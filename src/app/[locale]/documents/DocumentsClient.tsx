"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  FileSignature,
  Briefcase,
  Search,
  ExternalLink,
  Copy,
  Download,
  Archive,
  Clock,
  CheckCircle2,
  Eye,
  Send,
  XCircle,
  FilePenLine,
  ChevronRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocType = "proposal" | "contract" | "deliverable";

type DocItem = {
  id: string;
  type: DocType;
  title: string;
  client: string;
  folio: string;
  status: string;
  updatedAt: string;
  href: string;
};

type ActivityEvent = {
  id: string;
  label: string;
  docTitle: string;
  createdAt: string;
  type: "proposal" | "contract" | "deliverable";
};

type Props = {
  proposals: DocItem[];
  contracts: DocItem[];
  deliverables: DocItem[];
  activity: ActivityEvent[];
  locale: string;
};

// ─── Status Config ────────────────────────────────────────────────────────────

const PROPOSAL_STATUS: Record<string, { label: string; classes: string; icon: React.ElementType }> = {
  draft:    { label: "Borrador",  classes: "bg-neutral-800 text-neutral-400 border-neutral-700", icon: FilePenLine },
  sent:     { label: "Enviada",   classes: "bg-blue-500/15 text-blue-400 border-blue-500/30",    icon: Send },
  viewed:   { label: "Vista",     classes: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Eye },
  accepted: { label: "Aceptada",  classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  rejected: { label: "Rechazada", classes: "bg-red-500/15 text-red-400 border-red-500/30",       icon: XCircle },
};

const CONTRACT_STATUS: Record<string, { label: string; classes: string; icon: React.ElementType }> = {
  draft:    { label: "Borrador",         classes: "bg-neutral-800 text-neutral-400 border-neutral-700",          icon: FilePenLine },
  sent:     { label: "Pend. firma",      classes: "bg-blue-500/15 text-blue-400 border-blue-500/30",             icon: Send },
  signed:   { label: "Firmado",          classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",    icon: CheckCircle2 },
  cancelled:{ label: "Cancelado",        classes: "bg-red-500/15 text-red-400 border-red-500/30",                icon: XCircle },
};

function StatusBadge({ type, status }: { type: DocType; status: string }) {
  const map = type === "contract" ? CONTRACT_STATUS : PROPOSAL_STATUS;
  const cfg = map[status] || { label: status, classes: "bg-neutral-800 text-neutral-400 border-neutral-700", icon: FilePenLine };
  const Icon = cfg.icon as React.FC<{ className?: string }>;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider ${cfg.classes}`}>
      <Icon className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  );
}

// ─── Document Row ─────────────────────────────────────────────────────────────

function DocRow({ doc }: { doc: DocItem }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + doc.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const typeIcon = doc.type === "proposal"
    ? FileText
    : doc.type === "contract"
    ? FileSignature
    : Briefcase;
  const TypeIcon = typeIcon;

  const age = (() => {
    try {
      return formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true });
    } catch {
      return "–";
    }
  })();

  return (
    <Link
      href={doc.href}
      className="group relative flex items-center gap-4 rounded-2xl border border-transparent bg-white/[0.02] px-4 py-3.5 transition-all hover:border-white/8 hover:bg-white/[0.04]"
    >
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03]">
        <TypeIcon className="h-4 w-4 text-white/40" />
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">{doc.title}</p>
          {doc.type !== "deliverable" && (
            <StatusBadge type={doc.type} status={doc.status} />
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/35">
          <span className="truncate">{doc.client}</span>
          {doc.folio && (
            <>
              <span className="text-white/15">·</span>
              <span className="font-mono">{doc.folio}</span>
            </>
          )}
          <span className="text-white/15">·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {age}
          </span>
        </div>
      </div>

      {/* Hover quick actions */}
      <div className="absolute right-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleCopy}
          className="rounded-lg border border-white/8 bg-[#0d0d0d] p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/80"
          title={copied ? "¡Copiado!" : "Copiar enlace"}
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(doc.href, "_blank"); }}
          className="rounded-lg border border-white/8 bg-[#0d0d0d] p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/80"
          title="Abrir documento"
        >
          <ExternalLink className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="rounded-lg border border-white/8 bg-[#0d0d0d] p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/80"
          title="Archivar"
        >
          <Archive className="h-3 w-3" />
        </button>
      </div>

      {/* Arrow when not hovered */}
      <ChevronRight className="h-4 w-4 shrink-0 text-white/15 transition-opacity group-hover:opacity-0" />
    </Link>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  proposal: Send,
  contract: CheckCircle2,
  deliverable: Briefcase,
};

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.02]">
      <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
        <Activity className="h-4 w-4 text-white/30" />
        <h2 className="text-sm font-semibold text-white">Actividad reciente</h2>
      </div>
      <div className="divide-y divide-white/[0.03] p-1">
        {events.map((ev) => {
          const Icon = (ACTIVITY_ICONS[ev.type] ?? Activity) as React.FC<{ className?: string }>;
          const age = (() => {
            try { return formatDistanceToNow(new Date(ev.createdAt), { addSuffix: true }); }
            catch { return "–"; }
          })();
          return (
            <div key={ev.id} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.03]">
                <Icon className="h-3 w-3 text-white/40" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/70">{ev.label}</p>
                <p className="mt-0.5 truncate text-[11px] font-medium text-white/50">{ev.docTitle}</p>
              </div>
              <span className="shrink-0 text-[10px] text-white/25">{age}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptySection({
  label,
  icon: IconRaw,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  label: string;
  icon: React.ElementType;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  const Icon = IconRaw as React.FC<{ className?: string }>;
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/8 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]">
        <Icon className="h-5 w-5 text-white/25" />
      </div>
      <p className="text-sm text-white/40">{label}</p>
      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          {primaryLabel}
          <ChevronRight className="h-3 w-3" />
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="text-xs text-white/30 transition-colors hover:text-white/60"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: "all",          label: "Todo" },
  { key: "proposal",     label: "Propuestas" },
  { key: "contract",     label: "Contratos" },
  { key: "deliverable",  label: "Entregables" },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]["key"];

export function DocumentsClient({ proposals, contracts, deliverables, activity, locale }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const localHref = (path: string) => path === "/" ? `/${locale}` : `/${locale}${path}`;

  const allDocs: DocItem[] = useMemo(() => [
    ...proposals, ...contracts, ...deliverables,
  ], [proposals, contracts, deliverables]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allDocs.filter((doc) => {
      const matchesFilter = filter === "all" || doc.type === filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.client.toLowerCase().includes(q) ||
        doc.folio.toLowerCase().includes(q)
      );
    });
  }, [allDocs, search, filter]);

  const groupedFiltered = {
    proposal:    filtered.filter((d) => d.type === "proposal"),
    contract:    filtered.filter((d) => d.type === "contract"),
    deliverable: filtered.filter((d) => d.type === "deliverable"),
  };

  const showSplit = filter === "all" && !search;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Search + Filters ── */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full rounded-2xl border border-white/8 bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-white/20 focus:bg-white/[0.04]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full border px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                filter === tab.key
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/8 bg-transparent text-white/40 hover:border-white/15 hover:text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Unified flat list when searching ── */}
      {!showSplit && (
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/8 px-6 py-10 text-center text-sm text-white/35">
              No se encontraron documentos con esa búsqueda.
            </div>
          ) : (
            filtered.map((doc) => <DocRow key={`${doc.type}-${doc.id}`} doc={doc} />)
          )}
        </div>
      )}

      {/* ── Sectioned grid when showing all ── */}
      {showSplit && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Proposals */}
          <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileText className="h-3.5 w-3.5 text-white/30" />
                  Propuestas
                </h2>
                <p className="mt-0.5 text-[11px] text-white/35">{proposals.length} documento{proposals.length !== 1 ? "s" : ""}</p>
              </div>
              <Link href={localHref("/proposals")} className="text-[10px] font-mono text-white/30 uppercase tracking-wider transition-colors hover:text-white/60">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-1 p-3">
              {proposals.length === 0 ? (
                <EmptySection
                  label="Todavía no hay propuestas."
                  icon={FileText}
                  primaryLabel="Crear propuesta"
                  primaryHref={localHref("/proposals?new=proposal")}
                />
              ) : (
                proposals.map((doc) => <DocRow key={doc.id} doc={doc} />)
              )}
            </div>
          </section>

          {/* Contracts */}
          <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <FileSignature className="h-3.5 w-3.5 text-white/30" />
                  Contratos
                </h2>
                <p className="mt-0.5 text-[11px] text-white/35">{contracts.length} documento{contracts.length !== 1 ? "s" : ""}</p>
              </div>
              <Link href={localHref("/contracts")} className="text-[10px] font-mono text-white/30 uppercase tracking-wider transition-colors hover:text-white/60">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-1 p-3">
              {contracts.length === 0 ? (
                <EmptySection
                  label="Todavía no hay contratos."
                  icon={FileSignature}
                  primaryLabel="Crear contrato"
                  primaryHref={localHref("/contracts?new=contract")}
                />
              ) : (
                contracts.map((doc) => <DocRow key={doc.id} doc={doc} />)
              )}
            </div>
          </section>

          {/* Deliverables */}
          <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Briefcase className="h-3.5 w-3.5 text-white/30" />
                  Entregables
                </h2>
                <p className="mt-0.5 text-[11px] text-white/35">{deliverables.length} documento{deliverables.length !== 1 ? "s" : ""}</p>
              </div>
              <Link href={localHref("/projects")} className="text-[10px] font-mono text-white/30 uppercase tracking-wider transition-colors hover:text-white/60">
                Ver proyectos →
              </Link>
            </div>
            <div className="space-y-1 p-3">
              {deliverables.length === 0 ? (
                <EmptySection
                  label="No hay entregables compartidos."
                  icon={Briefcase}
                  primaryLabel="Crear entregable"
                  primaryHref={localHref("/projects")}
                  secondaryLabel="Ver proyectos"
                  secondaryHref={localHref("/projects")}
                />
              ) : (
                deliverables.map((doc) => <DocRow key={doc.id} doc={doc} />)
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── Activity feed ── */}
      <ActivityFeed events={activity} />
    </div>
  );
}
