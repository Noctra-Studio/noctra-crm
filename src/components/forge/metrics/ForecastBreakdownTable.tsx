"use client";

import Link from "next/link";
import { ExternalLink, ChevronRight } from "lucide-react";
import { ForecastItem } from "@/app/actions/metrics";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";

interface ForecastBreakdownTableProps {
  items: ForecastItem[];
}

export function ForecastBreakdownTable({ items }: ForecastBreakdownTableProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amt);

  // Sort items by contribution descending
  const sortedItems = [...items].sort(
    (a, b) => b.contribution - a.contribution,
  );

  const getProbabilityColor = (prob: number) => {
    if (prob === 100)
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (prob === 60)
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-neutral-500 bg-white/[0.03] border-white/10";
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden mt-8">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold">
          Desglose de Ingresos Proyectados
        </h3>
        <div className="flex items-center gap-2 text-[9px] font-mono text-neutral-600 uppercase">
          Ordenado por aporte al forecast
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium text-left">
                Cliente
              </th>
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium text-left">
                Tipo
              </th>
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium text-right">
                Monto
              </th>
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium text-center">
                Prob.
              </th>
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium text-right">
                Aporte
              </th>
              <th className="py-4 px-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12">
                  <ForgeEmptyState
                    icon="bar-chart"
                    eyebrow="Métricas"
                    title="Cero impacto en forecast"
                    description="No hay propuestas ni proyectos activos con impacto financiero para este periodo."
                    size="compact"
                  />
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-neutral-200 group-hover:text-emerald-400 transition-colors">
                      {item.clientName}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-tighter">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-sm font-mono text-neutral-300">
                      {formatCurrency(item.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm border uppercase tracking-tighter ${getProbabilityColor(item.probability)}`}>
                      {item.probability}%
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right border-l border-white/5 bg-white/[0.01]">
                    <span className="text-sm font-mono font-black text-emerald-500">
                      {formatCurrency(item.contribution)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={item.type === 'Lead' ? `/leads?id=${item.id}` : `/clients/${item.id}`}
                        className="p-1.5 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-md transition-all"
                      >
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
    </div>
  );
}
