"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Filter,
  AlertCircle,
  Kanban,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ForgeSidebar } from "@/components/forge/ForgeSidebar";
import { LeadDetailPanel } from "@/components/forge/LeadDetailPanel";
import { updateLeadStatusWithScoring } from "@/app/actions/leads";
import { LeadScoreBadge } from "@/components/forge/LeadScoreBadge";
import { useFollowUps } from "@/hooks/useFollowUps";
import { FollowUpBanner } from "@/components/forge/FollowUpBanner";
import { FollowUpModal } from "@/components/forge/FollowUpModal";
import { FollowUpSuggestion } from "@/app/actions/followup";

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

// Placeholder if STAGES is deleted, we will derive from config

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
  workspaceId,
  config,
}: {
  initialLeads: Lead[];
  workspaceId: string;
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [alerts, setAlerts] = useState<
    { id: string; name: string; days_inactive: number }[]
  >([]);
  const { suggestions, dismiss, refresh } = useFollowUps();
  const [selectedFollowUp, setSelectedFollowUp] =
    useState<FollowUpSuggestion | null>(null);

  const pipelineSuggestions = suggestions.filter(
    (s) => s.type === "lead_no_contact_3d" || s.type === "contract_sent_3d",
  );

  const supabase = createClient();

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase.rpc("get_leads_needing_attention");
      if (data) setAlerts(data);
    };
    fetchAlerts();
  }, [supabase]);

  // Filter leads based on search
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

    // Sort NUEVO column by lead_score descending
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

    // Special case for the split Resolution column
    // Since we only have 5 columns, and 'cerrado'/'perdido' share the 5th
    // We'll need a way to distinguish.
    // Actually, I'll make the 5th column provide two drop areas or just handle it.
    // The user said "CERRADO (green) | PERDIDO (red) — split at bottom"

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
    setIsUpdating(true);
    try {
      const updates: any = { pipeline_status: status };
      if (status === "cerrado") updates.closed_at = new Date().toISOString();
      if (status === "perdido" && lostReasonText)
        updates.lost_reason = lostReasonText;

      const result = await updateLeadStatusWithScoring(
        leadId,
        status,
        lostReasonText,
      );

      if (!result.success)
        throw new Error((result as any).error || "Unknown error");

      // Log activity
      await supabase.from("lead_activities").insert({
        lead_id: leadId,
        workspace_id: workspaceId,
        type: "status_change",
        content: `Status changed to ${status}${lostReasonText ? `. Reason: ${lostReasonText}` : ""}`,
      });

      // Update local state
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l)),
      );
    } catch (err) {
      console.error("Error updating lead status:", err);
      alert("Error updating status");
    } finally {
      setIsUpdating(false);
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
      {/* Sub-Header */}
      <header className="p-6 border-b border-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#080808]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-tight flex items-center gap-3">
            PIPELINE
            <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.03] px-2 py-0.5 border border-white/[0.05]">
              {leads.length} LEADS
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
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
          <button className="p-2.5 bg-[#0b0b0b] border border-neutral-900 text-neutral-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Follow-up Banners */}
      {pipelineSuggestions.length > 0 && (
        <div className="px-6 pt-4">
          {pipelineSuggestions.map((s) => (
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

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="bg-[#1a1200] border-b border-amber-900/30 p-4 flex items-center justify-between animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-200">
              {alerts.length} leads sin actividad en los últimos 3 días (o
              acciones vencidas)
            </p>
          </div>
          <button
            onClick={() => {
              const firstAlertId = alerts[0].id;
              setSelectedLeadId(firstAlertId);
            }}
            className="text-[10px] font-mono uppercase tracking-widest text-amber-500 hover:text-amber-400 underline underline-offset-4">
            Atender primer lead →
          </button>
        </div>
      )}

      {/* Kanban Board */}
      {leads.length === 0 ? (
        <div className="px-6 py-10">
          <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-[#111111] border border-dashed border-neutral-800 rounded-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-xl shadow-black/50">
              <Kanban className="w-8 h-8 text-emerald-500" />
            </div>

            <h3 className="text-xl font-bold text-white mb-3 relative z-10">
              Pipeline vacío
            </h3>

            <p className="text-neutral-400 text-sm max-w-sm mx-auto mb-8 relative z-10">
              Aún no tienes leads en tu pipeline. Agrega prospectos desde la
              sección de Leads o importando tus contactos.
            </p>

            <Link
              href="/forge/leads"
              className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-all shadow-lg hover:-translate-y-0.5 mt-2">
              <Plus className="w-4 h-4" />
              Nuevo Lead
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto p-6 bg-[#050505] forge-scroll">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full min-w-max pb-4">
              {STAGES.map((stage: any) => (
                <div
                  key={stage.id}
                  className="w-[280px] flex flex-col shrink-0">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 group px-2">
                    <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-300 flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getStageColor(stage.id).split(" ")[0]}`}
                      />
                      {stage.label}
                    </h3>
                    <span className="text-[9px] font-mono text-neutral-700 bg-white/[0.02] px-1.5 py-0.5">
                      {getLeadsByStage(stage.id).length}
                    </span>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 bg-[#0d0d0d] border border-[#1f1f1f] flex flex-col min-h-0">
                    {/* Special Handling for the 5th column split */}
                    {stage.id === "cerrado" ? (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Won Drop Zone */}
                        <Droppable droppableId="resolution_cerrado">
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`flex-1 min-h-[200px] p-3 space-y-3 transition-colors forge-scroll ${snapshot.isDraggingOver ? "bg-emerald-500/5" : ""}`}>
                              <div className="text-[8px] font-mono text-neutral-800 uppercase tracking-widest text-center mb-2 border-b border-neutral-900 pb-2">
                                WON / CERRADO
                              </div>
                              {getLeadsByStage("cerrado")
                                .filter((l) => l.pipeline_status === "cerrado")
                                .map((lead, index) => (
                                  <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    index={index}
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
                              className={`h-[40%] min-h-[150px] border-t border-neutral-900 p-3 space-y-3 transition-colors forge-scroll ${snapshot.isDraggingOver ? "bg-red-500/5" : ""}`}>
                              <div className="text-[8px] font-mono text-neutral-800 uppercase tracking-widest text-center mb-2 border-b border-neutral-900 pb-2">
                                LOST / PERDIDO
                              </div>
                              {getLeadsByStage("cerrado")
                                .filter((l) => l.pipeline_status === "perdido")
                                .map((lead, index) => (
                                  <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    index={index}
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
                            className={`flex-1 min-h-[400px] p-3 space-y-3 transition-colors forge-scroll ${snapshot.isDraggingOver ? "bg-white/[0.02]" : ""}`}>
                            {getLeadsByStage(stage.id).map((lead, index) => (
                              <LeadCard
                                key={lead.id}
                                lead={lead}
                                index={index}
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
                className="flex-1 bg-red-500 text-black text-[10px] font-black uppercase tracking-widest py-3 hover:bg-red-400 transition-all">
                Confirmar
              </button>
              <button
                onClick={() => setLostPromptId(null)}
                className="flex-1 bg-white/[0.05] text-white text-[10px] font-black uppercase tracking-widest py-3 hover:bg-white/[0.1] transition-all">
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
  onClick,
}: {
  lead: Lead;
  index: number;
  onClick: () => void;
}) {
  const isOverdue = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-[#111111] border border-[#1f1f1f] p-4 flex flex-col gap-3 transition-all hover:border-[#333333] cursor-pointer group relative ${snapshot.isDragging ? "opacity-80 scale-95 shadow-2xl z-[60]" : ""}`}>
          {/* Activity Dot */}
          {!lead.closed_at &&
            formatDistanceToNow(new Date(lead.created_at)).includes("days") &&
            parseInt(
              formatDistanceToNow(new Date(lead.created_at)).split(" ")[0],
            ) >= 3 && (
              <div
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                title="Sin actividad reciente"
              />
            )}

          <div className="space-y-1">
            <h4 className="text-[13px] font-semibold text-neutral-100 group-hover:text-white transition-colors">
              {lead.name}
            </h4>
            <div className="flex items-center gap-2">
              <span
                className={`text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 border text-neutral-400 bg-neutral-400/10 border-neutral-400/20`}>
                {getStageLabel(lead.service_interest)}
              </span>
              <span className="text-[8px] font-mono text-neutral-700">
                {lead.request_id}
              </span>
            </div>
            {lead.lead_score !== undefined && (
              <div className="pt-1">
                <LeadScoreBadge score={lead.lead_score} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            {lead.estimated_value ? (
              <div className="flex items-center gap-1 text-emerald-500">
                <DollarSign className="w-3 h-3" />
                <span className="text-[11px] font-bold">
                  {
                    new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })
                      .format(lead.estimated_value)
                      .split(",")[0]
                  }
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
              className={`mt-2 p-2 border border-white/[0.03] space-y-1 ${isOverdue(lead.next_action_date) ? "bg-red-500/5" : "bg-white/[0.01]"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest">
                  Next Action
                </span>
                {lead.next_action_date && (
                  <span
                    className={`text-[8px] font-mono font-bold ${isOverdue(lead.next_action_date) ? "text-red-500" : "text-amber-500/80"}`}>
                    {new Date(lead.next_action_date).toLocaleDateString(
                      "es-MX",
                      { month: "short", day: "numeric" },
                    )}
                  </span>
                )}
              </div>
              <p
                className={`text-[10px] leading-tight flex items-center gap-2 ${isOverdue(lead.next_action_date) ? "text-red-400" : "text-amber-500"}`}>
                <ChevronRight className="w-2.5 h-2.5" />
                {lead.next_action || "Pending definition"}
              </p>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
