import { createClient } from "@/utils/supabase/server";
import PipelineClient from "./PipelineClient";
import { redirect } from "next/navigation";
import { getWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const supabase = await createClient();
  const ctx = await getWorkspace();

  if (!ctx) {
    redirect("/login");
  }

  // Fetch leads with all pipeline metadata
  const { data: leads, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("workspace_id", ctx.workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    return (
      <div className="p-10 text-red-500 font-mono text-[10px] uppercase tracking-widest bg-black min-h-screen">
        Error loading pipeline: {error.message}
      </div>
    );
  }

  const { data: config } = await supabase
    .from("workspace_config")
    .select("*")
    .eq("workspace_id", ctx.workspaceId)
    .single();

  return (
    <PipelineClient
      initialLeads={leads || []}
      workspaceId={ctx.workspaceId}
      config={config}
    />
  );
}
