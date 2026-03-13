"use client";

import React from "react";
import { m, Variants } from "framer-motion";
import {
  BrainCircuit,
  Feather,
  Megaphone,
  RefreshCcw,
} from "lucide-react";
import { useLocale } from "next-intl";

const UNIFIED_STACK_COPY = {
  es: {
    title: "Cómo funciona la ayuda inteligente dentro de un sistema de operaciones con clientes nativo en IA",
    description:
      "Cada plan incluye capacidad de ayuda inteligente que el propio sistema utiliza sobre el contexto real del cliente. Noctra la usa para resumir conversaciones, organizar información, sugerir follow-ups e identificar oportunidades sin sacar al equipo de su operación.",
    profitabilityTitle: "Los tokens representan trabajo útil dentro del sistema",
    profitabilityDescription:
      "Piensa en los tokens como la capacidad de trabajo incluida en tu plan. No se consumen por ver una función, sino cuando Noctra ejecuta trabajo útil sobre el contexto compartido, como resúmenes, organización de información, sugerencias o detección de oportunidades.",
    projectMargin: "Cobertura útil de IA",
    signatureTitle: "Uso visible de IA",
    signatureDescription: "La ayuda inteligente trabaja dentro del sistema y su uso puede entenderse con claridad. No se activa por estar disponible, sino cuando aporta valor en el trabajo diario.",
    signatureBadge: "Consumo claro",
    accountingTitle: "Visibilidad por rol",
    accountingDescription: "Cada persona ve lo necesario para su trabajo, con una vista compartida de la operación sin abrir más información de la que realmente necesita.",
    marketingTitle: "Contexto compartido con cuidado",
    marketingDescription:
      "La ayuda inteligente trabaja sobre el historial compartido, mantiene continuidad entre personas y respeta los permisos del sistema para proteger el contexto sensible del cliente.",
    protocol: "Transparente por diseño",
  },
  en: {
    title: "How intelligent assistance works inside an AI-native client operations system",
    description:
      "Every plan includes intelligent-assistance capacity that the system uses on real client context. Noctra uses it to summarize conversations, organize information, suggest follow-ups, and identify opportunities without pulling the team out of its workflow.",
    profitabilityTitle: "Tokens represent useful work inside the system",
    profitabilityDescription:
      "Think of tokens as the amount of work included in your plan. They are not consumed because a feature exists, only when Noctra performs useful work on shared context such as summaries, information organization, suggestions, or opportunity signals.",
    projectMargin: "Useful AI coverage",
    signatureTitle: "Visible AI usage",
    signatureDescription: "Intelligent assistance works inside the system and its usage should be easy to understand. It is not consumed because it exists, only when it adds value to daily work.",
    signatureBadge: "Clear usage",
    accountingTitle: "Role-based visibility",
    accountingDescription: "Each person sees the information they need for their role, with a shared operating view that does not expose more account context than necessary.",
    marketingTitle: "Shared context, handled with care",
    marketingDescription:
      "Intelligent assistance works from shared history, keeps continuity across people, and respects system permissions to protect sensitive client context.",
    protocol: "Transparent by design",
  },
} as const;

export const UnifiedStack = () => {
  const locale = useLocale();
  const copy = UNIFIED_STACK_COPY[locale as "es" | "en"] ?? UNIFIED_STACK_COPY.es;
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="py-24 md:py-32 bg-[#0A0A0A] relative border-t border-white/10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
            {copy.title}
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {copy.description}
          </m.p>
        </div>

        {/* Bento Grid */}
        <m.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1: AI Profitability Engine (2 columns) & Native E-Sign (1 column) */}
          <m.div
            variants={item}
            className="md:col-span-2 p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-[#10b981]/50 hover:-translate-y-1 backdrop-blur-sm transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 flex items-center justify-center mb-8">
                <BrainCircuit size={32} className="text-[#10b981]" />
              </div>
              <h3 className="text-3xl font-black text-white mb-6">
                {copy.profitabilityTitle}
              </h3>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-md">
                {copy.profitabilityDescription}
              </p>
            </div>

            {/* Visual Mini Mockup */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-white">
                  {copy.projectMargin}
                </span>
                <span className="text-xl font-black text-[#10b981]">82%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <m.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "82%" }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-[#10b981] to-emerald-400"
                />
              </div>
            </div>

            <div className="absolute top-0 right-0 w-80 h-80 bg-[#10b981]/5 blur-[100px] rounded-full pointer-events-none" />
          </m.div>

          <m.div
            variants={item}
            className="md:col-span-1 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-[#10b981]/50 hover:-translate-y-1 backdrop-blur-sm transition-all duration-500 group relative flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center mb-6">
                <Feather size={24} className="text-[#10b981]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {copy.signatureTitle}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {copy.signatureDescription}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="bg-white/10 border border-white/10 text-white/60 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-2">
                {copy.signatureBadge}
              </span>
            </div>
          </m.div>

          {/* Row 2: Accounting Sync (1 column) & Marketing Bridge (2 columns) */}
          <m.div
            variants={item}
            className="md:col-span-1 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-blue-500/50 hover:-translate-y-1 backdrop-blur-sm transition-all duration-500 group min-h-[300px] flex flex-col justify-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <RefreshCcw size={24} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              {copy.accountingTitle}
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {copy.accountingDescription}
            </p>
          </m.div>

          <m.div
            variants={item}
            className="md:col-span-2 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-orange-500/50 hover:-translate-y-1 backdrop-blur-sm transition-all duration-500 group min-h-[300px] flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10 w-full md:w-1/2">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                <Megaphone size={24} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {copy.marketingTitle}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {copy.marketingDescription}
              </p>
            </div>

            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none" />
          </m.div>
        </m.div>

        {/* Unified Label */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex items-center justify-center gap-4 text-neutral-600 font-mono text-[10px] uppercase tracking-[0.4em] font-medium">
          <div className="h-[1px] w-12 bg-white/5" />
          <span>{copy.protocol}</span>
          <div className="h-[1px] w-12 bg-white/5" />
        </m.div>
      </div>
    </section>
  );
};
