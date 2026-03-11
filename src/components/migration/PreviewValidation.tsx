"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
} from "lucide-react";

export function PreviewValidation({
  onComplete,
  onBack,
}: {
  onComplete: () => void;
  onBack: () => void;
}) {
  // Mock validation results
  const stats = {
    valid: 142,
    warnings: 8,
    errors: 3,
  };

  const previewData = [
    { nombre: "Juan Pérez", email: "juan@example.com", status: "valid" },
    {
      nombre: "María Garcia",
      email: "maria@corp.mx",
      status: "warning",
      message: "Teléfono incompleto",
    },
    {
      nombre: "Invalid User",
      email: "not-an-email",
      status: "error",
      message: "Email inválido",
    },
    { nombre: "Carlos Slim", email: "carlos@telmex.com", status: "valid" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Paso 4: Vista Previa y Validación
          </h2>
          <p className="text-neutral-400 text-sm">
            Revisamos tus datos para asegurar la mayor calidad posible.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white hover:bg-white/10 transition-colors">
          <Download className="w-3 h-3" />
          Descargar Reporte (.csv)
        </button>
      </div>

      {/* Validation Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-white">Válidos</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.valid}</p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
            Registros listos
          </p>
        </div>
        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-white">
              Advertencias
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.warnings}</p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
            Requieren revisión
          </p>
        </div>
        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-white">Errores</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.errors}</p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
            Bloqueados
          </p>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                Nombre
              </th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                Email
              </th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {previewData.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm text-neutral-300">{row.nombre}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-neutral-300">{row.email}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {row.status === "valid" && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    )}
                    {row.status === "warning" && (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    )}
                    {row.status === "error" && (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span
                      className={`text-[10px] font-medium ${
                        row.status === "valid"
                          ? "text-emerald-500"
                          : row.status === "warning"
                            ? "text-amber-500"
                            : "text-red-500"
                      }`}>
                      {row.message || "Listo"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Corregir Mapeo
        </button>
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-all text-sm font-bold shadow-lg shadow-emerald-500/10">
          Todo correcto, continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
