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
        created_at,
        client_name,
        client_email,
        client_company,
        lead_id,
        contract_id,
        contracts:contract_id ( service_type )
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

  // Fetch activity for clients
  const { data: activityEvents } = await supabase
    .from("workspace_activity_events")
    .select("entity_id, created_at, entity_type")
    .in("entity_type", ["project", "contract", "client"])
    .order("created_at", { ascending: false });

  // Merge and deduplicate by email
  const mergedClients = new Map();

  // 1. Helper to find latest activity
  const getLatestActivity = (clientEmail: string, projectIds: string[], contractIds: string[]) => {
    const relevantEvents = (activityEvents || []).filter(e => 
      (e.entity_type === 'project' && projectIds.includes(e.entity_id || '')) ||
      (e.entity_type === 'contract' && contractIds.includes(e.entity_id || ''))
    );
    return relevantEvents[0]?.created_at || null;
  };

  // Process Projects
  (projectClients || []).forEach((p) => {
    const email = p.client_email || `p-${p.id}`;
    const existing = mergedClients.get(email) || {
      id: p.id,
      name: p.client_name ?? p.name,
      email: p.client_email,
      company: p.client_company,
      serviceType: (p as any).contracts?.service_type ?? null,
      status: p.status,
      source: "project",
      projectIds: [],
      contractIds: [],
      totalRevenue: 0,
      activeProjects: 0,
      createdAt: p.created_at,
    };

    existing.projectIds.push(p.id);
    if (p.contract_id) existing.contractIds.push(p.contract_id);
    if (['discovery', 'build'].includes(p.status)) {
      existing.activeProjects++;
    }
    
    mergedClients.set(email, existing);
  });

  // Process Contracts for Revenue and Missing Clients
  (contractClients || []).forEach((c) => {
    const email = c.client_email || `c-${c.id}`;
    let existing = mergedClients.get(email);

    if (!existing) {
      existing = {
        id: c.id,
        name: c.client_name,
        email: c.client_email,
        company: c.client_company,
        serviceType: c.service_type,
        status: "pending_project",
        source: "contract",
        projectIds: [],
        contractIds: [],
        totalRevenue: 0,
        activeProjects: 0,
        createdAt: c.created_at,
      };
      mergedClients.set(email, existing);
    }

    if (!existing.contractIds.includes(c.id)) {
      existing.contractIds.push(c.id);
    }
    existing.totalRevenue += Number(c.total_price || 0);
  });

  const finalClients = Array.from(mergedClients.values()).map(client => {
    const lastActivity = getLatestActivity(client.email, client.projectIds, client.contractIds) || client.createdAt;
    
    // Calculate Health
    let health: 'healthy' | 'attention' | 'risk' = 'healthy';
    const daysSinceActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActivity > 10) health = 'risk';
    else if (daysSinceActivity > 5 || client.status === 'pending_project') health = 'attention';

    return {
      ...client,
      lastActivity,
      health
    };
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ClientsClient initialClients={finalClients} />
    </div>
  );
}
