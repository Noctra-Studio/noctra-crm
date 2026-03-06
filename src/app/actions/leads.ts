"use server";

import { createClient } from "@/utils/supabase/server";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { getWorkspace } from "@/lib/workspace";
import { redirect } from "next/navigation";

export async function recalculateLeadScoreAction(leadId: string) {
  const supabase = await createClient();

  const ctx = await getWorkspace();
  if (!ctx) redirect("/forge/login");

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
  if (!ctx) redirect("/forge/login");

  try {
    const updates: any = { 
      pipeline_status: status,
      updated_at: new Date().toISOString()
    };
    
    if (status === "cerrado") updates.closed_at = new Date().toISOString();
    if (status === "perdido" && lostReasonText) updates.lost_reason = lostReasonText;
    
    // If moving out of 'nuevo' for the first time, record contacted_at
    if (status !== 'nuevo') {
      const { data: currentLead } = await supabase
        .from('contact_submissions')
        .select('pipeline_status, contacted_at')
        .eq('id', leadId)
        .eq('workspace_id', ctx.workspaceId)
        .single();
      if (currentLead && currentLead.pipeline_status === 'nuevo' && !currentLead.contacted_at) {
          updates.contacted_at = new Date().toISOString();
      }
    }

    // Update status
    const { error: statusError } = await supabase
      .from("contact_submissions")
      .update(updates)
      .eq("id", leadId)
      .eq("workspace_id", ctx.workspaceId);

    if (statusError) throw statusError;

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

      await supabase
        .from("contact_submissions")
        .update({
          lead_score: score,
          lead_score_breakdown: breakdown,
          updated_at: new Date().toISOString()
        })
        .eq("id", leadId)
        .eq("workspace_id", ctx.workspaceId);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in updateLeadStatusWithScoring:", err);
    return { success: false, error: err.message || String(err) };
  }
}
