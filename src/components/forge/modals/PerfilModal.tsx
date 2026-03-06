"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, User, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface PerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerfilModal({ isOpen, onClose }: PerfilModalProps) {
  const t = useTranslations("forge.perfil");
  const tCommon = useTranslations("forge.common");
  const [displayName, setDisplayName] = useState("Manu");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    // Simulating save for now
    await new Promise((resolve) => setTimeout(resolve, 800));
    setToast({ message: tCommon("exito"), type: "success" });
    setIsSaving(false);
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md overflow-hidden rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-white/50">
              {t("titulo")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-md text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">
              {t("informacionPersonal")}
            </h3>

            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center overflow-hidden group">
                <span className="text-2xl font-bold text-white/30">M</span>
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <button className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  {t("cambiarFoto")}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/50">
                {t("nombreUsuario")}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                placeholder="Tu nombre"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#050505] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            {tCommon("cancelar")}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase tracking-widest rounded-md transition-all disabled:opacity-50">
            {isSaving ? tCommon("cargando") : t("guardar")}
          </button>
        </div>
      </div>

      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4">
          <div className="px-6 py-3 bg-emerald-500 text-black shadow-2xl rounded-full flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
