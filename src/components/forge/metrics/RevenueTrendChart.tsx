"use client";

interface TrendData {
  label: string;
  amount: number;
  isForecast: boolean;
}

interface RevenueTrendChartProps {
  data: TrendData[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1000); // Avoid division by zero

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amt);

  return (
    <div className="bg-[#0d0d0d] border border-white/5 p-8 rounded-2xl shadow-xl space-y-8 flex flex-col h-full">
      <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-black">
        Tendencia de ingresos (6m)
      </h3>

      <div className="flex-1 flex items-end justify-between gap-4 pt-4 min-h-[200px]">
        {data.map((item, idx) => {
          const heightPercent = `${(item.amount / maxAmount) * 100}%`;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
              <div className="relative w-full flex flex-col items-center justify-end h-full">
                {/* Tooltip */}
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-200 bg-white text-black text-[9px] font-black px-2 py-1 rounded whitespace-nowrap shadow-xl z-10 pointer-events-none">
                  {formatCurrency(item.amount)}
                </div>

                {/* Bar */}
                <div
                  className={`w-full rounded-t-sm transition-all duration-700 ease-out cursor-help relative ${
                    item.isForecast
                      ? "bg-emerald-500/20 border-t-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:bg-emerald-500/30"
                      : "bg-white/10 group-hover:bg-white/20"
                  }`}
                  style={{ height: heightPercent }}>
                  {item.isForecast && (
                    <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-emerald-500/10 to-transparent" />
                  )}
                </div>
              </div>

              <span
                className={`text-[9px] font-mono uppercase tracking-widest ${item.isForecast ? "text-emerald-500 font-bold" : "text-neutral-600 group-hover:text-neutral-400"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
