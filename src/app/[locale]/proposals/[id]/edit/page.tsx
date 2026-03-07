import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProposalBuilderClient from "./ProposalBuilderClient";

export const dynamic = "force-dynamic";

export default async function ProposalEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch proposal with items and lead
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select(
      `
      *,
      lead:contact_submissions(*),
      items:proposal_items(*)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !proposal) {
    console.error("Failed to fetch proposal:", error);
    notFound();
  }

  return <ProposalBuilderClient initialProposal={proposal} />;
}
