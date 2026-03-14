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
} from "lucide-react";
import { getUnifiedTimeline, TimelineEvent } from "@/app/actions/timeline";
import { createClient } from "@/utils/supabase/client";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";

interface HistorialTabProps {
  leadId: string;
  onActivityAdded?: () => void;
}

export function HistorialTab({ leadId, onActivityAdded }: HistorialTabProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({ type: "note", content: "" });
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const loadTimeline = async () => {
    setIsLoading(true);
    try {
      const data = await getUnifiedTimeline(leadId);
      setEvents(data);
    } catch (err) {
      console.error("Error loading timeline", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) loadTimeline();
  }, [leadId]);

  const handleAddActivity = async () => {
    if (!newActivity.content.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("lead_activities").insert({
        lead_id: leadId,
        type: newActivity.type,
        content: newActivity.content.trim(),
      });
      if (error) throw error;
      setNewActivity({ ...newActivity, content: "" });
      if (onActivityAdded) onActivityAdded();
      await loadTimeline(); // Refresh
    } catch (err) {
      console.error("Error adding activity:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getIcon = (name: string) => {
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
      <div className="bg-[#080808] border border-neutral-900 p-4 space-y-4">
        <div className="flex items-center gap-2">
          {[
            { type: "note", icon: StickyNote, label: "Nota" },
            { type: "call", icon: PhoneCall, label: "Llamada" },
            { type: "email", icon: Mail, label: "Email" },
            { type: "meeting", icon: Users, label: "Reunión" },
          ].map((btn) => (
            <button
              key={btn.type}
              onClick={() => setNewActivity({ ...newActivity, type: btn.type })}
              className={`flex items-center gap-2 px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest border transition-all ${
                newActivity.type === btn.type
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                  : "bg-white/[0.02] border-white/5 text-neutral-400 hover:text-white"
              }`}>
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
          className="w-full bg-white text-black text-[10px] font-black uppercase tracking-widest py-3 hover:bg-neutral-200 transition-all disabled:opacity-50">
          {isSaving ? "Guardando..." : "+ Agregar Actividad Manual"}
        </button>
      </div>

      {/* TIMELINE */}
      <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
        {isLoading ? (
          <div className="py-12 text-center text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Cargando historial completo...
          </div>
        ) : events.length === 0 ? (
          <ForgeEmptyState
            icon="activity"
            eyebrow="Historial"
            title="Todavía no hay eventos registrados"
            description="Agrega una nota, llamada, email o reunión para empezar a construir la trazabilidad de este lead y dejar claro el siguiente paso comercial."
            guidance={["Notas", "Llamadas", "Emails", "Reuniones"]}
            size="compact"
          />
        ) : (
          events.map((event, index) => (
            <div
              key={event.id + index}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Event Icon / Dot */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border border-white bg-neutral-900 absolute left-0 md:left-1/2 -translate-y-4 sm:translate-y-0 transform -translate-x-1/2 shadow shrink-0 z-10 ${getColorClasses(
                  event.color,
                )}`}>
                {getIcon(event.iconName)}
              </div>

              {/* Event Content Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0A0A0A] border border-neutral-900 p-4 hover:border-neutral-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-white">
                    {event.title}
                  </h4>
                  <time
                    className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest text-right shrink-0 ml-4 group-hover:text-emerald-500 transition-colors"
                    title={format(new Date(event.timestamp), "PPpp", {
                      locale: es,
                    })}>
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
