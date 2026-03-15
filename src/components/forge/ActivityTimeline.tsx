"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Mail,
  PhoneCall,
  FileText,
  PenTool,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  StickyNote,
  Users,
  Briefcase,
  Activity,
  Plus,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";

export type TimelineEvent = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  iconName: string;
  color: string;
};

interface ActivityTimelineProps {
  entityType: "lead" | "client" | "project";
  entityId: string;
  showAddForm?: boolean;
  compact?: boolean;
}

export function ActivityTimeline({
  entityType,
  entityId,
  showAddForm = true,
  compact = false,
}: ActivityTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({ type: "note", content: "" });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const loadTimeline = async () => {
    setIsLoading(true);
    try {
      // Determine which table/column to query based on entity type
      let query;
      if (entityType === "lead") {
        query = supabase
          .from("lead_activities")
          .select("*")
          .eq("lead_id", entityId)
          .order("created_at", { ascending: false })
          .limit(50);
      } else if (entityType === "client") {
        // Client activities — stored against the contract/client record
        query = supabase
          .from("lead_activities")
          .select("*")
          .eq("client_id", entityId)
          .order("created_at", { ascending: false })
          .limit(50);
      } else {
        // Project activities
        query = supabase
          .from("lead_activities")
          .select("*")
          .eq("project_id", entityId)
          .order("created_at", { ascending: false })
          .limit(50);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        const mapped: TimelineEvent[] = data.map((row: any) => ({
          id: row.id,
          title: getActivityTitle(row.type, row.content),
          description: row.content,
          timestamp: row.created_at,
          iconName: getIconName(row.type),
          color: getColor(row.type),
        }));
        setEvents(mapped);
      }
    } catch (err) {
      console.error("Error loading timeline", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) loadTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, entityType]);

  const getActivityTitle = (type: string, content: string) => {
    switch (type) {
      case "note":
        return "Nota añadida";
      case "call":
        return "Llamada registrada";
      case "email":
        return "Email enviado";
      case "meeting":
        return "Reunión registrada";
      case "proposal_sent":
        return "Propuesta enviada";
      case "proposal_viewed":
        return "Propuesta vista por el cliente";
      case "contract_signed":
        return "Contrato firmado";
      case "file_uploaded":
        return "Archivo subido";
      case "lead_created":
        return "Lead creado";
      case "status_changed":
        return "Estado actualizado";
      default:
        return content?.slice(0, 60) || type;
    }
  };

  const getIconName = (type: string) => {
    switch (type) {
      case "email":
        return "mail";
      case "call":
        return "phone";
      case "meeting":
        return "meeting";
      case "proposal_sent":
      case "file_uploaded":
        return "file";
      case "proposal_viewed":
        return "eye";
      case "contract_signed":
        return "check";
      case "lead_created":
        return "user";
      default:
        return "note";
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "contract_signed":
        return "green";
      case "proposal_sent":
      case "proposal_viewed":
      case "email":
        return "blue";
      case "call":
      case "meeting":
        return "amber";
      default:
        return "neutral";
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.content.trim()) return;
    setIsSaving(true);
    try {
      const insertData: any = {
        type: newActivity.type,
        content: newActivity.content.trim(),
      };

      if (entityType === "lead") insertData.lead_id = entityId;
      else if (entityType === "client") insertData.client_id = entityId;
      else insertData.project_id = entityId;

      const { error } = await supabase
        .from("lead_activities")
        .insert(insertData);
      if (error) throw error;
      setNewActivity({ ...newActivity, content: "" });
      await loadTimeline();
    } catch (err) {
      console.error("Error adding activity:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getIconEl = (name: string) => {
    switch (name) {
      case "mail":
        return <Mail className="w-4 h-4" strokeWidth={1.5} />;
      case "phone":
        return <PhoneCall className="w-4 h-4" strokeWidth={1.5} />;
      case "file":
        return <FileText className="w-4 h-4" strokeWidth={1.5} />;
      case "pen":
        return <PenTool className="w-4 h-4" strokeWidth={1.5} />;
      case "eye":
        return <Eye className="w-4 h-4" strokeWidth={1.5} />;
      case "check":
        return <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />;
      case "x":
        return <XCircle className="w-4 h-4" strokeWidth={1.5} />;
      case "refresh":
        return <RefreshCw className="w-4 h-4" strokeWidth={1.5} />;
      case "meeting":
        return <Users className="w-4 h-4" strokeWidth={1.5} />;
      case "user":
        return <Users className="w-4 h-4" strokeWidth={1.5} />;
      case "briefcase":
        return <Briefcase className="w-4 h-4" strokeWidth={1.5} />;
      case "note":
      default:
        return <StickyNote className="w-4 h-4" strokeWidth={1.5} />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "blue":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "amber":
        return "bg-amber-500/20 text-amber-400 border-amber-500/50";
      case "red":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "neutral":
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-600";
    }
  };

  return (
    <div className="space-y-8">
      {/* ADD ACTIVITY FORM */}
      {showAddForm && (
        <div className="bg-[#080808] border border-neutral-900 p-4 space-y-4">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Registrar actividad
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { type: "note", icon: StickyNote, label: "Nota" },
              { type: "call", icon: PhoneCall, label: "Llamada" },
              { type: "email", icon: Mail, label: "Email" },
              { type: "meeting", icon: Users, label: "Reunión" },
            ].map((btn) => (
              <button
                key={btn.type}
                onClick={() =>
                  setNewActivity({ ...newActivity, type: btn.type })
                }
                className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest border transition-all ${
                  newActivity.type === btn.type
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-white/[0.02] border-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                <btn.icon className="w-3 h-3" strokeWidth={1.5} />
                {btn.label}
              </button>
            ))}
          </div>
          <textarea
            value={newActivity.content}
            onChange={(e) =>
              setNewActivity({ ...newActivity, content: e.target.value })
            }
            placeholder="Escribe el detalle de la actividad..."
            className="w-full bg-[#0d0d0d] border border-neutral-900 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors min-h-[80px] resize-y"
          />
          <button
            onClick={handleAddActivity}
            disabled={isSaving || !newActivity.content.trim()}
            className="w-full bg-white text-black text-[10px] font-black uppercase tracking-widest py-3 hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" />
            {isSaving ? "Guardando..." : "Agregar Actividad"}
          </button>
        </div>
      )}

      {/* TIMELINE */}
      <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
        {isLoading ? (
          <div className="py-12 text-center text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Cargando historial...
          </div>
        ) : events.length === 0 ? (
          <ForgeEmptyState
            icon="activity"
            eyebrow="Actividad"
            title="Sin actividad registrada"
            description="Agrega notas, llamadas, emails o reuniones para construir la trazabilidad de este registro."
            guidance={["Notas", "Llamadas", "Emails", "Reuniones"]}
            size="compact"
          />
        ) : (
          events.map((event, index) => (
            <div
              key={event.id + index}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Event Icon / Dot */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border bg-neutral-900 absolute left-0 md:left-1/2 -translate-y-4 sm:translate-y-0 transform -translate-x-1/2 shadow shrink-0 z-10 border-white ${getColorClasses(event.color)}`}
              >
                {getIconEl(event.iconName)}
              </div>

              {/* Event Content Card */}
              <div
                className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0A0A0A] border border-neutral-900 hover:border-neutral-700 transition-colors ${compact ? "p-3" : "p-4"}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-sm text-white">
                    {event.title}
                  </h4>
                  <time
                    className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest text-right shrink-0 ml-4 group-hover:text-emerald-500 transition-colors"
                    title={format(new Date(event.timestamp), "PPpp", {
                      locale: es,
                    })}
                  >
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </time>
                </div>
                {event.description && (
                  <p className="text-xs text-neutral-400 leading-relaxed font-light whitespace-pre-line">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
