import { createClient } from "@/utils/supabase/server";
import { getRequiredWorkspace } from "@/lib/workspace";
import ForgeProjectsClient from "./ForgeProjectsClient";
import type { Project } from "@/lib/projects";

// Ensure this page is not statically cached
export const dynamic = "force-dynamic";

export default async function ForgeProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const ctx = await getRequiredWorkspace(locale);

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("workspace_id", ctx.workspaceId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch projects:", error);
  }

  return (
    <ForgeProjectsClient initialProjects={(projects as Project[]) || []} />
  );
}
