import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";
import ForgeLanding from "@/components/forge/ForgeLanding";
import { getRevenueForecast } from "@/app/actions/metrics";
import { getWorkspace } from "@/lib/workspace";

export default async function ForgeIndexPage() {
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
  ] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("*")
      .eq("workspace_id", ctx.workspaceId),
    supabase.from("proposals").select("*").eq("workspace_id", ctx.workspaceId),
    supabase.from("contracts").select("*").eq("workspace_id", ctx.workspaceId),
    supabase.from("projects").select("*").eq("workspace_id", ctx.workspaceId),
  ]);

  const forecast = await getRevenueForecast();

  const isTrial = ctx.workspace.subscription_status === "trialing";

  return (
    <DashboardClient
      leads={leads || []}
      proposals={proposals || []}
      contracts={contracts || []}
      projects={projects || []}
      forecast={forecast}
      isTrial={isTrial}
    />
  );
}
