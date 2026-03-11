import { createClient } from "@/utils/supabase/server";
import { getRequiredWorkspace } from "@/lib/workspace";
import ForgeLeadsClient from "./ForgeLeadsClient";

export const dynamic = "force-dynamic";

export default async function ForgeLeadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const ctx = await getRequiredWorkspace(locale);

  const { data: leads, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("workspace_id", ctx.workspaceId)
    .order("created_at", { ascending: false });

  const { data: config } = await supabase
    .from("workspace_config")
    .select("*")
    .eq("workspace_id", ctx.workspaceId)
    .single();

  return <ForgeLeadsClient initialLeads={leads || []} config={config} />;
}
