"use client";

import { useEffect, useState } from "react";
import { 
  Eye, 
  Clock, 
  Calendar, 
  Activity,
  Loader2,
  TrendingUp,
  MousePointer2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ProposalIntelligenceProps {
  proposalId: string;
}

export function ProposalIntelligence({ proposalId }: ProposalIntelligenceProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadStats();
  }, [proposalId]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data: events, error } = await supabase
        .from("proposal_events")
        .select("*")
        .eq("proposal_id", proposalId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!events || events.length === 0) {
        setStats(null);
        return;
      }

      // Aggregate stats
      const viewEvents = events.filter(e => e.event_type === "view");
      const lastView = events[0].created_at;
      const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;

      // Calculate time spent (from heartbeats)
      // Group by visitor_id and take the MAX timeSpentSeconds per visitor session
      const visitorTimeMap: Record<string, number> = {};
      events.forEach(e => {
        if (e.event_type === "heartbeat" && e.metadata?.timeSpentSeconds) {
          const time = e.metadata.timeSpentSeconds;
          if (!visitorTimeMap[e.visitor_id] || time > visitorTimeMap[e.visitor_id]) {
            visitorTimeMap[e.visitor_id] = time;
          }
        }
      });

      const totalSeconds = Object.values(visitorTimeMap).reduce((acc, curr) => acc + curr, 0);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      // Calculate viewed sections
      const viewedSections = Array.from(new Set(
        events
          .filter(e => e.event_type === "scroll" && e.metadata?.section)
          .map(e => e.metadata.section)
      ));

      setStats({
        viewCount: viewEvents.length,
        lastView,
        uniqueVisitors,
        timeSpent: `${minutes}m ${seconds}s`,
        totalSeconds,
        viewedSections
      });
    } catch (err) {
      console.error("Error loading proposal stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white/5 border border-white/10 rounded-xl">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center">
        <Activity className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
          Sin actividad reciente
        </p>
        <p className="text-[9px] text-neutral-600 mt-1">
          Las métricas aparecerán cuando el cliente abra la propuesta.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          Inteligencia de Ventas
        </h4>
        <button 
          onClick={loadStats}
          className="text-[9px] font-mono text-neutral-500 hover:text-white transition-colors"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-neutral-500">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono uppercase tracking-widest">Vistas</span>
          </div>
          <p className="text-xl font-bold">{stats.viewCount}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-neutral-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono uppercase tracking-widest">Tiempo</span>
          </div>
          <p className="text-xl font-bold">{stats.timeSpent}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Última vista
          </span>
          <span className="text-[10px] font-bold">
            {formatDistanceToNow(new Date(stats.lastView), { addSuffix: true, locale: es })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest flex items-center gap-2">
            <MousePointer2 className="w-3 h-3" /> Visitantes únicos
          </span>
          <span className="text-[10px] font-bold">{stats.uniqueVisitors}</span>
        </div>
        {stats.viewedSections?.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" /> Secciones visitadas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {stats.viewedSections.map((s: string) => (
                <span key={s} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-neutral-400 uppercase">
                  {s.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
        <p className="text-[9px] text-emerald-400 font-mono leading-relaxed uppercase tracking-wider">
          {stats.totalSeconds > 120 
            ? "Interés alto detectado. El cliente ha pasado más de 2 minutos leyendo."
            : "Propuesta abierta recientemente. Pendiente de mayor interacción."}
        </p>
      </div>
    </div>
  );
}
