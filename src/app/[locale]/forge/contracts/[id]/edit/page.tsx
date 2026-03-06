import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ContractBuilderClient from "./ContractBuilderClient";

export const dynamic = "force-dynamic";

export default async function EditContractPage({
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
    redirect("/forge/login");
  }

  const { data: contract, error } = await supabase
    .from("contracts")
    .select(
      `
      *,
      proposal:proposals(proposal_number)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !contract) {
    notFound();
  }

  return <ContractBuilderClient initialContract={contract} />;
}
