"use client";

import Link from "next/link";
import type {
  ComponentType,
  MouseEventHandler,
  SVGProps,
} from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Database,
  FileSignature,
  FileText,
  FolderOpen,
  Inbox,
  KanbanSquare,
  Plus,
  Search,
  UploadCloud,
  UserCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateIcon =
  | "activity"
  | "bar-chart"
  | "briefcase"
  | "check-circle"
  | "database"
  | "file-signature"
  | "file-text"
  | "folder"
  | "inbox"
  | "kanban"
  | "search"
  | "upload"
  | "user-check"
  | "users";

type EmptyStateActionIcon = "arrow-right" | "plus" | "upload";

type EmptyStateAction = {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  icon?: EmptyStateActionIcon;
};

const ICONS: Record<EmptyStateIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  activity: Activity,
  "bar-chart": BarChart3,
  briefcase: Briefcase,
  "check-circle": CheckCircle2,
  database: Database,
  "file-signature": FileSignature,
  "file-text": FileText,
  folder: FolderOpen,
  inbox: Inbox,
  kanban: KanbanSquare,
  search: Search,
  upload: UploadCloud,
  "user-check": UserCheck,
  users: Users,
};

const ACTION_ICONS: Record<
  EmptyStateActionIcon,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  "arrow-right": ArrowRight,
  plus: Plus,
  upload: UploadCloud,
};

function EmptyStateActionButton({
  action,
  variant,
}: {
  action: EmptyStateAction;
  variant: "primary" | "secondary";
}) {
  const classes =
    variant === "primary"
      ? "bg-white text-black hover:bg-neutral-200"
      : "border border-white/10 text-white/70 hover:text-white";
  const Icon = action.icon ? ACTION_ICONS[action.icon] : null;

  if (action.href) {
    return (
      <Link
        href={action.href}
        className={cn(
          "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors",
          classes,
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {action.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-colors",
        classes,
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {action.label}
    </button>
  );
}

export function ForgeEmptyState({
  icon,
  eyebrow,
  title,
  description,
  guidance,
  primaryAction,
  secondaryAction,
  size = "default",
  align = "center",
  className,
}: {
  icon: EmptyStateIcon;
  eyebrow?: string;
  title: string;
  description: string;
  guidance?: string[];
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  size?: "default" | "compact";
  align?: "center" | "left";
  className?: string;
}) {
  const Icon = ICONS[icon];
  const compact = size === "compact";
  const centered = align === "center";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02]",
        compact ? "px-5 py-8" : "px-6 py-16",
        centered ? "text-center" : "text-left",
        className,
      )}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[80px]" />

      <div
        className={cn(
          "relative z-10 mx-auto flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] text-emerald-400 shadow-xl shadow-black/50",
          compact ? "mb-4 h-12 w-12 rounded-2xl" : "mb-5 h-16 w-16",
        )}
      >
        <Icon className={compact ? "h-5 w-5" : "h-7 w-7"} />
      </div>

      {eyebrow && (
        <p className="relative z-10 text-[10px] font-mono uppercase tracking-[0.26em] text-white/35">
          {eyebrow}
        </p>
      )}

      <h3
        className={cn(
          "relative z-10 font-bold text-white",
          compact ? "mt-2 text-lg" : "text-xl",
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          "relative z-10 mx-auto mt-3 text-sm leading-6 text-white/50",
          compact ? "max-w-lg" : "max-w-2xl",
          !centered && "mx-0",
        )}
      >
        {description}
      </p>

      {guidance && guidance.length > 0 && (
        <div
          className={cn(
            "relative z-10 mt-5 flex flex-wrap gap-2",
            centered ? "justify-center" : "justify-start",
          )}
        >
          {guidance.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/8 bg-black/30 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-white/45"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {(primaryAction || secondaryAction) && (
        <div
          className={cn(
            "relative z-10 mt-6 flex flex-col gap-3 sm:flex-row",
            centered ? "justify-center" : "justify-start",
          )}
        >
          {primaryAction && (
            <EmptyStateActionButton action={primaryAction} variant="primary" />
          )}
          {secondaryAction && (
            <EmptyStateActionButton
              action={secondaryAction}
              variant="secondary"
            />
          )}
        </div>
      )}
    </div>
  );
}
