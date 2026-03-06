"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Key,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";

export default function SecuritySettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollStep, setEnrollStep] = useState(1); // 1: QR, 2: Verify
  const [enrollData, setEnrollData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchFactors();
  }, []);

  const fetchFactors = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data) {
      setFactors(data.totp || []);
    }
    setLoading(false);
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startEnrollment = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Noctra Forge",
      });

      if (error) throw error;

      setEnrollData(data);
      const url = await QRCode.toDataURL(data.totp.qr_code);
      setQrCodeUrl(url);
      setIsEnrolling(true);
      setEnrollStep(1);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyEnrollment = async () => {
    if (verifyCode.length !== 6) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollData.id,
        code: verifyCode,
      });

      if (error) throw error;

      showToast("Autenticación de dos factores activada correctamente");
      setIsEnrolling(false);
      fetchFactors();
    } catch (err: any) {
      showToast("Código incorrecto. Intenta de nuevo.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const unenrollFactor = async (factorId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que deseas desactivar la autenticación de dos factores? Tu cuenta será menos segura.",
      )
    )
      return;

    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      showToast("2FA desactivado");
      fetchFactors();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const isEnrolled = factors.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neutral-800 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-xl mx-auto space-y-12">
        {/* HEADER */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h1 className="text-sm font-mono uppercase tracking-[0.2em] text-neutral-300">
              Seguridad
            </h1>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Autenticación de dos factores
          </h2>
        </div>

        {/* STATUS CARD */}
        <div
          className={`p-8 border ${isEnrolled ? "border-emerald-500/20 bg-emerald-500/5" : "border-neutral-900 bg-neutral-900/20"} space-y-6 relative overflow-hidden`}>
          <div className="flex items-start justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isEnrolled ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-xs font-mono uppercase tracking-widest ${isEnrolled ? "text-emerald-400" : "text-red-400"}`}>
                  {isEnrolled ? "Activada" : "Desactivada"}
                </span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {isEnrolled
                  ? "Tu cuenta está protegida con un segundo paso de verificación. Se te pedirá un código de tu app de autenticación cada vez que inicies sesión."
                  : "Añade una capa extra de seguridad a tu cuenta. Al activar 2FA, se requerirá un código generado por tu teléfono para acceder al Forge."}
              </p>
            </div>
          </div>

          {!isEnrolled ? (
            <button
              onClick={startEnrollment}
              disabled={isProcessing}
              className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-3.5 h-3.5" />
              )}
              Activar 2FA
            </button>
          ) : (
            <div className="pt-4 border-t border-emerald-500/10 flex flex-col gap-4">
              {factors.map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white">
                      {f.friendly_name}
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
                      Registrado el{" "}
                      {new Date(f.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => unenrollFactor(f.id)}
                    className="text-[9px] font-mono uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                    Desactivar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
          ← Volver
        </button>
      </div>

      {/* ENROLLMENT MODAL */}
      {isEnrolling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-900 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest">
                Configurar Authenticator
              </h3>
              <button
                onClick={() => {
                  setIsEnrolling(false);
                  // If we cancel early, Supabase enrollment stays in 'unverified' state
                  // but we want to clear it from our local state
                }}
                className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8 text-center">
              {enrollStep === 1 ? (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest leading-relaxed">
                      Escanea este código con tu app (Google Authenticator,
                      Authy, etc.)
                    </p>
                    <div className="bg-white p-4 inline-block">
                      <img
                        src={qrCodeUrl}
                        alt="2FA QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-600">
                      Código manual (si no puedes escanear)
                    </p>
                    <code className="block bg-neutral-900 p-2 text-emerald-400 text-xs font-mono break-all border border-neutral-800">
                      {enrollData.totp.secret}
                    </code>
                  </div>

                  <button
                    onClick={() => setEnrollStep(2)}
                    className="w-full py-4 bg-emerald-500 text-black font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                    Siguiente <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest leading-relaxed">
                      Ingresa el código de 6 dígitos que aparece en tu app
                    </p>
                    <input
                      type="text"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) =>
                        setVerifyCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="000000"
                      className="w-full bg-transparent border-b-2 border-neutral-800 text-center text-4xl font-mono tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition-colors uppercase py-4"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={verifyEnrollment}
                    disabled={verifyCode.length !== 6 || isProcessing}
                    className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Verificar y activar
                  </button>

                  <button
                    onClick={() => setEnrollStep(1)}
                    className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
                    ← Volver al código QR
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4">
          <div
            className={`px-6 py-3 border flex items-center gap-3 shadow-2xl ${toast.type === "success" ? "bg-emerald-500 text-black border-emerald-400" : "bg-red-500 text-white border-red-400"}`}>
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
