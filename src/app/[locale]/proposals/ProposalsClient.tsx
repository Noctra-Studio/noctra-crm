"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit3,
  FileText,
  Trash2,
  Copy,
  Send,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  ChevronRight,
  Clock,
  ExternalLink,
} from "lucide-react";
import { LeadScoreBadge } from "@/components/forge/LeadScoreBadge";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { ForgeSkeleton, ForgeMetricCardSkeleton, ForgeProposalRowSkeleton } from "@/components/forge/ForgeSkeleton";
import { NewProposalModal } from "./NewProposalModal";
import { useFollowUps } from "@/hooks/useFollowUps";
import { FollowUpModal } from "@/components/forge/FollowUpModal";
import { FollowUpSuggestion } from "@/app/actions/followup";
import { createContractFromProposalAction } from "@/app/actions/contracts";
import { deleteProposalAction, updateProposalAction } from "@/app/actions/proposals";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";
import { createPortal } from "react-dom";

// ─── Types ──────────────────────────────────────────────────────────────────

type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired";

type Proposal = {
  id: string;
  proposal_number: string;
  title: string;
  status: ProposalStatus;
  total: number;
  valid_until: string;
  created_at: string;
  sent_at?: string | null;
  viewed_at?: string | null;
  view_count?: number;
  public_uuid?: string;
  client_company?: string | null;
  service_type?: string | null;
  lead: {
    name: string;
    email: string;
    lead_score?: number;
    lead_score_breakdown?: any;
  };
};

type SortKey = "client" | "total" | "status" | "created_at" | "title";
type SortDir = "asc" | "desc";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; color: string; order: number }
> = {
  draft: {
    label: "Borrador",
    color: "text-neutral-400 bg-neutral-500/10 border-neutral-500/20",
    order: 0,
  },
  sent: {
    label: "Enviada",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    order: 1,
  },
  viewed: {
    label: "Vista",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    order: 2,
  },
  accepted: {
    label: "Aceptada",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    order: 3,
  },
  rejected: {
    label: "Rechazada",
    color: "text-red-400 bg-red-400/10 border-red-400/20",
    order: 4,
  },
  expired: {
    label: "Expirada",
    color: "text-neutral-500 bg-neutral-500/8 border-neutral-600/20",
    order: 5,
  },
};

const ALL_FILTER_STATUSES: Array<{ key: string; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "draft", label: "Borrador" },
  { key: "sent", label: "Enviada" },
  { key: "viewed", label: "Vista" },
  { key: "accepted", label: "Aceptada" },
  { key: "rejected", label: "Rechazada" },
  { key: "expired", label: "Expirada" },
];

function getUrgencyLevel(proposal: Proposal): "neutral" | "amber" | "red" {
  if (proposal.status === "draft" || proposal.status === "accepted") return "neutral";

  const refDate = proposal.viewed_at || proposal.sent_at || proposal.created_at;
  if (!refDate) return "neutral";

  const days = differenceInDays(new Date(), new Date(refDate));
  if (days > 14) return "red";
  if (days >= 7) return "amber";
  return "neutral";
}

function getUrgencyDot(level: "neutral" | "amber" | "red") {
  if (level === "red") return "bg-red-500";
  if (level === "amber") return "bg-amber-500";
  return null;
}

function formatCurrency(val: number) {
  return `$${val.toLocaleString("es-MX")}`;
}

function relativeTime(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const days = differenceInDays(new Date(), new Date(dateStr));
  if (days === 0) return "Hoy";
  if (days === 1) return "Hace 1 día";
  return `Hace ${days} días`;
}

// ─── Summary Cards ──────────────────────────────────────────────────────────

function SummaryCards({ proposals, isLoading }: { proposals: Proposal[]; isLoading: boolean }) {
  const stats = useMemo(() => {
    const sent = proposals.filter((p) =>
      ["sent", "viewed", "accepted", "rejected"].includes(p.status),
    ).length;
    const accepted = proposals.filter((p) => p.status === "accepted").length;
    const pendingValue = proposals
      .filter((p) => ["sent", "viewed"].includes(p.status))
      .reduce((acc, p) => acc + (p.total || 0), 0);
    const revenueClosed = proposals
      .filter((p) => p.status === "accepted")
      .reduce((acc, p) => acc + (p.total || 0), 0);
    return { sent, accepted, pendingValue, revenueClosed };
  }, [proposals]);

  const cards = [
    { label: "Enviadas", value: stats.sent.toString() },
    { label: "Aceptadas", value: stats.accepted.toString() },
    {
      label: "Valor pendiente",
      value: formatCurrency(stats.pendingValue),
      sub: "MXN",
    },
    {
      label: "Revenue cerrado",
      value: formatCurrency(stats.revenueClosed),
      sub: "MXN",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {isLoading ? (
        <ForgeMetricCardSkeleton repeat={4} />
      ) : (
        cards.map((card) => (
          <div
            key={card.label}
            className="bg-white/[0.02] border border-white/5 p-4 space-y-2"
          >
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500">
              {card.label}
            </span>
            <div className="text-2xl font-black tracking-tight text-white">
              {card.value}
              {card.sub && (
                <span className="text-[10px] font-normal text-neutral-600 ml-1">
                  {card.sub}
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Follow-up Alert Card (grouped) ─────────────────────────────────────────

function FollowUpAlertCard({
  suggestions,
  onViewProposals,
}: {
  suggestions: FollowUpSuggestion[];
  onViewProposals: () => void;
}) {
  const viewedNoReply = suggestions.filter(
    (s) => s.type === "proposal_viewed_3d",
  ).length;
  const neverOpened = suggestions.filter(
    (s) => s.type === "proposal_sent_5d",
  ).length;

  if (viewedNoReply === 0 && neverOpened === 0) return null;

  return (
    <div className="bg-amber-500/5 border border-amber-500/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black">
            Seguimiento pendiente
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            {viewedNoReply > 0 && (
              <span className="text-xs text-neutral-300">
                {viewedNoReply} propuesta{viewedNoReply !== 1 ? "s" : ""} vista
                {viewedNoReply !== 1 ? "s" : ""} sin respuesta
              </span>
            )}
            {neverOpened > 0 && (
              <span className="text-xs text-neutral-300">
                {neverOpened} propuesta{neverOpened !== 1 ? "s" : ""} sin abrir
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={onViewProposals}
        className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase tracking-widest hover:bg-amber-500/20 transition-colors shrink-0"
      >
        Ver propuestas
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Actions Dropdown (Portal) ──────────────────────────────────────────────

function ProposalActionsDropdown({
  proposal,
  onDelete,
  onConvertToContract,
}: {
  proposal: Proposal;
  onDelete: (id: string) => void;
  onConvertToContract: (p: Proposal) => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.right - 176 });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const timeout = setTimeout(() => {
      document.addEventListener("click", close);
      document.addEventListener("scroll", close, true);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/client/proposal/${proposal.public_uuid}`;
    navigator.clipboard.writeText(url);
    setOpen(false);
  };

  const actions = [
    // Edit
    ["draft", "sent", "viewed"].includes(proposal.status) && {
      label: "Editar",
      icon: Edit3,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/proposals/${proposal.id}/edit`);
      },
    },
    // Preview
    {
      label: "Previsualizar",
      icon: ExternalLink,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`/client/proposal/${proposal.public_uuid}`, "_blank");
      },
    },
    // Copy link
    proposal.public_uuid && {
      label: "Copiar enlace",
      icon: Copy,
      onClick: handleCopyLink,
    },
    // Convert to contract
    proposal.status === "accepted" && {
      label: "Crear contrato",
      icon: FileText,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onConvertToContract(proposal);
      },
      color: "text-emerald-400",
    },
    // Delete
    proposal.status === "draft" && {
      label: "Eliminar",
      icon: Trash2,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(proposal.id);
      },
      color: "text-red-400",
      border: true,
    },
  ].filter(Boolean) as Array<{
    label: string;
    icon: any;
    onClick: (e: React.MouseEvent) => void;
    color?: string;
    border?: boolean;
  }>;

  const dropdown = open ? (
    <div
      style={{ position: "fixed", top: position.top, left: position.left, zIndex: 50 }}
      className="w-44 bg-[#111] border border-[#1f1f1f] shadow-xl rounded-sm py-1"
      onClick={(e) => e.stopPropagation()}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors text-left ${action.color || "text-white"} ${action.border ? "border-t border-[#1f1f1f]" : ""}`}
        >
          <action.icon className="w-3.5 h-3.5" />
          {action.label}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1.5 hover:bg-white/5 rounded transition-colors opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal className="w-4 h-4 text-neutral-400" />
      </button>
      {typeof window !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}

// ─── Inline Hover Actions ───────────────────────────────────────────────────

function RowHoverActions({
  proposal,
  onConvertToContract,
}: {
  proposal: Proposal;
  onConvertToContract: (p: Proposal) => void;
}) {
  const router = useRouter();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/client/proposal/${proposal.public_uuid}`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado al portapapeles");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      whileHover={{ opacity: 1, x: 0 }}
      animate={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.15 }}
      className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5 bg-[#0a0a0a] border border-white/8 rounded-sm px-1 py-0.5 shadow-lg z-10"
    >
      {["draft", "sent", "viewed"].includes(proposal.status) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/proposals/${proposal.id}/edit`);
          }}
          title="Editar"
          className="p-1.5 hover:bg-white/8 rounded-sm transition-colors text-neutral-400 hover:text-white"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.open(`/client/proposal/${proposal.public_uuid}`, "_blank");
        }}
        title="Previsualizar"
        className="p-1.5 hover:bg-white/8 rounded-sm transition-colors text-neutral-400 hover:text-white"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
      {proposal.public_uuid && (
        <button
          onClick={handleCopyLink}
          title="Copiar enlace"
          className="p-1.5 hover:bg-white/8 rounded-sm transition-colors text-neutral-400 hover:text-white"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
      {proposal.status === "accepted" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConvertToContract(proposal);
          }}
          title="Crear contrato"
          className="p-1.5 hover:bg-white/8 rounded-sm transition-colors text-emerald-500 hover:text-emerald-400"
        >
          <FileText className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

// ─── Sortable Header ────────────────────────────────────────────────────────

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "right" | "center";
}) {
  const isActive = currentSort === sortKey;
  const alignClass =
    align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";

  return (
    <th
      className={`py-3.5 px-4 text-${align}`}
      onClick={() => onSort(sortKey)}
    >
      <button
        className={`inline-flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"} ${alignClass}`}
      >
        {label}
        {isActive ? (
          currentDir === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover/thead:opacity-40" />
        )}
      </button>
    </th>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ProposalsClient({
  initialProposals,
}: {
  initialProposals: any[];
}) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] =
    useState<FollowUpSuggestion | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const { suggestions, dismiss, refresh } = useFollowUps();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldOpenCreateModal = searchParams.get("new") === "proposal";

  // ─── Filtered & Sorted ─────────────────────────────────────────────────

  const processed = useMemo(() => {
    let result = [...proposals];

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.lead?.name?.toLowerCase().includes(q) ||
          p.lead?.email?.toLowerCase().includes(q) ||
          p.proposal_number?.toLowerCase().includes(q) ||
          p.client_company?.toLowerCase().includes(q),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "client":
          cmp = (a.lead?.name || "").localeCompare(b.lead?.name || "");
          break;
        case "total":
          cmp = (a.total || 0) - (b.total || 0);
          break;
        case "status":
          cmp =
            (STATUS_CONFIG[a.status]?.order ?? 9) -
            (STATUS_CONFIG[b.status]?.order ?? 9);
          break;
        case "created_at":
          cmp =
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime();
          break;
        case "title":
          cmp = (a.title || "").localeCompare(b.title || "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [proposals, searchQuery, statusFilter, sortKey, sortDir]);

  useEffect(() => {
    const handleNavigate = (e: any) => {
      const { direction } = e.detail;
      setFocusIndex((prev) => {
        if (direction === "next") return Math.min(prev + 1, processed.length - 1);
        if (direction === "prev") return Math.max(prev - 1, 0);
        return prev;
      });
    };

    const handleSelect = () => {
      if (focusIndex >= 0 && processed[focusIndex]) {
        router.push(`/proposals/${processed[focusIndex].id}/edit`);
      }
    };

    window.addEventListener("forge-navigate", handleNavigate as any);
    window.addEventListener("forge-select-active", handleSelect as any);
    return () => {
      window.removeEventListener("forge-navigate", handleNavigate as any);
      window.removeEventListener("forge-select-active", handleSelect as any);
    };
  }, [focusIndex, processed, router]);

  useEffect(() => {
    if (shouldOpenCreateModal) setIsModalOpen(true);
  }, [shouldOpenCreateModal]);

  const proposalSuggestions = suggestions.filter(
    (s) => s.type === "proposal_viewed_3d" || s.type === "proposal_sent_5d",
  );

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleConvertToContract = async (proposal: Proposal) => {
    try {
      const result = await createContractFromProposalAction(proposal.id);
      toast.success("Contrato creado exitosamente");
      router.push(`/contracts/${result.id}/edit`);
    } catch (err: any) {
      console.error(err);
      toast.error("Error al crear contrato");
    }
  };

  const handleUpdateTitle = async (id: string) => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    
    try {
      await updateProposalAction(id, { title: editingTitle });
      setProposals(prev => prev.map(p => p.id === id ? { ...p, title: editingTitle } : p));
      toast.success("Propuesta actualizada");
    } catch (err) {
      toast.error("Error al actualizar");
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!confirm("¿Eliminar esta propuesta? Esta acción no se puede deshacer."))
      return;
    try {
      await deleteProposalAction(proposalId);
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
    } catch (err: any) {
      console.error(err);
      alert("Error al eliminar: " + (err.message || "Error desconocido"));
    }
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("new");
    router.replace(
      nextParams.toString() ? `/proposals?${nextParams}` : "/proposals",
    );
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "total" ? "desc" : "asc");
    }
  };

  const handleFilterFollowUps = () => {
    setStatusFilter("viewed");
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <header className="px-5 md:px-8 py-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#050505]/50 backdrop-blur-xl sticky top-0 z-10">
        <div>
          <h2 className="text-[9px] font-mono uppercase tracking-[0.3em] text-neutral-500 mb-0.5">
            Propuestas
          </h2>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Proposal Builder
          </h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-4 py-2 flex items-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span className="text-[11px] font-black uppercase tracking-widest">
            Nueva Propuesta
          </span>
        </button>
      </header>

      {proposals.length === 0 ? (
        <div className="px-5 md:px-8 py-10">
          <ForgeEmptyState
            icon="file-text"
            eyebrow="Propuestas"
            title="Todavía no has preparado propuestas"
            description="Aquí conviertes oportunidades en documentos comerciales listos para negociar, enviar y convertir después en contrato."
            guidance={["Borradores", "Pricing", "Cierre comercial"]}
            primaryAction={{
              label: "Nueva propuesta",
              onClick: () => setIsModalOpen(true),
              icon: "plus",
            }}
            secondaryAction={{
              label: "Ir a leads",
              href: "/leads",
              icon: "arrow-right",
            }}
          />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="px-5 md:px-8 pt-6">
            <SummaryCards proposals={proposals} isLoading={isLoading} />
          </div>

          {/* Follow-up Alert (grouped) */}
          {proposalSuggestions.length > 0 && (
            <div className="px-5 md:px-8 pt-4">
              <FollowUpAlertCard
                suggestions={proposalSuggestions}
                onViewProposals={handleFilterFollowUps}
              />
            </div>
          )}

          {/* Toolbar: Search + Filters */}
          <div className="px-5 md:px-8 pt-5 pb-2 flex flex-col md:flex-row items-stretch md:items-center gap-3 shrink-0">
            <div className="relative flex-1 max-w-md min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar por cliente, título o folio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/8 px-9 py-2 min-h-[40px] text-[11px] font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {ALL_FILTER_STATUSES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                    statusFilter === s.key
                      ? "bg-white/8 text-white border border-white/15"
                      : "text-neutral-500 hover:text-neutral-300 border border-transparent hover:border-white/8"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="px-5 md:px-8 py-2">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse min-w-[1000px]">
                <thead className="group/thead">
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3.5 px-4 text-[9px] font-mono uppercase tracking-[0.15em] text-neutral-500 font-medium w-[100px]">
                      Folio
                    </th>
                    <SortableHeader
                      label="Cliente"
                      sortKey="client"
                      currentSort={sortKey}
                      currentDir={sortDir}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Servicio / Título"
                      sortKey="title"
                      currentSort={sortKey}
                      currentDir={sortDir}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Inversión"
                      sortKey="total"
                      currentSort={sortKey}
                      currentDir={sortDir}
                      onSort={handleSort}
                      align="right"
                    />
                    <SortableHeader
                      label="Estado"
                      sortKey="status"
                      currentSort={sortKey}
                      currentDir={sortDir}
                      onSort={handleSort}
                      align="center"
                    />
                    <th className="py-3.5 px-4 text-left text-[9px] font-mono uppercase tracking-[0.15em] text-neutral-500 font-medium">
                      Actividad
                    </th>
                    <SortableHeader
                      label="Fecha"
                      sortKey="created_at"
                      currentSort={sortKey}
                      currentDir={sortDir}
                      onSort={handleSort}
                      align="right"
                    />
                    <th className="py-3.5 px-4 text-right text-[9px] font-mono uppercase tracking-[0.15em] text-neutral-500 font-medium w-[100px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <ForgeProposalRowSkeleton repeat={5} />
                  ) : processed.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="mx-auto max-w-xl px-4">
                          <ForgeEmptyState
                            icon="search"
                            size="compact"
                            eyebrow="Búsqueda"
                            title="No encontramos propuestas con ese filtro"
                            description="Prueba con otro folio, nombre del cliente o título del documento."
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    processed.map((proposal, idx) => {
                      const urgency = getUrgencyLevel(proposal);
                      const urgencyDot = getUrgencyDot(urgency);
                      const sc = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft;
                      const viewedAgo = relativeTime(proposal.viewed_at);
                      const sentAgo = relativeTime(proposal.sent_at);
                      const isFocused = focusIndex === idx;

                      return (
                        <tr
                          key={proposal.id}
                          onClick={() =>
                            router.push(`/proposals/${proposal.id}/edit`)
                          }
                          className={`group hover:bg-white/[0.025] transition-colors cursor-pointer border-b border-white/[0.03] relative ${isFocused ? "bg-white/[0.04] ring-1 ring-inset ring-white/10" : ""}`}
                        >
                          {/* Folio */}
                          <td className="py-4 px-4">
                            <span className="font-mono text-[11px] text-white/30 group-hover:text-emerald-500/70 transition-colors">
                              {proposal.proposal_number || "—"}
                            </span>
                          </td>

                          {/* Client */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-white tracking-tight">
                                  {proposal.lead?.name || "Cliente Manual"}
                                </span>
                                {proposal.lead?.lead_score !== undefined && (
                                  <LeadScoreBadge
                                    score={proposal.lead.lead_score}
                                  />
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-neutral-600">
                                {proposal.lead?.email || "—"}
                              </span>
                            </div>
                          </td>

                          {/* Service / Title */}
                          <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                            {editingId === proposal.id ? (
                              <input
                                autoFocus
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleUpdateTitle(proposal.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                onBlur={() => handleUpdateTitle(proposal.id)}
                                className="bg-white/5 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/20 w-full"
                              />
                            ) : (
                              <span 
                                onDoubleClick={() => {
                                  setEditingId(proposal.id);
                                  setEditingTitle(proposal.title);
                                }}
                                className="text-xs text-neutral-400 line-clamp-1 hover:text-white transition-colors cursor-text"
                              >
                                {proposal.title}
                              </span>
                            )}
                          </td>

                          {/* Investment */}
                          <td className="py-4 px-4 text-right">
                            <span className="font-mono text-sm font-bold text-white tabular-nums">
                              {formatCurrency(proposal.total || 0)}
                            </span>
                            <span className="text-[9px] text-neutral-600 ml-1 font-mono">
                              MXN
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <div className="flex justify-center items-center gap-1.5">
                              {urgencyDot && (
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${urgencyDot} ${urgency === "red" ? "animate-pulse" : ""}`}
                                />
                              )}
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-mono uppercase tracking-widest ${sc.color}`}
                              >
                                {proposal.status === "viewed" && (
                                  <Eye className="w-2.5 h-2.5" />
                                )}
                                {sc.label}
                              </span>
                            </div>
                          </td>

                          {/* Engagement / Activity */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-0.5 text-[10px] font-mono">
                              {proposal.view_count != null &&
                              proposal.view_count > 0 ? (
                                <>
                                  <span className="text-neutral-400">
                                    <Eye className="w-3 h-3 inline mr-1 -mt-px" />
                                    {proposal.view_count} vista
                                    {proposal.view_count !== 1 ? "s" : ""}
                                  </span>
                                  {viewedAgo && (
                                    <span
                                      className={
                                        urgency === "red"
                                          ? "text-red-400"
                                          : urgency === "amber"
                                            ? "text-amber-400"
                                            : "text-neutral-600"
                                      }
                                    >
                                      {viewedAgo}
                                    </span>
                                  )}
                                </>
                              ) : proposal.sent_at ? (
                                <span className="text-neutral-600">
                                  <Send className="w-3 h-3 inline mr-1 -mt-px" />
                                  Enviada {sentAgo?.toLowerCase()}
                                </span>
                              ) : (
                                <span className="text-neutral-700">—</span>
                              )}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-mono text-neutral-500">
                                {format(
                                  new Date(proposal.created_at),
                                  "dd/MM/yyyy",
                                )}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-700">
                                Exp.{" "}
                                {proposal.valid_until
                                  ? format(
                                      new Date(proposal.valid_until),
                                      "dd/MM",
                                    )
                                  : "—"}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 relative">
                            <RowHoverActions
                              proposal={proposal}
                              onConvertToContract={handleConvertToContract}
                            />
                            <div className="flex justify-end">
                              <ProposalActionsDropdown
                                proposal={proposal}
                                onDelete={handleDelete}
                                onConvertToContract={handleConvertToContract}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid md:hidden gap-3 pb-8">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <ForgeSkeleton className="h-4 w-32" />
                      <ForgeSkeleton className="h-3 w-16" />
                    </div>
                    <ForgeSkeleton className="h-3 w-48" />
                    <div className="flex justify-between items-end pt-2">
                      <ForgeSkeleton className="h-2 w-20" />
                      <ForgeSkeleton className="h-6 w-24" />
                    </div>
                  </div>
                ))
              ) : processed.length === 0 ? (
                <div className="py-4">
                  <ForgeEmptyState
                    icon="search"
                    size="compact"
                    eyebrow="Búsqueda"
                    title="No encontramos propuestas con ese filtro"
                    description="Prueba con otro folio, nombre del cliente o título del documento."
                  />
                </div>
              ) : (
                processed.map((proposal) => {
                  const sc = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft;
                  const urgency = getUrgencyLevel(proposal);
                  const urgencyDot = getUrgencyDot(urgency);

                  return (
                    <div
                      key={proposal.id}
                      onClick={() =>
                        router.push(`/proposals/${proposal.id}/edit`)
                      }
                      className="flex flex-col p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative active:scale-[0.98] active:bg-white/[0.04] transition-all"
                    >
                      {/* Folio Badge */}
                      <div className="absolute top-4 right-4 bg-black/50 border border-white/10 px-2 py-0.5 rounded-full">
                        <span className="font-mono text-[10px] text-neutral-500">
                          {proposal.proposal_number || "—"}
                        </span>
                      </div>

                      {/* Client */}
                      <div className="mb-3 pr-24 flex items-center gap-2">
                        <span className="font-semibold text-white text-[15px] tracking-tight">
                          {proposal.lead?.name || "Cliente Manual"}
                        </span>
                        {proposal.lead?.lead_score !== undefined && (
                          <LeadScoreBadge score={proposal.lead.lead_score} />
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-neutral-600 -mt-1 mb-3">
                        {proposal.lead?.email || "—"}
                      </span>

                      <div className="h-px bg-white/5 w-full mb-3" />

                      <span className="text-[13px] text-neutral-400 mb-2 line-clamp-1">
                        {proposal.title}
                      </span>

                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5">
                          {urgencyDot && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${urgencyDot}`}
                            />
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-widest ${sc.color}`}
                          >
                            {sc.label}
                          </span>
                        </div>
                        {proposal.view_count != null &&
                          proposal.view_count > 0 && (
                            <span className="text-[10px] font-mono text-neutral-500">
                              <Eye className="w-3 h-3 inline mr-1 -mt-px" />
                              {proposal.view_count}x
                            </span>
                          )}
                      </div>

                      <div className="flex justify-between items-end mt-1">
                        <span className="text-[10px] font-mono text-neutral-600">
                          {format(
                            new Date(proposal.created_at),
                            "dd/MM/yyyy",
                          )}
                        </span>
                        <span className="font-black text-emerald-400 text-lg tabular-nums">
                          {formatCurrency(proposal.total || 0)}{" "}
                          <span className="text-[10px] text-emerald-600 font-mono">
                            MXN
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      <NewProposalModal isOpen={isModalOpen} onClose={closeCreateModal} />

      {selectedFollowUp && (
        <FollowUpModal
          suggestion={selectedFollowUp}
          onClose={() => setSelectedFollowUp(null)}
          onSent={refresh}
        />
      )}
    </>
  );
}
