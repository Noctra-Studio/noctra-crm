"use client";

import React from "react";
import {
  Check,
  ArrowRight,
  Sparkles,
  Building2,
  User,
  Phone,
  Briefcase,
  Zap,
  Info,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const PricingWithROI = () => {
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
            Planes y Precios
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            No es un gasto, <br className="hidden md:block" /> es una inversión
            en tu crecimiento.
          </h2>
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Consolida tus herramientas y escala sin límites. Planes diseñados
            para el tamaño exacto de tu operación.
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
                  /usuario/mes
                </span>
              </div>
              <p className="text-neutral-400 font-medium text-sm">
                Para Freelancers y Solopreneurs gestionando sus operaciones.
              </p>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {[
                "CRM Básico & Pipeline de Ventas",
                "Gestión de Proyectos",
                "50,000 Créditos IA / mes",
                "Soporte vía Email",
                "Integración con pagos (Stripe)",
              ].map((f, i) => (
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
              href={{
                pathname: "/forge/login",
                query: { mode: "signup", plan: "starter" },
              }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all active:scale-[0.98]">
              Empezar Gratis
            </Link>
          </div>

          {/* TIER 2: PRO (HIGHLIGHTED) */}
          <div className="relative p-8 rounded-3xl transition-all duration-300 bg-[#050505] border-2 border-[#10b981]/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col md:-mt-4 md:mb-4 group overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#10b981] text-black text-[10px] uppercase font-black px-4 py-1 rounded-b-xl tracking-widest shadow-lg z-10">
              Más Popular
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
                  /usuario/mes
                </span>
              </div>
              <p className="text-neutral-400 font-medium text-sm">
                Para Agencias y Equipos en Crecimiento. La suite completa.
              </p>
            </div>

            <div className="space-y-4 mb-10 flex-1 relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#10b981] mb-2">
                Todo en Starter, más:
              </div>
              {[
                "200,000 Créditos IA / mes",
                "Integración WhatsApp Nativa",
                "Firmas Digitales Ilimitadas (Noctra Sign)",
                "Portales de Cliente (Clase Mundial)",
                "Soporte Prioritario",
              ].map((f, i) => (
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
                href={{
                  pathname: "/forge/login",
                  query: { mode: "signup", plan: "pro", trial: "true" },
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-black hover:bg-neutral-200 transition-all active:scale-[0.98]">
                Probar 14 días <ArrowRight size={18} />
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
                  Custom
                </span>
              </div>
              <p className="text-neutral-400 font-medium text-sm">
                Para Organizaciones y Corporativos que escalan masivamente.
              </p>
            </div>

            <div className="space-y-4 mb-10 flex-1 relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 mb-2">
                Todo en Pro, más:
              </div>
              {[
                <span
                  key="1"
                  className="flex items-center gap-2 break-all group relative cursor-help">
                  IA Ilimitada*
                  <Info size={14} className="text-white/40" />
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                    Sujeto a Política de Uso Justo (Fair Use Policy) para
                    prevenir explotación automatizada por bots.
                  </div>
                </span>,
                "Entrenamiento de Modelos Custom",
                "SSO (SAML/Okta) & Audit Logs",
                "Opción On-Premise",
                "Soporte Dedicado / Slack Connect",
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
                Contactar Ventas{" "}
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
