"use client";

import { useState, useMemo } from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileSignature,
  FileText,
  Mail,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Send,
  Star,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// ─── Types ──────────────────────────────────────────────────────────────────

export type TimelineEventType =
  | "lead.created"
  | "lead.contacted"
  | "lead.qualified"
  | "meeting.scheduled"
  | "meeting.completed"
  | "proposal.created"
  | "proposal.sent"
  | "proposal.viewed"
  | "proposal.accepted"
  | "proposal.rejected"
  | "contract.created"
  | "contract.sent"
  | "contract.signed"
  | "project.created"
  | "project.started"
  | "project.milestone"
  | "project.completed"
  | "deliverable.uploaded"
  | "deliverable.approved"
  | "email.sent"
  | "call.made"
  | "note.added";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  actor?: string | null;
};

// ─── Event Config ───────────────────────────────────────────────────────────

type EventConfig = {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  dotColor: string;
  lineColor: string;
  category: "relationship" | "sales" | "delivery" | "communication";
};

const EVENT_CONFIG: Record<string, EventConfig> = {
  "lead.created": {
    icon: UserPlus,
    color: "text-emerald-400",
    dotColor: "bg-emerald-500",
    lineColor: "border-emerald-500/20",
    category: "relationship",
  },
  "lead.contacted": {
    icon: Phone,
    color: "text-blue-400",
    dotColor: "bg-blue-500",
    lineColor: "border-blue-500/20",
    category: "communication",
  },
  "lead.qualified": {
    icon: Star,
    color: "text-amber-400",
    dotColor: "bg-amber-500",
    lineColor: "border-amber-500/20",
    category: "relationship",
  },
  "meeting.scheduled": {
    icon: Calendar,
    color: "text-blue-400",
    dotColor: "bg-blue-500",
    lineColor: "border-blue-500/20",
    category: "communication",
  },
  "meeting.completed": {
    icon: Users,
    color: "text-blue-400",
    dotColor: "bg-blue-500",
    lineColor: "border-blue-500/20",
    category: "communication",
  },
  "proposal.created": {
    icon: FileText,
    color: "text-neutral-400",
    dotColor: "bg-neutral-500",
    lineColor: "border-neutral-500/20",
    category: "sales",
  },
  "proposal.sent": {
    icon: Send,
    color: "text-blue-400",
    dotColor: "bg-blue-500",
    lineColor: "border-blue-500/20",
    category: "sales",
  },
  "proposal.viewed": {
    icon: Eye,
    color: "text-amber-400",
    dotColor: "bg-amber-500",
    lineColor: "border-amber-500/20",
    category: "sales",
  },
  "proposal.accepted": {
    icon: CheckCircle2,
    color: "text-emerald-400",
    dotColor: "bg-emerald-500",
    lineColor: "border-emerald-500/20",
    category: "sales",
  },
  "proposal.rejected": {
    icon: FileText,
    color: "text-red-400",
    dotColor: "bg-red-500",
    lineColor: "border-red-500/20",
    category: "sales",
  },
  "contract.created": {
    icon: FileSignature,
    color: "text-neutral-400",
    dotColor: "bg-neutral-500",
    lineColor: "border-neutral-500/20",
    category: "sales",
  },
  "contract.sent": {
    icon: Send,
    color: "text-purple-400",
    dotColor: "bg-purple-500",
    lineColor: "border-purple-500/20",
    category: "sales",
  },
  "contract.signed": {
    icon: CheckCircle2,
    color: "text-emerald-400",
    dotColor: "bg-emerald-500",
    lineColor: "border-emerald-500/20",
    category: "sales",
  },
  "project.created": {
    icon: Briefcase,
    color: "text-purple-400",
    dotColor: "bg-purple-500",
    lineColor: "border-purple-500/20",
    category: "delivery",
  },
  "project.started": {
    icon: Briefcase,
    color: "text-emerald-400",
    dotColor: "bg-emerald-500",
    lineColor: "border-emerald-500/20",
    category: "delivery",
  },
  "project.milestone": {
    icon: Star,
    color: "text-amber-400",
    dotColor: "bg-amber-500",
    lineColor: "border-amber-500/20",
    category: "delivery",
  },
  "project.completed": {
    icon: CheckCircle2,
    color: "text-emerald-400",
    dotColor: "bg-emerald-500",
    lineColor: "border-emerald-500/20",
    category: "delivery",
  },
  "deliverable.uploaded": {
    icon: Upload,
    color: "text-blue-400",
    dotColor: "bg-blue-500",
    lineColor: "border-blue-500/20",
    category: "delivery",
  },
  "deliverable.approved": {
    icon: CheckCircle2,
    color: "text-emerald-400",
    dotColor: "bg-emerald-500",
    lineColor: "border-emerald-500/20",
    category: "delivery",
  },
  "email.sent": {
    icon: Mail,
    color: "text-neutral-400",
    dotColor: "bg-neutral-500",
    lineColor: "border-neutral-500/20",
    category: "communication",
  },
  "call.made": {
    icon: Phone,
    color: "text-neutral-400",
    dotColor: "bg-neutral-500",
    lineColor: "border-neutral-500/20",
    category: "communication",
  },
  "note.added": {
    icon: MessageSquare,
    color: "text-neutral-400",
    dotColor: "bg-neutral-500",
    lineColor: "border-neutral-500/20",
    category: "communication",
  },
};

const DEFAULT_CONFIG: EventConfig = {
  icon: Clock,
  color: "text-neutral-400",
  dotColor: "bg-neutral-500",
  lineColor: "border-neutral-500/20",
  category: "communication",
};

// ─── Category Filters ───────────────────────────────────────────────────────

const CATEGORY_FILTERS = [
  { key: "all", label: "Todo" },
  { key: "relationship", label: "Relación" },
  { key: "sales", label: "Ventas" },
  { key: "delivery", label: "Entrega" },
  { key: "communication", label: "Comunicación" },
] as const;

type CategoryFilter = (typeof CATEGORY_FILTERS)[number]["key"];

// ─── Timeline Item ──────────────────────────────────────────────────────────

function TimelineItem({
  event,
  isLast,
}: {
  event: TimelineEvent;
  isLast: boolean;
}) {
  const config = EVENT_CONFIG[event.type] || DEFAULT_CONFIG;
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4 pb-6 group">
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-[13px] top-8 bottom-0 w-px border-l border-dashed border-white/8" />
      )}

      {/* Dot */}
      <div className="relative z-10 shrink-0">
        <div
          className={`w-7 h-7 rounded-lg border border-white/8 bg-[#0d0d0d] flex items-center justify-center group-hover:border-white/15 transition-colors`}
        >
          <Icon className={`w-3 h-3 ${config.color}`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-white truncate">
            {event.title}
          </p>
        </div>

        {event.description && (
          <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] font-mono text-neutral-600">
            {format(new Date(event.createdAt), "dd MMM yyyy · HH:mm", {
              locale: es,
            })}
          </span>
          <span className="text-[10px] font-mono text-neutral-700">
            {formatDistanceToNow(new Date(event.createdAt), {
              addSuffix: true,
            })}
          </span>
          {event.actor && (
            <>
              <span className="text-neutral-800">·</span>
              <span className="text-[10px] font-mono text-neutral-600">
                {event.actor}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Timeline Component ────────────────────────────────────────────────

export function RelationshipTimeline({
  events,
  title = "Timeline",
  maxVisible = 10,
  showFilters = true,
  compact = false,
}: {
  events: TimelineEvent[];
  title?: string;
  maxVisible?: number;
  showFilters?: boolean;
  compact?: boolean;
}) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (filter === "all") return sorted;

    return sorted.filter((e) => {
      const config = EVENT_CONFIG[e.type] || DEFAULT_CONFIG;
      return config.category === filter;
    });
  }, [events, filter]);

  const visible = showAll ? filtered : filtered.slice(0, maxVisible);
  const remaining = filtered.length - maxVisible;

  if (events.length === 0) {
    return (
      <div className="border border-dashed border-white/8 bg-white/[0.02] p-6 text-center">
        <Clock className="w-5 h-5 text-neutral-700 mx-auto mb-2" />
        <p className="text-xs text-neutral-600 font-mono">
          Sin actividad registrada
        </p>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "border border-white/5 bg-white/[0.02]"}>
      {/* Header */}
      {!compact && (
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <span className="text-[10px] font-mono text-neutral-600 bg-white/[0.04] px-2 py-0.5 border border-white/5">
              {events.length}
            </span>
          </div>
        </div>
      )}

      {/* Category Filters */}
      {showFilters && (
        <div
          className={`flex items-center gap-1 overflow-x-auto ${compact ? "mb-4" : "px-5 py-3 border-b border-white/5"}`}
        >
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest transition-colors whitespace-nowrap ${
                filter === cat.key
                  ? "bg-white/8 text-white border border-white/15"
                  : "text-neutral-600 hover:text-neutral-400 border border-transparent hover:border-white/8"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className={compact ? "" : "p-5"}>
        {visible.length === 0 ? (
          <p className="text-xs text-neutral-600 font-mono text-center py-4">
            Sin eventos en esta categoría
          </p>
        ) : (
          visible.map((event, i) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={i === visible.length - 1}
            />
          ))
        )}

        {/* Show more */}
        {!showAll && remaining > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full flex items-center justify-center gap-1.5 py-3 text-[10px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest border-t border-white/5 mt-2"
          >
            <ChevronDown className="w-3 h-3" />
            Ver {remaining} evento{remaining !== 1 ? "s" : ""} más
          </button>
        )}

        {showAll && filtered.length > maxVisible && (
          <button
            onClick={() => setShowAll(false)}
            className="w-full flex items-center justify-center gap-1.5 py-3 text-[10px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors uppercase tracking-widest border-t border-white/5 mt-2"
          >
            <ChevronUp className="w-3 h-3" />
            Mostrar menos
          </button>
        )}
      </div>
    </div>
  );
}
