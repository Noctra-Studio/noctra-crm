"use client";

import { ScoreBreakdown } from "@/lib/lead-scoring";

interface LeadScoreBadgeProps {
  score: number;
  label?: string;
  className?: string;
}

export function LeadScoreBadge({
  score,
  label,
  className = "",
}: LeadScoreBadgeProps) {
  let status: "HOT" | "WARM" | "COOL" | "COLD" = "COLD";
  let color = "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
  let dotColor = "bg-neutral-500";

  if (score >= 80) {
    status = "HOT";
    color = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    dotColor = "bg-emerald-500";
  } else if (score >= 60) {
    status = "WARM";
    color = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    dotColor = "bg-yellow-500";
  } else if (score >= 40) {
    status = "COOL";
    color = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    dotColor = "bg-orange-500";
  }

  const displayLabel = label || status;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border rounded-sm ${color} ${className}`}>
      <div className={`w-1 h-1 rounded-full ${dotColor} animate-pulse`} />
      <span className="text-[8px] font-black uppercase tracking-widest leading-none pt-[1px]">
        {displayLabel} {score}
      </span>
    </div>
  );
}
