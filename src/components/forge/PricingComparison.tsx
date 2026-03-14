"use client";

import React from "react";
import { m } from "framer-motion";
import {
  Check,
  ArrowRight,
  Building2,
  Brain,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";

const COMPARISON_COPY = {
  es: {
    rows: [
      {
        category: "Modelo del sistema",
        mobileCategory: "Modelo",
        starter: "El trabajo vive entre herramientas separadas y sin contexto compartido",
        starterMobile: "Herramientas separadas y sin contexto",
        pro: "El CRM registra la operación, pero la IA y el proceso viven en capas aparte",
        proMobile: "CRM y automatización viven en capas aparte",
        enterprise: "Pipeline, historial, siguientes pasos y ayuda inteligente viven en una misma capa operativa",
        enterpriseMobile: "Una sola capa operativa con contexto compartido",
      },
      {
        category: "Estructura",
        mobileCategory: "Estructura",
        starter: "El trabajo depende de memoria, chats y hojas de cálculo",
        starterMobile: "Depende de memoria, chats y hojas",
        pro: "Hay pipeline, pero el contexto se reparte entre módulos y registros",
        proMobile: "Hay pipeline, pero el contexto se dispersa",
        enterprise: "Las relaciones con clientes siguen un flujo estructurado desde el primer contacto hasta el seguimiento",
        enterpriseMobile: "Flujo estructurado de punta a punta",
      },
      {
        category: "Visibilidad",
        mobileCategory: "Visibilidad",
        starter: "Es difícil ver qué avanza, qué se detiene y quién es responsable",
        starterMobile: "Cuesta ver avances, bloqueos y responsables",
        pro: "Hay reportes, pero la imagen real sigue fragmentada",
        proMobile: "Hay reportes, pero la operación sigue fragmentada",
        enterprise: "El equipo comparte una vista clara de estado, responsables y siguiente acción",
        enterpriseMobile: "Vista clara de estado, responsables y siguiente acción",
      },
      {
        category: "Asistencia inteligente",
        mobileCategory: "IA útil",
        starter: "Los recordatorios y seguimientos se hacen manualmente",
        starterMobile: "Seguimiento manual",
        pro: "Las automatizaciones siguen reglas, pero entienden poco del contexto de la relación",
        proMobile: "Automatiza reglas, no el contexto real",
        enterprise: "El sistema resume, organiza y sugiere acciones usando el contexto real del cliente",
        enterpriseMobile: "Resume y sugiere con contexto real",
      },
      {
        category: "Adopción operativa",
        mobileCategory: "Adopción",
        starter: "Es fácil empezar, pero difícil operar con consistencia",
        starterMobile: "Fácil empezar, difícil sostener",
        pro: "Requiere configuración, campos y administración antes de que el equipo lo adopte",
        proMobile: "Pide configuración antes de generar tracción",
        enterprise: "Está pensado para entenderse rápido y operar con estructura desde el inicio",
        enterpriseMobile: "Se entiende rápido y opera con estructura",
      },
    ],
    fairUse: "",
    eyebrow: "Comparativa",
    title: "Compara modelos operativos, no solo listas de funciones.",
    description:
      "La diferencia real no está en tener más funciones. Está en si la IA vive fuera del flujo o si forma parte del sistema que estructura y hace visible la operación con clientes.",
    recommended: "AI-native",
    swipeHint: "Desliza para comparar",
    helperDetail: "La primera columna se mantiene fija para darte contexto.",
    starterCta: "Ver el flujo",
    proCta: "Solicitar acceso",
    enterpriseCta: "Ver precios",
    starterLabel: "Flujo fragmentado",
    proLabel: "Noctra CRM",
    enterpriseLabel: "CRM tradicional",
    starterTitle: "Spreadsheets",
    starterTitleMobile: "Hojas",
    enterpriseTitle: "Add-on model",
    enterpriseTitleMobile: "Add-ons",
    proTitle: "Client Ops",
    proTitleMobile: "Client Ops",
  },
  en: {
    rows: [
      {
        category: "System model",
        mobileCategory: "Model",
        starter: "Work lives across separate tools with no shared context",
        starterMobile: "Separate tools with no shared context",
        pro: "The CRM records the work, but AI and process live in separate layers",
        proMobile: "CRM and AI live in separate layers",
        enterprise: "Pipeline, history, next steps, and intelligent assistance live in one operating layer",
        enterpriseMobile: "One operating layer with shared context",
      },
      {
        category: "Structure",
        mobileCategory: "Structure",
        starter: "Work depends on memory, chats, and spreadsheets",
        starterMobile: "Depends on memory, chats, and sheets",
        pro: "There is a pipeline, but context is split across modules and records",
        proMobile: "Pipeline exists, but context is scattered",
        enterprise: "Client relationships follow one structured flow from first contact through follow-through",
        enterpriseMobile: "One structured flow from first touch to follow-through",
      },
      {
        category: "Visibility",
        mobileCategory: "Visibility",
        starter: "It is hard to see what is moving, what is stalled, and who owns it",
        starterMobile: "Hard to see momentum, blockers, and ownership",
        pro: "Reporting exists, but the real picture is still fragmented",
        proMobile: "Reporting exists, but the picture is fragmented",
        enterprise: "The team shares a clear view of status, ownership, and next action",
        enterpriseMobile: "Clear shared view of status, ownership, and next action",
      },
      {
        category: "Intelligent assistance",
        mobileCategory: "AI help",
        starter: "Reminders and follow-ups are handled manually",
        starterMobile: "Follow-ups stay manual",
        pro: "Automation follows rules, but understands little of the relationship context",
        proMobile: "Automates rules, not relationship context",
        enterprise: "The system summarizes, organizes, and suggests actions using real client context",
        enterpriseMobile: "Summarizes and suggests using real context",
      },
      {
        category: "Operational adoption",
        mobileCategory: "Adoption",
        starter: "Easy to start, hard to run consistently",
        starterMobile: "Easy to start, hard to sustain",
        pro: "Needs configuration, fields, and admin work before teams adopt it",
        proMobile: "Needs setup before teams get momentum",
        enterprise: "Designed to be understood quickly and used with structure from the start",
        enterpriseMobile: "Quick to grasp and structured from day one",
      },
    ],
    fairUse: "",
    eyebrow: "Comparison",
    title: "Compare operating models, not just feature lists.",
    description:
      "The real difference is not having more features. It is whether AI sits outside the workflow or works inside the system that structures and makes client operations visible.",
    recommended: "AI-native",
    swipeHint: "Swipe to compare",
    helperDetail: "The first column stays pinned so the row topic never gets lost.",
    starterCta: "See the workflow",
    proCta: "Join early access",
    enterpriseCta: "See pricing",
    starterLabel: "Fragmented process",
    proLabel: "Noctra CRM",
    enterpriseLabel: "Traditional CRM",
    starterTitle: "Spreadsheets",
    starterTitleMobile: "Sheets",
    enterpriseTitle: "Add-on model",
    enterpriseTitleMobile: "Add-ons",
    proTitle: "Client Ops",
    proTitleMobile: "Client Ops",
  },
} as const;

const comparisonTableClass = "w-max min-w-[780px] md:min-w-0 md:w-full";

const comparisonGridClass =
  "grid grid-cols-[minmax(9.5rem,1.05fr)_minmax(12.5rem,1fr)_minmax(12.5rem,1fr)_minmax(13rem,1fr)] md:grid-cols-4";

const stickyColumnClass =
  "sticky left-0 z-20 bg-[#050505] shadow-[16px_0_28px_rgba(5,5,5,0.92)] md:static md:bg-transparent md:shadow-none";

export const PricingComparison = () => {
  const locale = useLocale();
  const copy = COMPARISON_COPY[locale as "es" | "en"] ?? COMPARISON_COPY.es;
  const features = [
    {
      category: copy.rows[0].category,
      mobileCategory: copy.rows[0].mobileCategory,
      starter: copy.rows[0].starter,
      starterMobile: copy.rows[0].starterMobile,
      pro: copy.rows[0].pro,
      proMobile: copy.rows[0].proMobile,
      enterprise: (
        <span className="flex items-center gap-2">{copy.rows[0].enterprise}</span>
      ),
      enterpriseMobile: copy.rows[0].enterpriseMobile,
    },
    {
      category: copy.rows[1].category,
      mobileCategory: copy.rows[1].mobileCategory,
      starter: copy.rows[1].starter,
      starterMobile: copy.rows[1].starterMobile,
      pro: copy.rows[1].pro,
      proMobile: copy.rows[1].proMobile,
      enterprise: (
        <span className="flex items-center gap-2">
          <Brain size={16} className="text-amber-500/80 shrink-0" />
          {copy.rows[1].enterprise}
        </span>
      ),
      enterpriseMobile: copy.rows[1].enterpriseMobile,
    },
    {
      category: copy.rows[2].category,
      mobileCategory: copy.rows[2].mobileCategory,
      starter: copy.rows[2].starter,
      starterMobile: copy.rows[2].starterMobile,
      pro: copy.rows[2].pro,
      proMobile: copy.rows[2].proMobile,
      enterprise: (
        <span className="flex items-center gap-2">
          <Zap size={16} className="text-amber-500/80 shrink-0" />
          {copy.rows[2].enterprise}
        </span>
      ),
      enterpriseMobile: copy.rows[2].enterpriseMobile,
    },
    {
      category: copy.rows[3].category,
      mobileCategory: copy.rows[3].mobileCategory,
      starter: copy.rows[3].starter,
      starterMobile: copy.rows[3].starterMobile,
      pro: copy.rows[3].pro,
      proMobile: copy.rows[3].proMobile,
      enterprise: (
        <span className="flex items-center gap-2">
          <MessageSquare size={16} className="text-amber-500/80 shrink-0" />
          {copy.rows[3].enterprise}
        </span>
      ),
      enterpriseMobile: copy.rows[3].enterpriseMobile,
    },
    {
      category: copy.rows[4].category,
      mobileCategory: copy.rows[4].mobileCategory,
      starter: copy.rows[4].starter,
      starterMobile: copy.rows[4].starterMobile,
      pro: copy.rows[4].pro,
      proMobile: copy.rows[4].proMobile,
      enterprise: copy.rows[4].enterprise,
      enterpriseMobile: copy.rows[4].enterpriseMobile,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-black relative border-t border-white/5 overflow-x-clip overflow-y-visible">
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
          <div className="mb-3 flex items-center justify-between px-1 md:hidden">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-neutral-400">
                {copy.swipeHint}
              </p>
              <p className="mt-1 text-xs text-neutral-600">{copy.helperDetail}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
              <ArrowRight size={13} className="text-neutral-500" />
            </div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-b from-white/5 to-transparent rounded-3xl blur opacity-30 pointer-events-none" />
          <div className="relative bg-[#050505] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
            <div className="relative px-3 pb-2 md:px-0 md:pb-0">
              <div className="pointer-events-none absolute inset-y-0 left-3 z-30 w-4 bg-gradient-to-r from-[#050505] to-transparent md:hidden" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-14 bg-gradient-to-l from-[#050505] via-[#050505]/92 to-transparent md:hidden" />
              <div
                className="w-full max-w-full overflow-x-auto overflow-y-visible overscroll-x-contain scroll-smooth touch-pan-x md:overflow-visible [-webkit-overflow-scrolling:touch]"
                aria-label={copy.title}>
              <div className={comparisonTableClass}>
              {/* Table Header (Grid) */}
              <div
                className={`${comparisonGridClass} border-b border-white/10 bg-white/[0.02]`}>
                <div
                  className={`${stickyColumnClass} bg-[#0a0a0a] p-5 md:p-8 md:border-r border-white/5`}>
                </div>

                {/* Starter Column Header */}
                <div className="p-5 md:p-8 md:border-r border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="text-white/70 font-bold uppercase tracking-widest text-[11px] md:text-xs mb-2 mt-4">
                    {copy.starterLabel}
                  </div>
                  <div className="text-white text-xl md:text-2xl font-black tracking-tighter">
                    <span className="md:hidden">{copy.starterTitleMobile}</span>
                    <span className="hidden md:inline">{copy.starterTitle}</span>
                  </div>
                </div>

                {/* Pro Column Header (Highlight) */}
                <div className="p-5 md:p-8 relative border-white/5 md:border-r flex flex-col items-center justify-center text-center bg-white/[0.01]">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-600/50 to-amber-500/50" />
                  <div className="text-white/90 font-bold uppercase tracking-widest text-[11px] md:text-xs mt-4 mb-2 flex items-center gap-2">
                    <Building2 size={14} className="text-amber-500/80" />
                    {copy.enterpriseLabel}
                  </div>
                  <div className="text-white text-xl md:text-2xl font-bold tracking-tighter">
                    <span className="md:hidden">{copy.enterpriseTitleMobile}</span>
                    <span className="hidden md:inline">{copy.enterpriseTitle}</span>
                  </div>
                </div>

                {/* Enterprise Column Header */}
                <div className="p-5 md:p-8 relative flex flex-col items-center justify-center text-center bg-emerald-500/[0.04] shadow-[inset_0_1px_0_rgba(16,185,129,0.18)]">
                  <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] uppercase font-black px-3 py-1 rounded-b-lg tracking-widest shadow-lg">
                    {copy.recommended}
                  </div>
                  <div className="text-emerald-500 font-bold uppercase tracking-widest text-[11px] md:text-xs mb-2 mt-4">
                    {copy.proLabel}
                  </div>
                  <div className="text-white text-2xl md:text-3xl font-black tracking-tighter">
                    <span className="md:hidden">{copy.proTitleMobile}</span>
                    <span className="hidden md:inline">{copy.proTitle}</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-white/5">
                {features.map((row, idx) => (
                  <div
                    key={idx}
                    className={`${comparisonGridClass} group/row hover:bg-white/[0.01] transition-colors`}>
                    {/* Category */}
                    <div
                      className={`${stickyColumnClass} min-h-[8.5rem] group-hover/row:bg-[#080808] md:min-h-0 md:bg-transparent md:group-hover/row:bg-transparent p-5 md:p-8 flex items-center md:border-r border-white/5`}>
                      <span className="text-sm font-bold text-neutral-300 leading-snug">
                        <span className="md:hidden">{row.mobileCategory}</span>
                        <span className="hidden md:inline">{row.category}</span>
                      </span>
                    </div>

                    {/* Starter */}
                    <div className="min-h-[8.5rem] md:min-h-0 p-5 md:p-8 text-white/70 text-sm flex items-center md:border-r border-white/5">
                      <span className="hidden flex-1 leading-relaxed md:inline">{row.starter}</span>
                      <span className="flex-1 text-[13px] leading-6 md:hidden">{row.starterMobile}</span>
                    </div>

                    {/* Pro */}
                    <div className="min-h-[8.5rem] md:min-h-0 p-5 md:p-8 text-white font-bold text-sm flex items-center md:border-r border-white/5 bg-white/[0.01]">
                      <span className="hidden flex-1 leading-relaxed md:inline">{row.pro}</span>
                      <span className="flex-1 text-[13px] leading-6 md:hidden">{row.proMobile}</span>
                    </div>

                    {/* Enterprise */}
                    <div className="min-h-[8.5rem] md:min-h-0 p-5 md:p-8 text-white font-medium text-sm flex items-center bg-emerald-500/[0.04]">
                      <Check
                        size={16}
                        className="text-emerald-500 mr-2 mt-0.5 shrink-0 hidden md:block"
                        strokeWidth={3}
                      />
                      <span className="hidden flex-1 leading-relaxed md:inline">{row.enterprise}</span>
                      <span className="flex-1 md:hidden">
                        <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                          <Check size={12} className="text-emerald-400" strokeWidth={3} />
                          {copy.proLabel}
                        </span>
                        <span className="block text-[13px] leading-6 text-white">
                          {row.enterpriseMobile}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Row */}
              <div
                className={`${comparisonGridClass} border-t border-white/10 bg-white/[0.02]`}>
                <div
                  className={`${stickyColumnClass} bg-[#0a0a0a] p-6 md:p-8 md:border-r border-white/5`}>
                </div>

                {/* Starter CTA */}
                <div className="p-6 md:p-8 md:border-r border-white/5 flex items-center justify-center">
                  <a
                    href="#features"
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/5 text-white/70 font-bold border border-white/10 text-sm hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]">
                    {copy.starterCta}
                  </a>
                </div>

                {/* Pro CTA */}
                <div className="p-6 md:p-8 border-white/5 md:border-r flex items-center justify-center bg-white/[0.01]">
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
          </div>
        </div>
      </div>
    </section>
  );
};
