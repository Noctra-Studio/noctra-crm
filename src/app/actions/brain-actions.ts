"use server";

import { createClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { recordWorkspaceActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function markLeadContacted(leadId: string) {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  if (!ctx) redirect("/login");

  const { data: lead } = await supabase
    .from("contact_submissions")
    .select("id, name, pipeline_status")
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspaceId)
    .single();

  if (!lead) return { success: false, error: "Lead not found" };

  const updates: Record<string, unknown> = {
    pipeline_status: "contactado",
    contacted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("contact_submissions")
    .update(updates)
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspaceId);

  if (error) return { success: false, error: error.message };

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    workspace_id: ctx.workspaceId,
    type: "call",
    content: `Lead contactado desde Cerebro Central.`,
  });

  await recordWorkspaceActivity(supabase, {
    workspaceId: ctx.workspaceId,
    entityType: "lead",
    entityId: leadId,
    eventType: "lead.stage_changed",
    title: "Lead contactado",
    description: `${lead.name || "Lead"} marcado como contactado desde Cerebro Central.`,
    metadata: { previousStatus: lead.pipeline_status, nextStatus: "contactado" },
  });

  revalidatePath("/leads");
  revalidatePath("/pipeline");
  return { success: true };
}

export async function markProposalLost(proposalId: string) {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  if (!ctx) redirect("/login");

  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, title, status, workspace_id")
    .eq("id", proposalId)
    .eq("workspace_id", ctx.workspaceId)
    .single();

  if (!proposal) return { success: false, error: "Proposal not found" };

  const { error } = await supabase
    .from("proposals")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId)
    .eq("workspace_id", ctx.workspaceId);

  if (error) return { success: false, error: error.message };

  await recordWorkspaceActivity(supabase, {
    workspaceId: ctx.workspaceId,
    entityType: "proposal",
    entityId: proposalId,
    eventType: "system.event",
    title: "Propuesta marcada como perdida",
    description: `${proposal.title || "Propuesta"} marcada como perdida desde Cerebro Central.`,
    metadata: { previousStatus: proposal.status },
  });

  revalidatePath("/proposals");
  return { success: true };
}

export async function scheduleLeadFollowUp(
  leadId: string,
  daysFromNow: number,
) {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  if (!ctx) redirect("/login");

  const nextActionDate = new Date();
  nextActionDate.setDate(nextActionDate.getDate() + daysFromNow);

  const { error } = await supabase
    .from("contact_submissions")
    .update({
      next_action_date: nextActionDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspaceId);

  if (error) return { success: false, error: error.message };

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    workspace_id: ctx.workspaceId,
    type: "note",
    content: `Seguimiento programado para ${nextActionDate.toLocaleDateString("es-MX")} desde Cerebro Central.`,
  });

  revalidatePath("/pipeline");
  return { success: true };
}
