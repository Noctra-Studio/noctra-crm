"use server";

import { createClient } from "@/utils/supabase/server";

export type TimelineEvent = {
  id: string; // unique key for react
  type: string; // e.g. 'created', 'sent', 'note', 'signed', 'completed', 'status_change', etc.
  iconName: "mail" | "phone" | "file" | "pen" | "eye" | "check" | "x" | "refresh" | "note" | "meeting";
  color: "green" | "blue" | "amber" | "red" | "neutral";
  title: string;
  description?: string;
  timestamp: string; // ISO date
};

export async function getUnifiedTimeline(leadId: string): Promise<TimelineEvent[]> {
  const supabase = await createClient();
  const events: TimelineEvent[] = [];

  // 1. Fetch Lead
  const { data: lead } = await supabase
    .from("contact_submissions")
    .select("created_at, email_sent_at, email")
    .eq("id", leadId)
    .single();

  if (lead) {
    events.push({
      id: `lead-created-${leadId}`,
      type: "created",
      iconName: "file",
      color: "blue",
      title: "Lead recibido",
      timestamp: lead.created_at,
    });

    if (lead.email_sent_at) {
      events.push({
        id: `lead-email-${leadId}`,
        type: "sent",
        iconName: "mail",
        color: "blue",
        title: "Correo automático de respuesta enviado",
        timestamp: lead.email_sent_at,
      });
    }
  }

  // 2. Fetch Lead Activities
  const { data: activities } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("lead_id", leadId);

  if (activities) {
    activities.forEach((act) => {
      let iconName: TimelineEvent["iconName"] = "note";
      let color: TimelineEvent["color"] = "neutral";
      let title = "Nota agregada";

      switch (act.type) {
        case "call":
          iconName = "phone";
          color = "blue";
          title = "Llamada registrada";
          break;
        case "email":
          iconName = "mail";
          color = "blue";
          title = "Correo registrado";
          break;
        case "meeting":
          iconName = "meeting";
          color = "blue";
          title = "Reunión registrada";
          break;
        case "status_change":
          iconName = "refresh";
          color = "amber";
          title = "Cambio de estado administrativo";
          break;
      }

      events.push({
        id: act.id,
        type: act.type,
        iconName,
        color,
        title,
        description: act.content,
        timestamp: act.created_at,
      });
    });
  }

  // 3. Fetch Proposals
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .eq("lead_id", leadId);

  let pIds: string[] = [];

  if (proposals) {
    proposals.forEach((p) => {
      pIds.push(p.id);
      
      events.push({
        id: `prop-created-${p.id}`,
        type: "created",
        iconName: "file",
        color: "blue",
        title: `Propuesta ${p.proposal_number || "creada"}`,
        timestamp: p.created_at,
      });

      if (p.sent_at) {
        events.push({
          id: `prop-sent-${p.id}`,
          type: "sent",
          iconName: "mail",
          color: "blue",
          title: `Propuesta ${p.proposal_number || ""} enviada al cliente`,
          timestamp: p.sent_at,
        });
      }

      if (p.viewed_at) {
        events.push({
          id: `prop-viewed-${p.id}`,
          type: "viewed",
          iconName: "eye",
          color: "amber",
          title: `Cliente visualizó la propuesta`,
          description: `Veces vista: ${p.view_count || 1}`,
          timestamp: p.viewed_at,
        });
      }

      if (p.signed_at) {
        events.push({
          id: `prop-signed-${p.id}`,
          type: "signed",
          iconName: "pen",
          color: "green",
          title: `Cliente firmó la propuesta técnica`,
          timestamp: p.signed_at,
        });
      }

      if (p.rejected_at) {
        events.push({
          id: `prop-rej-${p.id}`,
          type: "rejected",
          iconName: "x",
          color: "red",
          title: `Propuesta declinada / rechazada`,
          timestamp: p.rejected_at,
        });
      }
    });
  }

  // 4. Fetch Contracts
  if (pIds.length > 0) {
    const { data: contracts } = await supabase
      .from("contracts")
      .select("*")
      .in("proposal_id", pIds);

    if (contracts) {
      contracts.forEach((c) => {
        events.push({
          id: `cont-created-${c.id}`,
          type: "created",
          iconName: "file",
          color: "blue",
          title: `Proyecto de Contrato Legal generado (${c.contract_number})`,
          timestamp: c.created_at,
        });

        if (c.noctra_signed_at) {
          events.push({
            id: `cont-nsigned-${c.id}`,
            type: "signed",
            iconName: "check",
            color: "blue",
            title: `Noctra Studio autorizó / pre-firmó contrato`,
            timestamp: c.noctra_signed_at,
          });
        }
        
        // If sent_at exists in model or derived from status
        if (c.status === "sent" && c.updated_at) {
           events.push({
            id: `cont-sent-${c.id}`,
            type: "sent",
            iconName: "mail",
            color: "blue",
            title: `Contrato Legal enviado al cliente`,
            timestamp: c.updated_at,
          });
        }

        if (c.client_signed_at) {
          events.push({
            id: `cont-csigned-${c.id}`,
            type: "signed",
            iconName: "pen",
            color: "green",
            title: `Cliente firmó contrato legal (${c.contract_number})`,
            timestamp: c.client_signed_at,
          });
        }
      });
    }
  }

  // 5. Fetch Projects (If the lead has an email to map)
  if (lead?.email) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, created_at, profiles!inner(email)")
      .eq("profiles.email", lead.email);

    if (projects && projects.length > 0) {
      for (const proj of projects) {
        events.push({
          id: `proj-created-${proj.id}`,
          type: "created",
          iconName: "file",
          color: "blue",
          title: `Proyecto operativo creado: ${proj.name}`,
          timestamp: proj.created_at,
        });

        // Fetch status history
        const { data: hist } = await supabase
          .from("project_status_history")
          .select("*")
          .eq("project_id", proj.id);

        if (hist) {
          hist.forEach((h) => {
            events.push({
              id: `proj-hist-${h.id}`,
              type: "status_change",
              iconName: "refresh",
              color: h.status === "completed" ? "green" : "blue",
              title: `Fase del proyecto actualizada a: ${h.status.replace("_", " ")}`,
              timestamp: h.created_at,
            });
          });
        }
      }
    }
  }

  // Finally, sort by timestamp descending
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
