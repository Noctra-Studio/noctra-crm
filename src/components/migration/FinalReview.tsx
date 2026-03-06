"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Rocket,
  ShieldCheck,
  RefreshCw,
  Layers,
  CheckCircle2,
} from "lucide-react";

export function FinalReview({
  data,
  onBack,
}: {
  data: any;
  onBack: () => void;
}) {
  const [strategy, setStrategy] = useState<"ignore" | "overwrite" | "merge">(
    "ignore",
  );
  const [incremental, setIncremental] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      // 1. Create migration record in Supabase
      // 2. Trigger BullMQ job via API
      // Mocking the API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsStarted(true);
    } catch (error) {
      alert("Error al iniciar la migración");
    } finally {
      setIsStarting(false);
    }
  };

  if (isStarted) {
    return (
      <div className="text-center py-12 animate-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡Migración Iniciada!
        </h2>
        <p className="text-neutral-400 mb-8 max-w-sm mx-auto">
          Tus datos se están procesando en segundo plano. Puedes cerrar esta
          ventana o ver el progreso en tiempo real.
        </p>
        <button
          onClick={() => (window.location.href = "/forge")}
          className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-all">
          Ir al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">
          Paso 5: Resumen y Confirmación
        </h2>
        <p className="text-neutral-400 text-sm">
          Revisa la configuración final antes de iniciar la importación masiva.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Summary Details */}
        <div className="space-y-6">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
            <h3 className="text-xs uppercase tracking-widest font-mono text-neutral-500 mb-4">
              Detalles de la Migración
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Origen</span>
                <span className="text-sm font-medium text-white capitalize">
                  {data.source}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Tipo de Acceso</span>
                <span className="text-sm font-medium text-white">
                  {data.accessToken ? "API Token" : "Archivo Local"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">
                  Campos Mapeados
                </span>
                <span className="text-sm font-medium text-white">
                  {Object.keys(data.mapping).length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-400/80 leading-relaxed italic">
              "Tus datos son procesados de forma segura y cifrada. Realizamos un
              respaldo automático antes de cada migración masiva."
            </p>
          </div>
        </div>

        {/* Behavior selection */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest font-mono text-neutral-500 mb-4">
              Estrategia de Duplicados
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: "ignore",
                  label: "Ignorar",
                  desc: "No importar si el email ya existe",
                  icon: Layers,
                },
                {
                  id: "overwrite",
                  label: "Sobrescribir",
                  desc: "Actualizar datos existentes con los nuevos",
                  icon: RefreshCw,
                },
                {
                  id: "merge",
                  label: "Fusionar",
                  desc: "Completar campos vacíos sin borrar datos",
                  icon: ShieldCheck,
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStrategy(opt.id as any)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    strategy === opt.id
                      ? "bg-emerald-500/10 border-emerald-500/50"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}>
                  <opt.icon
                    className={`w-5 h-5 ${strategy === opt.id ? "text-emerald-500" : "text-neutral-500"}`}
                  />
                  <div>
                    <p
                      className={`text-sm font-bold ${strategy === opt.id ? "text-white" : "text-neutral-400"}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-neutral-500">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl cursor-pointer group hover:bg-white/[0.04] transition-all">
            <input
              type="checkbox"
              checked={incremental}
              onChange={(e) => setIncremental(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-neutral-950 text-emerald-500 focus:ring-emerald-500/20"
            />
            <div>
              <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Migración Incremental
              </p>
              <p className="text-[10px] text-neutral-500">
                Sincronizar cambios nuevos cada 6 horas automáticamente.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isStarting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Revisar Datos
        </button>
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="flex items-center gap-3 px-10 py-3 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-all text-sm font-black shadow-xl shadow-emerald-500/20 active:scale-95">
          {isStarting ? (
            "Iniciando..."
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              INICIAR MIGRACIÓN AHORA
            </>
          )}
        </button>
      </div>
    </div>
  );
}
