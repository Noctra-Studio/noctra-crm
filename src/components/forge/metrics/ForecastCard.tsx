"use client";

import { RevenueForecast } from "@/app/actions/metrics";
import { motion } from "framer-motion";

interface ForecastCardProps {
  forecast: RevenueForecast;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amt);

  const calculateWidth = (val: number) => {
    if (forecast.total === 0) return "0%";
    return `${(val / forecast.total) * 100}%`;
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl relative overflow-hidden group h-full flex flex-col justify-between">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700" />

      <div className="space-y-2 relative">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-500 font-black">
          Revenue Forecast — {forecast.month}
        </h3>
        <div className="flex flex-col">
          <span className="text-5xl font-black text-white tracking-tighter leading-none">
            {formatCurrency(forecast.total)}
          </span>
          <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ingreso Bruto Proyectado
          </span>
        </div>
      </div>

      <div className="space-y-6 relative pt-8">
        {/* Confirmed */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-mono text-emerald-500 uppercase font-black tracking-widest">
              Firma Final
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {formatCurrency(forecast.confirmed)}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: calculateWidth(forecast.confirmed) }}
              transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
              className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            />
          </div>
        </div>

        {/* Probable */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-mono text-amber-500 uppercase font-black tracking-widest">
              Probable (60%)
            </span>
            <span className="text-sm font-bold text-neutral-300 font-mono">
              {formatCurrency(forecast.probable)}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: calculateWidth(forecast.probable) }}
              transition={{ duration: 1.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="h-full bg-amber-500/70"
            />
          </div>
        </div>

        {/* Possible */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-mono text-neutral-500 uppercase font-black tracking-widest">
              Posible (25%)
            </span>
            <span className="text-sm font-bold text-neutral-500 font-mono">
              {formatCurrency(forecast.possible)}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: calculateWidth(forecast.possible) }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="h-full bg-neutral-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
