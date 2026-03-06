'use server'

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Initialize the "God Mode" client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export type ActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function deployClientInfrastructure(prevState: any, formData: FormData): Promise<ActionResponse> {
  // 1. Extract Data
  const email = formData.get('email') as string;
  const clientName = formData.get('clientName') as string;
  const companyName = formData.get('companyName') as string;
  const projectName = formData.get('projectName') as string;
  const budget = parseFloat(formData.get('budget') as string);

  // 2. Create the User (Send Magic Link Invite)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: clientName } // Stored in metadata
  });

  if (authError) {
    console.error('Invite Error:', authError);
    return { success: false, error: authError.message };
  }

  const userId = authData.user.id;

  // 3. Update Profile (Role & Company)
  // The trigger created the row, but we need to update the company details
  await supabaseAdmin.from('profiles').update({
    company_name: companyName,
    role: 'client'
  }).eq('id', userId);

  // 4. Create the Project
  const { data: project } = await supabaseAdmin.from('projects').insert({
    client_id: userId,
    name: projectName,
    total_budget: budget,
    status: 'active'
  }).select().single();

  if (!project) return { success: false, error: 'Failed to create project' };

  // 5. Create Default Services (The Financial Skeleton)
  // We allocate the budget roughly by default (Adjust logic as needed)
  await supabaseAdmin.from('project_services').insert([
    { project_id: project.id, name: 'Web Architecture', budget_allocated: budget * 0.6, status: 'active' },
    { project_id: project.id, name: 'SEO & Strategy', budget_allocated: budget * 0.2, status: 'pending' },
    { project_id: project.id, name: 'Visual Identity', budget_allocated: budget * 0.2, status: 'pending' },
  ]);

  // 6. Assign You as the Worker
  await supabaseAdmin.from('team_status').insert({
    project_id: project.id,
    worker_name: 'Manu de Quevedo',
    current_status: 'online',
    current_task: 'Initializing Project Environment'
  });

  revalidatePath('/admin');
  return { success: true, message: `Deployed infrastructure for ${companyName}` };
}
