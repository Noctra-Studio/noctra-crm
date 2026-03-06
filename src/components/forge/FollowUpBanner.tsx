"use client";

import {
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  EyeOff,
} from "lucide-react";
import { FollowUpSuggestion, markAsContacted } from "@/app/actions/followup";
import { useState } from "react";

interface FollowUpBannerProps {
  suggestion: FollowUpSuggestion;
  onOpenModal: (suggestion: FollowUpSuggestion) => void;
  onDismiss: (id: string, permanent: boolean) => void;
  onActionComplete: () => void;
}

export function FollowUpBanner({
  suggestion,
  onOpenModal,
  onDismiss,
  onActionComplete,
}: FollowUpBannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMarkContacted = async () => {
    setIsProcessing(true);
    try {
      const result = await markAsContacted(suggestion);
      if (result.success) {
        onDismiss(suggestion.id, false); // Local dismissal for 3 days (handled by parent logic)
        onActionComplete();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black">
            Sugerencia de Seguimiento
          </p>
          <p className="text-sm font-bold text-white tracking-tight">
            {suggestion.label}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={() => onOpenModal(suggestion)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95">
          <MessageSquare className="w-3.5 h-3.5" />
          Ver mensaje
        </button>

        <button
          onClick={handleMarkContacted}
          disabled={isProcessing}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          Ya contacté
        </button>

        <button
          onClick={() => onDismiss(suggestion.id, true)}
          className="p-2 hover:bg-white/5 text-neutral-500 hover:text-white transition-colors"
          title="Ignorar permanentemente">
          <EyeOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
