"use server";

import { createClient } from "@/utils/supabase/server";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { getWorkspace } from "@/lib/workspace";
import { recordWorkspaceActivity } from "@/lib/activity";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createLeadAction(data: {
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  service_interest?: string;
  estimated_value?: number | null;
  next_action?: string;
  next_action_date?: string;
  locale?: "es" | "en";
}) {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  if (!ctx) redirect("/login");

  const { data: seqData, error: seqError } =
    await supabase.rpc("get_next_request_id");
  const requestId = seqError
    ? `NOC-${Math.floor(Math.random() * 9000 + 1000)}`
    : `NOC-${String(seqData).padStart(4, "0")}`;

  const { score, ...breakdown } = calculateLeadScore(
    {
      service_type: data.service_interest || "Manual",
      message: "",
      phone: data.phone || null,
      company: data.company_name || null,
      source_cta: "manual_crm",
      pipeline_status: "nuevo",
      created_at: new Date().toISOString(),
    },
    null,
  );

  const { data: lead, error } = await supabase
    .from("contact_submissions")
    .insert({
      workspace_id: ctx.workspaceId,
      request_id: requestId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company_name: data.company_name || null,
      service_interest: data.service_interest || "Manual",
      estimated_value: data.estimated_value || null,
      next_action: data.next_action || null,
      next_action_date: data.next_action_date || null,
      locale: data.locale || "es",
      source_cta: "manual_crm",
      pipeline_status: "nuevo",
      lead_score: score,
      lead_score_breakdown: breakdown,
    })
    .select("*")
    .single();

  if (error) throw error;

  await supabase.from("lead_activities").insert({
    lead_id: lead.id,
    workspace_id: ctx.workspaceId,
    type: "note",
    content: "Lead creado manualmente desde el CRM.",
  });

  await recordWorkspaceActivity(supabase, {
    workspaceId: ctx.workspaceId,
    entityType: "lead",
    entityId: lead.id,
    eventType: "lead.created",
    title: "Lead creado",
    description: `${lead.name} se agregó manualmente al pipeline.`,
    metadata: {
      leadName: lead.name,
      requestId: lead.request_id,
      serviceInterest: lead.service_interest || "Manual",
    },
  });

  revalidatePath("/[locale]/leads", "page");
  revalidatePath("/[locale]/pipeline", "page");

  return lead;
}

export async function recalculateLeadScoreAction(leadId: string) {
  const supabase = await createClient();

  const ctx = await getWorkspace();
  if (!ctx) redirect("/login");

  const { data: lead, error: fetchError } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspaceId)
    .single();

  if (fetchError || !lead) {
    throw new Error("Lead not found");
  }

  const { score, ...breakdown } = calculateLeadScore({
    service_type: lead.intent || lead.service_interest,
    message: lead.message,
    phone: lead.phone,
    company: lead.company_name,
    source_cta: lead.source_cta,
    created_at: lead.created_at,
    pipeline_status: lead.pipeline_status
  }, lead.contacted_at ? new Date(lead.contacted_at) : null);

  const { error: updateError } = await supabase
    .from("contact_submissions")
    .update({
      lead_score: score,
      lead_score_breakdown: breakdown,
      updated_at: new Date().toISOString()
    })
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspaceId);

  if (updateError) throw updateError;

  return { score, breakdown };
}

export async function updateLeadStatusWithScoring(leadId: string, status: string, lostReasonText?: string) {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  if (!ctx) redirect("/login");

  try {
    let previousLead:
      | {
          id: string;
          name: string | null;
          pipeline_status: string;
          contacted_at: string | null;
          request_id: string | null;
        }
      | null = null;
    const updates: any = { 
      pipeline_status: status,
      updated_at: new Date().toISOString()
    };
    
    if (status === "cerrado") updates.closed_at = new Date().toISOString();
    if (status === "perdido" && lostReasonText) updates.lost_reason = lostReasonText;
    
    const { data: currentLead } = await supabase
      .from('contact_submissions')
      .select('id, name, pipeline_status, contacted_at, request_id')
      .eq('id', leadId)
      .eq('workspace_id', ctx.workspaceId)
      .single();
    previousLead = currentLead;

    // If moving out of 'nuevo' for the first time, record contacted_at
    if (
      status !== 'nuevo' &&
      currentLead &&
      currentLead.pipeline_status === 'nuevo' &&
      !currentLead.contacted_at
    ) {
      updates.contacted_at = new Date().toISOString();
    }

    // Update status
    const { error: statusError } = await supabase
      .from("contact_submissions")
      .update(updates)
      .eq("id", leadId)
      .eq("workspace_id", ctx.workspaceId);

    if (statusError) throw statusError;

    if (previousLead && previousLead.pipeline_status !== status) {
      await supabase.from("lead_activities").insert({
        lead_id: leadId,
        workspace_id: ctx.workspaceId,
        type: "status_change",
        content: `Status changed from ${previousLead.pipeline_status} to ${status}${lostReasonText ? `. Reason: ${lostReasonText}` : ""}`,
      });

      await recordWorkspaceActivity(supabase, {
        workspaceId: ctx.workspaceId,
        entityType: "lead",
        entityId: leadId,
        eventType: "lead.stage_changed",
        title: "Lead movido de etapa",
        description: `${previousLead.name || "Lead"} pasó de ${previousLead.pipeline_status} a ${status}.`,
        metadata: {
          leadName: previousLead.name || "",
          requestId: previousLead.request_id || "",
          previousStatus: previousLead.pipeline_status,
          nextStatus: status,
          lostReason: lostReasonText || null,
        },
      });
    }

    // Recalculate score after status update
    const { data: updatedLead } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("id", leadId)
      .eq("workspace_id", ctx.workspaceId)
      .single();

    if (updatedLead) {
      const { score, ...breakdown } = calculateLeadScore({
        service_type: updatedLead.intent || updatedLead.service_interest,
        message: updatedLead.message,
        phone: updatedLead.phone,
        company: updatedLead.company_name,
        source_cta: updatedLead.source_cta,
        created_at: updatedLead.created_at,
        pipeline_status: updatedLead.pipeline_status
      }, updatedLead.contacted_at ? new Date(updatedLead.contacted_at) : null);

      const { data: rescoredLead } = await supabase
        .from("contact_submissions")
        .update({
          lead_score: score,
          lead_score_breakdown: breakdown,
          updated_at: new Date().toISOString()
        })
        .select("*")
        .eq("id", leadId)
        .eq("workspace_id", ctx.workspaceId)
        .single();

      return { success: true, lead: rescoredLead ?? { ...updatedLead, lead_score: score, lead_score_breakdown: breakdown } };
    }

    return { success: true, lead: updatedLead };
  } catch (err: any) {
    console.error("Error in updateLeadStatusWithScoring:", err);
    return { success: false, error: err.message || String(err) };
  }
}
