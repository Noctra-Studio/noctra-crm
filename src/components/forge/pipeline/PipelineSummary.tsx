"use client";

import { DollarSign, BarChart2, Briefcase } from "lucide-react";

export function PipelineSummary({
  totalValue,
  activeDeals,
  expectedRevenue,
}: {
  totalValue: number;
  activeDeals: number;
  expectedRevenue: number;
}) {
  const formatValue = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-neutral-900 bg-[#050505]">
      <div className="p-4 md:border-r md:border-neutral-900 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
            Total Pipeline Value
          </h3>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            {formatValue(totalValue)}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      <div className="p-4 md:border-r md:border-neutral-900 flex items-center justify-between border-t md:border-t-0 border-neutral-900">
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
            Active Deals
          </h3>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            {activeDeals}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      <div className="p-4 flex items-center justify-between border-t md:border-t-0 border-neutral-900">
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
            Expected Revenue
          </h3>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            {formatValue(expectedRevenue)}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <BarChart2 className="w-4 h-4 text-amber-400" />
        </div>
      </div>
    </div>
  );
}
