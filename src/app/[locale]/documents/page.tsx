import { FileSignature, FileText, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getRequiredWorkspace } from "@/lib/workspace";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";
import { DocumentsClient } from "./DocumentsClient";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const localizedHref = (href: string) =>
    href === "/" ? `/${locale}` : `/${locale}${href}`;
  const supabase = await createClient();
  const ctx = await getRequiredWorkspace(locale);

  const [
    { count: proposalsCount },
    { count: contractsCount },
    { count: deliverablesCount },
    { data: rawProposals },
    { data: rawContracts },
    { data: rawDeliverables },
  ] = await Promise.all([
    supabase
      .from("proposals")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", ctx.workspaceId),
    supabase
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", ctx.workspaceId),
    supabase
      .from("project_deliverables")
      .select("id, project:projects!inner(id)", { count: "exact", head: true })
      .eq("project.workspace_id", ctx.workspaceId),
    supabase
      .from("proposals")
      .select("id, title, proposal_number, status, client_name, updated_at, created_at")
      .eq("workspace_id", ctx.workspaceId)
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("contracts")
      .select("id, client_name, contract_number, status, updated_at, created_at")
      .eq("workspace_id", ctx.workspaceId)
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("project_deliverables")
      .select("id, title, created_at, project:projects!inner(id, name)")
      .eq("project.workspace_id", ctx.workspaceId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const hasDocuments =
    (proposalsCount || 0) > 0 ||
    (contractsCount || 0) > 0 ||
    (deliverablesCount || 0) > 0;

  // Map to unified DocItem shape
  const proposals = (rawProposals || []).map((p: any) => ({
    id: p.id,
    type: "proposal" as const,
    title: p.title || "Propuesta sin título",
    client: p.client_name || "Sin cliente",
    folio: p.proposal_number || "",
    status: p.status || "draft",
    updatedAt: p.updated_at || p.created_at,
    href: localizedHref(`/proposals/${p.id}/edit`),
  }));

  const contracts = (rawContracts || []).map((c: any) => ({
    id: c.id,
    type: "contract" as const,
    title: `Contrato – ${c.client_name || "Sin cliente"}`,
    client: c.client_name || "Sin cliente",
    folio: c.contract_number || "",
    status: c.status || "draft",
    updatedAt: c.updated_at || c.created_at,
    href: localizedHref(`/contracts/${c.id}/edit`),
  }));

  const deliverables = (rawDeliverables || []).map((d: any) => ({
    id: d.id,
    type: "deliverable" as const,
    title: d.title || "Entregable sin título",
    client: (d.project as any)?.name || "Proyecto",
    folio: "",
    status: "delivered",
    updatedAt: d.created_at,
    href: (d.project as any)?.id
      ? localizedHref(`/projects?projectId=${(d.project as any).id}`)
      : localizedHref("/projects"),
  }));

  // Build a lightweight activity feed from the same data
  const activity = [
    ...proposals.slice(0, 3).map((p) => ({
      id: `p-${p.id}`,
      label: p.status === "sent" ? "Propuesta enviada" : "Propuesta actualizada",
      docTitle: p.title,
      createdAt: p.updatedAt,
      type: "proposal" as const,
    })),
    ...contracts.slice(0, 3).map((c) => ({
      id: `c-${c.id}`,
      label: c.status === "signed" ? "Contrato firmado" : "Contrato actualizado",
      docTitle: c.title,
      createdAt: c.updatedAt,
      type: "contract" as const,
    })),
    ...deliverables.slice(0, 2).map((d) => ({
      id: `d-${d.id}`,
      label: "Entregable compartido",
      docTitle: d.title,
      createdAt: d.updatedAt,
      type: "deliverable" as const,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 md:px-8">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-5 rounded-[2rem] border border-white/8 bg-[#0C0C0C] p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/35">
            CRM Documents
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">Documentos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Centro documental del workspace: propuestas, contratos y entregables
            en un solo lugar.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={localizedHref("/proposals?new=proposal")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
          >
            <FileText className="h-4 w-4" />
            Nueva propuesta
          </Link>
          <Link
            href={localizedHref("/contracts?new=contract")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm text-white/70 transition-colors hover:text-white"
          >
            <FileSignature className="h-4 w-4" />
            Nuevo contrato
          </Link>
        </div>
      </div>

      {/* ── Metric cards (interactive links) ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={FileText}
          label="Propuestas"
          value={proposalsCount || 0}
          helper="Borradores y propuestas enviadas"
          href={localizedHref("/proposals")}
        />
        <MetricCard
          icon={FileSignature}
          label="Contratos"
          value={contractsCount || 0}
          helper="Acuerdos listos para firma o seguimiento"
          href={localizedHref("/contracts")}
        />
        <MetricCard
          icon={Briefcase}
          label="Entregables"
          value={deliverablesCount || 0}
          helper="Archivos y enlaces compartidos desde proyectos"
          href={localizedHref("/projects")}
        />
      </div>

      {/* ── Document hub ── */}
      {!hasDocuments ? (
        <ForgeEmptyState
          icon="folder"
          eyebrow="Documentos"
          title="Aún no hay documentos para este espacio"
          description="Esta vista reúne propuestas, contratos y entregables ya generados dentro del workspace. Empieza a llenarse cuando creas tu primer documento comercial o compartes avances operativos."
          guidance={["Propuestas", "Contratos", "Entregables"]}
          primaryAction={{
            label: "Crear propuesta",
            href: localizedHref("/proposals?new=proposal"),
            icon: "plus",
          }}
          secondaryAction={{
            label: "Ver proyectos",
            href: localizedHref("/projects"),
            icon: "arrow-right",
          }}
        />
      ) : (
        <DocumentsClient
          proposals={proposals}
          contracts={contracts}
          deliverables={deliverables}
          activity={activity}
          locale={locale}
        />
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  href,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  helper: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.75rem] border border-white/8 bg-white/[0.02] p-5 transition-all hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.26em] text-white/35">
          {label}
        </span>
        <Icon className="h-4 w-4 text-white/30 transition-colors group-hover:text-white/50" />
      </div>
      <div className="mt-4 text-4xl font-black tracking-tight text-white">
        {value}
      </div>
      <p className="mt-2 text-sm text-white/50">{helper}</p>
      <div className="mt-3 flex items-center gap-1 text-[10px] font-mono text-white/25 transition-colors group-hover:text-white/50">
        <ArrowRight className="h-3 w-3" />
        <span>Ver {label.toLowerCase()}</span>
      </div>
    </Link>
  );
}
