"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

type ProfitabilityData = {
  metrics: {
    project_id: string;
    total_revenue: number;
    time_cost: number;
    direct_expenses: number;
    total_cost: number;
    gross_margin: number;
    margin_percentage: number;
  };
  ai_insights: {
    risk_level: "low" | "medium" | "high";
    analysis: string;
    action_items: string[];
  };
};

export function AIProfitabilityDashboard({ projectId }: { projectId: string }) {
  const [data, setData] = useState<ProfitabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfitability = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/profitability`);
        if (!res.ok) throw new Error("Failed to fetch profitability analysis");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProfitability();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center border border-neutral-900 rounded-lg bg-neutral-900/20">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        <span className="ml-3 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
          Analizando finanzas con IA...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full p-6 border border-red-500/20 bg-red-500/5 rounded-lg text-center">
        <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
        <p className="text-[10px] font-mono uppercase tracking-widest text-red-500">
          {error || "No data available"}
        </p>
      </div>
    );
  }

  const { metrics, ai_insights } = data;

  // Static mock series for the Area Chart just to visualize the trend
  // until we have deep chronologial data per day.
  // Real implementation would pull this grouping from DB.
  const chartData = [
    { name: "Start", Ingresos: 0, Costos: 0 },
    {
      name: "Mid",
      Ingresos: metrics.total_revenue * 0.5,
      Costos: metrics.total_cost * 0.4,
    },
    {
      name: "Current",
      Ingresos: metrics.total_revenue,
      Costos: metrics.total_cost,
    },
  ];

  const formatMXN = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
          AI Profitability Analysis
        </h3>
        {ai_insights.risk_level === "high" ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold">
              High Risk
            </span>
          </div>
        ) : ai_insights.risk_level === "medium" ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-orange-500/30 bg-orange-500/10 text-orange-400">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold">
              Medium Risk
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold">
              Healthy
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-neutral-800 bg-neutral-900/30 rounded-lg space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Margen Actual
          </p>
          <p
            className={`text-2xl font-bold ${metrics.margin_percentage < 20 ? "text-red-400" : "text-emerald-400"}`}>
            {metrics.margin_percentage}%
          </p>
        </div>
        <div className="p-4 border border-neutral-800 bg-neutral-900/30 rounded-lg space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Ganancia Bruta
          </p>
          <p className="text-xl font-bold text-white">
            {formatMXN(metrics.gross_margin)}
          </p>
        </div>
        <div className="p-4 border border-neutral-800 bg-neutral-900/30 rounded-lg space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Total Ingresos
          </p>
          <p className="text-xl font-bold text-neutral-300">
            {formatMXN(metrics.total_revenue)}
          </p>
        </div>
        <div className="p-4 border border-neutral-800 bg-neutral-900/30 rounded-lg space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Costo Total
          </p>
          <p className="text-xl font-bold text-neutral-300">
            {formatMXN(metrics.total_cost)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 p-4 border border-neutral-800 bg-neutral-900/20 rounded-lg h-72">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-4">
            Ingresos vs Costos Acumulados
          </p>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCostos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#525252"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#525252"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  borderColor: "#262626",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#e5e5e5" }}
              />
              <Area
                type="monotone"
                dataKey="Ingresos"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorIngresos)"
              />
              <Area
                type="monotone"
                dataKey="Costos"
                stroke="#f87171"
                fillOpacity={1}
                fill="url(#colorCostos)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights Panel */}
        <div className="p-6 border border-neutral-800 bg-[#0a0a0a] rounded-lg flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L14.24 9.76L22 12L14.24 14.24L12 22L9.76 14.24L2 12L9.76 9.76L12 2Z"
                fill="currentColor"
              />
            </svg>
            <h4 className="text-xs font-mono uppercase tracking-widest font-bold">
              Gemini Analysis
            </h4>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {ai_insights.analysis}
          </p>
          {ai_insights.action_items && ai_insights.action_items.length > 0 && (
            <div className="pt-4 border-t border-neutral-900 mt-2 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                Action Items
              </span>
              <ul className="space-y-2">
                {ai_insights.action_items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-neutral-400">
                    <span className="text-indigo-500 mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
