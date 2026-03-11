import { createClient } from "@/utils/supabase/server";
import { getRequiredWorkspace } from "@/lib/workspace";
import ContractsClient from "./ContractsClient";

export const dynamic = "force-dynamic";

export default async function ContractsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const ctx = await getRequiredWorkspace(locale);

  const { data: contracts, error } = await supabase
    .from("contracts")
    .select(
      `
      *,
      proposal:proposals(proposal_number)
    `,
    )
    .eq("workspace_id", ctx.workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contracts:", error);
  }

  return <ContractsClient initialContracts={contracts || []} />;
}
