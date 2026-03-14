import { createClient } from "@/utils/supabase/server";
import {
  type ActivityFeedItem,
  type WorkspaceActivityEvent,
  toFeedItem,
  toSyntheticFeedItem,
} from "@/lib/activity";

export async function getWorkspaceActivityFeed(
  workspaceId: string,
  limit = 8,
): Promise<ActivityFeedItem[]> {
  const supabase = await createClient();

  const [
    { data: events },
    { data: migrations },
    { data: leads },
    { data: proposals },
    { data: contracts },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("workspace_activity_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit * 2),
    supabase
      .from("migrations")
      .select("id, source, created_at, updated_at, status")
      .eq("workspace_id", workspaceId)
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase
      .from("contact_submissions")
      .select("id, name, request_id, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("proposals")
      .select("id, title, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("contracts")
      .select("id, client_name, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("projects")
      .select("id, name, created_at, updated_at")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(4),
  ]);

  const explicitEvents = ((events ?? []) as WorkspaceActivityEvent[]).map(
    toFeedItem,
  );
  const seenEntities = new Set(
    explicitEvents
      .filter((item) => item.entityId)
      .map((item) => `${item.entityType}:${item.entityId}`),
  );

  const syntheticItems: ActivityFeedItem[] = [];

  (leads ?? []).forEach((lead: any) => {
    const key = `lead:${lead.id}`;
    if (seenEntities.has(key)) return;
    syntheticItems.push(
      toSyntheticFeedItem({
        id: `lead-${lead.id}`,
        entityType: "lead",
        entityId: lead.id,
        eventType: "lead.created",
        title: "Lead creado",
        description: `${lead.name || "Lead sin nombre"} entró al pipeline${lead.request_id ? ` (${lead.request_id})` : ""}.`,
        createdAt: lead.created_at,
      }),
    );
  });

  (proposals ?? []).forEach((proposal: any) => {
    const key = `proposal:${proposal.id}`;
    if (seenEntities.has(key)) return;
    syntheticItems.push(
      toSyntheticFeedItem({
        id: `proposal-${proposal.id}`,
        entityType: "proposal",
        entityId: proposal.id,
        eventType: "proposal.created",
        title: "Propuesta creada",
        description: proposal.title || "Nueva propuesta registrada.",
        createdAt: proposal.created_at,
      }),
    );
  });

  (contracts ?? []).forEach((contract: any) => {
    const key = `contract:${contract.id}`;
    if (seenEntities.has(key)) return;
    syntheticItems.push(
      toSyntheticFeedItem({
        id: `contract-${contract.id}`,
        entityType: "contract",
        entityId: contract.id,
        eventType: "contract.created",
        title: "Contrato creado",
        description: contract.client_name
          ? `Se abrió un contrato para ${contract.client_name}.`
          : "Nuevo contrato registrado.",
        createdAt: contract.created_at,
      }),
    );
  });

  (projects ?? []).forEach((project: any) => {
    const key = `project:${project.id}`;
    if (seenEntities.has(key)) return;
    syntheticItems.push(
      toSyntheticFeedItem({
        id: `project-${project.id}`,
        entityType: "project",
        entityId: project.id,
        eventType: "project.updated",
        title: "Proyecto actualizado",
        description: project.name || "Cambios recientes en un proyecto.",
        createdAt: project.updated_at || project.created_at,
      }),
    );
  });

  (migrations ?? []).forEach((migration: any) => {
    syntheticItems.push(
      toSyntheticFeedItem({
        id: `migration-${migration.id}`,
        entityType: "migration",
        entityId: migration.id,
        eventType: "migration.completed",
        title: "Migración completada",
        description: migration.source
          ? `Importación completada desde ${migration.source}.`
          : "Una migración terminó correctamente.",
        createdAt: migration.updated_at || migration.created_at,
      }),
    );
  });

  return [...explicitEvents, ...syntheticItems]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}
