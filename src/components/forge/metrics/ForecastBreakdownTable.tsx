"use client";

import { ForecastItem } from "@/app/actions/metrics";

interface ForecastBreakdownTableProps {
  items: ForecastItem[];
}

export function ForecastBreakdownTable({ items }: ForecastBreakdownTableProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
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
    <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden mt-8">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold">
          Desglose de items
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium">
                Cliente
              </th>
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium">
                Tipo
              </th>
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium text-right">
                Monto
              </th>
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium text-center">
                Probabilidad
              </th>
              <th className="py-4 px-6 text-[9px] font-mono uppercase tracking-widest text-neutral-500 font-medium text-right">
                Aportación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  No hay items para este periodo
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors">
                      {item.clientName}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-tighter">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-xs font-mono text-neutral-300">
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
                    <span className="text-xs font-mono font-black text-emerald-500">
                      {formatCurrency(item.contribution)}
                    </span>
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
