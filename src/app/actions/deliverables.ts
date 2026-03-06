"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type DeliverableStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export type Deliverable = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  file_url: string;
  status: DeliverableStatus;
  client_token: string;
  client_comment: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function addDeliverableAction(data: {
  project_id: string;
  title: string;
  description: string;
  file_url: string;
}) {
  const supabase = await createClient();
  
  const { data: deliverable, error } = await supabase
    .from("project_deliverables")
    .insert({
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      file_url: data.file_url,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/forge/projects");
  return deliverable;
}

export async function getProjectDeliverablesAction(projectId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("project_deliverables")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Deliverable[];
}

export async function getDeliverableByTokenAction(token: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("project_deliverables")
    .select("*, projects(name, workspace:workspaces(*))")
    .eq("client_token", token)
    .single();

  if (error) return null;
  return data;
}

export async function updateDeliverableReviewAction(id: string, updates: {
  status: 'approved' | 'rejected';
  client_comment?: string;
}) {
  const supabase = await createClient();
  
  const { data: deliverable, error } = await supabase
    .from("project_deliverables")
    .update({
      status: updates.status,
      client_comment: updates.client_comment || null,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*, projects(name)")
    .single();

  if (error) throw error;

  // Trigger email notification via Resend
  const isApproved = updates.status === 'approved';
  const subject = isApproved 
    ? `✅ Entregable Aprobado: ${deliverable.title}`
    : `❌ Cambios Solicitados: ${deliverable.title}`;
  
  const body = `
El cliente del proyecto "${deliverable.projects?.name}" ha revisado el entregable "${deliverable.title}".

Estado: ${isApproved ? 'APROBADO' : 'CAMBIOS SOLICITADOS'}
${updates.client_comment ? `\nComentarios del cliente:\n"${updates.client_comment}"` : ''}

Puedes ver los detalles aquí:
${process.env.NEXT_PUBLIC_SITE_URL || 'https://noctra.studio'}/forge/projects
  `;

  try {
    await resend.emails.send({
      from: "Noctra Studio <manu@noctra.studio>",
      to: ["manu@noctra.studio"],
      subject: subject,
      text: body,
    });
  } catch (emailError) {
    console.error("Error sending notification email:", emailError);
    // We don't throw here to avoid failing the whole action if only email fails
  }

  revalidatePath("/forge/projects");
  revalidatePath(`/client/deliverables/${deliverable.client_token}`);
  
  return deliverable;
}

export async function updateDeliverableStatusInternalAction(id: string, status: DeliverableStatus) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("project_deliverables")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
  
  revalidatePath("/forge/projects");
  return { success: true };
}
