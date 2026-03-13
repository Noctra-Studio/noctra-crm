"use client";

import React from "react";
import { m } from "framer-motion";
import {
  Check,
  ArrowRight,
  Sparkles,
  Building2,
  Brain,
  MessageSquare,
  Server,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";

const COMPARISON_COPY = {
  es: {
    rows: [
      ["Arquitectura de IA", "La IA vive fuera del proceso y sin contexto compartido", "La IA se añade como una capa aparte del CRM", "La IA forma parte del sistema y trabaja con el contexto real del cliente"],
      ["Claridad del workflow", "El trabajo depende de memoria, chats y hojas de cálculo", "Hay pipeline, pero el contexto se reparte entre módulos y registros", "Pipeline, interacciones, historial y próximos pasos viven en un mismo flujo"],
      ["Complejidad de implementación", "Es fácil empezar, pero difícil operar con consistencia", "Requiere configuración, campos y administración antes de que el equipo lo adopte", "Está pensado para entenderse rápido y usarse con estructura desde el inicio"],
      ["Inteligencia de automatización", "Los recordatorios y seguimientos se hacen manualmente", "Las automatizaciones siguen reglas, pero entienden poco del contexto", "Resume conversaciones, sugiere follow-ups e identifica oportunidades con más criterio"],
      ["Visibilidad operativa", "No hay una vista clara de lo que avanza o se detiene", "Hay reportes, pero el estado real sigue repartido", "Da una vista compartida de pipeline, actividad y siguientes pasos para decidir mejor"],
    ],
    fairUse: "",
    eyebrow: "Comparativa",
    title: "Compara modelos operativos, no solo listas de funciones.",
    description:
      "La diferencia real no está en tener más funciones. Está en si la IA se añade como un extra o si forma parte del sistema para dar claridad al trabajo con clientes.",
    recommended: "AI-native",
    starterCta: "Ver el flujo",
    proCta: "Solicitar acceso",
    enterpriseCta: "Ver precios",
    starterLabel: "Proceso fragmentado",
    proLabel: "Noctra CRM",
    enterpriseLabel: "CRM tradicional",
  },
  en: {
    rows: [
      ["AI architecture", "AI sits outside the process with no shared context", "AI is added as a separate layer on top of the CRM", "AI is part of the system and works from real client context"],
      ["Workflow clarity", "Work depends on memory, chats, and spreadsheets", "There is a pipeline, but context is split across modules and records", "Pipeline, interactions, history, and next steps live in one flow"],
      ["Setup complexity", "Easy to start, hard to run consistently", "Needs configuration, fields, and admin work before teams adopt it", "Designed to be understood quickly and used with structure from the start"],
      ["Automation intelligence", "Reminders and follow-ups are handled manually", "Automation follows rules, but understands little of the relationship context", "Summarizes conversations, suggests follow-ups, and identifies opportunities with more context"],
      ["Operational visibility", "There is no clear view of what is moving or stalled", "Reports exist, but the real picture is still scattered", "Gives the team a shared view of pipeline, activity, and next steps to make better decisions"],
    ],
    fairUse: "",
    eyebrow: "Comparison",
    title: "Compare operating models, not just feature lists.",
    description:
      "The real difference is not having more features. It is whether AI is added as an extra or built into the system to bring clarity to client work.",
    recommended: "AI-native",
    starterCta: "See the workflow",
    proCta: "Join early access",
    enterpriseCta: "See pricing",
    starterLabel: "Fragmented process",
    proLabel: "Noctra CRM",
    enterpriseLabel: "Traditional CRM",
  },
} as const;

export const PricingComparison = () => {
  const locale = useLocale();
  const copy = COMPARISON_COPY[locale as "es" | "en"] ?? COMPARISON_COPY.es;
  const features = [
    {
      category: copy.rows[0][0],
      starter: copy.rows[0][1],
      pro: copy.rows[0][2],
      enterprise: (
        <span className="flex items-center gap-2">{copy.rows[0][3]}</span>
      ),
    },
    {
      category: copy.rows[1][0],
      starter: copy.rows[1][1],
      pro: copy.rows[1][2],
      enterprise: (
        <span className="flex items-center gap-2">
          <Brain size={16} className="text-amber-500/80 shrink-0" />
          {copy.rows[1][3]}
        </span>
      ),
    },
    {
      category: copy.rows[2][0],
      starter: copy.rows[2][1],
      pro: copy.rows[2][2],
      enterprise: (
        <span className="flex items-center gap-2">
          <Zap size={16} className="text-amber-500/80 shrink-0" />
          {copy.rows[2][3]}
        </span>
      ),
    },
    {
      category: copy.rows[3][0],
      starter: copy.rows[3][1],
      pro: copy.rows[3][2],
      enterprise: (
        <span className="flex items-center gap-2">
          <MessageSquare size={16} className="text-amber-500/80 shrink-0" />
          {copy.rows[3][3]}
        </span>
      ),
    },
    {
      category: copy.rows[4][0],
      starter: copy.rows[4][1],
      pro: copy.rows[4][2],
      enterprise: copy.rows[4][3],
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-black relative border-t border-white/5 overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <m.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 block">
            {copy.eyebrow}
          </m.span>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
            {copy.title}
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {copy.description}
          </m.p>
        </div>

        {/* Comparison Board */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-white/5 to-transparent rounded-3xl blur opacity-30 pointer-events-none" />
          <div className="relative bg-[#050505] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
            {/* Table Header (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-4 border-b border-white/10 bg-white/[0.02]">
              {/* Empty top-left cell for desktop */}
              <div className="hidden md:block p-8 border-r border-white/5"></div>

              {/* Starter Column Header */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-white/5 flex flex-col items-center justify-center text-center">
                <div className="text-white/70 font-bold uppercase tracking-widest text-xs mb-2 mt-4">
                  {copy.starterLabel}
                </div>
                <div className="text-white text-2xl font-black tracking-tighter">
                  Spreadsheets
                </div>
              </div>

              {/* Pro Column Header (Highlight) */}
              <div className="p-8 relative border-b md:border-b-0 border-white/5 md:border-r flex flex-col items-center justify-center text-center bg-white/[0.01]">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-600/50 to-amber-500/50" />
                <div className="text-white/90 font-bold uppercase tracking-widest text-xs mt-4 mb-2 flex items-center gap-2">
                  <Building2 size={14} className="text-amber-500/80" />
                  {copy.enterpriseLabel}
                </div>
                <div className="text-white text-2xl font-bold tracking-tighter">
                  Add-on model
                </div>
              </div>

              {/* Enterprise Column Header */}
              <div className="p-8 relative flex flex-col items-center justify-center text-center bg-emerald-500/[0.03]">
                <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] uppercase font-black px-3 py-1 rounded-b-lg tracking-widest shadow-lg">
                  {copy.recommended}
                </div>
                <div className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-2 mt-4">
                  {copy.proLabel}
                </div>
                <div className="text-white text-3xl font-black tracking-tighter">
                  Client Ops
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {features.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-4 group/row hover:bg-white/[0.01] transition-colors">
                  {/* Category */}
                  <div className="p-6 md:p-8 flex items-center md:border-r border-white/5">
                    <span className="text-sm font-bold text-neutral-300">
                      {row.category}
                    </span>
                  </div>

                  {/* Starter */}
                  <div className="p-6 md:p-8 text-white/70 text-sm flex items-center md:border-r border-white/5 border-b md:border-b-0">
                    <span className="md:hidden w-32 font-bold uppercase text-[10px] tracking-widest text-neutral-600">
                      {copy.starterLabel}:
                    </span>
                    <span className="flex-1">{row.starter}</span>
                  </div>

                  {/* Pro */}
                  <div className="p-6 md:p-8 text-white font-bold text-sm flex items-center md:border-r border-white/5 bg-white/[0.01] border-b md:border-b-0">
                    <span className="md:hidden w-32 font-bold uppercase text-[10px] tracking-widest text-neutral-500 mt-0.5">
                      {copy.enterpriseLabel}:
                    </span>
                    <span className="flex-1">{row.pro}</span>
                  </div>

                  {/* Enterprise */}
                  <div className="p-6 md:p-8 text-white font-medium text-sm flex items-center bg-emerald-500/[0.01]">
                    <span className="md:hidden w-32 font-bold uppercase text-[10px] tracking-widest text-emerald-500 mt-0.5">
                      {copy.proLabel}:
                    </span>
                    <Check
                      size={16}
                      className="text-emerald-500 mr-2 shrink-0 hidden md:block"
                      strokeWidth={3}
                    />
                    <span className="flex-1">{row.enterprise}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 border-t border-white/10 bg-white/[0.02]">
              <div className="hidden md:block p-8 border-r border-white/5"></div>

              {/* Starter CTA */}
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/5 flex items-center justify-center">
                <a
                  href="#features"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/5 text-white/70 font-bold border border-white/10 text-sm hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]">
                  {copy.starterCta}
                </a>
              </div>

              {/* Pro CTA */}
              <div className="p-6 md:p-8 border-b md:border-b-0 border-white/5 md:border-r flex items-center justify-center bg-white/[0.01]">
                <a
                  href="#pricing"
                  className="w-full relative flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#0a0a0a] border border-white/10 text-white font-bold text-sm hover:bg-white/5 hover:border-white/30 transition-all active:scale-[0.98] group/btn overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                  {copy.enterpriseCta}{" "}
                  <ArrowRight
                    size={16}
                    className="text-white/50 group-hover/btn:text-white"
                  />
                </a>
              </div>

              {/* Enterprise CTA */}
              <div className="p-6 md:p-8 flex items-center justify-center bg-emerald-500/[0.03]">
                <Link
                  href="/waitlist"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white text-black font-black text-sm hover:bg-neutral-200 transition-all active:scale-[0.98]">
                  {copy.proCta} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
