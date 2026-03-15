"use client";

import { useState } from "react";
import {
  Eye,
  Clock,
  Layers,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ProposalEngagement = {
  proposalId: string;
  viewCount: number;
  lastViewedAt: string | null;
  totalTimeSpentSeconds: number;
  sectionsViewed: string[];
  viewHistory: {
    timestamp: string;
    durationSeconds: number;
    sections: string[];
    device: string;
  }[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function getEngagementLevel(
  engagement: ProposalEngagement,
): { label: string; color: string; description: string } {
  const { viewCount, totalTimeSpentSeconds } = engagement;

  if (viewCount >= 3 && totalTimeSpentSeconds >= 180) {
    return {
      label: "HIGH",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
      description: "Strong buying signal",
    };
  }
  if (viewCount >= 2 || totalTimeSpentSeconds >= 60) {
    return {
      label: "MEDIUM",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/25",
      description: "Interest detected",
    };
  }
  if (viewCount >= 1) {
    return {
      label: "LOW",
      color: "text-neutral-400 bg-neutral-500/10 border-neutral-500/25",
      description: "Initial view only",
    };
  }
  return {
    label: "NONE",
    color: "text-neutral-600 bg-neutral-800 border-neutral-700",
    description: "Not viewed yet",
  };
}

// ─── Section Heatmap ────────────────────────────────────────────────────────

function SectionHeatmap({ sections }: { sections: string[] }) {
  const allSections = [
    "Resumen",
    "Alcance",
    "Pricing",
    "Timeline",
    "Términos",
  ];

  return (
    <div className="flex items-center gap-1">
      {allSections.map((section) => {
        const viewed = sections.includes(section.toLowerCase());
        return (
          <div
            key={section}
            title={`${section}: ${viewed ? "Visto" : "No visto"}`}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              viewed ? "bg-emerald-500/60" : "bg-neutral-800"
            }`}
          />
        );
      })}
    </div>
  );
}

// ─── Engagement Card (Inline in proposal table) ─────────────────────────────

export function ProposalEngagementInline({
  engagement,
}: {
  engagement: ProposalEngagement;
}) {
  if (engagement.viewCount === 0) {
    return <span className="text-neutral-700 text-[10px] font-mono">—</span>;
  }

  const level = getEngagementLevel(engagement);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Eye className="w-3 h-3 text-neutral-400" />
        <span className="text-[10px] font-mono text-neutral-300">
          {engagement.viewCount} vista{engagement.viewCount !== 1 ? "s" : ""}
        </span>
        <span
          className={`text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 border ${level.color}`}
        >
          {level.label}
        </span>
      </div>
      {engagement.lastViewedAt && (
        <span className="text-[10px] font-mono text-neutral-600">
          {formatDistanceToNow(new Date(engagement.lastViewedAt), {
            addSuffix: true,
          })}
          {" · "}
          {formatDuration(engagement.totalTimeSpentSeconds)}
        </span>
      )}
    </div>
  );
}

// ─── Full Engagement Panel (Detail view) ────────────────────────────────────

export function ProposalIntelligencePanel({
  engagement,
}: {
  engagement: ProposalEngagement;
}) {
  const [expanded, setExpanded] = useState(false);
  const level = getEngagementLevel(engagement);

  if (engagement.viewCount === 0) {
    return (
      <div className="border border-white/5 bg-white/[0.02] p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-neutral-600" />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold">
              Proposal Intelligence
            </h3>
          </div>
        </div>
        <p className="text-xs text-neutral-600 font-mono">
          La propuesta aún no ha sido visualizada por el cliente.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-white/5 bg-white/[0.02]">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                Proposal Intelligence
              </h3>
              <p className="text-[9px] font-mono text-neutral-600">
                {level.description}
              </p>
            </div>
          </div>
          <span
            className={`text-[9px] font-mono font-black uppercase tracking-widest px-2 py-1 border ${level.color}`}
          >
            {level.label} ENGAGEMENT
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/5 p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-neutral-500" />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-neutral-500">
                Vistas
              </span>
            </div>
            <p className="text-xl font-black text-white tabular-nums">
              {engagement.viewCount}
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-neutral-500" />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-neutral-500">
                Tiempo lectura
              </span>
            </div>
            <p className="text-xl font-black text-white tabular-nums">
              {formatDuration(engagement.totalTimeSpentSeconds)}
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-neutral-500" />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-neutral-500">
                Secciones
              </span>
            </div>
            <p className="text-xl font-black text-white tabular-nums">
              {engagement.sectionsViewed.length}
              <span className="text-[10px] text-neutral-600 font-normal">
                /5
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Section Heatmap */}
      <div className="px-5 py-3 border-b border-white/5">
        <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-neutral-500 mb-2">
          Secciones visitadas
        </p>
        <SectionHeatmap sections={engagement.sectionsViewed} />
        <div className="flex justify-between mt-1.5">
          {["Resumen", "Alcance", "Pricing", "Timeline", "Términos"].map(
            (s) => (
              <span key={s} className="text-[8px] font-mono text-neutral-700">
                {s}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Last viewed */}
      {engagement.lastViewedAt && (
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-mono text-neutral-500">
            Última visualización
          </span>
          <span className="text-[10px] font-mono text-neutral-300">
            {formatDistanceToNow(new Date(engagement.lastViewedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      )}

      {/* View History (Expandable) */}
      {engagement.viewHistory.length > 0 && (
        <div className="px-5 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors w-full"
          >
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            <span className="uppercase tracking-widest">
              Historial de vistas ({engagement.viewHistory.length})
            </span>
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {engagement.viewHistory.map((view, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center">
                      <span className="text-[8px] font-mono text-neutral-500">
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-neutral-300">
                        {formatDistanceToNow(new Date(view.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-[9px] font-mono text-neutral-600">
                        {view.device} · {view.sections.length} secciones
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                    {formatDuration(view.durationSeconds)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
