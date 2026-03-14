import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";
import ForgeLanding from "@/components/forge/ForgeLanding";
import { getRevenueForecast } from "@/app/actions/metrics";
import { getUserDashboardPreferences } from "@/app/actions/dashboard-preferences";
import { getWorkspaceActivityFeed } from "@/lib/activity-feed";
import { getWorkspace } from "@/lib/workspace";
import { canAccessCentralBrainRole } from "@/lib/ai/brain-access";
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
    activityFeed,
  ] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("*")
      .eq("workspace_id", ctx.workspaceId),
    supabase.from("proposals").select("*").eq("workspace_id", ctx.workspaceId),
    supabase.from("contracts").select("*").eq("workspace_id", ctx.workspaceId),
    supabase.from("projects").select("*").eq("workspace_id", ctx.workspaceId),
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
  };

  return (
    <DashboardClient
      initialData={dashboardData}
    />
  );
}
