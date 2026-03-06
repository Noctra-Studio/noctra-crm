"use client";

import React, { useState } from "react";
import {
  Check,
  ArrowRight,
  Zap,
  Sparkles,
  MessageSquare,
  Shield,
  Globe,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const ForgePricing = ({
  userType = "pro",
}: {
  userType?: "pro" | "agency";
}) => {
  const t = useTranslations("forge.suscripcion");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [isEarlyAccess, setIsEarlyAccess] = useState(true);

  const plans = ["solo", "studio", "agency"];

  const getPrice = (planKey: string) => {
    const pricingData: Record<string, { monthly: number; annual: number }> = {
      solo: { monthly: 29, annual: 24 },
      studio: { monthly: 49, annual: 39 },
      agency: { monthly: 99, annual: 79 },
    };

    const price =
      billing === "monthly"
        ? pricingData[planKey].monthly
        : pricingData[planKey].annual;

    return `$${price}`;
  };

  return (
    <section
      id="pricing"
      className="py-20 md:py-32 px-6 border-t border-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#10b981] font-bold mb-4">
            {t("titulo")}
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Precios diseñados para <br className="hidden md:block" />{" "}
            {userType === "pro" ? "creativos" : "agencias"} de todos los
            tamaños.
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Escala tu infraestructura a medida que crece tu equipo.{" "}
            <br className="hidden sm:block" />
            Sin sorpresas, sin costos ocultos.
          </p>
        </div>

        {/* --- TOGGLES --- */}
        <div className="flex flex-col items-center gap-8 mb-16">
          {/* Billing Toggle */}
          <div className="flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                billing === "monthly"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/50 hover:text-white",
              )}>
              {t("billing.monthly")}
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all relative",
                billing === "annual"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/50 hover:text-white",
              )}>
              {t("billing.annual")}
              {billing !== "annual" && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                </span>
              )}
            </button>
          </div>

          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
            Precios en USD
          </p>

          {/* Early Access Highlight */}
          <div
            onClick={() => setIsEarlyAccess(!isEarlyAccess)}
            className={cn(
              "group cursor-pointer flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 max-w-xl",
              isEarlyAccess
                ? "bg-[#10b981]/10 border-[#10b981]/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                : "bg-white/[0.02] border-white/10 hover:border-white/20",
            )}>
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500",
                isEarlyAccess
                  ? "bg-[#10b981] text-black"
                  : "bg-white/10 text-white/40",
              )}>
              <Sparkles
                size={24}
                className={isEarlyAccess ? "animate-pulse" : ""}
                strokeWidth={1.5}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "text-xs font-black uppercase tracking-widest",
                    isEarlyAccess ? "text-[#10b981]" : "text-white/40",
                  )}>
                  {t("earlyAccess.badge")}
                </span>
                {isEarlyAccess && (
                  <span className="bg-[#10b981] text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                    Activo
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-sm leading-snug",
                  isEarlyAccess ? "text-white" : "text-white/40",
                )}>
                {t("earlyAccess.description")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isStudio = plan === "studio";
            const isAgency = plan === "agency";
            const isSolo = plan === "solo";

            return (
              <div
                key={plan}
                className={cn(
                  "relative flex flex-col rounded-3xl p-8 transition-all duration-500 overflow-hidden group",
                  isAgency
                    ? "bg-[#10b981]/[0.03] border-[#10b981]/30 border-2 lg:-translate-y-4 shadow-[0_20px_60px_rgba(16,185,129,0.1)]"
                    : "bg-white/[0.02] border border-white/10 hover:border-white/20",
                )}>
                {isAgency && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-[#10b981] text-black text-[10px] font-black uppercase tracking-widest py-1 px-10 rotate-45 translate-x-8 translate-y-4">
                      Popular
                    </div>
                  </div>
                )}

                <div className="mb-8 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={cn(
                        "text-xs font-black uppercase tracking-widest",
                        isStudio || isAgency
                          ? "text-[#10b981]"
                          : "text-white/40",
                      )}>
                      {isSolo ? "Solo" : isStudio ? "Studio" : "Agency"}
                    </h3>
                    {(isStudio || isAgency) && (
                      <span className="text-[9px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border border-[#10b981]/20">
                        Reemplaza 4 apps
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-white tracking-tight">
                      {getPrice(plan)}
                    </span>
                    <span className="text-white/30 text-xs font-medium">
                      {isSolo ? "/mes" : "/usuario/mes"}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {isSolo
                      ? "Para el Freelancer que no para."
                      : isStudio
                        ? "Para equipos con hambre."
                        : "Para casas creativas en escala."}
                  </p>
                </div>

                <div className="flex-1 space-y-4 mb-8 relative z-10">
                  {(isSolo
                    ? [
                        "1 Usuario (Tú)",
                        "Proyectos Ilimitados",
                        "CRM & Pipeline",
                        "Proposal Builder",
                        "Portal de Clientes",
                      ]
                    : isStudio
                      ? [
                          "Hasta 10 Usuarios",
                          "Todo en Solo",
                          "Haiku AI Integration",
                          "White-Labeling Básico",
                          "Webhooks & API",
                        ]
                      : [
                          "Usuarios Ilimitados",
                          "Todo en Studio",
                          "Noctra AI (Sonnet 3.5)",
                          "Métricas Financieras Avanzadas",
                          "Soporte Prioritario 24/7",
                        ]
                  ).map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-1 p-0.5 rounded-full shrink-0",
                          !isSolo ? "bg-[#10b981]/20" : "bg-white/10",
                        )}>
                        <Check
                          size={12}
                          className={cn(
                            !isSolo ? "text-[#10b981]" : "text-white/40",
                          )}
                          strokeWidth={1.5}
                        />
                      </div>
                      <span className="text-neutral-300 text-sm leading-snug">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {/* Soft Wall Specific Features */}
                  <div className="flex items-start gap-3 border-t border-white/5 pt-4 mt-2">
                    <div
                      className={cn(
                        "mt-1 p-0.5 rounded-full shrink-0",
                        !isSolo ? "bg-[#10b981]/20" : "bg-white/10",
                      )}>
                      <Check
                        size={12}
                        className={cn(
                          !isSolo ? "text-[#10b981]" : "text-white/40",
                        )}
                        strokeWidth={1.5}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs leading-snug font-medium",
                        isSolo ? "text-neutral-500 italic" : "text-[#10b981]",
                      )}>
                      {isSolo
                        ? 'Incluye marca de agua "Generado por Noctra CRM" en PDFs y dominio genérico noctra.studio/p/'
                        : "Marca de agua eliminada y soporte para Subdominio Personalizado (White-label)"}
                    </span>
                  </div>
                </div>

                <div className="relative z-10">
                  <Link
                    href={{
                      pathname: "/forge/login",
                      query: { mode: "signup", plan: "starter" },
                    }}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all",
                      isAgency
                        ? "bg-white text-black hover:bg-neutral-200"
                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10",
                    )}>
                    {isSolo ? "Empezar Gratis" : "Elegir Plan"}
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </Link>
                </div>

                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-16 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
            {billing === "annual"
              ? "Todos los planes anuales incluyen 2 meses gratis ya calculados en el precio"
              : "14 días de prueba gratuita en todos los planes. Sin tarjeta de crédito."}
          </p>
        </div>
      </div>
    </section>
  );
};
