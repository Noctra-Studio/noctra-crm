import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/lib/workspace";
import ProposalsClient from "./ProposalsClient";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const supabase = await createClient();
  const ctx = await getWorkspace();

  if (!ctx) {
    redirect("/login");
  }

  // Fetch proposals with lead information
  const { data: proposals, error } = await supabase
    .from("proposals")
    .select(
      `
      *,
      lead:contact_submissions(id, name, email)
    `,
    )
    .eq("workspace_id", ctx.workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch proposals:", error);
  }

  return <ProposalsClient initialProposals={proposals || []} />;
}
