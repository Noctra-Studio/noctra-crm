"use client";

import { useEffect, useState } from "react";
import { 
  Zap, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp, 
  Target,
  Clock,
  Mail,
  FileCheck
} from "lucide-react";
import { getInsights } from "@/app/[locale]/dashboard/actions";
import Link from "next/link";

export function CommandCenter() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const insights = await getInsights();
      setData(insights);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl"></div>
      ))}
    </div>
  );

  const calculateForecast = () => {
    if (!data?.forecast) return 0;
    // Simple probability weights
    const weights: Record<string, number> = {
      'nuevo': 0.05,
      'contactado': 0.15,
      'calificado': 0.30,
      'propuesta_enviada': 0.60,
      'negociacion': 0.85
    };

    return data.forecast.reduce((acc: number, deal: any) => {
      const weight = weights[deal.status] || 0;
      return acc + (deal.value * weight);
    }, 0);
  };

  const insights = [
    ...(data.idleLeads.map((l: any) => ({
      id: `lead-${l.id}`,
      type: 'warning',
      icon: Clock,
      title: 'Lead sin respuesta',
      description: `${l.name} (${l.company || 'Individual'}) lleva 5 días sin contacto.`,
      action: 'Contactar ahora',
      href: `/leads`
    }))),
    ...(data.viewedProposals.map((p: any) => ({
      id: `prop-${p.id}`,
      type: 'success',
      icon: Eye, // Note: Eye might need import if not already there, I see it in previous thought but not in block
      title: 'Propuesta vista',
      description: `El cliente vio "${p.title}" recientemente pero no ha firmado.`,
      action: 'Enviar recordatorio',
      href: `/proposals`
    }))),
    ...(data.pendingContracts.map((c: any) => ({
      id: `cont-${c.id}`,
      type: 'info',
      icon: FileCheck,
      title: 'Contrato pendiente',
      description: `Contrato ${c.contract_number} enviado. Aún sin firma.`,
      action: 'Ver contrato',
      href: `/contracts`
    })))
  ].slice(0, 3); // Show top 3

  const forecast = calculateForecast();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          Command Center • Insights accionables
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Forecast Card */}
        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-1">
              Proyección de Ingresos
            </p>
            <h4 className="text-2xl font-black tracking-tighter">
              ${forecast.toLocaleString('es-MX')} MXN
            </h4>
            <p className="text-[10px] text-emerald-500/60 mt-2 font-mono uppercase">
              Basado en probabilidad del pipeline
            </p>
          </div>
        </div>

        {/* Dynamic Insights */}
        {insights.length > 0 ? insights.map((insight: any) => (
          <div key={insight.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${
                insight.type === 'warning' ? 'text-amber-400' : 
                insight.type === 'success' ? 'text-emerald-400' : 'text-blue-400'
              }`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate">{insight.title}</h4>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{insight.description}</p>
                <Link href={insight.href} className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-mono uppercase tracking-widest text-white hover:gap-2 transition-all">
                  {insight.action} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )) : (
          <div className="lg:col-span-2 p-6 bg-white/5 border border-white/10 border-dashed rounded-2xl flex items-center justify-center text-center">
            <div className="space-y-2">
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                Todo está bajo control
              </p>
              <p className="text-[10px] text-neutral-600">
                No hay acciones críticas recomendadas en este momento.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Eye import manually to the block above
import { Eye } from "lucide-react";
