"use client";

import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  X,
  Mail,
  Phone,
  PhoneCall,
  Globe,
  Calendar,
  MessageSquare,
  DollarSign,
  Clock,
  RefreshCw,
  StickyNote,
  Send,
  Users,
  PlusCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { HistorialTab } from "./HistorialTab";
import { LeadScoreBadge } from "./LeadScoreBadge";
import { LeadScoreBreakdownTable } from "./LeadScoreBreakdownTable";
import { recalculateLeadScoreAction } from "@/app/actions/leads";

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

type Activity = {
  id: string;
  lead_id: string;
  type: "note" | "call" | "email" | "meeting" | "status_change";
  content: string;
  created_at: string;
};

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
  lead_score?: number;
  lead_score_breakdown?: any;
};

interface LeadDetailPanelProps {
  leadId: string | null;
  onClose: () => void;
  onUpdate: (updatedLead: Lead) => void;
}

export function LeadDetailPanel({
  leadId,
  onClose,
  onUpdate,
}: LeadDetailPanelProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "note", content: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"DETALLES" | "HISTORIAL">(
    "DETALLES",
  );
  const [isRecalculating, setIsRecalculating] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (leadId) {
      window.addEventListener("keydown", handleEsc);
      fetchLeadData();
    } else {
      setLead(null);
      setActivities([]);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [leadId]);

  const fetchLeadData = async () => {
    setIsLoading(true);
    try {
      const { data: leadData, error: leadError } = await supabase
        .from("contact_submissions")
        .select("*")
        .eq("id", leadId)
        .single();

      if (leadError) throw leadError;
      setLead(leadData);

      const { data: activityData, error: activityError } = await supabase
        .from("lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (activityError) throw activityError;
      setActivities(activityData || []);
    } catch (err) {
      console.error("Error fetching lead data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLead = async (field: keyof Lead, value: any) => {
    if (!lead) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ [field]: value })
        .eq("id", lead.id);

      if (error) throw error;
      setLead({ ...lead, [field]: value });
      onUpdate({ ...lead, [field]: value });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecalculateScore = async () => {
    if (!lead) return;
    setIsRecalculating(true);
    try {
      const result = await recalculateLeadScoreAction(lead.id);
      const updatedLead = {
        ...lead,
        lead_score: result.score,
        lead_score_breakdown: result.breakdown,
      };
      setLead(updatedLead);
      onUpdate(updatedLead);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleAddActivity = async () => {
    if (!lead || !newActivity.content.trim()) return;
    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("lead_activities")
        .insert({
          lead_id: lead.id,
          type: newActivity.type,
          content: newActivity.content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      setActivities([data, ...activities]);
      setNewActivity({ ...newActivity, content: "" });
    } catch (err) {
      console.error("Error adding activity:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nuevo":
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
      case "contactado":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "propuesta_enviada":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "en_negociacion":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "cerrado":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "perdido":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "note":
        return <StickyNote className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case "call":
        return <PhoneCall className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case "email":
        return <Send className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case "meeting":
        return <Users className="w-3.5 h-3.5" strokeWidth={1.5} />;
      case "status_change":
        return <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />;
      default:
        return <StickyNote className="w-3.5 h-3.5" strokeWidth={1.5} />;
    }
  };

  if (!leadId) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${
          leadId
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed z-[70] bg-[#0a0a0a] border-neutral-900 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          /* Mobile: Bottom Sheet */
          bottom-0 left-0 right-0 h-[85vh] rounded-t-[20px] translate-y-full border-t
          /* Desktop: Right Drawer */
          md:top-0 md:bottom-0 md:right-0 md:left-auto md:h-screen md:rounded-none md:translate-y-0 md:translate-x-full md:border-l
          md:w-[420px] lg:w-[450px] xl:w-[500px]
          ${leadId ? (lead ? "translate-y-0 md:translate-x-0" : "") : ""}
        `}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-neutral-400 font-mono text-[10px] uppercase tracking-widest">
            Loading Lead Details...
          </div>
        ) : lead ? (
          <div className="flex flex-col h-full">
            {/* 1. Header (Fixed) */}
            <div className="flex-shrink-0 p-6 border-b border-neutral-900 flex items-center justify-between bg-[#080808] md:rounded-none rounded-t-[20px]">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {lead.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-white/[0.03] px-2 py-0.5 border border-white/[0.05]">
                    {lead.request_id}
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border ${getStatusColor(
                      lead.pipeline_status,
                    )}`}>
                    {getStageLabel(lead.pipeline_status)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white transition-colors bg-white/5 rounded-full">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* 2. Tabs Menu (Fixed) */}
            <div className="flex-shrink-0 px-6 border-b border-neutral-900 bg-[#080808]">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("DETALLES")}
                  className={`py-3 text-[10px] font-mono uppercase tracking-widest transition-all relative ${
                    activeTab === "DETALLES"
                      ? "text-emerald-400"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}>
                  Detalles
                  {activeTab === "DETALLES" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("HISTORIAL")}
                  className={`py-3 text-[10px] font-mono uppercase tracking-widest transition-all relative ${
                    activeTab === "HISTORIAL"
                      ? "text-emerald-400"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}>
                  Historial
                  {activeTab === "HISTORIAL" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
                  )}
                </button>
              </div>
            </div>

            {/* 3. Main Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-10 forge-scroll scroll-smooth">
              {/* Section 1: Contact Info */}
              <section
                className={`space-y-4 ${
                  activeTab === "DETALLES" ? "block" : "hidden"
                }`}>
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail
                      className="w-4 h-4 text-neutral-400"
                      strokeWidth={1.5}
                    />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sm text-neutral-300 hover:text-emerald-400 transition-colors">
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone
                      className="w-4 h-4 text-neutral-400"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm text-neutral-300">
                      {lead.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <Globe
                        className="w-3.5 h-3.5 text-neutral-700"
                        strokeWidth={1.5}
                      />
                      <span className="text-[10px] font-mono text-neutral-300 uppercase">
                        [{lead.locale || "ES"}]
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock
                        className="w-3.5 h-3.5 text-neutral-700"
                        strokeWidth={1.5}
                      />
                      <span className="text-[10px] font-mono text-neutral-300 uppercase">
                        {format(new Date(lead.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 1.5: Lead Scoring */}
              <section
                className={`space-y-4 pt-6 border-t border-neutral-900 ${
                  activeTab === "DETALLES" ? "block" : "hidden"
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    Lead Quality
                  </h3>
                  <button
                    onClick={handleRecalculateScore}
                    disabled={isRecalculating}
                    className="text-[9px] font-mono uppercase tracking-widest text-emerald-500 hover:text-emerald-400 disabled:opacity-50 transition-colors flex items-center gap-1.5">
                    <RefreshCw
                      className={`w-3 h-3 ${isRecalculating ? "animate-spin" : ""}`}
                      strokeWidth={1.5}
                    />
                    {isRecalculating ? "Recalculando..." : "Recalcular Score"}
                  </button>
                </div>

                {lead.lead_score !== undefined && lead.lead_score_breakdown ? (
                  <LeadScoreBreakdownTable
                    score={lead.lead_score}
                    breakdown={lead.lead_score_breakdown}
                  />
                ) : (
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded text-center">
                    <p className="text-[10px] font-mono text-neutral-500 uppercase">
                      Sin puntuación calculada
                    </p>
                    <button
                      onClick={handleRecalculateScore}
                      className="mt-2 text-[9px] font-mono text-emerald-500 underline uppercase tracking-tighter">
                      Calcular ahora
                    </button>
                  </div>
                )}
              </section>

              {/* Section 2: Lead Details */}
              <section
                className={`space-y-4 ${
                  activeTab === "DETALLES" ? "block" : "hidden"
                }`}>
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  Lead Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-2">
                      Service Interest
                    </label>
                    <span className="px-2 py-1 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono uppercase tracking-widest">
                      {getStageLabel(lead.service_interest)}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-2">
                      Original Message
                    </label>
                    <p className="text-sm text-neutral-400 leading-relaxed italic border-l-2 border-neutral-800 pl-4 py-1">
                      "{lead.message || "No message provided."}"
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-2">
                      Valor Estimado (MXN)
                    </label>
                    <div className="relative">
                      <DollarSign
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                        strokeWidth={1.5}
                      />
                      <input
                        type="number"
                        value={lead.estimated_value || ""}
                        onChange={(e) =>
                          handleUpdateLead(
                            "estimated_value",
                            parseFloat(e.target.value),
                          )
                        }
                        placeholder="0.00"
                        className="w-full bg-[#0d0d0d] border border-neutral-900 px-10 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  {lead.pipeline_status === "perdido" && (
                    <div>
                      <label className="text-[10px] font-mono uppercase text-red-500 block mb-2">
                        Razón de pérdida
                      </label>
                      <p className="text-sm text-red-400/80 italic bg-red-500/5 border border-red-500/10 p-3 leading-relaxed">
                        {lead.lost_reason || "No se proporcionó razón."}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Section 3: Next Action */}
              <section
                className={`space-y-4 pt-4 border-t border-neutral-900 ${
                  activeTab === "DETALLES" ? "block" : "hidden"
                }`}>
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  Next Action
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-2">
                      Próxima Acción
                    </label>
                    <input
                      type="text"
                      value={lead.next_action || ""}
                      onBlur={(e) =>
                        handleUpdateLead("next_action", e.target.value)
                      }
                      onChange={(e) =>
                        setLead({ ...lead, next_action: e.target.value })
                      }
                      placeholder="e.g. Llamar viernes"
                      className="w-full bg-[#0d0d0d] border border-neutral-900 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={
                        lead.next_action_date
                          ? lead.next_action_date.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdateLead("next_action_date", e.target.value)
                      }
                      className="w-full bg-[#0d0d0d] border border-neutral-900 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* TAB 2: HISTORIAL */}
              <section
                className={`pt-4 border-t border-neutral-900 ${
                  activeTab === "HISTORIAL" ? "block" : "hidden"
                }`}>
                <HistorialTab leadId={leadId} />
              </section>
            </div>

            {/* 4. Footer: Pipeline Status Selector (Fixed) */}
            <div className="flex-shrink-0 p-6 bg-[#080808] border-t border-neutral-900">
              <label className="text-[10px] font-mono uppercase text-neutral-500 block mb-4 tracking-tighter">
                Actualizar Estado del Pipeline
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "nuevo",
                  "contactado",
                  "propuesta_enviada",
                  "en_negociacion",
                  "cerrado",
                  "perdido",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateLead("pipeline_status", status)}
                    className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest border transition-all ${
                      lead.pipeline_status === status
                        ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                        : "bg-white/[0.02] border-white/5 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
                    }`}>
                    {getStageLabel(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
