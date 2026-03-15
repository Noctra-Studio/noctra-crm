import { createClient } from "@/utils/supabase/server";
import { getRequiredWorkspace } from "@/lib/workspace";
import ProposalsClient from "./ProposalsClient";

export const dynamic = "force-dynamic";

export default async function ProposalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const ctx = await getRequiredWorkspace(locale);

  // Fetch proposals with lead information
  const { data: proposals, error } = await supabase
    .from("proposals")
    .select(
      `
      *,
      lead:contact_submissions(id, name, email, lead_score, lead_score_breakdown)
    `,
    )
    .eq("workspace_id", ctx.workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch proposals:", error);
  }

  return <ProposalsClient initialProposals={proposals || []} />;
}
