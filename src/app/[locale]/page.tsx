import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";
import ForgeLanding from "@/components/forge/ForgeLanding";
import { getRevenueForecast } from "@/app/actions/metrics";
import { getUserDashboardPreferences } from "@/app/actions/dashboard-preferences";
import { getWorkspaceActivityFeed } from "@/lib/activity-feed";
import { getWorkspace } from "@/lib/workspace";
import { canAccessCentralBrainRole } from "@/lib/ai/brain-access";
import { DEFAULT_PIPELINE_STAGES } from "@/lib/workspace-config";
import type { WorkspaceDashboardData } from "@/types/forge-dashboard";

export default async function ForgeIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const ctx = await getWorkspace();

  // If no session/user/workspace, show the landing page
  if (!ctx) {
    return <ForgeLanding />;
  }

  // Fetch all basic objects to power the dashboard metrics
  const [
    { data: leads },
    { data: proposals },
    { data: contracts },
    { data: projects },
    { data: workspaceConfig },
    activityFeed,
  ] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("id, name, request_id, pipeline_status, estimated_value, created_at, next_action_date, next_action_notes, closed_at")
      .eq("workspace_id", ctx.workspaceId),
    supabase
      .from("proposals")
      .select("id, title, status, total, updated_at, created_at")
      .eq("workspace_id", ctx.workspaceId),
    supabase
      .from("contracts")
      .select("id, client_name, status, total_price, created_at")
      .eq("workspace_id", ctx.workspaceId),
    supabase
      .from("projects")
      .select("id, name, status, created_at, updated_at")
      .eq("workspace_id", ctx.workspaceId),
    supabase
      .from("workspace_config")
      .select("pipeline_stages")
      .eq("workspace_id", ctx.workspaceId)
      .maybeSingle(),
    getWorkspaceActivityFeed(ctx.workspaceId),
  ]);

  const [forecast, widgetPreferences] = await Promise.all([
    getRevenueForecast(),
    getUserDashboardPreferences(),
  ]);

  const isTrial = ctx.workspace.subscription_status === "trialing";

  const dashboardData: WorkspaceDashboardData = {
    locale,
    leads: leads || [],
    proposals: proposals || [],
    contracts: contracts || [],
    projects: projects || [],
    activityFeed,
    forecast,
    isTrial,
    canUseCentralBrain: canAccessCentralBrainRole(ctx.role),
    widgetPreferences,
    currency: ctx.workspace.currency || "MXN",
    pipelineStages: workspaceConfig?.pipeline_stages || DEFAULT_PIPELINE_STAGES,
  };

  return (
    <DashboardClient
      initialData={dashboardData}
    />
  );
}
