"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getWorkspace } from "@/lib/workspace";
import { recordWorkspaceActivity } from "@/lib/activity";

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
        workspace_id: ctx.workspaceId,
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
      workspace_id: ctx.workspaceId,
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

  await recordWorkspaceActivity(supabase, {
    workspaceId: ctx.workspaceId,
    entityType: "proposal",
    entityId: proposal.id,
    eventType: "proposal.created",
    title: "Propuesta creada",
    description: `Se creó un borrador para ${data.service.name}.`,
    metadata: {
      leadId: leadId,
      serviceName: data.service.name,
      total: data.service.basePrice || 0,
    },
  });

  revalidatePath("/proposals");
  revalidatePath("/[locale]/proposals", "page");
  return { id: proposal.id };
}

export async function updateProposalAction(proposalId: string, data: any) {
  const supabase = await createClient();

  // Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: previousProposal } = await supabase
    .from("proposals")
    .select("status, title")
    .eq("id", proposalId)
    .single();

  const { error, data: updatedProposal } = await supabase
    .from("proposals")
    .update({
      title: data.title,
      description: data.description,
      valid_until: data.valid_until,
      estimated_duration: data.estimated_duration,
      subtotal: data.subtotal,
      total: data.total,
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId)
    .select("workspace_id, status")
    .single();

  if (error) throw error;

  if (
    updatedProposal &&
    previousProposal &&
    previousProposal.status !== updatedProposal.status
  ) {
    if (updatedProposal.status === "accepted") {
      await recordWorkspaceActivity(supabase, {
        workspaceId: updatedProposal.workspace_id,
        entityType: "proposal",
        entityId: proposalId,
        eventType: "proposal.accepted",
        title: "Propuesta aprobada",
        description: `El cliente ha aceptado ${data.title || previousProposal.title}.`,
      });
    } else if (updatedProposal.status === "viewed") {
      await recordWorkspaceActivity(supabase, {
        workspaceId: updatedProposal.workspace_id,
        entityType: "proposal",
        entityId: proposalId,
        eventType: "proposal.viewed",
        title: "Propuesta visualizada",
        description: `El cliente ha abierto ${data.title || previousProposal.title}.`,
      });
    }
  }

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
