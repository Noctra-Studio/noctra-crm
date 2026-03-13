"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const MIN_PASSWORD_LENGTH = 6;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("forge.auth");
  const [supabase] = useState(() => createClient());

  const isResetMode = searchParams.get("mode") === "reset";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(isResetMode);
  const [status, setStatus] = useState<"idle" | "email-sent" | "password-updated">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    if (!isResetMode) {
      setIsCheckingSession(false);
      setHasRecoverySession(false);
      return;
    }

    let isMounted = true;

    const checkSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (sessionError) {
        setError(t("forgot_password_reset_session_error"));
        setHasRecoverySession(false);
        setIsCheckingSession(false);
        return;
      }

      setHasRecoverySession(Boolean(session));
      setError(
        session
          ? null
          : t("forgot_password_reset_session_missing"),
      );
      setIsCheckingSession(false);
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [isResetMode, supabase, t]);

  const handleRequestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const nextPath = `/${locale}/forgot-password?mode=reset`;
      const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo },
      );

      if (resetError) {
        throw resetError;
      }

      setStatus("email-sent");
      setFeedback(t("forgot_password_email_sent", { email }));
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : t("forgot_password_request_failed_generic");
      setError(t("forgot_password_request_failed", { detail: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("forgot_password_new_password_min"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("forgot_password_password_mismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setStatus("password-updated");
      setFeedback(t("forgot_password_password_updated"));
    } catch (updatePasswordError) {
      const message =
        updatePasswordError instanceof Error
          ? updatePasswordError.message
          : t("forgot_password_request_failed_generic");
      setError(t("forgot_password_update_failed", { detail: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessCard = status === "email-sent" || status === "password-updated";

  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mobile-safe-x relative isolate flex min-h-dvh items-center justify-center overflow-hidden py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.04),_transparent_40%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

        <div className="relative z-10 w-full max-w-md min-w-0 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-3 text-sm font-medium text-neutral-400 transition-colors hover:text-white">
            <ArrowLeft size={16} />
            {t("forgot_password_back_to_login")}
          </Link>

          <div className="mb-8">
            <BrandLogo className="mb-6 h-10 w-10 text-white" />
            <h1 className="text-3xl font-bold tracking-tight">
              {isResetMode
                ? t("forgot_password_reset_title")
                : t("forgot_password_title")}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              {isResetMode
                ? t("forgot_password_reset_description")
                : t("forgot_password_description")}
            </p>
          </div>

          {showSuccessCard ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="mb-4 flex items-center gap-3 text-emerald-300">
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold">
                  {status === "email-sent"
                    ? t("forgot_password_email_sent_title")
                    : t("forgot_password_password_updated_title")}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-emerald-100/90">
                {feedback}
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-neutral-200">
                  {t("forgot_password_back_to_login")}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : isResetMode ? (
            <>
              {isCheckingSession ? (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-neutral-300">
                  <Loader2 size={16} className="animate-spin" />
                  {t("forgot_password_validating_session")}
                </div>
              ) : hasRecoverySession ? (
                <form className="space-y-5" onSubmit={handleUpdatePassword} noValidate>
                  {error ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label
                      htmlFor="new-password"
                      className="block text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-500">
                      {t("forgot_password_new_password_label")}
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/20"
                      placeholder={t("forgot_password_new_password_placeholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="block text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-500">
                      {t("forgot_password_confirm_password_label")}
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/20"
                      placeholder={t("forgot_password_confirm_password_placeholder")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !password || !confirmPassword}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60">
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        {t("forgot_password_reset_button")}
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start gap-3 text-sm text-neutral-300">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-300" />
                    <span>{error ?? t("forgot_password_reset_session_missing")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.replace("/forgot-password")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-neutral-300">
                    {t("forgot_password_request_new_link")}
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <form className="space-y-5" onSubmit={handleRequestReset} noValidate>
              {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-bold uppercase tracking-[0.24em] text-neutral-500">
                  {t("email_label")}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/20"
                  placeholder={t("email_placeholder")}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {t("forgot_password_send_button")}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <p className="text-sm leading-relaxed text-neutral-500">
                {t("forgot_password_help_text")}
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
