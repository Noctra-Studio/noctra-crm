"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Loader2,
  Zap,
  CreditCard,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { CreditSystemExplainer } from "./CreditSystemExplainer";
// Sonner removed in favor of local toast

import { useBillingData } from "@/hooks/useBillingData";
import { TokenInfoTooltip } from "@/components/forge/TokenInfoTooltip";

export default function BillingSettingsPage() {
  const { workspace, subscription, loading } = useBillingData();
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubscribe = async () => {
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID, // Use actual Price ID from env
          mode: "subscription",
          workspaceId: workspace.id,
        }),
      });

      if (!response.ok) throw new Error("Error initiating checkout");
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      setToast({ message: "Hubo un error.", type: "error" });
    }
  };

  const handleTopUp = async (amount: number, priceId: string) => {
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: priceId,
          mode: "payment",
          workspaceId: workspace.id,
          creditAmount: amount,
        }),
      });

      if (!response.ok) throw new Error("Error initiating topup");
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      setToast({ message: "Hubo un error.", type: "error" });
    }
  };

  const manageBilling = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });

      if (!response.ok) throw new Error("Error opening portal");
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      setToast({ message: "Hubo un error al abrir el portal.", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  const isPro = workspace?.tier === "pro" || subscription;
  const credits = workspace?.ai_credits_balance || 0;
  // A hypothetical max for visual progress mapping if standard/pro logic differs
  const maxCredits = isPro ? 50000 : 1000;
  const progressPercent = Math.min((credits / maxCredits) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-10">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-none border text-sm font-mono tracking-widest uppercase transition-all ${toast.type === "success" ? "bg-black border-emerald-500/50 text-emerald-400" : "bg-black border-red-500/50 text-red-400"}`}>
          {toast.message}
        </div>
      )}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Facturación & Planes
        </h1>
        <p className="text-neutral-400">
          Administra tu suscripción a Noctra Forge y créditos de IA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CURRENT PLAN CARD */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] pointer-events-none" />
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-emerald-500 mb-1 font-bold">
                Plan Actual
              </h2>
              <h3 className="text-2xl font-bold text-white">
                {isPro ? "Forge Pro" : "Free Trial"}
              </h3>
            </div>
            {isPro && (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                Activo
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-400 mb-8 max-w-[80%]">
            {isPro
              ? "Tienes acceso completo a CRM, Gestión de Proyectos ilimitada y Profitability AI."
              : "Tu prueba de 14 días expirará pronto. Actualiza hoy para no perder acceso."}
          </p>

          <button
            onClick={isPro ? manageBilling : handleSubscribe}
            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white rounded-xl py-3 text-sm font-semibold hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]">
            <CreditCard className="w-4 h-4" />
            {isPro ? "Gestionar en Stripe" : "Actualizar a Pro - $29/mo"}
            {isPro && <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-50" />}
          </button>
        </div>

        {/* AI CREDITS CARD */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-[10px] uppercase tracking-widest text-orange-500 mb-1 font-bold">
                  Consumo de IA
                </h2>
                <h3 className="text-2xl font-bold text-white flex items-center">
                  Noctra AI Tokens
                  <TokenInfoTooltip />
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Zap className="text-orange-500 w-5 h-5" />
              </div>
            </div>

            <div className="mb-2 flex justify-between items-end">
              <span className="text-3xl font-mono text-white tracking-tighter">
                {credits.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 mb-1">
                /{" "}
                {workspace?.is_ai_unlimited ? "∞" : maxCredits.toLocaleString()}{" "}
                restantes
              </span>
            </div>

            {!workspace?.is_ai_unlimited && (
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full ${progressPercent < 20 ? "bg-red-500" : "bg-gradient-to-r from-orange-600 to-amber-500"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
            <p className="text-xs text-neutral-500">
              Usados para generar análisis predictivo de margen y autocompletar
              propuestas.
            </p>
          </div>
        </div>
      </div>

      {/* TOP UP SECTION */}
      <div className="pt-8 border-t border-white/5 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">Recargar Tokens AI</h3>
          <p className="text-sm text-neutral-400">
            Los tokens comprados nunca expiran y se consumen primero.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              amount: 50000,
              label: "50k Tokens",
              price: "$5",
              priceId: process.env.NEXT_PUBLIC_STRIPE_TOKEN_50K,
            },
            {
              amount: 200000,
              label: "200k Tokens",
              price: "$15",
              priceId: process.env.NEXT_PUBLIC_STRIPE_TOKEN_200K,
              popular: true,
            },
            {
              amount: 1000000,
              label: "1M Tokens",
              price: "$50",
              priceId: process.env.NEXT_PUBLIC_STRIPE_TOKEN_1M,
            },
          ].map((pack, idx) => (
            <div
              key={idx}
              className={`relative bg-white/[0.02] border ${pack.popular ? "border-orange-500/50 hover:border-orange-500" : "border-white/5 hover:border-white/20"} rounded-2xl p-5 transition-all text-center flex flex-col justify-between h-48`}>
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                  Más Popular
                </div>
              )}
              <div className="mt-2">
                <h4 className="text-lg font-bold text-white mb-1">
                  {pack.label}
                </h4>
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                  {pack.price}
                </div>
              </div>

              <button
                onClick={() => handleTopUp(pack.amount, pack.priceId!)}
                disabled={!pack.priceId}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] mt-4 ${pack.popular ? "bg-orange-500 hover:bg-orange-400 text-black" : "bg-white/10 hover:bg-white/20 text-white"}`}>
                Comprar
              </button>
            </div>
          ))}
        </div>
      </div>

      <CreditSystemExplainer />
    </div>
  );
}
