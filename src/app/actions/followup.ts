"use server";

import { createClient } from "@/utils/supabase/server";
import { differenceInDays, subDays } from "date-fns";
import { Resend } from "resend";
import { getWorkspace } from "@/lib/workspace";
import { redirect } from "next/navigation";

const resend = new Resend(process.env.RESEND_API_KEY);

export type FollowUpSuggestion = {
  id: string; // ID of the proposal, contract, or lead
  type: 'proposal_viewed_3d' | 'proposal_sent_5d' | 'contract_sent_3d' | 'lead_no_contact_3d';
  label: string;
  clientName: string;
  clientEmail: string;
  locale: 'es' | 'en';
  refId: string; // The specific record ID (proposal_id, contract_id, etc.)
  leadId: string; // The parent lead ID for logging activities
};

export type FollowUpTemplate = {
  type: string;
  locale: string;
  subject: string;
  body: string;
};

export async function getPendingFollowUps(): Promise<FollowUpSuggestion[]> {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  if (!ctx) redirect("/forge/login");

  const suggestions: FollowUpSuggestion[] = [];
  const now = new Date();

  // 1. Trigger: lead_no_contact_3d
  // Lead pipeline_status = 'nuevo' AND created_at < now() - 3 days
  const { data: newLeads } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("workspace_id", ctx.workspaceId)
    .eq("pipeline_status", "nuevo")
    .lt("created_at", subDays(now, 3).toISOString());

  if (newLeads) {
    newLeads.forEach(lead => {
      suggestions.push({
        id: `lead-${lead.id}`,
        type: 'lead_no_contact_3d',
        label: `Lead nuevo sin contacto hace ${differenceInDays(now, new Date(lead.created_at))} días`,
        clientName: lead.name,
        clientEmail: lead.email,
        locale: lead.locale === 'en' ? 'en' : 'es',
        refId: lead.id,
        leadId: lead.id
      });
    });
  }

  // 2. Trigger: proposal_viewed_3d & proposal_sent_5d
  // Join with contact_submissions to get client names and locales
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*, contact_submissions(name, email, locale)")
    .eq("workspace_id", ctx.workspaceId)
    .eq("signed", false);

  if (proposals) {
    proposals.forEach((p: any) => {
      const client = p.contact_submissions;
      if (!client) return;

      const pDate = new Date(p.created_at);
      const sDate = p.sent_at ? new Date(p.sent_at) : null;
      const vDate = p.viewed_at ? new Date(p.viewed_at) : null;

      // viewed_at < now() - 3 days AND signed = false
      if (vDate && differenceInDays(now, vDate) >= 3) {
        suggestions.push({
          id: `prop-v-${p.id}`,
          type: 'proposal_viewed_3d',
          label: `Propuesta vista hace ${differenceInDays(now, vDate)} días sin respuesta`,
          clientName: client.name,
          clientEmail: client.email,
          locale: client.locale === 'en' ? 'en' : 'es',
          refId: p.id,
          leadId: p.lead_id
        });
      }
      // status = 'sent' AND viewed_at IS NULL AND sent_at < now() - 5 days
      else if (sDate && !vDate && differenceInDays(now, sDate) >= 5) {
        suggestions.push({
          id: `prop-s-${p.id}`,
          type: 'proposal_sent_5d',
          label: `Propuesta enviada hace ${differenceInDays(now, sDate)} días sin visualización`,
          clientName: client.name,
          clientEmail: client.email,
          locale: client.locale === 'en' ? 'en' : 'es',
          refId: p.id,
          leadId: p.lead_id
        });
      }
    });
  }

  // 3. Trigger: contract_sent_3d
  // Contract status = 'sent' AND client_signed_at IS NULL AND created_at < now() - 3 days
  const { data: contracts } = await supabase
    .from("contracts")
    .select("*, proposals(contact_submissions(name, email, locale), lead_id)")
    .eq("workspace_id", ctx.workspaceId)
    .eq("status", "sent")
    .is("client_signed_at", null)
    .lt("created_at", subDays(now, 3).toISOString());

  if (contracts) {
    contracts.forEach((c: any) => {
      const proposal = c.proposals;
      if (!proposal) return;
      const client = proposal.contact_submissions;
      if (!client) return;

      suggestions.push({
        id: `cont-s-${c.id}`,
        type: 'contract_sent_3d',
        label: `Contrato enviado hace ${differenceInDays(now, new Date(c.created_at))} días sin firma`,
        clientName: client.name,
        clientEmail: client.email,
        locale: client.locale === 'en' ? 'en' : 'es',
        refId: c.id,
        leadId: proposal.lead_id
      });
    });
  }

  return suggestions;
}

export async function getFollowUpTemplates(): Promise<FollowUpTemplate[]> {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  if (!ctx) redirect("/forge/login");

  const { data } = await supabase
    .from("followup_templates")
    .select("type, locale, subject, body")
    .eq("workspace_id", ctx.workspaceId);
  
  return data || [];
}

export async function sendFollowUpEmail(
  suggestion: FollowUpSuggestion,
  subject: string,
  body: string
) {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  if (!ctx) redirect("/forge/login");

  try {
    // 1. Send via Resend
    const { error: resendError } = await resend.emails.send({
      from: `${ctx.workspace.name} <${ctx.workspace.email}>`,
      to: [suggestion.clientEmail],
      subject: subject,
      text: body,
    });

    if (resendError) throw resendError;

    // 2. Log activity
    await supabase.from("lead_activities").insert({
      lead_id: suggestion.leadId,
      workspace_id: ctx.workspaceId,
      type: 'email',
      content: `Follow-up enviado (${suggestion.type}):\n\nAsunto: ${subject}\n\n${body}`
    });

    // 3. Update status if needed (e.g., mark as contactado for lead_no_contact_3d)
    if (suggestion.type === 'lead_no_contact_3d') {
      await supabase
        .from("contact_submissions")
        .update({ pipeline_status: 'contactado' })
        .eq("id", suggestion.leadId)
        .eq("workspace_id", ctx.workspaceId);
    }

    return { success: true };
  } catch (err) {
    console.error("Error sending follow-up:", err);
    return { success: false, error: err };
  }
}

export async function markAsContacted(suggestion: FollowUpSuggestion) {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  if (!ctx) redirect("/forge/login");

  try {
    // 1. Log "call" activity
    await supabase.from("lead_activities").insert({
      lead_id: suggestion.leadId,
      workspace_id: ctx.workspaceId,
      type: 'call',
      content: `Follow-up realizado manualmente (Marked as contacted).`
    });

    // 2. Update status for leads
    if (suggestion.type === 'lead_no_contact_3d') {
      await supabase
        .from("contact_submissions")
        .update({ pipeline_status: 'contactado' })
        .eq("id", suggestion.leadId)
        .eq("workspace_id", ctx.workspaceId);
    }

    return { success: true };
  } catch (err) {
    console.error("Error marking as contacted:", err);
    return { success: false, error: err };
  }
}
