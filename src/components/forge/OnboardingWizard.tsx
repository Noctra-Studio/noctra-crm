"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Check,
  Upload,
  ArrowRight,
  Loader2,
  Sparkles,
  Building2,
  PaintBucket,
} from "lucide-react";
import { completeOnboardingAction } from "@/app/actions/onboarding";
import { toast } from "sonner";
import Image from "next/image";

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 State
  const [primaryColor, setPrimaryColor] = useState("#10b981"); // Default Emerald
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Step 2 State
  const [folioPrefix, setFolioPrefix] = useState("NOC-");
  const [currency, setCurrency] = useState("MXN");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/svg+xml"].includes(file.type)) {
      toast.error("Por favor sube un archivo PNG o SVG");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("El logo no debe pesar más de 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await completeOnboardingAction({
        primaryColor,
        folioPrefix,
        currency,
        logoUrl: logoBase64 || undefined, // Send Base64 directly as logo_url for now if storage is not active
      });
      if (res.success) {
        toast.success("¡Bienvenido a Noctra Forge!");
        // The page layout revalidates, meaning `onboarding_completed: true` is fetched
        // We force a refresh to unmount this wizard
        window.location.reload();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al completar el Onboarding");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
        {/* Progress Bar Header */}
        <div className="flex h-1.5 w-full bg-white/5">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${(step / 3) * 100}%`,
              backgroundColor: primaryColor,
            }}
          />
        </div>

        <div className="p-8 md:p-12">
          {/* STEP 1: IDENTIDAD DE MARCA */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300 mb-4">
                  <PaintBucket className="w-3.5 h-3.5" />
                  Paso 1 de 3
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Identidad Visual
                </h2>
                <p className="text-neutral-400 text-sm">
                  Escoge el color de tu marca y sube tu logo. Esto personalizará
                  los portales de clientes y tus propuestas enviadas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <label className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">
                    Logo (PNG o SVG)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 transition-colors cursor-pointer bg-white/[0.02] relative group">
                    <input
                      type="file"
                      accept=".png,.svg"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    {logoBase64 ? (
                      <div className="relative w-full h-full p-4 flex items-center justify-center">
                        <img
                          src={logoBase64}
                          alt="Logo preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                          <span className="text-xs text-white">
                            Cambiar Logo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-neutral-500">
                        <Upload className="w-6 h-6" />
                        <span className="text-xs">Click para subir</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Color Picker */}
                <div className="space-y-4">
                  <label className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">
                    Color Primario
                  </label>
                  <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl flex justify-center">
                    <HexColorPicker
                      color={primaryColor}
                      onChange={setPrimaryColor}
                    />
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-mono text-neutral-400">
                      HEX:
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {primaryColor.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURACIÓN GLOBAL */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300 mb-4">
                  <Building2 className="w-3.5 h-3.5" />
                  Paso 2 de 3
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Operaciones Globales
                </h2>
                <p className="text-neutral-400 text-sm">
                  Define tu prefijo de facturación interno y la moneda principal
                  con la que operarás la mayor parte del tiempo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">
                    Prefijo de Folio
                  </label>
                  <input
                    type="text"
                    value={folioPrefix}
                    onChange={(e) =>
                      setFolioPrefix(e.target.value.toUpperCase())
                    }
                    className="w-full min-h-[44px] bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none transition-all duration-200"
                    placeholder="Ej. NOC-"
                    style={{
                      borderColor: folioPrefix ? primaryColor : undefined,
                    }}
                  />
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Próxima propuesta: {folioPrefix}P-0001
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase">
                    Moneda Predeterminada
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full min-h-[44px] bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none transition-all duration-200 appearance-none"
                    style={{ borderColor: primaryColor }}>
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="USD">Dólar Estadounidense (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BIENVENIDA Y VIDEO */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300 mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Configuración Lista
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Bienvenido a tu Centro de Mando
                </h2>
                <p className="text-neutral-400 text-sm">
                  Ya puedes comenzar a gestionar clientes y firmar propuestas.
                  Mientras tanto, mira esta guía de 2 minutos.
                </p>
              </div>

              {/* Video Placeholder */}
              <div className="w-full aspect-video bg-neutral-900 border border-white/10 rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                {/* Decorative background instead of real video */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at center, white 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform border border-white/20">
                    <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-2" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-sm font-bold text-white">
                    Guía Rápida: De Prospecto a Cliente
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    1:45 min • Curso Básico
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 p-6 flex items-center justify-between bg-black/40">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
            className={`text-sm font-medium transition-colors ${step === 1 ? "opacity-0 pointer-events-none" : "text-neutral-400 hover:text-white"}`}>
            Atrás
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              style={{ backgroundColor: primaryColor }}
              className="px-6 py-2.5 rounded-lg text-black font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              style={{ backgroundColor: primaryColor }}
              className="px-6 py-2.5 rounded-lg text-black font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Finalizar y Entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
