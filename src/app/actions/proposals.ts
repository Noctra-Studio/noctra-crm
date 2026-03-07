"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getWorkspace } from "@/lib/workspace";

export async function createProposalAction(data: {
  lead_id?: string;
  manual_lead?: { name: string; email: string; service_interest: string };
  service: { name: string; basePrice: number };
}) {
  const supabase = await createClient();

  // 1. Check Auth and Workspace
  const ctx = await getWorkspace();
  if (!ctx) throw new Error("No autenticado o sin workspace");

  const isTrial = ctx.workspace.subscription_status === "trialing";

  // 1.5 Enforce Trial Limits (max 3 proposals for free users)
  if (isTrial) {
    const { count } = await supabase
      .from("proposals")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", ctx.workspaceId);

    if (count !== null && count >= 3) {
      throw new Error("TRIAL_LIMIT_REACHED");
    }
  }

  let leadId = data.lead_id;

  // 2. Handle Manual Lead
  if (!leadId && data.manual_lead) {
    const { data: newLead, error: leadError } = await supabase
      .from("contact_submissions")
      .insert({
        name: data.manual_lead.name,
        email: data.manual_lead.email,
        service_interest: data.manual_lead.service_interest || "Manual",
      })
      .select("id")
      .single();

    if (leadError) throw leadError;
    leadId = newLead?.id;
  }

  if (!leadId) throw new Error("Información del cliente faltante");

  // 3. Create Proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .insert({
      lead_id: leadId,
      title: `Propuesta - ${data.service.name}`,
      status: "draft",
      subtotal: data.service.basePrice || 0,
      total: data.service.basePrice || 0,
      currency: "MXN",
    })
    .select("id")
    .single();

  if (proposalError) throw proposalError;

  revalidatePath("/proposals");
  return { id: proposal.id };
}

export async function updateProposalAction(proposalId: string, data: any) {
  const supabase = await createClient();

  // Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("proposals")
    .update({
      title: data.title,
      description: data.description,
      valid_until: data.valid_until,
      estimated_duration: data.estimated_duration,
      subtotal: data.subtotal,
      total: data.total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId);

  if (error) throw error;

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}/edit`);
}

export async function deleteProposalAction(proposalId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Delete related items first
  await supabase
    .from("proposal_items")
    .delete()
    .eq("proposal_id", proposalId);

  const { error } = await supabase
    .from("proposals")
    .delete()
    .eq("id", proposalId);

  if (error) throw error;

  revalidatePath("/proposals");
}
