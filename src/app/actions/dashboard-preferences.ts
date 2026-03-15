"use server";

import { createClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/lib/workspace";
import {
  type DashboardPresetKey,
  type DashboardWidgetState,
  getPresetWidgetState,
  mergeDashboardPreferenceRows,
  normalizeDashboardWidgetState,
  PRODUCT_DEFAULT_PRESET,
} from "@/lib/dashboard/preferences";

function isMissingRelationError(error: { code?: string | null; message?: string | null } | null) {
  return (
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table") === true
  );
}

async function getDashboardPreferenceContext() {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    workspaceContext,
  ] = await Promise.all([supabase.auth.getUser(), getWorkspace()]);

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  if (!workspaceContext?.workspaceId) {
    throw new Error("Workspace not found");
  }

  return {
    supabase,
    userId: user.id,
    workspaceId: workspaceContext.workspaceId,
  };
}

async function writeDashboardPreferences(
  widgets: DashboardWidgetState[],
) {
  const { supabase, userId, workspaceId } = await getDashboardPreferenceContext();
  const normalized = normalizeDashboardWidgetState(widgets);

  const { error } = await supabase.from("dashboard_preferences").upsert(
    normalized.map((widget) => ({
      workspace_id: workspaceId,
      user_id: userId,
      widget_key: widget.widgetKey,
      visible: widget.visible,
      order_index: widget.orderIndex,
      size_variant: widget.sizeVariant,
      filters: widget.preferences,
      updated_at: new Date().toISOString(),
    })),
    {
      onConflict: "workspace_id,user_id,widget_key",
    },
  );

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        "[dashboard-preferences] preference storage unavailable; using in-memory layout until migrations are applied.",
      );
      return normalized;
    }
    throw new Error(error.message);
  }

  return normalized;
}

export async function getUserDashboardPreferences() {
  const { supabase, userId, workspaceId } = await getDashboardPreferenceContext();

  const { data, error } = await supabase
    .from("dashboard_preferences")
    .select(
      "widget_key, visible, order_index, size_variant, filters",
    )
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .order("order_index", { ascending: true });

  if (error) {
    if (isMissingRelationError(error)) {
      return getPresetWidgetState(PRODUCT_DEFAULT_PRESET);
    }
    throw new Error(error.message);
  }

  if (!data?.length) {
    return getPresetWidgetState(PRODUCT_DEFAULT_PRESET);
  }

  return mergeDashboardPreferenceRows(data as any);
}

export async function saveDashboardPreferences(input: {
  widgets: DashboardWidgetState[];
}) {
  return writeDashboardPreferences(input.widgets);
}

/**
 * Saves a single dashboard widget preference
 */
export async function saveDashboardPreference(input: {
  widgetKey: string;
  visible: boolean;
  orderIndex: number;
  sizeVariant: string;
  preferences: any;
}) {
  const { supabase, userId, workspaceId } = await getDashboardPreferenceContext();

  const { error } = await supabase.from("dashboard_preferences").upsert(
    {
      workspace_id: workspaceId,
      user_id: userId,
      widget_key: input.widgetKey,
      visible: input.visible,
      order_index: input.orderIndex,
      size_variant: input.sizeVariant,
      filters: input.preferences,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "workspace_id,user_id,widget_key",
    },
  );

  if (error) throw new Error(error.message);
  return { success: true };
}

/**
 * Saves a specific user dashboard filter
 */
export async function saveUserDashboardFilter(input: {
  widgetKey: string;
  filterKey: string;
  filterValue: any;
}) {
  const { supabase, userId, workspaceId } = await getDashboardPreferenceContext();

  const { error } = await supabase.from("user_dashboard_filters").upsert(
    {
      workspace_id: workspaceId,
      user_id: userId,
      widget_key: input.widgetKey,
      filter_key: input.filterKey,
      filter_value: input.filterValue,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "workspace_id,user_id,widget_key,filter_key",
    },
  );

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function applyDashboardPreset(input: {
  presetKey: DashboardPresetKey;
}) {
  const presetWidgets = getPresetWidgetState(input.presetKey);
  return writeDashboardPreferences(presetWidgets);
}

export async function restoreDefaultDashboard() {
  const presetWidgets = getPresetWidgetState(PRODUCT_DEFAULT_PRESET);
  return writeDashboardPreferences(presetWidgets);
}
