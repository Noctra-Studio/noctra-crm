"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function exportToAccounting(contractId: string) {
  const supabase = await createClient();

  // 1. Fetch the contract and associated project/lead to verify tax profile
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select(`
      id,
      total_price,
      project_id,
      projects ( lead_id )
    `)
    .eq("id", contractId)
    .single();

  if (contractError || !contract) {
    throw new Error("Contrato no encontrado.");
  }

  // 2. Validate existence of tax profile for the client (lead)
  // Assuming the contract is linked to a project, which is linked to a lead.
  // We extract the lead ID to find the tax profile.
  // Supabase may return it as an array or object depending on relationship.
  const leadId = Array.isArray(contract.projects) ? contract.projects[0]?.lead_id : (contract.projects as any)?.lead_id;

  if (!leadId) {
    throw new Error("Contrato no tiene un Lead asociado para facturación.");
  }

  const { data: taxProfile, error: taxError } = await supabase
    .from("tax_profiles")
    .select("*")
    .eq("lead_id", leadId)
    .single();

  if (taxError || !taxProfile) {
    // We update the contract status to error
    await supabase
      .from("contracts")
      .update({
        accounting_sync_status: "error",
        accounting_sync_error: "Falta perfil fiscal (RFC/Dirección) del cliente.",
      })
      .eq("id", contractId);

    revalidatePath(`/contracts/${contractId}/edit`);
    throw new Error("El cliente no tiene un perfil fiscal configurado.");
  }

  // 3. Simulate API Call to Xero / QuickBooks
  // In a real scenario, you would build the JSON/XML payload and send it via fetch()
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

  // Simulate a successful response with a generated external ID
  const mockExternalId = `QB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // 4. Update Contract with success status
  const { error: updateError } = await supabase
    .from("contracts")
    .update({
      accounting_sync_status: "synced",
      accounting_external_id: mockExternalId,
      accounting_synced_at: new Date().toISOString(),
      accounting_sync_error: null, // clear previous errors
    })
    .eq("id", contractId);

  if (updateError) {
    throw new Error("Error al actualizar el estado de sincronización.");
  }

  revalidatePath(`/contracts/${contractId}/edit`);
  return { success: true, externalId: mockExternalId };
}
