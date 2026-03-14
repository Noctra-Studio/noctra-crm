import { createClient } from "@/utils/supabase/server";
import { ClientsClient } from "./ClientsClient";
import { getRequiredWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function ForgeClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const ctx = await getRequiredWorkspace(locale);

  const [
    { data: projectClients, error: projectsError },
    { data: contractClients, error: contractsError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select(
        `
        id,
        name,
        status,
        service_type,
        created_at,
        client_name,
        client_email,
        client_company,
        lead_id,
        contract_id
      `,
      )
      .eq("workspace_id", ctx.workspaceId)
      .not("status", "eq", "cancelled")
      .order("created_at", { ascending: false }),
    supabase
      .from("contracts")
      .select(
        `
        id,
        contract_number,
        client_name,
        client_email,
        client_company,
        service_type,
        total_price,
        client_signed_at,
        created_at
      `,
      )
      .eq("workspace_id", ctx.workspaceId)
      .eq("signed_by_client", true)
      .eq("status", "signed")
      .is("project_id", null)
      .order("created_at", { ascending: false }),
  ]);

  if (projectsError) {
    console.error("Error fetching projects for clients view:", {
      message: projectsError.message,
      details: projectsError.details,
      hint: projectsError.hint,
      code: projectsError.code,
    });
  }

  if (contractsError) {
    console.error("Error fetching contracts for clients view:", {
      message: contractsError.message,
      details: contractsError.details,
      hint: contractsError.hint,
      code: contractsError.code,
    });
  }

  // Merge and deduplicate by email
  const mergedClients = new Map();

  // 1. Project-based clients (Active/Completed)
  (projectClients || []).forEach((p) => {
    const email = p.client_email || `p-${p.id}`;
    mergedClients.set(email, {
      id: p.id,
      name: p.client_name ?? p.name,
      email: p.client_email,
      company: p.client_company,
      serviceType: p.service_type,
      status: p.status,
      phase: (p as any).phase, // Need to make sure project table has phase or map it
      source: "project",
      projectId: p.id,
      createdAt: p.created_at,
    });
  });

  // 2. Contract-only clients (Signed but no project yet)
  (contractClients || []).forEach((c) => {
    const email = c.client_email || `c-${c.id}`;
    if (!mergedClients.has(email)) {
      mergedClients.set(email, {
        id: c.id,
        name: c.client_name,
        email: c.client_email,
        company: c.client_company,
        serviceType: c.service_type,
        status: "pending_project",
        phase: null,
        source: "contract",
        projectId: null,
        createdAt: c.created_at,
      });
    }
  });

  const finalClients = Array.from(mergedClients.values());

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ClientsClient initialClients={finalClients} />
    </div>
  );
}
