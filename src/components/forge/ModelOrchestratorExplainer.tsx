"use client";

import { Brain, Cpu, Zap, Activity } from "lucide-react";
import { m } from "framer-motion";
import { CentralBrainLogo } from "@/components/ui/CentralBrainLogo";

export function ModelOrchestratorExplainer() {
  return (
    <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-48 h-48 flex-none">
          <CentralBrainLogo isThinking={true} />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-6 h-6 text-emerald-500" />
            Cerebro Central{" "}
            <span className="text-xs font-mono uppercase tracking-tighter bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded">
              Orchestrator v2.0
            </span>
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
            Optimiza el rendimiento y costo de tus consultas IA automáticamente.
            El Cerebro Central analiza cada petición en tiempo real para asignar
            el recurso de procesamiento más eficiente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h4 className="text-sm font-bold text-white">Velocidad Máxima</h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Para tareas simples como agendar o consultas rápidas, activamos
            modelos ligeros que responden en milisegundos.
          </p>
        </div>

        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          <h4 className="text-sm font-bold text-white">Análisis Profundo</h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Peticiones complejas escalan automáticamente a modelos de alta
            capacidad para asegurar precisión técnica.
          </p>
        </div>

        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-2">
          <Cpu className="w-5 h-5 text-blue-500" />
          <h4 className="text-sm font-bold text-white">ROI Optimizado</h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Eficiencia total en el consumo de tokens sin que tengas que elegir
            modelos manualmente.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Estado del Sistema:{" "}
          <span className="text-emerald-500">Totalmente Operativo</span>
        </div>
      </div>
    </div>
  );
}
