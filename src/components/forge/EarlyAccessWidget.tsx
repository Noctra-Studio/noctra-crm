"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function earlyAccessLimit() {
  return 20; // This should match lib/subscriptions
}

export function EarlyAccessWidget() {
  const [activeCount, setActiveCount] = useState<number | null>(null);

  useEffect(() => {
    // We fetch the count from a new or existing api endpoint.
    // For simplicity, let's create a quick API route or Server Action to get this count safely.
    // Instead of building a complex route just for this int, let's assume we have `/api/forge/stats`
    // Or we can just use a Server Action if we define it. For now, doing a standard fetch.
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/forge/early-access-count");
        if (res.ok) {
          const data = await res.json();
          setActiveCount(data.count);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCount();
  }, []);

  if (activeCount === null) {
    return (
      <div className="w-full bg-[#050505] border border-white/5 rounded-2xl p-6 flex justify-center items-center h-32 animate-pulse">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const limit = earlyAccessLimit();
  const seatsLeft = Math.max(0, limit - activeCount);
  const progressPercentage = Math.min(100, (activeCount / limit) * 100);

  if (seatsLeft === 0) return null; // Offer ended

  return (
    <div className="relative overflow-hidden w-full bg-gradient-to-r from-emerald-500/10 via-[#0A0A0A] to-[#0A0A0A] border border-emerald-500/20 rounded-2xl p-6 shadow-xl group">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Texts */}
        <div className="space-y-2 flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Oferta Early Access
          </div>
          <h3 className="text-xl font-bold text-white">
            Últimos {seatsLeft} lugares para beneficio vitalicio.
          </h3>
          <p className="text-sm text-neutral-400">
            Suscríbete ahora y bloquea tu precio con descuento de fundador de
            por vida. El cupón se aplica automáticamente en el checkout.
          </p>
        </div>

        {/* Progress and CTA */}
        <div className="w-full md:w-auto flex flex-col items-start md:items-end shrink-0 gap-4">
          <div className="w-full md:w-48 space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-500">{activeCount} Ocupados</span>
              <span className="text-neutral-500">{limit} Límite</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <Link
            href="/forge/settings/billing"
            className="w-full md:w-auto px-6 py-3 bg-emerald-500 text-black font-bold text-sm rounded-xl hover:bg-emerald-400 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-95">
            Asegurar mi lugar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
