"use client";

import { APP_ENV, isNonProduction } from "@/lib/environment";
import { Info } from "lucide-react";

const MESSAGES: Record<string, string> = {
  demo: "ENTORNO DEMO · Estás viendo datos de prueba. Algunas acciones o datos pueden reiniciarse.",
  staging: "ENTORNO STAGING · Este entorno no representa producción.",
};

/**
 * Slim top banner shown only in non-production environments.
 * Styled consistently with existing Noctra banners (FollowUpBanner / inactivity).
 */
export function EnvironmentBanner() {
  if (!isNonProduction) return null;

  const isDemo = APP_ENV === "demo";
  const message = MESSAGES[APP_ENV];

  return (
    <div
      className={`
        w-full border-b px-4 py-2.5
        flex items-center gap-2.5
        text-[11px] font-mono tracking-[0.05em]
        ${
          isDemo
            ? "bg-violet-500/5 border-violet-500/15 text-violet-400"
            : "bg-amber-500/5 border-amber-500/15 text-amber-400"
        }
      `}>
      <Info className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
