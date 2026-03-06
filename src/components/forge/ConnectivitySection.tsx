"use client";

import React from "react";
import { m } from "framer-motion";
import { MessageSquare, Zap, CheckCircle2 } from "lucide-react";
import { CentralBrainLogo } from "@/components/ui/CentralBrainLogo";

export const ConnectivitySection = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-black via-[#050505] to-zinc-950 relative border-t border-white/5 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 block">
            Plataforma Abierta & Inteligente
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6">
            Más que management. <br className="hidden md:block" />
            Un cerebro para tu negocio.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* BLOCK 1: REVENUE INTELLIGENCE (Left) */}
          <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden group hover:bg-white/[0.03] transition-colors flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />

            <div className="mb-12 relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 line-clamp-2">
                Revenue Radar: Escucha lo que tus datos dicen.
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
                Analiza el sentimiento de tus clientes en WhatsApp y Slack.
                Detecta riesgos de churn y oportunidades de upsell antes de que
                sea demasiado tarde.
              </p>
            </div>

            {/* Simulated Chat & AI Widget UI */}
            <div className="relative bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 shadow-2xl z-10">
              {/* Chat bubbles */}
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 shrink-0" />
                  <div className="bg-zinc-900 rounded-tr-xl rounded-b-xl px-4 py-2.5 text-xs text-neutral-300 max-w-[80%] border border-white/5">
                    "Me encanta la nueva propuesta, ¿podemos revisar los
                    detalles del contrato de una vez? Queremos arrancar el
                    lunes."
                  </div>
                </div>
              </div>

              {/* Floating AI Widget Overlay (Central Brain) */}
              <div className="absolute -bottom-8 -right-4 md:-right-8 bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] w-[260px] animate-in slide-in-from-bottom-5 duration-700">
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-2">
                  <div className="w-8 h-8 flex-none">
                    <CentralBrainLogo isThinking={true} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white">
                      Cerebro Central
                    </span>
                    <span className="text-[8px] uppercase font-medium tracking-tighter text-emerald-500">
                      Orchestrator v2.0
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/[0.03] p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-neutral-500 font-medium">
                      Modo de Ejecución
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                      <Zap size={10} /> Optimized Mode
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white/[0.03] p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] text-neutral-500 font-medium whitespace-nowrap">
                      Token Efficiency
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      High ROI
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-neutral-500 font-medium">
                      Acción Orquestada
                    </span>
                    <button className="w-full py-1.5 bg-white text-black text-[10px] font-bold rounded-md hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider">
                      Generar Contrato <CheckCircle2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 2: OPEN ECOSYSTEM (Right) */}
          <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#020202] border border-white/5 overflow-hidden group hover:border-emerald-500/20 transition-all flex flex-col justify-between">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

            <div className="mb-12 relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 line-clamp-2">
                Tu Hub Central. <br />
                Conectado a todo.
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
                Noctra es tu cerebro financiero. Sincroniza automáticamente
                contratos y tareas con las herramientas que tu equipo ya ama y
                domina.
              </p>
            </div>

            {/* Flow Diagram UI */}
            <div className="relative h-[280px] w-full flex items-center justify-center z-10 mt-4 md:mt-0">
              {/* Center: Noctra Logo Pulsing */}
              <div className="relative z-20 w-16 h-16 rounded-2xl bg-black border border-[#10b981]/50 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse">
                <span className="text-2xl font-bold text-white">N</span>
              </div>

              {/* Orbiting Elements & Lines */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* SVG Connecting Lines */}
                <svg
                  className="absolute w-[120%] h-[120%] opacity-20 pointer-events-none"
                  viewBox="0 0 400 300">
                  {/* Left Top Line */}
                  <path
                    d="M 200 150 Q 150 100 80 80"
                    stroke="url(#emerald-grad)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 4"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  {/* Right Top Line */}
                  <path
                    d="M 200 150 Q 250 100 320 80"
                    stroke="url(#emerald-grad)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 4"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  {/* Left Bottom Line */}
                  <path
                    d="M 200 150 Q 150 200 80 220"
                    stroke="url(#emerald-grad)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 4"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  {/* Right Bottom Line */}
                  <path
                    d="M 200 150 Q 250 200 320 220"
                    stroke="url(#emerald-grad)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 4"
                    className="animate-[dash_20s_linear_infinite]"
                  />

                  <defs>
                    <linearGradient
                      id="emerald-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#transparent" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Nodes */}
                {/* Top Left - Notion-like */}
                <div className="absolute top-[10%] left-[10%] group/node">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-white/5 text-[9px] uppercase tracking-widest text-[#10b981] px-2 py-1 rounded shadow-lg opacity-0 group-hover/node:opacity-100 transition-opacity">
                    Webhook: Sync Docs
                  </div>
                </div>

                {/* Top Right - Slack-like */}
                <div className="absolute top-[10%] right-[10%] group/node">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <MessageSquare size={18} className="text-white" />
                  </div>
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-white/5 text-[9px] uppercase tracking-widest text-purple-400 px-2 py-1 rounded shadow-lg opacity-0 group-hover/node:opacity-100 transition-opacity">
                    Alert: Contract Signed
                  </div>
                </div>

                {/* Bottom Left - Make/Zapier-like */}
                <div className="absolute bottom-[10%] left-[10%] group/node">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <Zap size={18} className="text-white" />
                  </div>
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-white/5 text-[9px] uppercase tracking-widest text-orange-400 px-2 py-1 rounded shadow-lg opacity-0 group-hover/node:opacity-100 transition-opacity">
                    Trigger: New Invoice
                  </div>
                </div>

                {/* Bottom Right - Asana/Check-like */}
                <div className="absolute bottom-[10%] right-[10%] group/node">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black border border-white/5 text-[9px] uppercase tracking-widest text-blue-400 px-2 py-1 rounded shadow-lg opacity-0 group-hover/node:opacity-100 transition-opacity">
                    Sync: Create Task
                  </div>
                </div>
              </div>
            </div>

            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes dash {
                to { stroke-dashoffset: -1000; }
              }
            `,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
