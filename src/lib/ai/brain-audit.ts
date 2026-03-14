import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";

type BrainAuditPayload = {
  workspaceId?: string | null;
  userId?: string | null;
  route: string;
  provider?: string | null;
  model?: string | null;
  complexity?: string | null;
  mode?: string | null;
  success: boolean;
  responseStatus?: number | null;
  workspaceState?: string | null;
  inputChars?: number | null;
  messageCount?: number | null;
  metadata?: Record<string, unknown>;
};

function isMissingAuditTableError(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "PGRST205"
  );
}

export async function logBrainAuditEvent(payload: BrainAuditPayload) {
  if (!payload.workspaceId) return;

  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("ai_brain_audit_logs").insert({
      workspace_id: payload.workspaceId,
      user_id: payload.userId || null,
      route: payload.route,
      provider: payload.provider || null,
      model: payload.model || null,
      complexity: payload.complexity || null,
      mode: payload.mode || null,
      success: payload.success,
      response_status: payload.responseStatus || null,
      workspace_state: payload.workspaceState || null,
      input_chars: payload.inputChars || 0,
      message_count: payload.messageCount || 0,
      metadata: payload.metadata || {},
    });

    if (error) {
      if (isMissingAuditTableError(error)) {
        return;
      }

      console.error("[CentralBrain] audit insert failed:", error);
    }
  } catch (error) {
    console.error("[CentralBrain] audit logging error:", error);
  }
}
