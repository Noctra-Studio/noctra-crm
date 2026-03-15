"use client";

import { APP_ENV, isNonProduction, envLabel } from "@/lib/environment";

/**
 * Full-viewport diagonal watermark for non-production environments.
 *
 * Disabled by default — set `enabled` to true to activate.
 * Renders nothing in production regardless of the prop.
 */
export function EnvironmentWatermark({ enabled = false }: { enabled?: boolean }) {
  if (!isNonProduction || !enabled) return null;

  const label = `${envLabel(APP_ENV).toUpperCase()} ENVIRONMENT`;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[80] pointer-events-none select-none overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center -rotate-30">
        <span className="whitespace-nowrap text-[clamp(3rem,8vw,7rem)] font-black uppercase tracking-[0.2em] text-white/[0.03]">
          {label}
        </span>
      </div>
    </div>
  );
}
