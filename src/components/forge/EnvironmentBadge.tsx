"use client";

import { APP_ENV, isNonProduction, envLabel } from "@/lib/environment";

/**
 * Fixed bottom-right badge that shows the current non-production environment.
 * Renders nothing in production.
 */
export function EnvironmentBadge() {
  if (!isNonProduction) return null;

  const isDemo = APP_ENV === "demo";

  return (
    <div
      className={`
        flex items-center gap-1.5
        px-2.5 py-1 rounded-full
        text-[10px] font-mono font-bold uppercase tracking-[0.1em]
        border
        pointer-events-none select-none
        ${
          isDemo
            ? "bg-violet-500/10 border-violet-500/25 text-violet-400"
            : "bg-amber-500/10 border-amber-500/25 text-amber-400"
        }
      `}>
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${
          isDemo ? "bg-violet-500" : "bg-amber-500"
        }`}
      />
      {isDemo ? "Entorno Demo" : "Entorno Staging"}
    </div>
  );
}
