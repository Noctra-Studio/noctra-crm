"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Check } from "lucide-react";

export function AcceptButton({ proposalId }: { proposalId: string }) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const supabase = createClient();

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from("proposals")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", proposalId);

      if (error) throw error;
      setIsAccepted(true);
    } catch (err) {
      console.error("Error accepting proposal:", err);
      alert("Error al aceptar la propuesta. Por favor intente de nuevo.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isAccepted) {
    return (
      <div className="flex items-center gap-2 px-6 py-2 bg-emerald-500/10 text-emerald-600 text-[11px] font-black uppercase tracking-widest border border-emerald-500/20">
        <Check className="w-3.5 h-3.5" /> Propuesta Aceptada
      </div>
    );
  }

  return (
    <button
      onClick={handleAccept}
      disabled={isAccepting}
      className="bg-emerald-600 text-white px-6 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
      {isAccepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
      Aceptar Propuesta
    </button>
  );
}
