"use client";

import { useTranslations } from "next-intl";
import {
  X,
  CreditCard,
  Zap,
  Infinity,
  ArrowRight,
  ExternalLink,
  Loader2,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useBillingData } from "@/hooks/useBillingData";
import { useState } from "react";
import { TokenInfoTooltip } from "../TokenInfoTooltip";

interface SuscripcionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuscripcionModal({ isOpen, onClose }: SuscripcionModalProps) {
  const { workspace, subscription, loading } = useBillingData();
  const [actionLoading, setActionLoading] = useState(false);
  const [view, setView] = useState<"status" | "topup">("status");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPro = workspace?.tier === "pro" || subscription;
  const isUnlimited = workspace?.is_ai_unlimited;
  const credits = workspace?.ai_credits_balance || 0;
  // Dynamic max capacity logic similar to billing page
  const maxCredits = isPro ? 50000 : 1000;
  const progressPercent = Math.min((credits / maxCredits) * 100, 100);

  const packs = [
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
  ];

  const handleTopUp = async (amount: number, priceId?: string) => {
    if (!workspace) return;
    if (!priceId) {
      setErrorMsg(
        "Falta configurar el Price ID de Stripe en tu archivo .env.local",
      );
      return;
    }
    try {
      setErrorMsg(null);
      setActionLoading(true);
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

      if (!response.ok) {
        const txt = await response.text();
        throw new Error("Error iniciando checkout: " + txt);
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
      setActionLoading(false);
    }
  };

  const manageBilling = async () => {
    if (!workspace) return;
    try {
      setErrorMsg(null);
      setActionLoading(true);
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });

      if (!response.ok) throw new Error("Error opening portal");
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      setErrorMsg("Hubo un error al abrir el portal.");
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setView("status");
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Backdrop clickable to close */}
      <div className="absolute inset-0" onClick={closeModal} />

      {/* Modal Content */}
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative z-10 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {view === "topup" ? (
              <button
                onClick={() => setView("status")}
                className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-emerald-500" />
              </div>
            )}
            <span className="font-bold text-white tracking-tight">
              {view === "topup" ? "Recargar Créditos" : "Mi Suscripción"}
            </span>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 relative max-h-[75vh] overflow-y-auto forge-scroll">
          {(loading || actionLoading) && (
            <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-b-2xl">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{errorMsg}</p>
            </div>
          )}

          {view === "status" && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Status Card */}
              <div className="border border-white/10 bg-white/[0.02] rounded-xl p-5 mb-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[50px] pointer-events-none" />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-[10px] uppercase tracking-widest text-emerald-500 mb-1 font-bold">
                      Plan Actual
                    </h2>
                    <h3 className="text-xl font-bold text-white">
                      {workspace?.tier === "enterprise"
                        ? "Forge Enterprise"
                        : isPro
                          ? "Forge Standard"
                          : "Free Trial"}
                    </h3>
                  </div>
                  {workspace?.tier === "enterprise" && (
                    <span className="bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Infinity className="w-3 h-3" /> Fair Use
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-orange-500 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> IA Tokens
                      <TokenInfoTooltip />
                    </span>
                    <span className="text-xs font-mono text-white">
                      {isUnlimited
                        ? "Ilimitados"
                        : `${credits.toLocaleString()} / ${maxCredits.toLocaleString()}`}
                    </span>
                  </div>

                  {!isUnlimited && (
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressPercent < 20 ? "bg-red-500" : "bg-gradient-to-r from-orange-600 to-amber-500"}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setView("topup")}
                  disabled={loading || actionLoading}
                  className="flex flex-col items-center justify-center gap-2 bg-emerald-500 text-black rounded-xl p-4 hover:bg-emerald-400 transition-all font-bold active:scale-95 disabled:opacity-50">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm">Recargar Créditos</span>
                </button>
                <button
                  onClick={manageBilling}
                  disabled={loading || actionLoading}
                  className="flex flex-col items-center justify-center gap-2 bg-white/5 border border-white/10 text-white rounded-xl p-4 hover:bg-white/10 transition-all font-bold active:scale-95 disabled:opacity-50">
                  <ExternalLink className="w-5 h-5 text-neutral-400" />
                  <span className="text-sm">Gestionar Plan</span>
                </button>
              </div>

              {/* Footer Link */}
              <div className="flex justify-center border-t border-white/5 pt-5">
                <Link
                  href="/forge/settings/billing"
                  onClick={closeModal}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium">
                  Ver historial de facturación completo{" "}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {view === "topup" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
              <p className="text-sm text-neutral-400 mb-2">
                Selecciona un paquete para añadir tokens adicionales a tu
                balance mensual. No tienen fecha de caducidad.
              </p>

              <div className="grid grid-cols-1 gap-3">
                {packs.map((pack, idx) => (
                  <div
                    key={idx}
                    className={`relative bg-white/[0.02] border ${pack.popular ? "border-orange-500/50" : "border-white/5"} rounded-xl p-4 flex items-center justify-between`}>
                    {pack.popular && (
                      <div className="absolute -top-2 left-4 bg-orange-500 text-black text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                        Más Popular
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {pack.label}
                      </h4>
                      <div className="text-sm text-neutral-500 mt-0.5">
                        Pago único
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                        {pack.price}
                      </div>
                      <button
                        onClick={() => handleTopUp(pack.amount, pack.priceId)}
                        disabled={loading || actionLoading}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] ${pack.popular ? "bg-orange-500 hover:bg-orange-400 text-black" : "bg-white/10 hover:bg-white/20 text-white"}`}>
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
