"use client";

import { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowRight,
  Users,
  Frown,
  CheckCircle2,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  subMonths,
  format,
  differenceInDays,
} from "date-fns";
import { ForgeSidebar } from "@/components/forge/ForgeSidebar";
import { useState, useEffect } from "react";
import { RevenueForecast, getRevenueForecast } from "@/app/actions/metrics";
import { MonthSelector } from "@/components/forge/metrics/MonthSelector";
import { ForecastCard } from "@/components/forge/metrics/ForecastCard";
import { RevenueTrendChart } from "@/components/forge/metrics/RevenueTrendChart";
import { ForecastBreakdownTable } from "@/components/forge/metrics/ForecastBreakdownTable";

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

const STAGE_COLORS: Record<string, string> = {
  nuevo: "bg-neutral-500",
  contactado: "bg-blue-500",
  propuesta_enviada: "bg-amber-500",
  en_negociacion: "bg-purple-500",
  cerrado: "bg-emerald-500",
  perdido: "bg-red-500",
};

const SERVICE_COLORS: Record<string, string> = {
  website: "bg-blue-500",
  ecommerce: "bg-purple-500",
  custom_system: "bg-emerald-500",
  discovery_call: "bg-amber-500",
  general: "bg-neutral-500",
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [forecast, setForecast] = useState<RevenueForecast>(initialForecast);
  const [trend, setTrend] = useState(initialTrend);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function updateData() {
      // Don't fetch if it's the initial month (already provided)
      if (format(currentDate, "MM yyyy") === format(new Date(), "MM yyyy")) {
        setForecast(initialForecast);
        return;
      }

      setIsUpdating(true);
      try {
        const newForecast = await getRevenueForecast(currentDate);
        setForecast(newForecast);
      } catch (err) {
        console.error("Error updating forecast:", err);
      } finally {
        setIsUpdating(false);
      }
    }
    updateData();
  }, [currentDate, initialForecast]);

  const stats = useMemo(() => {
    const total = leads.length;
    const closed = leads.filter((l) => l.pipeline_status === "cerrado").length;
    const conversionRate = total > 0 ? (closed / total) * 100 : 0;

    const pipelineValue = leads
      .filter((l) => !["cerrado", "perdido"].includes(l.pipeline_status))
      .reduce((acc, l) => acc + (l.estimated_value || 0), 0);

    const wonValue = leads
      .filter((l) => l.pipeline_status === "cerrado")
      .reduce((acc, l) => acc + (l.estimated_value || 0), 0);

    const closedLeads = leads.filter(
      (l) => l.pipeline_status === "cerrado" && l.closed_at,
    );
    const avgDaysToClose =
      closedLeads.length > 0
        ? closedLeads.reduce(
            (acc, l) =>
              acc +
              differenceInDays(new Date(l.closed_at!), new Date(l.created_at)),
            0,
          ) / closedLeads.length
        : 0;

    // Monthly leads (last 6 months)
    const monthlyLeads = Array.from({ length: 6 })
      .map((_, i) => {
        const monthDate = subMonths(new Date(), i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const count = leads.filter((l) => {
          const d = new Date(l.created_at);
          return isAfter(d, start) && isBefore(d, end);
        }).length;
        return {
          label: format(monthDate, "MMM"),
          count,
        };
      })
      .reverse();

    // Leads by service
    const serviceDistribution = leads.reduce(
      (acc: Record<string, number>, l) => {
        acc[l.service_interest] = (acc[l.service_interest] || 0) + 1;
        return acc;
      },
      {},
    );

    // Leads by stage
    const stageDistribution = leads.reduce((acc: Record<string, number>, l) => {
      acc[l.pipeline_status] = (acc[l.pipeline_status] || 0) + 1;
      return acc;
    }, {});

    const lostLeads = leads.filter((l) => l.pipeline_status === "perdido");

    return {
      total,
      closed,
      conversionRate,
      pipelineValue,
      wonValue,
      avgDaysToClose,
      monthlyLeads,
      serviceDistribution,
      stageDistribution,
      lostLeads,
    };
  }, [leads]);

  const formatCurrency = (val: number) => {
    return (
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      }).format(val) + " MXN"
    );
  };

  return (
    <>
      <header className="p-8 border-b border-neutral-900 bg-[#080808]">
        <h1 className="text-[10px] font-mono uppercase tracking-[0.4em] text-neutral-300 mb-2">
          Metrics Dashboard
        </h1>
        <h2 className="text-3xl font-black tracking-tighter">
          RENDIMIENTO DEL PIPELINE
        </h2>
      </header>

      <div className="p-8 space-y-12 max-w-7xl mx-auto">
        {/* Row 0: Forecast & Trend */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Revenue Projection
              </h2>
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                Visualización de ingresos confirmados y proyectados
              </p>
            </div>
            <MonthSelector
              currentDate={currentDate}
              onChange={setCurrentDate}
            />
          </div>

          <div
            className={`grid grid-cols-1 lg:grid-cols-5 gap-6 transition-opacity duration-300 w-full max-w-full overflow-hidden ${isUpdating ? "opacity-50" : "opacity-100"}`}>
            <div className="lg:col-span-2">
              <ForecastCard forecast={forecast} />
            </div>
            <div className="lg:col-span-3">
              <RevenueTrendChart data={trend} />
            </div>
          </div>

          <div
            className={`transition-opacity duration-300 ${isUpdating ? "opacity-50" : "opacity-100"}`}>
            <ForecastBreakdownTable items={forecast.items} />
          </div>
        </section>

        <div className="h-px bg-white/5 w-full" />

        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Leads Totales"
            value={stats.total.toString()}
            subtext={`+${leads.filter((l) => isAfter(new Date(l.created_at), subMonths(new Date(), 1))).length} este mes`}
            icon={Users}
          />
          <KPICard
            label="Tasa de Conversión"
            value={`${stats.conversionRate.toFixed(1)}%`}
            subtext={`${stats.closed} cerrados de ${stats.total}`}
            icon={TrendingUp}
            color={
              stats.conversionRate > 20 ? "text-emerald-500" : "text-amber-500"
            }
          />
          <KPICard
            label="Valor en Pipeline"
            value={formatCurrency(stats.pipelineValue).split(" ")[0]}
            subtext="MXN Proyectos activos"
            icon={DollarSign}
          />
          <KPICard
            label="Días p. Cierre"
            value={`${Math.round(stats.avgDaysToClose)} días`}
            subtext="Promedio histórico"
            icon={Clock}
          />
        </div>

        {/* Row 2: Funnel Visualization */}
        <section className="bg-[#111111] border border-neutral-900 p-4 md:p-8 w-full max-w-full overflow-hidden">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 mb-4 md:mb-8">
            Pipeline Funnel
          </h3>

          {/* Desktop Funnel */}
          <div className="hidden md:flex items-end h-48 gap-px w-full max-w-full">
            {[
              "nuevo",
              "contactado",
              "propuesta_enviada",
              "en_negociacion",
              "cerrado",
            ].map((stage, idx, arr) => {
              const count = stats.stageDistribution[stage] || 0;
              const prevCount =
                idx > 0
                  ? stats.stageDistribution[arr[idx - 1]] || 0
                  : stats.total;
              const dropoff = idx > 0 ? (count / prevCount) * 100 : 100;
              const totalPct = (count / stats.total) * 100 || 0;

              return (
                <div
                  key={stage}
                  className="flex-1 flex flex-col justify-end group min-w-0">
                  <div className="flex flex-col items-center mb-4 transition-transform group-hover:-translate-y-1">
                    <span className="text-xl font-black">{count}</span>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-tighter truncate max-w-full px-1">
                      {totalPct.toFixed(0)}% del total
                    </span>
                  </div>
                  <div
                    className={`${STAGE_COLORS[stage]} border-t border-white/10 transition-all w-full group-hover:brightness-110`}
                    style={{
                      height: `${Math.max(10, totalPct)}%`,
                      opacity: 0.3 + idx * 0.15,
                    }}
                  />
                  <div className="mt-4 text-[9px] font-mono text-neutral-300 uppercase tracking-widest text-center truncate px-2 w-full">
                    {stage.replace("_", " ")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Funnel */}
          <div className="flex flex-col md:hidden gap-3 w-full">
            {[
              "nuevo",
              "contactado",
              "propuesta_enviada",
              "en_negociacion",
              "cerrado",
            ].map((stage) => {
              const count = stats.stageDistribution[stage] || 0;
              const totalPct = (count / stats.total) * 100 || 0;

              return (
                <div
                  key={stage}
                  className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-md border border-neutral-800 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2 h-8 rounded-full shrink-0 ${STAGE_COLORS[stage]}`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-mono uppercase tracking-widest text-neutral-300 truncate">
                        {stage.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {totalPct.toFixed(0)}% del total
                      </span>
                    </div>
                  </div>
                  <div className="text-xl font-black shrink-0 ml-2">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Row 3: Service & Monthly Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leads by Service */}
          <section className="bg-[#111111] border border-neutral-900 p-4 md:p-8 w-full max-w-full overflow-hidden">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 mb-4 md:mb-8">
              Leads por Servicio
            </h3>
            <div className="space-y-6">
              {Object.entries(stats.serviceDistribution).map(
                ([service, count]) => {
                  const pct = (count / stats.total) * 100;
                  return (
                    <div key={service} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                        <span className="text-neutral-400">{service}</span>
                        <span className="text-white font-bold">
                          {count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-900 overflow-hidden">
                        <div
                          className={`h-full ${SERVICE_COLORS[service] || SERVICE_COLORS.general}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>

          {/* Monthly Growth */}
          <section className="bg-[#111111] border border-neutral-900 p-4 md:p-8 flex flex-col w-full max-w-full overflow-hidden">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 mb-4 md:mb-8">
              Leads por Mes (Últimos 6m)
            </h3>
            <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 h-48 w-full max-w-full overflow-hidden">
              {stats.monthlyLeads.map((m) => {
                const maxCount = Math.max(
                  ...stats.monthlyLeads.map((ml) => ml.count),
                );
                const height = maxCount > 0 ? (m.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={m.label}
                    className="flex-1 flex flex-col items-center gap-2 md:gap-4 min-w-0">
                    <span className="text-[9px] md:text-[10px] font-mono text-neutral-400 shrink-0">
                      {m.count}
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-emerald-500 scale-y-0 origin-bottom transition-transform duration-1000"
                      style={{ height: `${height}%`, transform: "scaleY(1)" }}
                    />
                    <span className="text-[8px] sm:text-[10px] font-mono text-neutral-400 uppercase truncate px-0.5 max-w-full text-center">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Row 4: Lost Leads Table */}
        <section className="bg-[#111111] border border-neutral-900 overflow-hidden w-full max-w-full">
          <div className="p-8 border-b border-neutral-900">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
              Leads Perdidos
            </h3>
          </div>
          {stats.lostLeads.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-700">
                No hay leads perdidos aún
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0d0d0d] border-b border-neutral-900">
                    <th className="px-8 py-4 text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                      Nombre
                    </th>
                    <th className="px-8 py-4 text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                      Servicio
                    </th>
                    <th className="px-8 py-4 text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                      Valor Est.
                    </th>
                    <th className="px-8 py-4 text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                      Razón Perdida
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lostLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-neutral-900/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-4 font-bold text-sm tracking-tight">
                        {lead.name}
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 bg-white/[0.03] px-2 py-1 border border-white/[0.05]">
                          {lead.service_interest}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm font-mono text-red-400/80">
                        {lead.estimated_value
                          ? formatCurrency(lead.estimated_value)
                          : "---"}
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-xs text-neutral-300 italic max-w-xs truncate">
                          {lead.lost_reason || "No se especificó razón"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function KPICard({
  label,
  value,
  subtext,
  icon: Icon,
  color = "text-white",
}: {
  label: string;
  value: string;
  subtext: string;
  icon: any;
  color?: string;
}) {
  return (
    <div className="bg-[#111111] border border-neutral-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400">
          {label}
        </span>
        <Icon className="w-4 h-4 text-neutral-700" />
      </div>
      <div className="space-y-1">
        <div className={`text-4xl font-black tracking-tighter ${color}`}>
          {value}
        </div>
        <div className="text-[10px] font-mono text-neutral-700 uppercase">
          {subtext}
        </div>
      </div>
    </div>
  );
}
