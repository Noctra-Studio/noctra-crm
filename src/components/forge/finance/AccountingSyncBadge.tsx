"use client";

import { useTransition } from "react";
import { CheckCircle2, AlertCircle, RefreshCcw, FileText } from "lucide-react";
import { exportToAccounting } from "@/app/actions/finance-actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AccountingSyncBadgeProps {
  invoiceId: string;
  status: "pending" | "synced" | "error";
  syncedAt?: string | null;
  error?: string | null;
  externalId?: string | null;
  onSyncComplete?: () => void;
}

export function AccountingSyncBadge({
  invoiceId,
  status,
  syncedAt,
  error,
  externalId,
  onSyncComplete,
}: AccountingSyncBadgeProps) {
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      try {
        await exportToAccounting(invoiceId);
        onSyncComplete?.();
      } catch (err: any) {
        alert(err.message || "Error al sincronizar");
        onSyncComplete?.(); // Revalidate to fetch the updated 'error' status
      }
    });
  };

  if (status === "synced") {
    return (
      <div className="flex items-center gap-2">
        <div
          className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-mono tracking-widest flex items-center gap-1.5"
          title={`Sincronizado el ${syncedAt ? format(new Date(syncedAt), "dd MMM yyyy HH:mm", { locale: es }) : "desconocido"}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>QuickBooks Sync</span>
          {externalId && <span className="opacity-50 ml-1">#{externalId}</span>}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 group relative">
        <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase font-mono tracking-widest flex items-center gap-1.5 cursor-help">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Sync Error</span>
        </div>

        {/* Tooltip for error */}
        <div className="absolute top-full left-0 mt-2 bg-[#1f1f1f] text-white text-xs p-3 rounded-lg shadow-xl shadow-black/50 border border-white/10 hidden group-hover:block w-48 z-10">
          {error || "Error desconocido. Revisa el perfil fiscal."}
        </div>

        <button
          onClick={handleSync}
          disabled={isPending}
          className="p-1 text-neutral-400 hover:text-white disabled:opacity-50 transition-colors"
          title="Reintentar sincronización">
          <RefreshCcw
            className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    );
  }

  // Pending status
  return (
    <button
      onClick={handleSync}
      disabled={isPending}
      className={`px-3 py-1.5 rounded-lg border border-white/10 text-[10px] uppercase font-mono tracking-widest flex items-center gap-2 transition-all ${
        isPending
          ? "bg-white/5 text-neutral-500 cursor-not-allowed"
          : "bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
      }`}>
      {isPending ? (
        <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <FileText className="w-3.5 h-3.5" />
      )}
      {isPending ? "Sincronizando..." : "Export to QB"}
    </button>
  );
}
