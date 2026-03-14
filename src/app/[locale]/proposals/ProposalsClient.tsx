"use client";

import { useState, useRef, useEffect } from "react";
import { ForgeSidebar } from "@/components/forge/ForgeSidebar";
import { format } from "date-fns";
import {
  Plus,
  Search,
  MoreHorizontal,
  Send,
  Eye,
  Edit3,
  FileText,
  ExternalLink,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { LeadScoreBadge } from "@/components/forge/LeadScoreBadge";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { NewProposalModal } from "./NewProposalModal";
import { useFollowUps } from "@/hooks/useFollowUps";
import { FollowUpBanner } from "@/components/forge/FollowUpBanner";
import { FollowUpModal } from "@/components/forge/FollowUpModal";
import { FollowUpSuggestion } from "@/app/actions/followup";
import { createContractFromProposalAction } from "@/app/actions/contracts";
import { deleteProposalAction } from "@/app/actions/proposals";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";

import { createPortal } from "react-dom";

type Proposal = {
  id: string;
  proposal_number: string;
  title: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
  total: number;
  valid_until: string;
  created_at: string;
  public_uuid?: string;
  lead: {
    name: string;
    email: string;
    lead_score?: number;
    lead_score_breakdown?: any;
  };
};

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
      setPosition({
        // Use fixed positioning relative to viewport
        top: rect.bottom + 4,
        left: rect.right - 160,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    // Use timeout to avoid immediate closure if click triggered this
    const timeout = setTimeout(() => {
      document.addEventListener("click", close);
      // Close on scroll to prevent detached floating dropdowns
      document.addEventListener("scroll", close, true);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const dropdown = open ? (
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 50, // Changed from 99999 to 50 to ensure custom cursor appears above it
      }}
      className="w-40 bg-[#111] border border-[#1f1f1f] shadow-xl rounded-sm py-1"
      onClick={(e) => e.stopPropagation()}>
      {/* EDITAR — draft, sent, viewed */}
      {["draft", "sent", "viewed"].includes(proposal.status) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/proposals/${proposal.id}/edit`);
          }}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-white hover:bg-[#1a1a1a] transition-colors text-left">
          <Edit3 className="w-3.5 h-3.5" />
          EDITAR
        </button>
      )}

      {/* PREVISUALIZAR — always */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.open(`/client/proposal/${proposal.public_uuid}`, "_blank");
        }}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-white hover:bg-[#1a1a1a] transition-colors text-left">
        <Eye className="w-3.5 h-3.5" />
        PREVISUALIZAR
      </button>

      {/* CONVERT TO CONTRACT - accepted */}
      {proposal.status === "accepted" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConvertToContract(proposal);
          }}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-emerald-400 hover:bg-[#1a1a1a] transition-colors text-left">
          <FileText className="w-3.5 h-3.5" />
          CONTRATO
        </button>
      )}

      {/* ELIMINAR — draft only */}
      {proposal.status === "draft" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(proposal.id);
          }}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-red-400 hover:bg-[#1a1a1a] transition-colors text-left border-t border-[#1f1f1f]">
          <Trash2 className="w-3.5 h-3.5" />
          ELIMINAR
        </button>
      )}
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
        className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
        <MoreHorizontal className="w-4 h-4 text-neutral-300" />
      </button>
      {typeof window !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}

export default function ProposalsClient({
  initialProposals,
}: {
  initialProposals: any[];
}) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedFollowUp, setSelectedFollowUp] =
    useState<FollowUpSuggestion | null>(null);
  const { suggestions, dismiss, refresh } = useFollowUps();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const menuRef = useRef<HTMLDivElement>(null);
  const shouldOpenCreateModal = searchParams.get("new") === "proposal";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (shouldOpenCreateModal) {
      setIsModalOpen(true);
    }
  }, [shouldOpenCreateModal]);

  const proposalSuggestions = suggestions.filter(
    (s) => s.type === "proposal_viewed_3d" || s.type === "proposal_sent_5d",
  );

  const handleConvertToContract = async (proposal: Proposal) => {
    try {
      const result = await createContractFromProposalAction(proposal.id);
      router.push(`/contracts/${result.id}/edit`);
    } catch (err: any) {
      console.error(err);
      alert(
        "Error al convertir a contrato: " +
          (err.message || "Error desconocido"),
      );
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!confirm("¿Eliminar esta propuesta? Esta acción no se puede deshacer."))
      return;
    try {
      await deleteProposalAction(proposalId);
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
      setOpenMenuId(null);
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

  const filteredProposals = proposals.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lead?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.proposal_number.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "text-neutral-300 bg-neutral-500/10 border-neutral-500/20";
      case "sent":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "viewed":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "accepted":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "rejected":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-neutral-300 bg-neutral-500/10 border-neutral-500/20";
    }
  };

  return (
    <>
      <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#050505]/50 backdrop-blur-xl sticky top-0 z-10">
        <div>
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-300 mb-1">
            Propuestas
          </h2>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Proposal Builder
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-4 py-2 flex items-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 group">
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span className="text-[11px] font-black uppercase tracking-widest">
            Nueva Propuesta
          </span>
        </button>
      </header>

      {/* Toolbar */}
      <div className="px-5 md:px-8 py-4 border-b border-white/5 flex items-center gap-4 shrink-0 overflow-x-auto bg-[#050505]">
        <div className="relative flex-1 w-full max-w-none md:max-w-md min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300" />
          <input
            type="text"
            placeholder="Buscar por cliente, título o folio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 px-9 py-2 md:py-2.5 min-h-[44px] md:min-h-0 text-[11px] font-mono text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500/50 transition-colors rounded-lg md:rounded-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "draft", "sent", "accepted"].map((status) => (
            <button
              key={status}
              className="px-3 py-1.5 border border-white/5 bg-white/[0.02] min-h-[44px] md:min-h-0 text-[9px] font-mono uppercase tracking-widest text-neutral-300 hover:text-white hover:border-white/20 transition-all capitalize rounded-lg md:rounded-none">
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Follow-up Banners */}
      {proposalSuggestions.length > 0 && (
        <div className="px-5 md:px-8 pt-6">
          {proposalSuggestions.map((s) => (
            <FollowUpBanner
              key={s.id}
              suggestion={s}
              onOpenModal={setSelectedFollowUp}
              onDismiss={dismiss}
              onActionComplete={refresh}
            />
          ))}
        </div>
      )}

      {/* Content Area */}
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
        <div className="px-5 md:px-8 py-6 forge-scroll">
          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                    Folio
                  </th>
                  <th className="text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                    Cliente
                  </th>
                  <th className="text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                    Servicio / Título
                  </th>
                  <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                    Inversión
                  </th>
                  <th className="text-center py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                    Estatus
                  </th>
                  <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                    Fecha
                  </th>
                  <th className="py-4 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
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
                  filteredProposals.map((proposal) => (
                    <tr
                      key={proposal.id}
                      onClick={() =>
                        router.push(`/proposals/${proposal.id}/edit`)
                      }
                      className="group hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-transparent">
                      <td className="py-5 px-4">
                        <span className="font-mono text-[11px] text-white/40 group-hover:text-emerald-500 transition-colors">
                          {proposal.proposal_number || "NOC-P-XXXX"}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-200">
                              {proposal.lead?.name || "Cliente Manual"}
                            </span>
                            {proposal.lead?.lead_score !== undefined && (
                              <LeadScoreBadge
                                score={proposal.lead.lead_score}
                              />
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {proposal.lead?.email || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className="text-xs font-medium text-neutral-300">
                          {proposal.title}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <span className="font-mono text-[11px] font-bold text-white">
                          ${proposal.total?.toLocaleString("es-MX")}
                          <span className="text-[9px] text-neutral-400 ml-1">
                            MXN
                          </span>
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex justify-center">
                          <span
                            className={`px-2 py-0.5 border text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(proposal.status)}`}>
                            {proposal.status === "viewed" && (
                              <Eye className="w-2.5 h-2.5" />
                            )}
                            {proposal.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-neutral-400">
                            {format(
                              new Date(proposal.created_at),
                              "dd/MM/yyyy",
                            )}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-700 uppercase">
                            Exp.{" "}
                            {proposal.valid_until
                              ? format(new Date(proposal.valid_until), "dd/MM")
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex justify-end gap-2 pr-4 relative">
                          <ProposalActionsDropdown
                            proposal={proposal}
                            onDelete={handleDelete}
                            onConvertToContract={handleConvertToContract}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS LIST */}
          <div className="grid md:hidden gap-4 pb-8">
            {filteredProposals.length === 0 ? (
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
              filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  onClick={() =>
                    router.push(`/proposals/${proposal.id}/edit`)
                  }
                  className="flex flex-col p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative active:scale-[0.98] active:bg-white/[0.05] transition-all">
                  {/* Folio Badge */}
                  <div className="absolute top-4 right-4 bg-black/50 border border-white/10 px-2 py-0.5 rounded-full z-10">
                    <span className="font-mono text-[10px] text-neutral-400">
                      {proposal.proposal_number || "PENDIENTE"}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="mb-4 pr-24 flex items-center gap-2">
                    <span className="font-bold text-white text-[15px]">
                      {proposal.lead?.name || "Cliente Manual"}
                    </span>
                    {proposal.lead?.lead_score !== undefined && (
                      <LeadScoreBadge score={proposal.lead.lead_score} />
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-neutral-400 mt-[-12px] mb-4">
                    {proposal.lead?.email || "—"}
                  </span>

                  <div className="h-px bg-white/5 w-full mb-4" />

                  {/* Meta Details */}
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-neutral-300 w-2/3 truncate">
                      {proposal.title}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full border text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(proposal.status)}`}>
                      {proposal.status === "viewed" && (
                        <Eye className="w-2.5 h-2.5" />
                      )}
                      {proposal.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-neutral-500">
                        Fecha:{" "}
                        {format(new Date(proposal.created_at), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-emerald-400 text-lg">
                        ${proposal.total?.toLocaleString("es-MX")}{" "}
                        <span className="text-[10px] text-emerald-600">
                          MXN
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <NewProposalModal
        isOpen={isModalOpen}
        onClose={closeCreateModal}
      />

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
