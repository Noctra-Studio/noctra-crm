"use client";

import React from "react";
import { ShieldCheck, Calendar, Globe, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditTrailBadgeProps {
  timestamp: string;
  ip: string;
  userAgent?: string;
  className?: string;
}

export const AuditTrailBadge = ({
  timestamp,
  ip,
  userAgent,
  className,
}: AuditTrailBadgeProps) => {
  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 backdrop-blur-sm",
        className,
      )}>
      <div className="flex items-center gap-2 text-emerald-500 mb-1">
        <ShieldCheck size={16} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          Firmado Digitalmente
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-neutral-400">
          <Calendar size={12} className="shrink-0" />
          <span className="text-[10px] font-mono">{timestamp}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <Globe size={12} className="shrink-0" />
          <span className="text-[10px] font-mono">IP: {ip}</span>
        </div>
        {userAgent && (
          <div className="flex items-center gap-2 text-neutral-400 md:col-span-2">
            <Monitor size={12} className="shrink-0" />
            <span className="text-[10px] font-mono truncate max-w-xs">
              {userAgent}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-white/5">
        <p className="text-[9px] text-neutral-600 font-mono leading-relaxed">
          Este documento cuenta con un certificado digital de no repudio
          vinculado a los datos arriba listados bajo el protocolo Noctra Sign
          (ESIGN/UETA Compliant).
        </p>
      </div>
    </div>
  );
};
