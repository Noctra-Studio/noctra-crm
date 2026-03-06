"use client";

import { Info } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function TokenInfoTooltip() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block ml-1.5 group">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
        aria-label="Información sobre tokens">
        <Info className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
      </button>

      <AnimatePresence>
        {show && (
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl z-50 pointer-events-none">
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">
                ¿Cómo funcionan tus tokens?
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                Se consumen por cada ciclo de interacción: el mensaje que envías
                (input) y la respuesta que recibes (output). Esto permite que la
                IA mantenga el contexto de tu conversación.
              </p>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-bold">
                  Equivalencia Visual:
                </p>
                <p className="text-[11px] text-neutral-300 font-semibold italic">
                  1,000 tokens ≈ 750 palabras o el equivalente a 5 correos de
                  seguimiento detallados.
                </p>
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-neutral-900" />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
