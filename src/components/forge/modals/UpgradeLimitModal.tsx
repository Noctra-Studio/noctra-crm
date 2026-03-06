"use client";

import { X, Sparkles, Building2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface UpgradeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function UpgradeLimitModal({
  isOpen,
  onClose,
  title = "Límite del Trial Gratuito",
  description = "Has llegado al límite de 3 propuestas gratuitas. Agrega un método de pago y desbloquea funciones ilimitadas.",
}: UpgradeLimitModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center px-4 sm:px-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Upgrade Requerido
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 relative z-10 space-y-4">
          <h4 className="text-lg font-bold text-white leading-tight">
            {title}
          </h4>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {description}
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-6">
            <h5 className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mb-3">
              Beneficios Pro
            </h5>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                Propuestas Ilimitadas
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                Integración con WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                Portales de Cliente
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 relative z-10 mt-2">
          <Link
            href="/forge/settings/billing"
            className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95"
            onClick={onClose}>
            Actualizar Suscripción <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm text-neutral-500 hover:text-white transition-colors">
            Cerrar, continuaré después
          </button>
        </div>
      </div>
    </div>
  );
}
