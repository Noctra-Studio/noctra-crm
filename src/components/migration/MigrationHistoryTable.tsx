"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreVertical,
  UploadCloud,
  Plus,
} from "lucide-react";

export function MigrationHistoryTable({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const supabase = createClient();
  const [migrations, setMigrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMigrations = async () => {
      const { data, error } = await supabase
        .from("migrations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setMigrations(data);
      }
      setLoading(false);
    };

    fetchMigrations();

    // Subscribe to real-time updates for migration status/progress
    const channel = supabase
      .channel("migration_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "migrations",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          setMigrations((prev) =>
            prev.map((m) => (m.id === payload.new.id ? payload.new : m)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, supabase]);

  if (loading)
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-white/[0.02] border border-white/5 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );

  if (migrations.length === 0)
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-[#111111] border border-dashed border-neutral-800 rounded-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-xl shadow-black/50">
          <UploadCloud className="w-8 h-8 text-emerald-500" />
        </div>

        <h3 className="text-xl font-bold text-white mb-3 relative z-10">
          Aún no hay migraciones
        </h3>

        <p className="text-neutral-400 text-sm max-w-sm mx-auto mb-8 relative z-10">
          Importa tus contactos, clientes o proyectos desde HubSpot, Pipedrive o
          un archivo CSV.
        </p>

        <Link
          href="/migration/new"
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-all shadow-lg hover:-translate-y-0.5 mt-2">
          <Plus className="w-4 h-4" />
          Nueva Migración
        </Link>
      </div>
    );

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-white/5 border-b border-white/5">
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-mono text-neutral-500">
              Origen & Fecha
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-mono text-neutral-500">
              Estado
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-mono text-neutral-500">
              Progreso
            </th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-mono text-neutral-500 text-right">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {migrations.map((m) => (
            <tr
              key={m.id}
              className="hover:bg-white/[0.01] transition-colors group">
              <td className="px-6 py-5">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white capitalize">
                    {m.source}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono mt-1">
                    {new Date(m.created_at).toLocaleDateString()}{" "}
                    {new Date(m.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </td>
              <td className="px-6">
                <div className="flex items-center gap-2">
                  {m.status === "completed" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  {m.status === "failed" && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  {m.status === "processing" && (
                    <RotateCcw className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {m.status === "pending" && (
                    <Clock className="w-4 h-4 text-neutral-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      m.status === "completed"
                        ? "text-emerald-500"
                        : m.status === "failed"
                          ? "text-red-500"
                          : m.status === "processing"
                            ? "text-blue-500"
                            : "text-neutral-500"
                    }`}>
                    {m.status === "completed"
                      ? "Completada"
                      : m.status === "failed"
                        ? "Fallida"
                        : m.status === "processing"
                          ? "Procesando"
                          : "Pendiente"}
                  </span>
                </div>
              </td>
              <td className="px-6">
                <div className="flex flex-col gap-1.5 w-48">
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>
                      {Math.round((m.stats.processed / m.stats.total) * 100) ||
                        0}
                      %
                    </span>
                    <span>
                      {m.stats.processed} / {m.stats.total}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        m.status === "failed" ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${(m.stats.processed / m.stats.total) * 100 || 0}%`,
                      }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    title="Descargar Reporte"
                    className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                  {m.status === "completed" && (
                    <button
                      title="Deshacer Migración"
                      className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
