"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/ui/BrandLogo";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

function AuthForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const t = useTranslations("forge.auth");

  const modeParam = searchParams.get("mode");
  const plan = searchParams.get("plan");
  const isTrial = searchParams.get("trial") === "true";

  const [isLoginMode, setIsLoginMode] = useState(modeParam !== "signup");

  // Shared State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Signup Specific State
  const [fullName, setFullName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  // Login MFA Specific State
  const [showMFA, setShowMFA] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isVerifyingMFA, setIsVerifyingMFA] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Función auxiliar para verificar si se requiere MFA (Login)
  const checkMfaRequirement = async () => {
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.currentLevel === "aal1" && aal.nextLevel === "aal2") {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedFactors =
        factors?.totp.filter((f) => f.status === "verified") || [];
      if (verifiedFactors.length > 0) {
        setMfaFactorId(verifiedFactors[0].id);
        setShowMFA(true);
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const requiresMfa = await checkMfaRequirement();
          // If no MFA required, we could theoretically redirect, but keeping logic as was
        }
      } catch (err) {
        console.error("Session check error on login", err);
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) {
        if (loginError.message === "Invalid login credentials") {
          throw new Error(t("error_invalid_credentials"));
        }
        throw loginError;
      }

      const requiresMfa = await checkMfaRequirement();
      if (!requiresMfa) {
        sessionStorage.setItem("session_start", Date.now().toString());
        router.push("/forge");
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        t("error_login_failed", { detail: err.message || "Unknown error" }),
      );
      setLoading(false);
    }
  };

  const verifyOTP = async (code: string) => {
    if (!mfaFactorId) return;
    setIsVerifyingMFA(true);
    setMfaError(null);

    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: code,
      });

      if (error) throw error;

      sessionStorage.setItem("session_start", Date.now().toString());
      router.push("/forge");
    } catch (err: any) {
      console.error("MFA verification error", err);
      setMfaError(t("error_mfa_invalid_code"));
      setOtpCode(["", "", "", "", "", ""]);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      document.getElementById("otp-0")?.focus();
    } finally {
      setIsVerifyingMFA(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-verify if all 6 digits are entered
    if (index === 5 && value && newOtp.every((digit) => digit !== "")) {
      verifyOTP(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (otpCode.every((digit) => digit !== "")) {
        verifyOTP(otpCode.join(""));
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: signupError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              card_required_after_trial: true,
            },
          },
        },
      );

      if (signupError) throw signupError;

      const user = authData.user;
      if (!user) throw new Error("No se pudo crear el usuario");

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          name: workspaceName,
          slug: workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          owner_id: user.id,
          ai_credits_balance: 1000,
          subscription_status: "trialing",
          trial_ends_at: trialEndsAt.toISOString(),
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      const { error: linkError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner",
        });

      if (linkError) throw linkError;

      sessionStorage.setItem("session_start", Date.now().toString());
      router.push("/forge");
    } catch (err: any) {
      console.error(err);
      setError(
        t("error_signup_failed", { detail: err.message || "Unknown error" }),
      );
    } finally {
      setLoading(false);
    }
  };

  if (showMFA) {
    return (
      <div className="w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
        <div className="mb-10">
          <div className="w-10 h-10 bg-white/[0.03] border border-white/5 rounded-lg flex items-center justify-center mb-6 text-white/50">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
            {t("mfa_title")}
          </h2>
          <p className="text-sm text-neutral-500">{t("mfa_description")}</p>
        </div>

        <div className="relative">
          {mfaError && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500 text-xs font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={14} />
              {mfaError}
            </div>
          )}

          <div
            className={cn(
              "flex justify-between gap-2 mb-8",
              shake && "animate-shake",
            )}>
            {otpCode.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData
                    .getData("text")
                    .slice(0, 6)
                    .replace(/[^0-9]/g, "");
                  if (pastedData) {
                    const newOtp = [...otpCode];
                    for (let i = 0; i < pastedData.length; i++) {
                      newOtp[i] = pastedData[i];
                    }
                    setOtpCode(newOtp);
                    if (pastedData.length === 6) {
                      verifyOTP(newOtp.join(""));
                    } else {
                      document
                        .getElementById(`otp-${pastedData.length}`)
                        ?.focus();
                    }
                  }
                }}
                className={cn(
                  "w-12 h-14 bg-white/[0.02] border rounded-lg text-center text-xl font-bold text-white transition-all outline-none",
                  digit
                    ? "border-white/20 bg-white/[0.04]"
                    : "border-white/10 focus:border-white/20 focus:bg-white/[0.04]",
                  mfaError && "border-red-500/20 focus:border-red-500/20",
                )}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            onClick={() => verifyOTP(otpCode.join(""))}
            disabled={isVerifyingMFA || !otpCode.every((digit) => digit !== "")}
            className={cn(
              "w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all duration-300",
              otpCode.every((digit) => digit !== "")
                ? "bg-white text-black hover:bg-neutral-100"
                : "bg-white/5 text-white/20 cursor-not-allowed",
            )}>
            {isVerifyingMFA ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              t("mfa_button")
            )}
          </button>

          <div className="mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => {
                setShowMFA(false);
                setOtpCode(["", "", "", "", "", ""]);
                setMfaError(null);
                setLoading(false);
              }}
              className="text-sm font-bold text-neutral-500 hover:text-white transition-colors">
              {t("mfa_cancel")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 text-left">
        <Link href="/" className="inline-block group mb-8">
          <BrandLogo className="w-10 h-10 text-white group-hover:scale-105 transition-transform duration-300" />
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
          {isLoginMode ? t("signin_title") : t("signup_title")}
        </h1>
        <p className="text-sm text-neutral-500">
          {isLoginMode ? t("signin_description") : t("signup_description")}
        </p>
      </div>

      <div className="relative">
        <form
          onSubmit={isLoginMode ? handleLoginSubmit : handleSignupSubmit}
          className="space-y-6 w-full"
          noValidate>
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {!isLoginMode && (
            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 font-mono">
                  {t("full_name_label")}
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 bg-white/[0.02] border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700"
                    placeholder={t("full_name_placeholder")}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 font-mono">
                  {t("agency_name_label")}
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full h-11 bg-white/[0.02] border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700"
                    placeholder={t("agency_name_placeholder")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 font-mono">
                {t("email_label")}
              </label>
              <div className="relative group">
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-white/[0.02] border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700"
                  placeholder={t("email_placeholder")}
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                  {t("password_label")}
                </label>
                {isLoginMode && (
                  <button
                    type="button"
                    onClick={() => router.push("/forge/forgot-password")}
                    className="text-[10px] font-bold text-neutral-600 hover:text-white transition-colors uppercase tracking-widest font-mono">
                    {t("forgot_password")}
                  </button>
                )}
              </div>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isLoginMode ? "current-password" : "new-password"
                  }
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-white/[0.02] border border-white/10 rounded-lg pl-4 pr-12 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700"
                  placeholder={t("password_placeholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-600 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {!isLoginMode && (
                <p className="text-[10px] text-neutral-500 mt-2 px-1">
                  {t("password_hint")}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !email ||
              !password ||
              (!isLoginMode && (!fullName || !workspaceName))
            }
            className="w-full h-11 mt-4 bg-white hover:bg-neutral-100 text-black font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]">
            {loading ? (
              <Loader2 size={16} className="animate-spin text-black/50" />
            ) : (
              <>
                {isLoginMode ? t("login_button") : t("signup_button")}{" "}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-sm text-neutral-500 mb-4">
            {isLoginMode ? t("no_account") : t("have_account")}
          </p>
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-sm font-bold text-white hover:text-white/80 transition-colors">
            {isLoginMode ? t("register_now") : t("back_to_login")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForgeUnifiedAuthPage() {
  const t = useTranslations("forge.auth");
  return (
    <div className="min-h-screen bg-black flex w-full relative overflow-hidden">
      {/* LEFT PANEL - CINEMATIC IMAGE */}
      <div className="hidden lg:flex w-[50%] relative overflow-hidden flex-col items-center justify-center">
        <Image
          src="/images/login-client-portal.jpg"
          alt="Business Infrastructure"
          fill
          className="object-cover opacity-60 grayscale-[20%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black" />

        {/* Feature Highlights Grid */}
        <div className="absolute bottom-16 left-0 right-0 px-20 z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {[
              {
                title: t("feature_management_title"),
                desc: t("feature_management_desc"),
              },
              {
                title: t("feature_collaboration_title"),
                desc: t("feature_collaboration_desc"),
              },
              {
                title: t("feature_ai_title"),
                desc: t("feature_ai_desc"),
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-col gap-2 group hover:bg-white/[0.05] transition-all duration-500">
                <Check size={14} className="text-emerald-500/80" />
                <div>
                  <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1 font-mono">
                    {f.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - MINIMALIST FORM */}
      <div className="w-full lg:w-[50%] relative z-10 flex flex-col items-center justify-center p-6 md:p-12 bg-black">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </div>
          }>
          <AuthForms />
        </Suspense>
      </div>
    </div>
  );
}
