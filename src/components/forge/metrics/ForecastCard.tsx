"use client";

import { RevenueForecast } from "@/app/actions/metrics";

interface ForecastCardProps {
  forecast: RevenueForecast;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amt) + " MXN";

  const calculateWidth = (val: number) => {
    if (forecast.total === 0) return "0%";
    return `${(val / forecast.total) * 100}%`;
  };

  return (
    <div className="bg-[#0d0d0d] border border-white/5 p-8 rounded-2xl shadow-2xl space-y-8 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/15 transition-all duration-700" />

      <div className="space-y-1 relative">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-500 font-black">
          Forecast — {forecast.month}
        </h3>
        <div className="flex flex-col">
          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            {formatCurrency(forecast.total)}
          </span>
          <span className="text-xs text-neutral-400 font-mono uppercase tracking-widest mt-1">
            Ingreso proyectado
          </span>
        </div>
      </div>

      <div className="space-y-6 relative">
        {/* Confirmed */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-mono text-emerald-500 uppercase font-black tracking-widest">
              Confirmado
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {formatCurrency(forecast.confirmed)}
            </span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              style={{ width: calculateWidth(forecast.confirmed) }}
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
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500/70 transition-all duration-1000 delay-100 ease-out"
              style={{ width: calculateWidth(forecast.probable) }}
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
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-700 transition-all duration-1000 delay-200 ease-out"
              style={{ width: calculateWidth(forecast.possible) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
