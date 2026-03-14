import type { SupabaseClient } from "@supabase/supabase-js";

export const ACTIVITY_ENTITY_TYPES = [
  "lead",
  "proposal",
  "contract",
  "project",
  "client",
  "migration",
  "document",
  "system",
] as const;

export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

export type ActivityEventType =
  | "lead.created"
  | "lead.stage_changed"
  | "proposal.created"
  | "proposal.viewed"
  | "proposal.accepted"
  | "contract.created"
  | "contract.viewed"
  | "contract.signed"
  | "project.created"
  | "project.updated"
  | "project.status_changed"
  | "client.added"
  | "migration.completed"
  | "document.added"
  | "system.event";

export type ActivityMetadata = Record<
  string,
  string | number | boolean | null | string[] | number[] | boolean[]
>;

export interface WorkspaceActivityEvent {
  id: string;
  workspace_id: string;
  actor_user_id: string | null;
  entity_type: ActivityEntityType;
  entity_id: string | null;
  event_type: ActivityEventType;
  title: string;
  description: string | null;
  metadata: ActivityMetadata;
  created_at: string;
}

export interface RecordWorkspaceActivityInput {
  workspaceId: string;
  entityType: ActivityEntityType;
  entityId?: string | null;
  eventType: ActivityEventType;
  title: string;
  description?: string | null;
  metadata?: ActivityMetadata;
  createdAt?: string;
}

export interface ActivityFeedItem {
  id: string;
  entityType: ActivityEntityType;
  entityId: string | null;
  eventType: ActivityEventType;
  title: string;
  description: string | null;
  href: string;
  createdAt: string;
  tone: "emerald" | "blue" | "amber" | "purple" | "neutral";
}

export async function recordWorkspaceActivity(
  supabase: SupabaseClient,
  input: RecordWorkspaceActivityInput,
) {
  const { error } = await supabase.from("workspace_activity_events").insert({
    workspace_id: input.workspaceId,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    event_type: input.eventType,
    title: input.title,
    description: input.description ?? null,
    metadata: input.metadata ?? {},
    created_at: input.createdAt,
  });

  if (error) {
    throw error;
  }
}

export function buildActivityHref(item: {
  entityType: ActivityEntityType;
  entityId: string | null;
}) {
  switch (item.entityType) {
    case "lead":
      return item.entityId ? `/leads?leadId=${item.entityId}` : "/leads";
    case "proposal":
      return item.entityId ? `/proposals/${item.entityId}/edit` : "/proposals";
    case "contract":
      return item.entityId ? `/contracts/${item.entityId}/edit` : "/contracts";
    case "project":
      return item.entityId ? `/projects?projectId=${item.entityId}` : "/projects";
    case "client":
      return item.entityId ? `/clients/${item.entityId}` : "/clients";
    case "migration":
      return "/migration";
    case "document":
      return "/documents";
    default:
      return "/";
  }
}

export function buildActivityTone(
  entityType: ActivityEntityType,
): ActivityFeedItem["tone"] {
  switch (entityType) {
    case "lead":
      return "emerald";
    case "proposal":
      return "blue";
    case "contract":
      return "amber";
    case "project":
      return "purple";
    default:
      return "neutral";
  }
}

export function toFeedItem(event: WorkspaceActivityEvent): ActivityFeedItem {
  return {
    id: `evt-${event.id}`,
    entityType: event.entity_type,
    entityId: event.entity_id,
    eventType: event.event_type,
    title: event.title,
    description: event.description,
    href: buildActivityHref({
      entityType: event.entity_type,
      entityId: event.entity_id,
    }),
    createdAt: event.created_at,
    tone: buildActivityTone(event.entity_type),
  };
}

export function toSyntheticFeedItem(input: {
  id: string;
  entityType: ActivityEntityType;
  entityId: string | null;
  eventType: ActivityEventType;
  title: string;
  description?: string | null;
  createdAt: string;
}): ActivityFeedItem {
  return {
    id: input.id,
    entityType: input.entityType,
    entityId: input.entityId,
    eventType: input.eventType,
    title: input.title,
    description: input.description ?? null,
    href: buildActivityHref(input),
    createdAt: input.createdAt,
    tone: buildActivityTone(input.entityType),
  };
}
