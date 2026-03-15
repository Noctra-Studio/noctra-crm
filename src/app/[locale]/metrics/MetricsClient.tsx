"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Frown,
  Calendar,
  ChevronDown,
  Target,
  Percent,
  TrendingDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  subMonths,
  format,
  differenceInDays,
  subDays,
  isWithinInterval,
  startOfToday,
  startOfYear,
} from "date-fns";
import { es } from "date-fns/locale";
import { RevenueForecast, getRevenueForecast } from "@/app/actions/metrics";
import { ForecastCard } from "@/components/forge/metrics/ForecastCard";
import { RevenueTrendChart } from "@/components/forge/metrics/RevenueTrendChart";
import { ForecastBreakdownTable } from "@/components/forge/metrics/ForecastBreakdownTable";
import { motion, AnimatePresence } from "framer-motion";
import { ForgeSkeleton, ForgeMetricCardSkeleton } from "@/components/forge/ForgeSkeleton";

type Lead = {
  id: string;
  name: string;
  pipeline_status: string;
  estimated_value: number;
  service_interest: string;
  locale: string;
  created_at: string;
  closed_at?: string;
  lost_reason?: string;
};

type DateRange = "30d" | "90d" | "year" | "custom";

const STAGE_ORDER = ["nuevo", "contactado", "propuesta_enviada", "en_negociacion", "cerrado"];

const STAGE_COLORS: Record<string, string> = {
  nuevo: "bg-neutral-500",
  contactado: "bg-blue-500",
  propuesta_enviada: "bg-amber-500",
  en_negociacion: "bg-purple-500",
  cerrado: "bg-emerald-500",
  perdido: "bg-red-500",
};

interface MetricsClientProps {
  leads: Lead[];
  initialForecast: RevenueForecast;
  initialTrend: any[];
}

export default function MetricsClient({
  leads,
  initialForecast,
  initialTrend,
}: MetricsClientProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [forecast, setForecast] = useState<RevenueForecast>(initialForecast);
  const [trend, setTrend] = useState(initialTrend);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    let start: Date;
    let end = new Date();
    let prevStart: Date;
    let prevEnd: Date;

    const today = new Date();

    switch (dateRange) {
      case "30d":
        start = subDays(today, 30);
        prevStart = subDays(start, 30);
        prevEnd = start;
        break;
      case "90d":
        start = subDays(today, 90);
        prevStart = subDays(start, 90);
        prevEnd = start;
        break;
      case "year":
        start = startOfYear(today);
        prevStart = startOfYear(subMonths(start, 1));
        prevEnd = start;
        break;
      default:
        start = subDays(today, 30);
        prevStart = subDays(start, 30);
        prevEnd = start;
    }

    const currentLeads = leads.filter(l => isAfter(new Date(l.created_at), start));
    const previousLeads = leads.filter(l => isWithinInterval(new Date(l.created_at), { start: prevStart, end: prevEnd }));

    const calculateMetrics = (data: Lead[]) => {
      const total = data.length;
      const closed = data.filter((l) => l.pipeline_status === "cerrado").length;
      const lost = data.filter((l) => l.pipeline_status === "perdido").length;
      const conversionRate = total > 0 ? (closed / (closed + lost || total)) * 100 : 0;
      const winRate = (closed + lost) > 0 ? (closed / (closed + lost)) * 100 : 0;
      
      const pipelineValue = data
        .filter((l) => !["cerrado", "perdido"].includes(l.pipeline_status))
        .reduce((acc, l) => acc + (l.estimated_value || 0), 0);

      const wonValue = data
        .filter((l) => l.pipeline_status === "cerrado")
        .reduce((acc, l) => acc + (l.estimated_value || 0), 0);

      const avgDealSize = closed > 0 ? wonValue / closed : 0;

      const closedLeads = data.filter((l) => l.pipeline_status === "cerrado" && l.closed_at);
      const avgDaysToClose = closedLeads.length > 0
          ? closedLeads.reduce((acc, l) => acc + differenceInDays(new Date(l.closed_at!), new Date(l.created_at)), 0) / closedLeads.length
          : 0;

      const stageDistribution = data.reduce((acc: Record<string, number>, l) => {
        acc[l.pipeline_status] = (acc[l.pipeline_status] || 0) + 1;
        return acc;
      }, {});

      const lossReasons = data
        .filter(l => l.pipeline_status === "perdido" && l.lost_reason)
        .reduce((acc: Record<string, number>, l) => {
          const reason = l.lost_reason || "Otro";
          acc[reason] = (acc[reason] || 0) + 1;
          return acc;
        }, {});

      return { total, closed, lost, conversionRate, winRate, pipelineValue, wonValue, avgDealSize, avgDaysToClose, stageDistribution, lossReasons };
    };

    const current = calculateMetrics(currentLeads);
    const previous = calculateMetrics(previousLeads);

    return {
      current,
      previous,
      leads: currentLeads,
      allLeads: leads
    };
  }, [leads, dateRange]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getComparison = (curr: number, prev: number) => {
    if (prev === 0) return null;
    const diff = ((curr - prev) / prev) * 100;
    return {
      value: Math.abs(diff).toFixed(0) + "%",
      isPositive: diff >= 0,
    };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050505] overflow-y-auto pb-20">
      <header className="p-8 border-b border-white/5 bg-[#0a0a0a] flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-[10px] font-mono uppercase tracking-[0.4em] text-emerald-500 mb-2 font-black">
            Metrics & Intelligence
          </h1>
          <h2 className="text-3xl font-black tracking-tighter text-white italic uppercase">
            Rendimiento Comercial
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 p-1 rounded-lg">
          {(["30d", "90d", "year"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all rounded-md ${dateRange === r ? "bg-emerald-500 text-black font-black" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              {r === '30d' ? '30 Días' : r === '90d' ? '90 Días' : 'Este Año'}
            </button>
          ))}
        </div>
      </header>

      <div className="p-8 space-y-12 max-w-7xl mx-auto w-full">
        {/* Row 1: KPI Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <ForgeMetricCardSkeleton repeat={4} />
          ) : (
            <>
              <KPICard
                label="Leads Captados"
                value={stats.current.total.toString()}
                comparison={getComparison(stats.current.total, stats.previous.total)}
                icon={Users}
              />
              <KPICard
                label="Win Rate"
                value={`${stats.current.winRate.toFixed(1)}%`}
                comparison={getComparison(stats.current.winRate, stats.previous.winRate)}
                icon={Target}
                color={stats.current.winRate > 20 ? "text-emerald-400" : "text-amber-400"}
              />
              <KPICard
                label="Ticket Promedio"
                value={formatCurrency(stats.current.avgDealSize)}
                comparison={getComparison(stats.current.avgDealSize, stats.previous.avgDealSize)}
                icon={DollarSign}
              />
              <KPICard
                label="Ciclo de Venta"
                value={`${Math.round(stats.current.avgDaysToClose)}d`}
                comparison={getComparison(stats.current.avgDaysToClose, stats.previous.avgDaysToClose)}
                inverse
                icon={Clock}
              />
            </>
          )}
        </div>

        {/* Funnel & Projections */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Funnel Visualization */}
          <section className="lg:col-span-3 bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold border-l-2 border-emerald-500 pl-4">
                Pipeline Funnel
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
                <Percent className="w-3 h-3" /> Conversión Real
              </div>
            </div>

            <div className="space-y-4">
              {STAGE_ORDER.map((stage, idx) => {
                const count = stats.current.stageDistribution[stage] || 0;
                const total = stats.current.total;
                const pct = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={stage} className="relative">
                    <div className="flex justify-between items-center mb-1.5 px-2">
                       <span className="text-[10px] font-mono uppercase text-neutral-300 tracking-wider">
                          {stage.replace('_', ' ')}
                       </span>
                       <span className="text-sm font-bold text-white">
                          {count} <span className="text-[10px] font-mono text-neutral-500 font-normal ml-2">{pct.toFixed(0)}%</span>
                       </span>
                    </div>
                    <div className="h-6 bg-white/[0.02] border border-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(2, pct)}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full ${STAGE_COLORS[stage]} opacity-80 rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Forecast Quick Card */}
          <section className="lg:col-span-2 space-y-6">
             {isLoading ? (
               <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 space-y-4">
                 <ForgeSkeleton className="h-3 w-32" />
                 <ForgeSkeleton className="h-8 w-48" />
                 <div className="grid grid-cols-3 gap-2 pt-4">
                   <ForgeSkeleton className="h-10 w-full" repeat={3} />
                 </div>
               </div>
             ) : (
               <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 space-y-4">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-black">
                    Revenue Projection
                  </h3>
                  <div className="space-y-1">
                     <p className="text-3xl font-black text-white tracking-tighter">
                        {formatCurrency(forecast.total)}
                     </p>
                     <p className="text-[10px] font-mono text-neutral-400 uppercase">
                        Proyección estimada para {forecast.month}
                     </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-4">
                     <div className="space-y-1">
                        <div className="h-1 bg-emerald-500 rounded-full" />
                        <p className="text-[8px] font-mono text-neutral-500 uppercase">Firma</p>
                        <p className="text-[10px] font-bold text-white">{formatCurrency(forecast.confirmed)}</p>
                     </div>
                     <div className="space-y-1">
                        <div className="h-1 bg-amber-500 rounded-full" />
                        <p className="text-[8px] font-mono text-neutral-500 uppercase">Probable</p>
                        <p className="text-[10px] font-bold text-white">{formatCurrency(forecast.probable)}</p>
                     </div>
                     <div className="space-y-1">
                        <div className="h-1 bg-neutral-700 rounded-full" />
                        <p className="text-[8px] font-mono text-neutral-500 uppercase">Posible</p>
                        <p className="text-[10px] font-bold text-white">{formatCurrency(forecast.possible)}</p>
                     </div>
                  </div>
               </div>
             )}

             <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Leads Perdidos</p>
                   {isLoading ? <ForgeSkeleton className="h-6 w-12" /> : <p className="text-xl font-black text-rose-500">{stats.current.lost}</p>}
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Loss Rate</p>
                   {isLoading ? <ForgeSkeleton className="h-6 w-16 ml-auto" /> : (
                     <p className="text-xl font-black text-rose-500">
                        {((stats.current.lost / (stats.current.total || 1)) * 100).toFixed(1)}%
                     </p>
                   )}
                </div>
             </div>
          </section>
        </div>

        {/* Detailed Breakdown Table */}
        <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
           <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-bold">
                Desglose de Ingresos Proyectados
              </h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                       <th className="px-6 py-4 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Cliente</th>
                       <th className="px-6 py-4 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Estado</th>
                       <th className="px-6 py-4 text-[9px] font-mono text-neutral-500 uppercase tracking-widest text-right">Monto</th>
                       <th className="px-6 py-4 text-[9px] font-mono text-neutral-500 uppercase tracking-widest text-center">Prob.</th>
                       <th className="px-6 py-4 text-[9px] font-mono text-neutral-500 uppercase tracking-widest text-right">Aportación</th>
                       <th className="px-6 py-4 text-[9px] font-mono text-neutral-500 uppercase tracking-widest"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4"><ForgeSkeleton className="h-3 w-32" /></td>
                          <td className="px-6 py-4"><ForgeSkeleton className="h-3 w-20" /></td>
                          <td className="px-6 py-4"><ForgeSkeleton className="h-3 w-24 ml-auto" /></td>
                          <td className="px-6 py-4"><ForgeSkeleton className="h-3 w-12 mx-auto" /></td>
                          <td className="px-6 py-4"><ForgeSkeleton className="h-3 w-24 ml-auto" /></td>
                          <td className="px-6 py-4"></td>
                        </tr>
                      ))
                    ) : (
                      forecast.items.map((item) => (
                        <tr key={item.id} className="group hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                                {item.clientName}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-tighter">
                                  {item.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-mono text-neutral-300">
                                {formatCurrency(item.amount)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${item.probability === 100 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-neutral-400 bg-white/5 border-white/10'}`}>
                                  {item.probability}%
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-mono font-black text-emerald-500">
                                {formatCurrency(item.contribution)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Link href={item.status === 'lead' ? `/leads?id=${item.id}` : `/clients/${item.id}`} className="p-1.5 hover:text-emerald-400 transition-colors">
                                      <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                            </td>
                        </tr>
                      ))
                    )}
                  </tbody>
              </table>
           </div>
        </section>

        {/* Loss Intelligence */}
        {Object.keys(stats.current.lossReasons).length > 0 && (
          <section className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 space-y-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold border-l-2 border-rose-500 pl-4">
              Loss Intelligence (Motivos de Fuga)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(stats.current.lossReasons).map(([reason, count]) => {
                const totalLost = stats.current.lost;
                const pct = (count / (totalLost || 1)) * 100;
                return (
                  <div key={reason} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider truncate mr-4">{reason}</span>
                      <span className="text-xs font-bold text-rose-500">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-rose-500/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full bg-rose-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  comparison,
  icon: Icon,
  color = "text-white",
  inverse = false,
}: {
  label: string;
  value: string;
  comparison: { value: string; isPositive: boolean } | null;
  icon: any;
  color?: string;
  inverse?: boolean;
}) {
  const isActuallyGood = inverse ? !comparison?.isPositive : comparison?.isPositive;
  const compColor = isActuallyGood ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl relative group hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-500 font-black">
          {label}
        </span>
        <Icon className="w-4 h-4 text-neutral-800 group-hover:text-emerald-500 transition-colors" />
      </div>
      <div className="space-y-1">
        <div className={`text-3xl font-black tracking-tighter ${color}`}>
          {value}
        </div>
        {comparison && (
          <div className={`flex items-center gap-1.5 text-[10px] font-mono ${compColor} uppercase font-bold`}>
            {comparison.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {comparison.value} <span className="text-neutral-600 font-normal">vs periodo anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}
