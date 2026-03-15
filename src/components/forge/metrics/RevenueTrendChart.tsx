"use client";

import { motion } from "framer-motion";

interface TrendData {
  label: string;
  amount: number;
  isForecast: boolean;
}

interface RevenueTrendChartProps {
  data: TrendData[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1000);

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amt);

  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl flex flex-col h-full space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-black">
          Tendencia de Ingresos (6M)
        </h3>
        <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-bold">
          Market Trend Analysis
        </span>
      </div>

      <div className="flex-1 flex items-end justify-between gap-4 pt-4 min-h-[220px]">
        {data.map((item, idx) => {
          const heightPercent = `${Math.max(4, (item.amount / maxAmount) * 100)}%`;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
              <div className="relative w-full flex flex-col items-center justify-end h-full">
                {/* Tooltip */}
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-200 bg-white text-black text-[9px] font-black px-2 py-1 rounded whitespace-nowrap shadow-xl z-20 pointer-events-none">
                  {formatCurrency(item.amount)}
                </div>

                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: heightPercent }}
                  transition={{ duration: 1, delay: idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  className={`w-full rounded-t-lg transition-colors cursor-help relative ${
                    item.isForecast
                      ? "bg-emerald-500/10 border-t border-emerald-500 group-hover:bg-emerald-500/20"
                      : "bg-white/[0.03] border-t border-white/10 group-hover:bg-white/[0.08]"
                  }`}
                >
                  {item.isForecast && (
                    <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-emerald-500/10 to-transparent" />
                  )}
                </motion.div>
              </div>

              <span
                className={`text-[9px] font-mono uppercase tracking-widest transition-colors ${item.isForecast ? "text-emerald-500 font-black" : "text-neutral-600 group-hover:text-neutral-400"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
