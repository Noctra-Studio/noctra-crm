"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  Clock,
  Eye,
  FileSignature,
  Mail,
  MessageSquare,
  Phone,
  Send,
  UserX,
  X,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { FollowUpSuggestion } from "@/app/actions/followup";

// ─── Types ──────────────────────────────────────────────────────────────────

type FollowUpAction = "email" | "call" | "mark_contacted" | "dismiss";

type FollowUpConfig = {
  type: FollowUpSuggestion["type"];
  icon: React.ComponentType<{ className?: string }>;
  urgency: "high" | "medium" | "low";
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  suggestedAction: string;
};

// ─── Config ─────────────────────────────────────────────────────────────────

const FOLLOWUP_CONFIG: Record<string, FollowUpConfig> = {
  lead_no_contact_3d: {
    type: "lead_no_contact_3d",
    icon: UserX,
    urgency: "high",
    color: "text-red-400",
    bgColor: "bg-red-500/8",
    borderColor: "border-red-500/20",
    title: "Lead sin contactar",
    suggestedAction: "Enviar primer contacto",
  },
  proposal_viewed_3d: {
    type: "proposal_viewed_3d",
    icon: Eye,
    urgency: "high",
    color: "text-amber-400",
    bgColor: "bg-amber-500/8",
    borderColor: "border-amber-500/20",
    title: "Propuesta vista sin respuesta",
    suggestedAction: "Enviar recordatorio",
  },
  proposal_sent_5d: {
    type: "proposal_sent_5d",
    icon: Send,
    urgency: "medium",
    color: "text-blue-400",
    bgColor: "bg-blue-500/8",
    borderColor: "border-blue-500/20",
    title: "Propuesta sin abrir",
    suggestedAction: "Reenviar propuesta",
  },
  contract_sent_3d: {
    type: "contract_sent_3d",
    icon: FileSignature,
    urgency: "medium",
    color: "text-purple-400",
    bgColor: "bg-purple-500/8",
    borderColor: "border-purple-500/20",
    title: "Contrato pendiente de firma",
    suggestedAction: "Enviar recordatorio de firma",
  },
};

// ─── Priority Sorting ───────────────────────────────────────────────────────

const URGENCY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortByUrgency(suggestions: FollowUpSuggestion[]): FollowUpSuggestion[] {
  return [...suggestions].sort((a, b) => {
    const configA = FOLLOWUP_CONFIG[a.type];
    const configB = FOLLOWUP_CONFIG[b.type];
    return (
      (URGENCY_ORDER[configA?.urgency || "low"] || 2) -
      (URGENCY_ORDER[configB?.urgency || "low"] || 2)
    );
  });
}

// ─── Single Follow-up Card ──────────────────────────────────────────────────

function FollowUpCard({
  suggestion,
  onAction,
  onDismiss,
}: {
  suggestion: FollowUpSuggestion;
  onAction: (suggestion: FollowUpSuggestion, action: FollowUpAction) => void;
  onDismiss: (id: string) => void;
}) {
  const config = FOLLOWUP_CONFIG[suggestion.type] || FOLLOWUP_CONFIG.lead_no_contact_3d;
  const Icon = config.icon;

  return (
    <div
      className={`group relative border ${config.borderColor} ${config.bgColor} p-4 transition-all hover:border-white/15`}
    >
      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(suggestion.id)}
        className="absolute top-3 right-3 p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-neutral-300 hover:bg-white/5"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[8px] font-mono font-black uppercase tracking-widest ${config.color}`}
            >
              {config.title}
            </span>
            {config.urgency === "high" && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>

          <p className="text-[13px] font-semibold text-white truncate">
            {suggestion.clientName}
          </p>
          <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
            {suggestion.label}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onAction(suggestion, "email")}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${config.bgColor} border ${config.borderColor} ${config.color} text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-white/5 transition-colors`}
            >
              <Mail className="w-3 h-3" />
              {config.suggestedAction}
            </button>
            <button
              onClick={() => onAction(suggestion, "call")}
              className="p-1.5 border border-white/8 text-neutral-500 hover:text-white hover:border-white/15 transition-colors"
              title="Llamar"
            >
              <Phone className="w-3 h-3" />
            </button>
            <button
              onClick={() => onAction(suggestion, "mark_contacted")}
              className="p-1.5 border border-white/8 text-neutral-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
              title="Marcar como contactado"
            >
              <MessageSquare className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Smart Follow-ups Section ───────────────────────────────────────────────

export function SmartFollowUps({
  suggestions,
  onAction,
  onDismiss,
  maxVisible = 5,
}: {
  suggestions: FollowUpSuggestion[];
  onAction: (suggestion: FollowUpSuggestion, action: FollowUpAction) => void;
  onDismiss: (id: string) => void;
  maxVisible?: number;
}) {
  const [showAll, setShowAll] = useState(false);

  if (suggestions.length === 0) return null;

  const sorted = sortByUrgency(suggestions);
  const visible = showAll ? sorted : sorted.slice(0, maxVisible);
  const remaining = sorted.length - maxVisible;

  const highCount = sorted.filter(
    (s) => FOLLOWUP_CONFIG[s.type]?.urgency === "high",
  ).length;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-white">
              Smart Follow-ups
            </h2>
            <p className="text-[9px] font-mono text-neutral-600">
              {suggestions.length} acción{suggestions.length !== 1 ? "es" : ""}{" "}
              pendiente{suggestions.length !== 1 ? "s" : ""}
              {highCount > 0 && (
                <span className="text-red-400 ml-1">
                  · {highCount} urgente{highCount !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
        </div>

        {remaining > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-[10px] font-mono text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
          >
            Ver todas
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {visible.map((suggestion) => (
          <FollowUpCard
            key={suggestion.id}
            suggestion={suggestion}
            onAction={onAction}
            onDismiss={onDismiss}
          />
        ))}
      </div>

      {showAll && sorted.length > maxVisible && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-2 text-[10px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest"
        >
          Mostrar menos
        </button>
      )}
    </div>
  );
}
