"use client";

import { ScoreBreakdown } from "@/lib/lead-scoring";

interface LeadScoreBreakdownTableProps {
  score: number;
  breakdown: ScoreBreakdown;
}

export function LeadScoreBreakdownTable({
  score,
  breakdown,
}: LeadScoreBreakdownTableProps) {
  let label: "HOT" | "WARM" | "COOL" | "COLD" = "COLD";
  let colorClass = "text-neutral-500";

  if (score >= 80) {
    label = "HOT";
    colorClass = "text-emerald-500";
  } else if (score >= 60) {
    label = "WARM";
    colorClass = "text-yellow-500";
  } else if (score >= 40) {
    label = "COOL";
    colorClass = "text-orange-500";
  }

  const rows = [
    { label: "Servicio de interés", value: breakdown.serviceIntent, max: 30 },
    { label: "Calidad del mensaje", value: breakdown.messageQuality, max: 20 },
    {
      label: "Completitud de datos",
      value: breakdown.dataCompleteness,
      max: 20,
    },
    { label: "CTA de origen", value: breakdown.sourceCta, max: 15 },
    { label: "Tiempo de respuesta", value: breakdown.responseTime, max: 15 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
          Puntuación del Lead
        </span>
        <span
          className={`text-[11px] font-black uppercase tracking-widest ${colorClass}`}>
          {score}/100 — {label}
        </span>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between group">
            <span className="text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors">
              {row.label}
            </span>
            <span className="text-[10px] font-mono text-white/40 group-hover:text-white transition-colors">
              {row.value}/{row.max}
            </span>
          </div>
        ))}

        <div className="pt-2 border-t border-white/5 mt-2 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
            TOTAL
          </span>
          <span className={`text-[12px] font-black ${colorClass}`}>
            {score}/100
          </span>
        </div>
      </div>
    </div>
  );
}
