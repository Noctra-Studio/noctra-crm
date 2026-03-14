import { createAdminClient } from "@/utils/supabase/admin";
import { FileText } from "lucide-react";
import { recordWorkspaceActivity } from "@/lib/activity";
import { ClientContractClient } from "./ClientContractClient";

export const dynamic = "force-dynamic";

export default async function ClientContractPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createAdminClient();

  // 1. Fetch contract by client_token with workspace info
  const { data: contract, error } = await supabase
    .from("contracts")
    .select(
      `
      *,
      proposal:proposals(proposal_number),
      workspace:workspaces(*)
    `,
    )
    .eq("client_token", params.token)
    .single();

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-neutral-300">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">
          Contrato no encontrado
        </h1>
        <p className="text-neutral-300 text-xs font-mono uppercase tracking-[0.2em]">
          Verifica el enlace o contacta con nosotros.
        </p>
      </div>
    );
  }

  // 2. On load: UPDATE status = 'viewed' if was 'sent'
  if (contract.status === "sent") {
    await supabase
      .from("contracts")
      .update({ status: "viewed", updated_at: new Date().toISOString() })
      .eq("id", contract.id);

    await recordWorkspaceActivity(supabase, {
      workspaceId: contract.workspace_id,
      entityType: "contract",
      entityId: contract.id,
      eventType: "contract.viewed",
      title: "Contrato visto",
      description: `${contract.client_name || "El cliente"} abrió ${contract.contract_number || "el contrato"}.`,
      metadata: {
        contractNumber: contract.contract_number || "",
        clientName: contract.client_name || "",
      },
    });
  }

  return <ClientContractClient contract={contract} params={params} />;
}
