'use server'

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/utils/supabase/admin';
import { z } from "zod";

// Initialize the "God Mode" client
const supabaseAdmin = createAdminClient();

const DeployClientSchema = z.object({
  email: z.string().email(),
  clientName: z.string().trim().min(1).max(120),
  companyName: z.string().trim().min(1).max(120),
  projectName: z.string().trim().min(1).max(160),
  budget: z.number().finite().positive(),
});

export type ActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function deployClientInfrastructure(prevState: any, formData: FormData): Promise<ActionResponse> {
  try {
    await requireAdminUser();
  } catch {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Extract Data
  const email = String(formData.get('email') || '').trim();
  const clientName = String(formData.get('clientName') || '').trim();
  const companyName = String(formData.get('companyName') || '').trim();
  const projectName = String(formData.get('projectName') || '').trim();
  const budget = parseFloat(String(formData.get('budget') || '0'));

  const parsed = DeployClientSchema.safeParse({
    email,
    clientName,
    companyName,
    projectName,
    budget,
  });

  if (!parsed.success) {
    return { success: false, error: 'Invalid input' };
  }

  const sanitizedData = parsed.data;

  // 2. Create the User (Send Magic Link Invite)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(sanitizedData.email, {
    data: { full_name: sanitizedData.clientName } // Stored in metadata
  });

  if (authError) {
    console.error('Invite Error:', authError);
    return { success: false, error: authError.message };
  }

  const userId = authData.user.id;

  // 3. Update Profile (Role & Company)
  // The trigger created the row, but we need to update the company details
  await supabaseAdmin.from('profiles').update({
    company_name: sanitizedData.companyName,
    role: 'client'
  }).eq('id', userId);

  // 4. Create the Project
  const { data: project } = await supabaseAdmin.from('projects').insert({
    client_id: userId,
    name: sanitizedData.projectName,
    total_budget: sanitizedData.budget,
    status: 'active'
  }).select().single();

  if (!project) return { success: false, error: 'Failed to create project' };

  // 5. Create Default Services (The Financial Skeleton)
  // We allocate the budget roughly by default (Adjust logic as needed)
  await supabaseAdmin.from('project_services').insert([
    { project_id: project.id, name: 'Web Architecture', budget_allocated: sanitizedData.budget * 0.6, status: 'active' },
    { project_id: project.id, name: 'SEO & Strategy', budget_allocated: sanitizedData.budget * 0.2, status: 'pending' },
    { project_id: project.id, name: 'Visual Identity', budget_allocated: sanitizedData.budget * 0.2, status: 'pending' },
  ]);

  // 6. Assign You as the Worker
  await supabaseAdmin.from('team_status').insert({
    project_id: project.id,
    worker_name: 'Manu de Quevedo',
    current_status: 'online',
    current_task: 'Initializing Project Environment'
  });

  revalidatePath('/admin');
  return { success: true, message: `Deployed infrastructure for ${sanitizedData.companyName}` };
}
