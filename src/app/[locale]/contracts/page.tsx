import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/lib/workspace";
import ContractsClient from "./ContractsClient";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const supabase = await createClient();
  const ctx = await getWorkspace();

  if (!ctx) {
    redirect("/login");
  }

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
