"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createContractFromProposalAction(proposalId: string) {
  const supabase = await createClient();

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // 2. Fetch Full Proposal
  const { data: fullProposal, error: fetchError } = await supabase
    .from("proposals")
    .select("*, items:proposal_items(*), lead:contact_submissions(*)")
    .eq("id", proposalId)
    .single();

  if (fetchError || !fullProposal) {
    throw new Error("No se pudo obtener la información de la propuesta");
  }

  // 3. Create Contract
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .insert({
      proposal_id: fullProposal.id,
      client_name: fullProposal.lead?.name || "",
      client_email: fullProposal.lead?.email || "",
      client_company: (fullProposal.lead as any)?.company_name || "",
      total_price: fullProposal.total,
      payment_terms: fullProposal.payment_terms,
      items: fullProposal.items.map((i: any) => ({
        name: i.name,
        description: i.description,
      })),
      status: "draft",
    })
    .select()
    .single();

  if (contractError) throw contractError;

  revalidatePath("/contracts");
  revalidatePath("/proposals");
  
  return { id: contract.id };
}
