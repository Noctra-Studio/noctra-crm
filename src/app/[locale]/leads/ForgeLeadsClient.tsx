"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Mail,
  Phone,
  Globe,
  Send,
  ArrowUpAz,
  Clock,
  Kanban,
  FileText,
  StickyNote,
  ClipboardList,
  Activity,
  ChevronRight,
  UserCheck,
  Target,
  DollarSign,
  Zap,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { LeadScoreBadge } from "@/components/forge/LeadScoreBadge";
import { NewLeadModal } from "./NewLeadModal";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";
import { ActivityTimeline } from "@/components/forge/ActivityTimeline";
import { TasksPanel } from "@/components/forge/TasksPanel";
import { createClient } from "@/utils/supabase/client";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ForgeSkeleton, ForgeLeadListItemSkeleton } from "@/components/forge/ForgeSkeleton";

type Lead = {
  id: string;
  request_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  service_interest: string;
  source_page: string;
  source_cta: string;
  email_sent: boolean;
  email_sent_at: string;
  locale: string;
  created_at: string;
  estimated_value?: number;
  lead_score?: number;
  lead_score_breakdown?: any;
  pipeline_status?: string;
};

type Proposal = {
  id: string;
  title: string;
  proposal_number: string | null;
  status: string | null;
  total_price: number | null;
  created_at: string;
};

type Tab = "PERFIL" | "ACTIVIDAD" | "PROPUESTAS" | "TAREAS";

const PIPELINE_STAGES = [
  { key: "nuevo", label: "Nuevo", color: "text-neutral-400 border-neutral-700 bg-neutral-900" },
  { key: "contactado", label: "Contactado", color: "text-blue-400 border-blue-500/30 bg-blue-500/5" },
  { key: "calificado", label: "Calificado", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" },
  { key: "propuesta_enviada", label: "Propuesta Enviada", color: "text-purple-400 border-purple-500/30 bg-purple-500/5" },
  { key: "negociacion", label: "Negociación", color: "text-orange-400 border-orange-500/30 bg-orange-500/5" },
  { key: "ganado", label: "Ganado", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" },
  { key: "perdido", label: "Perdido", color: "text-red-400 border-red-500/30 bg-red-500/5" },
];

export default function ForgeLeadsClient({
  initialLeads,
  config,
}: {
  initialLeads: Lead[];
  config: any;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    initialLeads[0]?.id || null,
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [sortOrder, setSortOrder] = useState<"date" | "score">("score");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("PERFIL");

  // Filters state
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Pipeline stage update state
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Proposals
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  const selectedLeadFromQuery = searchParams.get("leadId");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeName, setActiveName] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);

  // Derived filters
  const services = Array.from(new Set(leads.map(l => l.service_interest))).filter(Boolean);
  const sources = Array.from(new Set(leads.map(l => l.source_cta))).filter(Boolean);

  const filteredLeads = leads.filter(lead => {
    if (stageFilter !== "all" && lead.pipeline_status !== stageFilter) return false;
    if (serviceFilter !== "all" && lead.service_interest !== serviceFilter) return false;
    if (sourceFilter !== "all" && lead.source_cta !== sourceFilter) return false;
    if (scoreFilter !== "all") {
      const score = lead.lead_score || 0;
      if (scoreFilter === "hot" && score < 70) return false;
      if (scoreFilter === "warm" && (score < 30 || score >= 70)) return false;
      if (scoreFilter === "cold" && score >= 30) return false;
    }
    return true;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortOrder === "score") {
      const scoreA = a.lead_score || 0;
      const scoreB = b.lead_score || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Keyboard navigation handler
  useEffect(() => {
    const handleNavigate = (e: CustomEvent<{ direction: "up" | "down" }>) => {
      if (sortedLeads.length === 0) return;
      setFocusIndex(prev => {
        const next = e.detail.direction === "down" ? prev + 1 : prev - 1;
        return (next + sortedLeads.length) % sortedLeads.length;
      });
    };

    const handleSelect = () => {
      const activeLead = sortedLeads[focusIndex];
      if (activeLead) {
        setSelectedLeadId(activeLead.id);
        setActiveTab("PERFIL");
      }
    };

    window.addEventListener("forge-navigate", handleNavigate as EventListener);
    window.addEventListener("forge-select-active", handleSelect as EventListener);
    return () => {
      window.removeEventListener("forge-navigate", handleNavigate as EventListener);
      window.removeEventListener("forge-select-active", handleSelect as EventListener);
    };
  }, [sortedLeads, focusIndex]);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  const shouldOpenCreateModal = searchParams.get("new") === "lead";



  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  useEffect(() => {
    if (shouldOpenCreateModal) {
      setIsCreateModalOpen(true);
    } else {
      setIsCreateModalOpen(false);
    }
  }, [shouldOpenCreateModal]);

  useEffect(() => {
    if (!selectedLeadFromQuery) return;
    if (leads.some((lead) => lead.id === selectedLeadFromQuery)) {
      setSelectedLeadId(selectedLeadFromQuery);
    }
  }, [leads, selectedLeadFromQuery]);

  // Load proposals for a lead when PROPUESTAS tab is active
  const loadProposals = useCallback(async (lead: Lead) => {
    setProposalsLoading(true);
    try {
      const { data } = await supabase
        .from("proposals")
        .select("id, title, proposal_number, status, total_price, created_at")
        .or(`lead_id.eq.${lead.id},client_email.ilike.${lead.email}`)
        .order("created_at", { ascending: false })
        .limit(10);
      setProposals(data || []);
    } catch {
      setProposals([]);
    } finally {
      setProposalsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (activeTab === "PROPUESTAS" && selectedLead) {
      loadProposals(selectedLead);
    }
  }, [activeTab, selectedLead, loadProposals]);

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("new");
    router.replace(nextParams.toString() ? `/leads?${nextParams}` : "/leads");
  };

  const handleRetry = async (submissionId: string) => {
    setIsRetrying(true);
    try {
      const res = await fetch("/api/contact/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === submissionId
              ? { ...l, email_sent: true, email_sent_at: new Date().toISOString() }
              : l,
          ),
        );
      } else {
        const error = await res.json();
        alert(`Failed to retry: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("An exception occurred while retrying.");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleUpdatePipelineStage = async (leadId: string, stage: string) => {
    if (!selectedLead || isUpdatingStage) return;
    setIsUpdatingStage(true);
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, pipeline_status: stage } : l))
    );
    toast.success(`Etapa actualizada: ${stage.toUpperCase()}`);
    try {
      await supabase
        .from("contact_submissions")
        .update({ pipeline_status: stage, updated_at: new Date().toISOString() })
        .eq("id", leadId);
    } catch (err) {
      console.error("Error updating pipeline stage:", err);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleUpdateLeadName = async (id: string, newName: string) => {
    if (!newName.trim() || newName === selectedLead?.name) {
      setIsEditingName(false);
      return;
    }

    try {
      const supabase = createClient();
      await supabase
        .from("contact_submissions")
        .update({ name: newName })
        .eq("id", id);
      
      setLeads(prev => prev.map(l => l.id === id ? { ...l, name: newName } : l));
      toast.success("Nombre actualizado");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el nombre");
    } finally {
      setIsEditingName(false);
    }
  };

  const currentStage = selectedLead?.pipeline_status || "nuevo";
  const stageConfig = PIPELINE_STAGES.find((s) => s.key === currentStage) || PIPELINE_STAGES[0];

  const getProposalStatusColor = (status: string | null) => {
    switch (status) {
      case "accepted": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "sent": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "draft": return "text-neutral-400 bg-neutral-800 border-neutral-700";
      default: return "text-neutral-400 bg-neutral-800 border-neutral-700";
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <NewLeadModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />

      {/* LEFT SIDEBAR – Lead List */}
      <aside className="w-full md:w-[320px] bg-[#080808] border-r border-neutral-900 flex flex-col shrink-0">
        <div className="p-5 border-b border-neutral-900 space-y-4">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-500 font-black">
            Pipeline Intelligence
          </h2>
          
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-[9px] font-mono uppercase text-neutral-600 mb-2 tracking-widest">Filtros Avanzados</p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-white/[0.03] border border-white/10 text-[10px] text-neutral-300 rounded px-2 py-1.5 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="all">Etapa: Todas</option>
                  {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="bg-white/[0.03] border border-white/10 text-[10px] text-neutral-300 rounded px-2 py-1.5 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="all">Score: Todos</option>
                  <option value="hot">HOT (70+)</option>
                  <option value="warm">WARM (30-70)</option>
                  <option value="cold">{"COLD (<30)"}</option>
                </select>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="bg-white/[0.03] border border-white/10 text-[10px] text-neutral-300 rounded px-2 py-1.5 focus:outline-none focus:border-emerald-500/50 col-span-2"
                >
                  <option value="all">Servicio: Todos</option>
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder("score")}
                className={`flex-1 py-1.5 px-3 rounded text-[9px] font-mono uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5 ${
                  sortOrder === "score"
                    ? "bg-white text-black border-white"
                    : "bg-white/[0.03] text-neutral-400 border-white/10 hover:border-white/20"
                }`}
              >
                <ArrowUpAz className="w-3 h-3" /> Score
              </button>
              <button
                onClick={() => setSortOrder("date")}
                className={`flex-1 py-1.5 px-3 rounded text-[9px] font-mono uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5 ${
                  sortOrder === "date"
                    ? "bg-white text-black border-white"
                    : "bg-white/[0.03] text-neutral-400 border-white/10 hover:border-white/20"
                }`}
              >
                <Clock className="w-3 h-3" /> Fecha
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 forge-scroll">
          {isLoading ? (
            <div className="space-y-2">
              <ForgeLeadListItemSkeleton />
              <ForgeLeadListItemSkeleton />
              <ForgeLeadListItemSkeleton />
              <ForgeLeadListItemSkeleton />
            </div>
          ) : sortedLeads.length === 0 ? (
            <ForgeEmptyState
              icon="inbox"
              eyebrow="Leads"
              title="Aquí aparecerán tus leads"
              description="Ajusta los filtros para ver otros prospectos."
              guidance={["Filtros", "Búsqueda"]}
              size="compact"
              className="mx-2"
              primaryAction={{
                label: "Crear primer lead",
                onClick: () => setIsCreateModalOpen(true),
                icon: "plus"
              }}
            />
          ) : (
            sortedLeads.map((lead, idx) => {
              const stage = PIPELINE_STAGES.find((s) => s.key === (lead.pipeline_status || "nuevo"));
              const isFocused = idx === focusIndex;
              return (
                <div
                  key={lead.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedLeadId(lead.id);
                    setActiveTab("PERFIL");
                    setFocusIndex(idx);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedLeadId(lead.id);
                      setActiveTab("PERFIL");
                      setFocusIndex(idx);
                    }
                  }}
                  onMouseEnter={() => setFocusIndex(idx)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex flex-col gap-3 group border relative overflow-hidden cursor-pointer ${
                    selectedLeadId === lead.id
                      ? "bg-white/[0.04] border-white/10"
                      : isFocused
                        ? "bg-white/[0.02] border-white/5"
                        : "bg-transparent border-transparent hover:bg-white/[0.01]"
                  }`}
                >
                  {/* Hover Quick Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-150">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toast.info("Email action coming soon"); }}
                      className="p-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white/40 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); window.location.href=`/proposals/new?leadId=${lead.id}`; }}
                      className="p-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white/40 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-start pr-12">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className={`text-sm font-bold truncate transition-colors ${
                        selectedLeadId === lead.id ? "text-emerald-400" : "text-white group-hover:text-emerald-400"
                      }`}>
                        {lead.name}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest truncate">
                        {lead.service_interest}
                      </p>
                    </div>
                    {lead.lead_score !== undefined && (
                      <div className={`px-2 py-1 rounded text-[9px] font-black font-mono tracking-tighter shadow-xl shrink-0 ${
                        lead.lead_score >= 70 ? "bg-emerald-500 text-black" : 
                        lead.lead_score >= 30 ? "bg-amber-500 text-black" : 
                        "bg-neutral-800 text-neutral-400"
                      }`}>
                        {lead.lead_score >= 70 ? "HOT" : lead.lead_score >= 30 ? "WARM" : "COLD"} {lead.lead_score}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        stage?.key === 'ganado' ? 'bg-emerald-500' : 
                        stage?.key === 'perdido' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                        {stage?.label}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es }).replace('hace ', '')}
                    </span>
                  </div>

                  {/* Focus indicator */}
                  {isFocused && (
                    <motion.div 
                      layoutId="focus-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-emerald-500"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* RIGHT PANEL – Lead Detail */}
      <div className="flex-1 bg-[#050505] flex flex-col min-w-0">
        {!selectedLead ? (
          <div className="h-full flex items-center justify-center px-6">
            <div className="w-full max-w-xl">
              <ForgeEmptyState
                icon={sortedLeads.length > 0 ? "users" : "inbox"}
                eyebrow="Leads"
                title="Selecciona un lead para ver su perfil"
                description="Desde aquí puedes revisar origen, mensaje, scoring, actividad y preparar el siguiente seguimiento sin cambiar de módulo."
                guidance={
                  sortedLeads.length > 0
                    ? ["Origen", "Scoring", "Seguimiento"]
                    : ["Captura", "Calificación", "Pipeline"]
                }
                primaryAction={
                  sortedLeads.length > 0
                    ? {
                        label: "Abrir primer lead",
                        onClick: () => setSelectedLeadId(sortedLeads[0]?.id ?? null),
                      }
                    : {
                        label: "Crear lead manual",
                        onClick: () => setIsCreateModalOpen(true),
                        icon: "plus",
                      }
                }
                secondaryAction={
                  sortedLeads.length > 0
                    ? { label: "Ir al pipeline", href: "/pipeline", icon: "arrow-right" }
                    : { label: "Importar contactos", href: "/migration/new", icon: "upload" }
                }
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-0 h-full">
            {/* Lead Header */}
            <motion.header 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="px-8 py-8 border-b border-white/5 bg-[#0a0a0a] shrink-0"
            >
              <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-mono uppercase tracking-widest">
                        {selectedLead.service_interest}
                      </div>
                      <div className="px-2 py-0.5 border border-white/10 bg-white/5 text-white/60 text-[10px] font-mono uppercase tracking-widest">
                        {selectedLead.request_id || "NOC-XXXX"}
                      </div>
                      {selectedLead.lead_score && (
                        <div className={`px-2 py-0.5 border text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 ${
                          selectedLead.lead_score >= 70 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
                          selectedLead.lead_score >= 30 ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
                          "border-white/10 bg-white/5 text-white/40"
                        }`}>
                          <Target className="w-3 h-3" /> Score {selectedLead.lead_score}
                        </div>
                      )}
                    </div>
                    
                    {isEditingName ? (
                      <input
                        autoFocus
                        value={activeName}
                        onChange={(e) => setActiveName(e.target.value)}
                        onBlur={() => handleUpdateLeadName(selectedLead.id, activeName)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateLeadName(selectedLead.id, activeName);
                          if (e.key === "Escape") {
                            setIsEditingName(false);
                            setActiveName(selectedLead.name);
                          }
                        }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter bg-transparent border-b border-emerald-500 focus:outline-none w-full py-2"
                      />
                    ) : (
                      <h1 
                        onDoubleClick={() => {
                          setIsEditingName(true);
                          setActiveName(selectedLead.name);
                        }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter cursor-pointer hover:text-emerald-400 transition-colors"
                      >
                        {selectedLead.name}
                      </h1>
                    )}

                    <div className="flex items-center gap-4 text-neutral-500 font-mono text-xs">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Registrado el {format(new Date(selectedLead.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                      {selectedLead.email_sent && (
                        <span className="text-emerald-500/80">• Respuesta automática enviada</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link
                      href={`/proposals/new?leadId=${selectedLead.id}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl shadow-white/5"
                    >
                      <FileText className="w-3.5 h-3.5" /> Crear Propuesta
                    </Link>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" /> Enviar Email
                    </a>
                  </div>
                </div>

                {/* Pipeline Progress Indicator */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-neutral-500 font-black">
                      Pipeline Progression
                    </p>
                    <span className="text-[9px] font-mono uppercase text-emerald-500 font-bold">
                      {PIPELINE_STAGES.find(s => s.key === currentStage)?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {PIPELINE_STAGES.map((stage, idx) => {
                      const stages = PIPELINE_STAGES.map(s => s.key);
                      const currentIdx = stages.indexOf(currentStage);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <button
                          key={stage.key}
                          onClick={() => handleUpdatePipelineStage(selectedLead.id, stage.key)}
                          disabled={isUpdatingStage}
                          className="group relative flex flex-col gap-2"
                        >
                          <motion.div 
                            initial={false}
                            animate={{
                              backgroundColor: isCompleted ? "#10b981" : "#171717",
                              height: isCurrent ? "6px" : "6px",
                            }}
                            className={`h-1.5 w-full transition-all duration-300 ${
                              isCurrent ? 'ring-4 ring-emerald-500/20 scale-y-110' : ''
                            }`} 
                          />
                          <span className={`text-[8px] font-mono uppercase tracking-tighter text-center transition-colors ${
                            isCurrent ? 'text-white font-bold' : isCompleted ? 'text-neutral-400' : 'text-neutral-500'
                          }`}>
                            {stage.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.header>

            {/* Tabs */}
            <div className="px-8 border-b border-white/5 bg-[#080808] shrink-0">
              <div className="flex gap-8">
                {(["PERFIL", "ACTIVIDAD", "PROPUESTAS", "TAREAS"] as Tab[]).map((tab) => {
                  const icons: Record<Tab, React.ReactNode> = {
                    PERFIL: <Mail className="w-3 h-3" />,
                    ACTIVIDAD: <Activity className="w-3 h-3" />,
                    PROPUESTAS: <FileText className="w-3 h-3" />,
                    TAREAS: <ClipboardList className="w-3 h-3" />,
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 text-[10px] font-mono uppercase tracking-[0.4em] transition-all relative flex items-center gap-2 ${
                        activeTab === tab
                          ? "text-white font-bold"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      {icons[tab]}
                      {tab}
                      {activeTab === tab && (
                        <motion.div 
                          layoutId="active-tab-lead"
                          className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" 
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + selectedLead.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex-1 overflow-y-auto"
              >
              {/* PERFIL Tab */}
              {activeTab === "PERFIL" && (
                <div className="max-w-4xl mx-auto p-10 space-y-16">
                  {/* Business Context Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[#0A0A0A] border border-white/5 p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Valor Potencial</span>
                      </div>
                      <p className="text-2xl font-black text-white">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedLead.estimated_value || 0)}
                        <span className="text-xs text-neutral-500 font-mono ml-2">USD</span>
                      </p>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/5 p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Servicio Solicitado</span>
                      </div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{selectedLead.service_interest}</p>
                    </div>
                    <div className="bg-[#0A0A0A] border border-white/5 p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Fuente del Lead</span>
                      </div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{selectedLead.source_cta || "Directo"}</p>
                    </div>
                  </div>

                  {/* Contact Info + Source Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <section className="space-y-8">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold border-l-2 border-emerald-500 pl-3">
                        Lead Details
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-500 group-hover:text-emerald-400 transition-all shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-mono uppercase text-neutral-500 mb-0.5">Primary Email</p>
                            <a
                              href={`mailto:${selectedLead.email}`}
                              className="text-base font-medium text-neutral-200 hover:text-white transition-colors truncate block"
                            >
                              {selectedLead.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-500 group-hover:text-emerald-400 transition-all shrink-0">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono uppercase text-neutral-500 mb-0.5">Phone Number</p>
                            <a
                              href={`tel:${selectedLead.phone}`}
                              className="text-base font-medium text-neutral-200 hover:text-white transition-colors"
                            >
                              {selectedLead.phone || "Not provided"}
                            </a>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-8">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold border-l-2 border-emerald-500 pl-3">
                        Technical Origin
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-start gap-3">
                          <Globe className="w-4 h-4 text-neutral-600 mt-1 shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-[9px] font-mono uppercase text-neutral-500 mb-1">Conversion Page</p>
                            <p className="text-xs font-mono text-neutral-400 truncate max-w-xs bg-white/[0.02] px-2 py-1 border border-white/5">
                              {selectedLead.source_page || "/landing-page"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <p className="text-[9px] font-mono uppercase text-neutral-500 mb-1">Language</p>
                            <p className="text-sm font-black text-white uppercase bg-white/[0.02] inline-block px-3 py-1 border border-white/5">{selectedLead.locale || "ES"}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] font-mono uppercase text-neutral-500 mb-1">Status</p>
                            <p className="text-sm font-black text-emerald-500 uppercase bg-emerald-500/5 inline-block px-3 py-1 border border-emerald-500/10">Active</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Message */}
                  <section className="space-y-6 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                          Initial Inquiry Message
                        </h3>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-600 uppercase">Received {formatDistanceToNow(new Date(selectedLead.created_at), { addSuffix: true, locale: es })}</span>
                    </div>
                    <div className="bg-[#080808] border border-white/5 p-8 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Mail className="w-12 h-12" />
                      </div>
                      <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap italic text-lg font-serif">
                        "{selectedLead.message || "No initial message provided."}"
                      </p>
                    </div>
                  </section>

                  {/* Recent Activity Teaser */}
                  <section className="space-y-8 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                          Trazabilidad del Lead
                        </h3>
                      </div>
                      <button 
                        onClick={() => setActiveTab("ACTIVIDAD")}
                        className="text-[9px] font-mono uppercase text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        Ver historial completo →
                      </button>
                    </div>
                    <div className="bg-[#050505] -mx-4">
                      <ActivityTimeline 
                        entityType="lead" 
                        entityId={selectedLead.id} 
                        showAddForm={false} 
                        compact={true} 
                      />
                    </div>
                  </section>

                  {/* Automation Status */}
                  <section className="pt-4">
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">Respuesta Automática</h4>
                        <p className="text-xs text-neutral-400">Estado del email de respuesta automática disparado al registrarse.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {selectedLead.email_sent ? (
                          <div className="text-right">
                            <p className="text-[10px] font-mono uppercase text-emerald-500 font-bold">ENVIADO</p>
                            <p className="text-[10px] font-mono text-neutral-500 uppercase">
                              {format(new Date(selectedLead.email_sent_at), "PPp")}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] font-mono uppercase text-red-500 font-bold">No enviado</p>
                            <button
                              onClick={() => handleRetry(selectedLead.id)}
                              disabled={isRetrying}
                              className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                              {isRetrying ? "Reintentando..." : "Reintentar"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Convert to Client CTA */}
                  {(currentStage === "ganado") && (
                    <section className="pt-4">
                      <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-5 h-5 text-blue-400" />
                          <div>
                            <h4 className="text-sm font-bold text-white">Lead Convertido</h4>
                            <p className="text-xs text-neutral-400">Crear propuesta o contrato para convertir en cliente activo.</p>
                          </div>
                        </div>
                        <Link
                          href="/proposals?new=proposal"
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                        >
                          Crear Propuesta <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* ACTIVIDAD Tab */}
              {activeTab === "ACTIVIDAD" && (
                <div className="max-w-3xl mx-auto p-8">
                  <ActivityTimeline
                    entityType="lead"
                    entityId={selectedLead.id}
                    showAddForm={true}
                  />
                </div>
              )}

              {/* PROPUESTAS Tab */}
              {activeTab === "PROPUESTAS" && (
                <div className="max-w-3xl mx-auto p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                        Propuestas Relacionadas
                      </h3>
                    </div>
                    <Link
                      href="/proposals?new=proposal"
                      className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                    >
                      + Nueva Propuesta
                    </Link>
                  </div>

                  {proposalsLoading ? (
                    <div className="py-10 text-center text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                      Cargando propuestas...
                    </div>
                  ) : proposals.length === 0 ? (
                    <ForgeEmptyState
                      icon="file-text"
                      eyebrow="Propuestas"
                      title="Sin propuestas para este lead"
                      description="Crea una propuesta comercial vinculada a este lead para avanzar en el pipeline."
                      guidance={["Propuesta", "Precio", "Alcance"]}
                      size="compact"
                      primaryAction={{
                        label: "Crear Propuesta",
                        href: "/proposals?new=proposal",
                        icon: "plus",
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      {proposals.map((proposal) => (
                        <Link
                          key={proposal.id}
                          href={`/proposals/${proposal.id}/edit`}
                          className="block bg-[#0a0a0a] border border-white/5 hover:border-emerald-500/30 transition-all p-5 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                                {proposal.title}
                              </h4>
                              <p className="text-[10px] font-mono text-neutral-500 uppercase">
                                {proposal.proposal_number}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {proposal.total_price && (
                                <span className="text-sm font-bold text-white">
                                  ${proposal.total_price.toLocaleString("es-MX")} MXN
                                </span>
                              )}
                              <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border rounded-sm ${getProposalStatusColor(proposal.status)}`}>
                                {proposal.status || "draft"}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] font-mono text-neutral-600 mt-2 uppercase">
                            {format(new Date(proposal.created_at), "dd MMM yyyy", { locale: es })}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAREAS Tab */}
              {activeTab === "TAREAS" && (
                <div className="max-w-3xl mx-auto p-8">
                  <TasksPanel entityType="lead" entityId={selectedLead.id} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
