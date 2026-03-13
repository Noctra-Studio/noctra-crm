"use client";

import React from "react";
import {
  Check,
  ArrowRight,
  Building2,
  User,
  Briefcase,
  Info,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";

const PRICING_COPY = {
  es: {
    eyebrow: "Precios transparentes",
    title: "Precios claros para un Client Operations System desde antes del lanzamiento.",
    description:
      "Noctra CRM está diseñado para que cada negocio entienda qué incluye su plan, cómo funciona la ayuda inteligente, cuándo se consume esa capacidad y qué puede esperar del sistema desde el inicio. Sin letras pequeñas ni capas ocultas.",
    starterPeriod: "/usuario/mes",
    starterDescription:
      "Para profesionales y operaciones pequeñas que necesitan estructura desde el inicio.",
    starterFeatures: [
      "Lead management y pipeline estructurado",
      "Historial centralizado por cliente",
      "50,000 tokens de IA / mes con uso visible",
      "Resúmenes y sugerencias dentro del CRM",
      "Soporte por email",
    ],
    starterCta: "Unirme al acceso anticipado",
    popular: "Pensado para equipos",
    proPeriod: "/usuario/mes",
    proDescription: "Para equipos en crecimiento que necesitan más visibilidad, seguimiento y automatización.",
    proIncludes: "Todo en Starter, más:",
    proFeatures: [
      "200,000 tokens de IA / mes con uso visible",
      "Follow-ups sugeridos y señales de oportunidad",
      "Mayor visibilidad operativa por equipo",
      "Más capacidad para historiales y actividad",
      "Soporte prioritario",
    ],
    proCta: "Unirme al acceso anticipado",
    enterprisePrice: "Custom",
    enterpriseDescription:
      "Para organizaciones que requieren seguridad, control y volumen a mayor escala.",
    enterpriseIncludes: "Todo en Pro, más:",
    fairUse:
      "Sujeto a una política de uso responsable explicada con claridad para prevenir abuso automatizado y proteger la calidad del sistema.",
    enterpriseFeatures: [
      "Mayores volúmenes de uso de IA",
      "Controles avanzados de acceso",
      "Opciones adicionales para manejo de datos",
      "Acompañamiento dedicado",
    ],
    contactSales: "Hablar con nosotros",
  },
  en: {
    eyebrow: "Transparent pricing",
    title: "Clear pricing for a Client Operations System before launch.",
    description:
      "Noctra CRM is designed so businesses can understand plan scope, how intelligent assistance works, when that capacity is consumed, and what they can expect from the system from the start. No small print and no hidden layers.",
    starterPeriod: "/user/mo",
    starterDescription:
      "For professionals and small operations that need structure from the beginning.",
    starterFeatures: [
      "Structured lead management and pipeline",
      "Centralized client history",
      "50,000 AI tokens / month with visible usage",
      "Summaries and suggestions inside the CRM",
      "Email support",
    ],
    starterCta: "Join early access",
    popular: "Built for teams",
    proPeriod: "/user/mo",
    proDescription: "For growing teams that need more visibility, follow-through, and automation.",
    proIncludes: "Everything in Starter, plus:",
    proFeatures: [
      "200,000 AI tokens / month with visible usage",
      "Suggested follow-ups and opportunity signals",
      "Stronger operational visibility across teams",
      "More capacity for shared history and activity",
      "Priority support",
    ],
    proCta: "Join early access",
    enterprisePrice: "Custom",
    enterpriseDescription:
      "For organizations that need more security, control, and higher-volume usage.",
    enterpriseIncludes: "Everything in Pro, plus:",
    fairUse:
      "Subject to a clearly explained responsible-use policy to prevent automated abuse and protect system quality.",
    enterpriseFeatures: [
      "Higher AI usage volumes",
      "Advanced access controls",
      "Additional data-handling options",
      "Dedicated support",
    ],
    contactSales: "Talk to us",
  },
} as const;

export const PricingWithROI = () => {
  const locale = useLocale();
  const copy = PRICING_COPY[locale as "es" | "en"] ?? PRICING_COPY.es;

  return (
    <section
      id="pricing"
      className="py-24 md:py-32 bg-neutral-900 relative border-t border-white/5 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 block">
            {copy.eyebrow}
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            {copy.title}
          </h2>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {copy.description}
          </p>
        </div>

        {/* --- PRICING CARDS (3 Tiers) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {/* TIER 1: STARTER */}
          <div className="relative p-8 rounded-3xl transition-all duration-300 bg-white/[0.02] border border-white/10 hover:border-white/20 flex flex-col group">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-lg bg-white/5 text-white/70">
                  <User size={18} fill="currentColor" />
                </span>
                <h3 className="text-sm font-black uppercase tracking-widest text-white/70">
                  Starter
                </h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-white tracking-tighter tabular-nums">
                  $9
                </span>
                <span className="text-neutral-500 text-sm font-bold">
                  {copy.starterPeriod}
                </span>
              </div>
              <p className="text-neutral-400 font-medium text-sm">
                {copy.starterDescription}
              </p>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {copy.starterFeatures.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 text-sm text-neutral-300">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Check
                      size={10}
                      className="text-white/70"
                      strokeWidth={3}
                    />
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <Link
              href="/waitlist"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-[0.98]">
              {copy.starterCta}
            </Link>
          </div>

          {/* TIER 2: PRO (HIGHLIGHTED) */}
          <div className="relative p-8 rounded-3xl transition-all duration-300 bg-[#050505] border-2 border-[#10b981]/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col md:-mt-4 md:mb-4 group overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#10b981] text-black text-[10px] uppercase font-black px-4 py-1 rounded-b-xl tracking-widest shadow-lg z-10">
              {copy.popular}
            </div>

            <div className="mb-8 mt-4 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Briefcase size={18} fill="currentColor" />
                </span>
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500">
                  Forge Pro
                </h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-black text-white tracking-tighter tabular-nums">
                  $29
                </span>
                <span className="text-neutral-500 text-sm font-bold">
                  {copy.proPeriod}
                </span>
              </div>
              <p className="text-neutral-400 font-medium text-sm">
                {copy.proDescription}
              </p>
            </div>

            <div className="space-y-4 mb-10 flex-1 relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#10b981] mb-2">
                {copy.proIncludes}
              </div>
              {copy.proFeatures.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 text-sm text-neutral-300">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check
                      size={10}
                      className="text-emerald-500"
                      strokeWidth={3}
                    />
                  </div>
                  <span
                    className={
                      i === 0 || i === 1 || i === 2
                        ? "font-semibold text-white/90"
                        : ""
                    }>
                    {f}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative z-10">
              <Link
                href="/waitlist"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-black hover:bg-neutral-200 transition-all active:scale-[0.98]">
                {copy.proCta} <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* TIER 3: ENTERPRISE */}
          <div className="relative p-8 rounded-3xl transition-all duration-300 bg-white/[0.01] border border-white/5 hover:border-white/10 flex flex-col group overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="mb-8 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500/80">
                  <Building2 size={18} fill="currentColor" />
                </span>
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-500/80">
                  Enterprise
                </h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-white tracking-tighter tabular-nums">
                  {copy.enterprisePrice}
                </span>
              </div>
              <p className="text-neutral-400 font-medium text-sm">
                {copy.enterpriseDescription}
              </p>
            </div>

            <div className="space-y-4 mb-10 flex-1 relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 mb-2">
                {copy.enterpriseIncludes}
              </div>
              {[
                <span
                  key="1"
                  className="flex items-center gap-2 break-all group relative cursor-help">
                  {locale === "es" ? "IA Ilimitada*" : "Unlimited AI*"}
                  <Info size={14} className="text-white/40" />
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                    {copy.fairUse}
                  </div>
                </span>,
                ...copy.enterpriseFeatures,
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 text-sm text-neutral-300">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-amber-500/5 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Check
                      size={10}
                      className="text-amber-500/80"
                      strokeWidth={3}
                    />
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="relative z-10">
              <a
                href="mailto:ventas@noctra.studio?subject=Consulta%20Plan%20Enterprise"
                className="w-full relative flex items-center justify-center gap-2 py-4 rounded-xl bg-black border border-white/10 text-white font-bold hover:bg-white/5 transition-all active:scale-[0.98] group/btn overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                {copy.contactSales}{" "}
                <ArrowRight
                  size={16}
                  className="text-white/40 group-hover/btn:text-white"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
