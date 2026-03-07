"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import {
  X,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Type,
  ArrowRight,
  Loader2,
  Key,
  AlertTriangle,
} from "lucide-react";

interface ConfiguracionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  is2FAEnabled: boolean | null;
}

export function ConfiguracionesModal({
  isOpen,
  onClose,
  is2FAEnabled,
}: ConfiguracionesModalProps) {
  const t = useTranslations("forge.configuraciones");
  const tCommon = useTranslations("forge.common");
  const router = useRouter();
  const pathname = usePathname();

  const [currentLang, setCurrentLang] = useState(
    pathname.startsWith("/en") ? "en" : "es",
  );

  const handleLanguageToggle = (lang: "es" | "en") => {
    if (lang === currentLang) return;
    setCurrentLang(lang);
    router.replace(pathname, { locale: lang });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-xl overflow-hidden rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-500" />
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
        <div className="p-0 overflow-y-auto forge-scroll flex-1">
          {/* Preferences Section */}
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-mono uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
              <Type className="w-4 h-4" />
              {t("preferencias")}
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("idioma")}</p>
                <p className="text-xs text-white/40">English / Español</p>
              </div>
              <div className="flex bg-neutral-900 border border-white/10 rounded-md p-1">
                <button
                  onClick={() => handleLanguageToggle("es")}
                  className={`px-4 py-1.5 text-xs font-mono uppercase tracking-widest rounded-sm transition-colors ${currentLang === "es" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"}`}>
                  ES
                </button>
                <button
                  onClick={() => handleLanguageToggle("en")}
                  className={`px-4 py-1.5 text-xs font-mono uppercase tracking-widest rounded-sm transition-colors ${currentLang === "en" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"}`}>
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-mono uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
              <Key className="w-4 h-4" />
              {t("seguridad")}
            </h3>

            <div className="space-y-6">
              {/* Password */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("contrasena")}</p>
                  <p className="text-xs text-white/40">{t("ultimaContra")}</p>
                </div>
                <button className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/20 px-4 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-md">
                  {t("cambiarContrasena")}
                </button>
              </div>

              {/* 2FA */}
              <div className="flex items-start justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{t("dosFactores")}</p>
                    {is2FAEnabled ? (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {t("activado")}
                      </span>
                    ) : (
                      <span className="text-[9px] bg-yellow-500/20 text-yellow-500 font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border border-yellow-500/20 flex items-center gap-1">
                        {t("noActivado")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed max-w-sm">
                    {t("descripcion2fa")}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    router.push("/settings/security");
                  }}
                  className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-black font-bold transition-colors border px-4 py-2 bg-white hover:bg-neutral-200 rounded-md flex items-center gap-2">
                  {is2FAEnabled ? t("gestionar2fa") : t("activar2fa")}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-red-500 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t("zonaPeligro")}
            </h3>

            <div className="flex items-center justify-between border border-red-500/20 bg-red-500/5 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">
                  {t("eliminarCuenta")}
                </p>
                <p className="text-xs text-red-400">
                  {t("eliminarAdvertencia")}
                </p>
              </div>
              <button className="text-[10px] font-mono uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors border border-red-500/20 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-md">
                {t("eliminarCuenta")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
