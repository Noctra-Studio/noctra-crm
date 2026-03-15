"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import type { FollowUpSuggestion } from "@/app/actions/followup";

export function PipelineAlerts({
  alerts,
  suggestions,
  onViewDetails,
}: {
  alerts: { id: string; name: string; days_inactive: number }[];
  suggestions: FollowUpSuggestion[];
  onViewDetails: () => void;
}) {
  const unresolvedLeads = alerts.length;
  // Combine all types of action items into a succinct generic string for missing contracts, emails, etc.
  const actionItems = suggestions.length;

  if (unresolvedLeads === 0 && actionItems === 0) return null;

  return (
    <div className="bg-[#1a1200] border-b border-amber-900/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-500">
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Follow-up needed
          </h4>
          <p className="text-[11px] text-amber-200 mt-0.5">
            {unresolvedLeads > 0 && `${unresolvedLeads} leads without contact `}
            {unresolvedLeads > 0 && actionItems > 0 && "• "}
            {actionItems > 0 && `${actionItems} missing signatures or replies`}
          </p>
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="text-[10px] font-mono uppercase tracking-widest bg-amber-500 text-black px-4 py-2 hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto">
        View details
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
