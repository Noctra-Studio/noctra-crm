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
  Shield,
  Server,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";

const COMPARISON_COPY = {
  es: {
    rows: [
      ["Precio Base", "$9 / usuario", "$29 / usuario", "Custom Pricing"],
      ["Modelos AI", "GPT-4o-mini / Flash", "Claude 3.5 Sonnet + GPT-4o", "Custom + Router Privado"],
      ["Tokens Mensuales", "50k", "200k", "Ilimitados*"],
      ["WhatsApp", "Add-on ($)", "Incluido Nativo", "Incluido Nativo + API Access"],
      ["Firmas (e-Sign)", "5 / mes", "Ilimitadas (Noctra Sign)", "Ilimitadas (Advanced KYC)"],
      ["Storage", "10GB", "100GB", "1TB+"],
      ["Soporte", "Email", "Prioritario", "Slack Connect / Dedicado"],
      ["Seguridad", "Autenticación estándar", "2FA Incluido", "SSO (SAML/Okta) & Audit Logs"],
    ],
    fairUse:
      "Sujeto a Política de Uso Justo (Fair Use Policy) para prevenir explotación automatizada.",
    eyebrow: "Comparativa Detallada",
    title: "Todo lo que necesitas. Nada que no.",
    description:
      "Compara las capacidades exactas de cada plan y encuentra el ajuste perfecto para la escala de tu agencia.",
    recommended: "Recomendado",
    starterCta: "Empezar Starter",
    proCta: "Empezar Pro",
    enterpriseCta: "Contactar Ventas",
  },
  en: {
    rows: [
      ["Base Price", "$9 / user", "$29 / user", "Custom pricing"],
      ["AI Models", "GPT-4o-mini / Flash", "Claude 3.5 Sonnet + GPT-4o", "Custom + Private Router"],
      ["Monthly Tokens", "50k", "200k", "Unlimited*"],
      ["WhatsApp", "Add-on ($)", "Included natively", "Included natively + API access"],
      ["e-Signatures", "5 / mo", "Unlimited (Noctra Sign)", "Unlimited (Advanced KYC)"],
      ["Storage", "10GB", "100GB", "1TB+"],
      ["Support", "Email", "Priority", "Slack Connect / Dedicated"],
      ["Security", "Standard authentication", "2FA included", "SSO (SAML/Okta) & audit logs"],
    ],
    fairUse:
      "Subject to a Fair Use Policy to prevent automated abuse.",
    eyebrow: "Detailed Comparison",
    title: "Everything you need. Nothing you do not.",
    description:
      "Compare the exact capabilities of each plan and pick the right fit for your agency's scale.",
    recommended: "Recommended",
    starterCta: "Start Starter",
    proCta: "Start Pro",
    enterpriseCta: "Contact Sales",
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
        <span className="flex items-center gap-2 group relative cursor-help">
          <Zap size={16} className="text-amber-500/80 shrink-0" />
          {copy.rows[2][3]}
          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
            {copy.fairUse}
          </div>
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
    {
      category: copy.rows[5][0],
      starter: copy.rows[5][1],
      pro: copy.rows[5][2],
      enterprise: copy.rows[5][3],
    },
    {
      category: copy.rows[6][0],
      starter: copy.rows[6][1],
      pro: copy.rows[6][2],
      enterprise: (
        <span className="flex items-center gap-2">
          <Shield size={16} className="text-amber-500/80 shrink-0" />
          {copy.rows[6][3]}
        </span>
      ),
    },
    {
      category: copy.rows[7][0],
      starter: copy.rows[7][1],
      pro: copy.rows[7][2],
      enterprise: (
        <span className="flex items-center gap-2">
          <Server size={16} className="text-amber-500/80 shrink-0" />
          {copy.rows[7][3]}
        </span>
      ),
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
                  Starter
                </div>
                <div className="text-white text-3xl font-black tracking-tighter">
                  $9
                  <span className="text-sm font-medium text-neutral-400">
                    /mo
                  </span>
                </div>
              </div>

              {/* Pro Column Header (Highlight) */}
              <div className="p-8 relative border-b md:border-b-0 border-white/5 md:border-r flex flex-col items-center justify-center text-center bg-emerald-500/[0.03]">
                <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] uppercase font-black px-3 py-1 rounded-b-lg tracking-widest shadow-lg">
                  {copy.recommended}
                </div>
                <div className="text-emerald-500 font-bold uppercase tracking-widest text-xs mt-4 mb-2">
                  Forge Pro
                </div>
                <div className="text-white text-3xl font-black tracking-tighter">
                  $29
                  <span className="text-sm font-medium text-neutral-400">
                    /mo
                  </span>
                </div>
              </div>

              {/* Enterprise Column Header */}
              <div className="p-8 relative flex flex-col items-center justify-center text-center bg-white/[0.01]">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-600/50 to-amber-500/50" />
                <div className="text-white/90 font-bold uppercase tracking-widest text-xs mb-2 mt-4 flex items-center gap-2">
                  <Building2 size={14} className="text-amber-500/80" />{" "}
                  Enterprise
                </div>
                <div className="text-white text-2xl font-bold tracking-tighter">
                  Custom
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
                      Starter:
                    </span>
                    <span className="flex-1">{row.starter}</span>
                  </div>

                  {/* Pro */}
                  <div className="p-6 md:p-8 text-white font-medium text-sm flex items-center md:border-r border-white/5 bg-emerald-500/[0.01] border-b md:border-b-0">
                    <span className="md:hidden w-32 font-bold uppercase text-[10px] tracking-widest text-emerald-500 mt-0.5">
                      Pro:
                    </span>
                    <Check
                      size={16}
                      className="text-emerald-500 mr-2 shrink-0 hidden md:block"
                      strokeWidth={3}
                    />
                    <span className="flex-1">{row.pro}</span>
                  </div>

                  {/* Enterprise */}
                  <div className="p-6 md:p-8 text-white font-bold text-sm flex items-center bg-white/[0.01]">
                    <span className="md:hidden w-32 font-bold uppercase text-[10px] tracking-widest text-neutral-500 mt-0.5">
                      Enterprise:
                    </span>
                    <Sparkles
                      size={16}
                      className="text-amber-500/50 mr-2 shrink-0 hidden md:block"
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
                <Link
                  href={{
                    pathname: "/login",
                    query: { mode: "signup", plan: "starter" },
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/5 text-white/70 font-bold border border-white/10 text-sm hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]">
                  {copy.starterCta}
                </Link>
              </div>

              {/* Pro CTA */}
              <div className="p-6 md:p-8 border-b md:border-b-0 border-white/5 md:border-r flex items-center justify-center bg-emerald-500/[0.03]">
                <Link
                  href={{
                    pathname: "/login",
                    query: { mode: "signup", plan: "pro", trial: "true" },
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white text-black font-black text-sm hover:bg-neutral-200 transition-all active:scale-[0.98]">
                  {copy.proCta} <ArrowRight size={16} />
                </Link>
              </div>

              {/* Enterprise CTA */}
              <div className="p-6 md:p-8 flex items-center justify-center bg-white/[0.01]">
                <a
                href="mailto:ventas@noctra.studio?subject=Consulta%20Plan%20Enterprise"
                className="w-full relative flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#0a0a0a] border border-white/10 text-white font-bold text-sm hover:bg-white/5 hover:border-white/30 transition-all active:scale-[0.98] group/btn overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                  {copy.enterpriseCta}{" "}
                  <ArrowRight
                    size={16}
                    className="text-white/50 group-hover/btn:text-white"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
