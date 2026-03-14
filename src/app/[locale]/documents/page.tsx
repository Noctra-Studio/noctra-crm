import { FileSignature, FileText, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getRequiredWorkspace } from "@/lib/workspace";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";

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
    { data: recentProposals },
    { data: recentContracts },
    { data: recentDeliverables },
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
      .select("id, title, proposal_number, created_at")
      .eq("workspace_id", ctx.workspaceId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("contracts")
      .select("id, client_name, contract_number, created_at")
      .eq("workspace_id", ctx.workspaceId)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("project_deliverables")
      .select("id, title, created_at, project:projects!inner(id, name)")
      .eq("project.workspace_id", ctx.workspaceId)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const hasDocuments =
    (proposalsCount || 0) > 0 ||
    (contractsCount || 0) > 0 ||
    (deliverablesCount || 0) > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 md:px-8">
      <div className="flex flex-col gap-5 rounded-[2rem] border border-white/8 bg-[#0C0C0C] p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/35">
            CRM Documents
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">Documentos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Este módulo funciona como centro documental del workspace:
            concentra propuestas, contratos y entregables compartidos para dar
            seguimiento claro a lo que ya se generó, se envió o quedó en
            revisión con clientes.
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
        <div className="grid gap-6 lg:grid-cols-3">
          <DocumentsListCard
            title="Propuestas recientes"
            helper="Documentos comerciales en edición o seguimiento"
            emptyLabel="Todavía no has creado propuestas."
            emptyAction={{
              label: "Crear propuesta",
              href: localizedHref("/proposals?new=proposal"),
            }}
            items={(recentProposals || []).map((proposal: any) => ({
              id: proposal.id,
              title: proposal.title || "Propuesta sin título",
              meta: proposal.proposal_number || "Sin folio",
              href: localizedHref(`/proposals/${proposal.id}/edit`),
            }))}
          />
          <DocumentsListCard
            title="Contratos recientes"
            helper="Acuerdos legales listos para gestionar"
            emptyLabel="Todavía no hay contratos en este workspace."
            emptyAction={{
              label: "Crear contrato",
              href: localizedHref("/contracts?new=contract"),
            }}
            items={(recentContracts || []).map((contract: any) => ({
              id: contract.id,
              title: contract.client_name || "Contrato sin cliente",
              meta: contract.contract_number || "Sin folio",
              href: localizedHref(`/contracts/${contract.id}/edit`),
            }))}
          />
          <DocumentsListCard
            title="Entregables recientes"
            helper="Recursos operativos compartidos para revisión o seguimiento"
            emptyLabel="No se han compartido entregables todavía."
            emptyAction={{ label: "Ir a proyectos", href: localizedHref("/projects") }}
            items={(recentDeliverables || []).map((deliverable: any) => ({
              id: deliverable.id,
              title: deliverable.title || "Entregable sin título",
              meta: deliverable.project?.name || "Proyecto",
              href: deliverable.project?.id
                ? localizedHref(`/projects?projectId=${deliverable.project.id}`)
                : localizedHref("/projects"),
            }))}
          />
        </div>
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
      className="rounded-[1.75rem] border border-white/8 bg-white/[0.02] p-5 transition-colors hover:border-white/15 hover:bg-white/[0.03]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.26em] text-white/35">
          {label}
        </span>
        <Icon className="h-4 w-4 text-white/30" />
      </div>
      <div className="mt-4 text-4xl font-black tracking-tight text-white">
        {value}
      </div>
      <p className="mt-2 text-sm text-white/50">{helper}</p>
    </Link>
  );
}

function DocumentsListCard({
  title,
  helper,
  emptyLabel,
  emptyAction,
  items,
}: {
  title: string;
  helper: string;
  emptyLabel: string;
  emptyAction?: { label: string; href: string };
  items: Array<{ id: string; title: string; meta: string; href: string }>;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.02]">
      <div className="border-b border-white/5 px-5 py-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-white/45">{helper}</p>
      </div>
      <div className="p-3">
        {items.length === 0 ? (
          <ForgeEmptyState
            icon="folder"
            size="compact"
            eyebrow={title}
            title={emptyLabel}
            description="Usa la acción recomendada para generar el primer documento relacionado con esta categoría."
            primaryAction={
              emptyAction
                ? {
                    label: emptyAction.label,
                    href: emptyAction.href,
                    icon: "arrow-right",
                  }
                : undefined
            }
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-white/35">
                    {item.meta}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/25" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
