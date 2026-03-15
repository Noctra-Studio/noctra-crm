"use client";

import { useState, useEffect, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { formatDistanceToNow } from "date-fns";
import {
  DollarSign,
  Clock,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { LeadDetailPanel } from "@/components/forge/LeadDetailPanel";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { updateLeadStatusWithScoring } from "@/app/actions/leads";
import { LeadScoreBadge } from "@/components/forge/LeadScoreBadge";
import { useFollowUps } from "@/hooks/useFollowUps";
import { FollowUpBanner } from "@/components/forge/FollowUpBanner";
import { FollowUpModal } from "@/components/forge/FollowUpModal";
import { FollowUpSuggestion } from "@/app/actions/followup";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";
import { PipelineSummary } from "@/components/forge/pipeline/PipelineSummary";
import { PipelineAlerts } from "@/components/forge/pipeline/PipelineAlerts";

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
  pipeline_status: string;
  estimated_value: number;
  next_action: string;
  next_action_date: string;
  locale: string;
  created_at: string;
  lost_reason?: string;
  closed_at?: string;
  lead_score?: number;
  lead_score_breakdown?: any;
};

const FALLBACK_STAGE_COLORS: Record<string, string> = {
  nuevo: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  contactado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  propuesta_enviada: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  en_negociacion: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  cerrado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  perdido: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STAGE_LABELS: Record<string, string> = {
  nuevo: "NUEVO",
  contactado: "CONTACTADO",
  propuesta_enviada: "PROPUESTA ENVIADA",
  "propuesta enviada": "PROPUESTA ENVIADA",
  en_negociacion: "EN NEGOCIACIÓN",
  "en negociacion": "EN NEGOCIACIÓN",
  cerrado: "CERRADO",
  perdido: "PERDIDO",
};

const getStageLabel = (stage: string) =>
  STAGE_LABELS[stage.toLowerCase()] ?? stage.replace(/_/g, " ").toUpperCase();

const getStageColor = (stageId: string) => {
  return FALLBACK_STAGE_COLORS[stageId] || FALLBACK_STAGE_COLORS.nuevo;
};

export default function PipelineClient({
  initialLeads,
  config,
}: {
  initialLeads: Lead[];
  config: any;
}) {
  const STAGES = (
    config?.pipeline_stages || [
      "nuevo",
      "contactado",
      "propuesta_enviada",
      "en_negociacion",
      "cerrado",
    ]
  ).map((s: string) => ({
    id: s.toLowerCase().replace(/ /g, "_"),
    label: getStageLabel(s),
  }));

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lostPromptId, setLostPromptId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [alerts, setAlerts] = useState<
    { id: string; name: string; days_inactive: number }[]
  >([]);
  const { suggestions, dismiss, refresh } = useFollowUps();
  const [selectedFollowUp, setSelectedFollowUp] =
    useState<FollowUpSuggestion | null>(null);

  const pipelineSuggestions = suggestions.filter(
    (s) => s.type === "lead_no_contact_3d" || s.type === "contract_sent_3d",
  );

  // Scroll state for horizontal board interactions
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollPosition(target.scrollLeft);
    setMaxScroll(target.scrollWidth - target.clientWidth);
  };

  useEffect(() => {
    if (boardRef.current) {
      setMaxScroll(boardRef.current.scrollWidth - boardRef.current.clientWidth);
    }
  }, [leads, searchTerm]);

  const scrollToStart = () => {
    if (boardRef.current) {
      boardRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const supabase = createClient();

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase.rpc("get_leads_needing_attention");
      if (data) setAlerts(data);
    };
    fetchAlerts();
  }, [supabase]);

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getLeadsByStage = (stageId: string) => {
    let stageLeads = [];
    if (stageId === "cerrado") {
      stageLeads = filteredLeads.filter(
        (l) =>
          l.pipeline_status === "cerrado" || l.pipeline_status === "perdido",
      );
    } else {
      stageLeads = filteredLeads.filter((l) => l.pipeline_status === stageId);
    }

    if (stageId === "nuevo") {
      return stageLeads.sort(
        (a, b) => (b.lead_score || 0) - (a.lead_score || 0),
      );
    }

    return stageLeads;
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const lead = leads.find((l) => l.id === draggableId);
    if (!lead) return;

    let newStatus = destination.droppableId;

    if (newStatus === "resolution_cerrado") {
      await updateLeadStatus(lead.id, "cerrado");
    } else if (newStatus === "resolution_perdido") {
      setLostPromptId(lead.id);
    } else {
      await updateLeadStatus(lead.id, newStatus);
    }
  };

  const updateLeadStatus = async (
    leadId: string,
    status: string,
    lostReasonText?: string,
  ) => {
    const previousLead = leads.find((lead) => lead.id === leadId);
    if (!previousLead) return;

    setPendingLeadId(leadId);
    const optimisticLead = {
      ...previousLead,
      pipeline_status: status,
      closed_at:
        status === "cerrado"
          ? previousLead.closed_at || new Date().toISOString()
          : previousLead.closed_at,
      lost_reason:
        status === "perdido" ? lostReasonText || previousLead.lost_reason : undefined,
    };

    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? optimisticLead : lead)),
    );

    try {
      const result = await updateLeadStatusWithScoring(
        leadId,
        status,
        lostReasonText,
      );

      if (!result.success)
        throw new Error((result as any).error || "Unknown error");

      if ((result as any).lead) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === leadId ? ((result as any).lead as Lead) : lead,
          ),
        );
      }
      setFeedback({
        message: `Lead movido a ${getStageLabel(status).toLowerCase()}`,
        type: "success",
      });
    } catch (err) {
      console.error("Error updating lead status:", err);
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? previousLead : lead)),
      );
      setFeedback({
        message: "No pudimos guardar el cambio de etapa.",
        type: "error",
      });
    } finally {
      setPendingLeadId(null);
      setLostPromptId(null);
      setLostReason("");
    }
  };

  const isOverdue = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <>
      {feedback && (
        <div
          className={`fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-1/2 z-[120] -translate-x-1/2 rounded-2xl border px-4 py-3 text-xs font-mono uppercase tracking-widest ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-black text-emerald-400"
              : "border-red-500/30 bg-black text-red-400"
          }`}
        >
          {feedback.message}
        </div>
      )}
      
      {/* Sub-Header */}
      <header className="px-6 py-5 border-b border-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#080808]">
        <div className="flex items-center justify-between w-full md:w-auto">
          <h1 className="text-lg font-black tracking-tight flex items-center gap-3">
            PIPELINE
            <span className="text-[9px] font-mono text-neutral-400 bg-white/[0.03] px-2 py-0.5 border border-white/[0.05] rounded-sm">
              {leads.length} LEADS
            </span>
          </h1>
          
          {/* Mobile Search/Filter Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-neutral-400">
                  <Filter className="w-4 h-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-[#0a0a0a] border-white/10 p-6 rounded-t-3xl">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-white font-mono uppercase tracking-widest text-xs">Filtros de Pipeline</SheetTitle>
                </SheetHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[9px] font-mono uppercase text-neutral-500">Buscar por nombre o ID</p>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Nombre, email, folio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 text-sm text-neutral-300 rounded-xl px-12 py-4 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0b0b0b] border border-neutral-900 px-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors w-full md:w-64"
            />
          </div>
        </div>
      </header>

      {/* Pipeline Summary Component */}
      <PipelineSummary
        totalValue={filteredLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0)}
        activeDeals={filteredLeads.filter((l) => l.pipeline_status !== "perdido").length}
        expectedRevenue={filteredLeads
          .filter(
            (l) =>
              l.pipeline_status === "cerrado" ||
              l.pipeline_status === "en_negociacion",
          )
          .reduce((sum, l) => sum + (l.estimated_value || 0), 0)}
      />

      {/* Unified Follow-up Alert Component */}
      <PipelineAlerts
        alerts={alerts}
        suggestions={pipelineSuggestions}
        onViewDetails={() => {
          if (alerts.length > 0) {
            setSelectedLeadId(alerts[0].id);
          } else if (pipelineSuggestions.length > 0) {
            setSelectedFollowUp(pipelineSuggestions[0]);
          }
        }}
      />

      {/* Kanban Board */}
      {leads.length === 0 ? (
        <div className="px-6 py-10">
          <ForgeEmptyState
            icon="kanban"
            eyebrow="Pipeline"
            title="Tu pipeline todavía no tiene leads"
            description="Aquí priorizas oportunidades, detectas bloqueos y mueves cada prospecto hasta cierre o pérdida. Para activarlo, agrega tu primer lead o importa contactos existentes."
            guidance={["Captura", "Seguimiento", "Cierre"]}
            primaryAction={{
              label: "Nuevo lead",
              href: "/leads?new=lead",
              icon: "plus",
            }}
            secondaryAction={{
              label: "Importar contactos",
              href: "/migration/new",
              icon: "upload",
            }}
          />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="px-6 py-10">
          <ForgeEmptyState
            icon="search"
            eyebrow="Pipeline"
            title="No encontramos leads con esa búsqueda"
            description="Prueba con otro nombre, email o folio. Si necesitas revisar el flujo completo, puedes limpiar el filtro y volver al tablero."
            size="compact"
            primaryAction={{
              label: "Limpiar búsqueda",
              onClick: () => setSearchTerm(""),
            }}
            secondaryAction={{
              label: "Ver leads",
              href: "/leads",
              icon: "arrow-right",
            }}
          />
        </div>
      ) : (
        <div className="relative group/board">
          {/* Scroll to Start Floating Button */}
          {scrollPosition > 50 && (
            <button
              onClick={scrollToStart}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-black border border-neutral-800 text-neutral-400 hover:text-white rounded-full p-2.5 shadow-xl transition-all animate-in fade-in zoom-in duration-300"
              title="Scroll to start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}

          {/* Left/Right Edge Fades */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050505] to-transparent z-10 transition-opacity duration-300"
            style={{ opacity: scrollPosition > 10 ? 1 : 0 }}
          />
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent z-10 transition-opacity duration-300"
            style={{ opacity: maxScroll > 0 && scrollPosition < maxScroll - 10 ? 1 : 0 }}
          />

          <div
            ref={boardRef}
            onScroll={handleScroll}
            className="overflow-x-auto overflow-y-visible px-6 py-6 bg-[#050505] custom-scrollbar"
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex items-start gap-4 min-w-max pb-8">
                {STAGES.map((stage: any) => (
                  <div
                    key={stage.id}
                    className="w-[85vw] md:w-[280px] lg:w-[320px] flex flex-col shrink-0"
                  >
                    {/* Column Header */}
                    <div className="flex flex-col mb-4 group px-3 border-b border-neutral-900 pb-3">
                      <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-300 flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${getStageColor(stage.id).split(" ")[0]}`}
                        />
                        {stage.label}
                      </h3>
                      <div className="text-[10px] text-neutral-500 font-mono mt-1 flex items-center gap-2">
                        <span>{getLeadsByStage(stage.id).length} deals</span>
                        <span>·</span>
                        <span className="text-emerald-500/80">
                          {new Intl.NumberFormat("es-MX", {
                            style: "currency",
                            currency: "MXN",
                            maximumFractionDigits: 0,
                          }).format(
                            getLeadsByStage(stage.id).reduce(
                              (sum, l) => sum + (l.estimated_value || 0),
                              0,
                            ),
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Column Content */}
                    <div className="bg-[#0d0d0d] border border-[#1f1f1f] flex flex-col rounded-xl overflow-hidden shadow-inner">
                      {stage.id === "cerrado" ? (
                        <div className="flex flex-col">
                          {/* Won Drop Zone */}
                          <Droppable droppableId="resolution_cerrado">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`p-4 space-y-4 transition-colors ${snapshot.isDraggingOver ? "bg-emerald-500/10 ring-2 ring-inset ring-emerald-500/40" : ""}`}
                              >
                                <div className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.3em] text-center mb-3 border-b border-neutral-900/50 pb-3 font-black">
                                  WON / CERRADO
                                </div>
                                {getLeadsByStage("cerrado")
                                  .filter((l) => l.pipeline_status === "cerrado")
                                  .map((lead, index) => (
                                    <LeadCard
                                      key={lead.id}
                                      lead={lead}
                                      index={index}
                                      isPending={pendingLeadId === lead.id}
                                      onClick={() => setSelectedLeadId(lead.id)}
                                    />
                                  ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
 
                          {/* Lost Drop Zone */}
                          <Droppable droppableId="resolution_perdido">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`border-t border-neutral-900/50 p-4 space-y-4 transition-colors ${snapshot.isDraggingOver ? "bg-red-500/10 ring-2 ring-inset ring-red-500/40" : ""}`}
                              >
                                <div className="text-[9px] font-mono text-neutral-600 uppercase tracking-[0.3em] text-center mb-3 border-b border-neutral-900/50 pb-3 font-black">
                                  LOST / PERDIDO
                                </div>
                                {getLeadsByStage("cerrado")
                                  .filter((l) => l.pipeline_status === "perdido")
                                  .map((lead, index) => (
                                    <LeadCard
                                      key={lead.id}
                                      lead={lead}
                                      index={index}
                                      isPending={pendingLeadId === lead.id}
                                      onClick={() => setSelectedLeadId(lead.id)}
                                    />
                                  ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      ) : (
                        <Droppable droppableId={stage.id}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`min-h-[200px] p-4 space-y-4 transition-colors ${
                                snapshot.isDraggingOver
                                  ? "bg-white/[0.05] ring-2 ring-inset ring-white/10"
                                  : ""
                              }`}
                            >
                              {getLeadsByStage(stage.id).map((lead, index) => (
                                <LeadCard
                                  key={lead.id}
                                  lead={lead}
                                  index={index}
                                  isPending={pendingLeadId === lead.id}
                                  onClick={() => setSelectedLeadId(lead.id)}
                                />
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>
      )}

      {/* Lost Reason Prompt */}
      {lostPromptId && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#0d0d0d] border border-neutral-900 p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                Razón de pérdida
              </h3>
              <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest">
                Opcional: ¿Por qué se perdió este lead?
              </p>
            </div>
            <textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              className="w-full bg-[#050505] border border-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 min-h-[100px]"
              placeholder="e.g. Presupuesto, Falta de respuesta..."
            />
            <div className="flex gap-3">
              <button
                onClick={() =>
                  updateLeadStatus(lostPromptId, "perdido", lostReason)
                }
                className="flex-1 bg-red-500 text-black text-[10px] font-black uppercase tracking-widest py-3 hover:bg-red-400 transition-all"
              >
                Confirmar
              </button>
              <button
                onClick={() => setLostPromptId(null)}
                className="flex-1 bg-white/[0.05] text-white text-[10px] font-black uppercase tracking-widest py-3 hover:bg-white/[0.1] transition-all"
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      )}

      <LeadDetailPanel
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onUpdate={(updatedLead) => {
          setLeads((prev) =>
            prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)),
          );
        }}
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

function LeadCard({
  lead,
  index,
  isPending,
  onClick,
}: {
  lead: Lead;
  index: number;
  isPending: boolean;
  onClick: () => void;
}) {
  const daysSinceCreated =
    parseInt(formatDistanceToNow(new Date(lead.created_at)).split(" ")[0]) || 0;

  const isOverdue = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isStale = !lead.closed_at && daysSinceCreated >= 10;
  const isUrgent = !lead.closed_at && daysSinceCreated >= 14;
  const isWarning = !lead.closed_at && daysSinceCreated >= 7 && daysSinceCreated < 14;

  return (
    <Draggable draggableId={lead.id} index={index} isDragDisabled={isPending}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-[#111111] border border-[#1f1f1f] p-5 md:p-6 flex flex-col gap-4 transition-all hover:border-[#333333] cursor-pointer group rounded-2xl relative active:scale-[0.98] ${
            snapshot.isDragging
              ? "z-[60] -rotate-1 scale-[1.05] border-emerald-500/40 shadow-[0_32px_80px_rgba(0,0,0,0.6)] ring-2 ring-emerald-500/30"
              : "shadow-[0_0_0_rgba(0,0,0,0)]"
          } ${isPending ? "opacity-70" : ""}`}
        >
          {snapshot.isDragging && (
            <div className="pointer-events-none absolute inset-x-4 -bottom-2 h-4 rounded-full bg-black/40 blur-md" />
          )}

          {/* Urgency Indicator (Left border strip) */}
          {isUrgent && <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500/80 rounded-l-md" />}
          {isWarning && <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500/80 rounded-l-md" />}

          {/* Activity Dot */}
          {!lead.closed_at && daysSinceCreated >= 3 && (
            <div
              className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse hidden"
              title="Sin actividad reciente"
            />
          )}

          <div className="space-y-1 pr-6">
            <h4 className="text-[13px] font-semibold text-neutral-100 group-hover:text-white transition-colors line-clamp-1">
              {lead.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 border text-neutral-400 bg-neutral-400/10 border-neutral-400/20">
                {getStageLabel(lead.service_interest)}
              </span>
              <span className="text-[8px] font-mono text-neutral-700">
                {lead.request_id}
              </span>
            </div>
            {lead.lead_score !== undefined && (
              <div className="pt-1 flex items-center gap-2">
                <LeadScoreBadge score={lead.lead_score} breakdown={lead.lead_score_breakdown} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            {lead.estimated_value ? (
              <div className="flex items-center gap-1 text-emerald-500">
                <DollarSign className="w-3 h-3" />
                <span className="text-[11px] font-bold">
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })
                    .format(lead.estimated_value)
                    .split(",")[0]}
                </span>
              </div>
            ) : (
              <div className="text-[9px] font-mono text-neutral-700 italic">
                No value set
              </div>
            )}

            <div className="flex items-center gap-1.5 text-neutral-400">
              <Clock className="w-2.5 h-2.5" />
              <span className="text-[9px] font-mono uppercase">
                {formatDistanceToNow(new Date(lead.created_at), {
                  addSuffix: false,
                })}
              </span>
            </div>
          </div>

          {(lead.next_action || lead.next_action_date) && (
            <div
              className={`mt-2 p-2 border border-white/[0.03] space-y-1 ${isOverdue(lead.next_action_date) ? "bg-red-500/10 border-red-500/20" : "bg-neutral-900/50"}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[8px] font-mono uppercase tracking-widest ${isOverdue(lead.next_action_date) ? "text-red-400 font-bold" : "text-neutral-400"}`}>
                  Next Action
                </span>
                {lead.next_action_date && (
                  <span
                    className={`text-[8px] font-mono font-bold ${isOverdue(lead.next_action_date) ? "text-red-500 animate-pulse" : "text-amber-500/80"}`}
                  >
                    {new Date(lead.next_action_date).toLocaleDateString("es-MX", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] font-medium leading-tight flex items-center gap-2 ${isOverdue(lead.next_action_date) ? "text-red-300" : "text-amber-500"}`}
              >
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="line-clamp-2">{lead.next_action || "Pending definition"}</span>
              </p>
            </div>
          )}

          {isStale && (
            <div className="mt-1 flex items-center gap-1.5 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-sm w-fit">
              <AlertCircle className="w-3 h-3" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
                Needs attention
              </span>
            </div>
          )}

          {/* Owner Avatar */}
          <div
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 overflow-hidden"
            title="Assigned to you"
          >
            <span className="text-[9px] font-mono text-neutral-400">ME</span>
          </div>

          {/* Quick Actions Hover Palette */}
          <div
            className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-[#1a1a1a] p-1 border border-neutral-800 rounded-md z-10 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
              title="Send email"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </button>
            <button
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
              title="Schedule"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </button>
            <button
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
              title="Add note"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
