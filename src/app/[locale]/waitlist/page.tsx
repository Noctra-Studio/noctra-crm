"use client";

import { type FormEvent, useState, useTransition } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocale } from "next-intl";
import { submitWaitlist } from "@/app/actions/forge";
import { Link } from "@/i18n/routing";

const WAITLIST_COPY = {
  es: {
    eyebrow: "Lista de espera",
    title: "Recibe noticias del lanzamiento de Noctra CRM",
    description:
      "Estamos construyendo Noctra CRM con una ventana estimada de lanzamiento entre finales de 2026 e inicios de 2027. Déjanos tu correo y te compartiremos actualizaciones del producto.",
    email: "Correo de trabajo",
    organization: "Empresa u organización",
    submit: "Unirme a la lista",
    submitting: "Enviando",
    successTitle: "Ya estás en la lista",
    successBody:
      "Te avisaremos cuando haya avances importantes y cuando Noctra CRM esté listo para abrir públicamente.",
    duplicate:
      "Ese correo ya está registrado en la lista. Te avisaremos cuando haya novedades.",
    error: "No pudimos registrar tu solicitud. Inténtalo de nuevo.",
    back: "Volver al inicio",
  },
  en: {
    eyebrow: "Waitlist",
    title: "Get updates on the Noctra CRM launch",
    description:
      "We are building Noctra CRM toward a planned launch window in late 2026 to early 2027. Leave your email and we will share product updates with you.",
    email: "Work email",
    organization: "Company or organization",
    submit: "Join the waitlist",
    submitting: "Submitting",
    successTitle: "You are on the list",
    successBody:
      "We will let you know when major milestones land and when Noctra CRM is ready to open publicly.",
    duplicate:
      "That email is already on the waitlist. We will keep you posted when there is news.",
    error: "We could not save your request. Please try again.",
    back: "Back to home",
  },
} as const;

export default function WaitlistPage() {
  const locale = useLocale();
  const copy = WAITLIST_COPY[locale as "es" | "en"] ?? WAITLIST_COPY.es;
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "duplicate" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");

    startTransition(async () => {
      try {
        const result = await submitWaitlist({
          email,
          agencyName: organization,
          locale,
        });

        if (result?.error === "duplicate_email") {
          setStatus("duplicate");
          return;
        }

        setStatus("success");
        setEmail("");
        setOrganization("");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    });
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-10">
          {copy.back}
        </Link>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#10b981] font-bold mb-5">
            {copy.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            {copy.title}
          </h1>
          <p className="text-neutral-400 text-base md:text-lg leading-relaxed mb-10">
            {copy.description}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">
                {copy.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#10b981]/40"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">
                {copy.organization}
              </label>
              <input
                type="text"
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#10b981]/40"
                placeholder={locale === "es" ? "Noctra Studio" : "Noctra Studio"}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-black font-bold py-3.5 hover:bg-neutral-200 transition-colors disabled:opacity-70">
              {isPending ? copy.submitting : copy.submit}
              {!isPending && <ArrowRight size={18} />}
            </button>
          </form>

          {status === "success" && (
            <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
              <p className="flex items-center gap-2 text-emerald-300 font-semibold mb-1">
                <CheckCircle2 size={18} />
                {copy.successTitle}
              </p>
              <p className="text-sm text-neutral-300">{copy.successBody}</p>
            </div>
          )}

          {status === "duplicate" && (
            <p className="mt-6 text-sm text-amber-300">{copy.duplicate}</p>
          )}

          {status === "error" && (
            <p className="mt-6 text-sm text-red-300">{copy.error}</p>
          )}
        </div>
      </div>
    </main>
  );
}
