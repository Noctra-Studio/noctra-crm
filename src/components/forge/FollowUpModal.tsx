"use client";

import { useState, useEffect } from "react";
import { X, Copy, Send, Check } from "lucide-react";
import {
  FollowUpSuggestion,
  FollowUpTemplate,
  getFollowUpTemplates,
  sendFollowUpEmail,
} from "@/app/actions/followup";

interface FollowUpModalProps {
  suggestion: FollowUpSuggestion;
  onClose: () => void;
  onSent: () => void;
}

export function FollowUpModal({
  suggestion,
  onClose,
  onSent,
}: FollowUpModalProps) {
  const [template, setTemplate] = useState<FollowUpTemplate | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        const templates = await getFollowUpTemplates();
        const found = templates.find(
          (t) => t.type === suggestion.type && t.locale === suggestion.locale,
        );
        if (found) {
          setTemplate(found);
          setSubject(found.subject);
          // Replace [nombre] with clientName
          setBody(found.body.replace(/\[nombre\]/g, suggestion.clientName));
        }
      } catch (err) {
        console.error("Error loading templates:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplate();
  }, [suggestion]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Asunto: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await sendFollowUpEmail(suggestion, subject, body);
      if (result.success) {
        onSent();
        onClose();
      } else {
        alert("Error al enviar el correo. Revisa la consola.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white uppercase italic tracking-tight">
              Sugerencia de Seguimiento
            </h3>
            <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">
              {suggestion.label}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-12 text-center text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
              Cargando plantilla...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  Para
                </label>
                <div className="bg-white/[0.02] border border-white/5 px-4 py-2 text-sm text-neutral-300">
                  {suggestion.clientName} &lt;{suggestion.clientEmail}&gt;
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  Asunto
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  Mensaje
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors min-h-[200px] resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#080808] flex items-center justify-between gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copiado!" : "Copiar mensaje"}
          </button>

          <button
            onClick={handleSend}
            disabled={isSending || isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50">
            {isSending ? (
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSending ? "Enviando..." : "Enviar por correo"}
          </button>
        </div>
      </div>
    </div>
  );
}
