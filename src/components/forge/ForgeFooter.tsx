"use client";

import { Link } from "@/i18n/routing";
import { Instagram } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import NextImage from "next/image";
import { useLocale } from "next-intl";

const FOOTER_COPY = {
  es: {
    tagline: "Construido por diseñadores, para creativos.",
    platform: "Plataforma",
    demo: "Demo",
    pricing: "Precios",
    signIn: "Iniciar sesión",
    createAccount: "Crear cuenta gratis",
    resources: "Recursos",
    migrationCenter: "Centro de Migración",
    studio: "Noctra Studio",
    legal: "Legal",
    terms: "Términos de Servicio",
    privacy: "Política de Privacidad",
    rights: "Todos los derechos reservados",
    systems: "Sistemas",
    operational: "Operativos",
    designedIn: "Diseñado en Querétaro con ☕",
  },
  en: {
    tagline: "Built by designers, for creative operators.",
    platform: "Platform",
    demo: "Demo",
    pricing: "Pricing",
    signIn: "Sign in",
    createAccount: "Create free account",
    resources: "Resources",
    migrationCenter: "Migration Center",
    studio: "Noctra Studio",
    legal: "Legal",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    rights: "All rights reserved",
    systems: "Systems",
    operational: "Operational",
    designedIn: "Designed in Queretaro with ☕",
  },
} as const;

export function ForgeFooter() {
  const year = new Date().getFullYear();
  const locale = useLocale();
  const copy = FOOTER_COPY[locale as "es" | "en"] ?? FOOTER_COPY.es;

  return (
    <footer className="bg-[#050505] border-t border-neutral-900 text-neutral-300 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* LOGO AND MAIN LINKS DESKTOP GRIDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* LOGO + TAGLINE */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-3">
                <NextImage
                  src="/favicon-light.svg"
                  alt="Noctra Forge"
                  width={24}
                  height={24}
                  className="w-8 h-8 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all"
                />
                <span className="text-xl font-bold text-white tracking-tight">
                  Noctra Forge
                </span>
              </div>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs font-medium">
              {copy.tagline}
            </p>
          </div>

          {/* LINK COLUMNS */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* PLATAFORMA */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
                {copy.platform}
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#demo"
                    className="text-sm text-neutral-300 hover:text-white transition-colors">
                    {copy.demo}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm text-neutral-300 hover:text-white transition-colors">
                    {copy.pricing}
                  </a>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-neutral-300 hover:text-white transition-colors">
                    {copy.signIn}
                  </Link>
                </li>
                <li>
                  <Link
                    href={{
                      pathname: "/login",
                    query: { mode: "signup", plan: "starter" },
                    }}
                    className="text-sm text-neutral-300 hover:text-white transition-colors">
                    {copy.createAccount}
                  </Link>
                </li>
              </ul>
            </div>

            {/* RECURSOS */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
                {copy.resources}
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href={"/docs/migracion" as any}
                    className="text-sm text-neutral-300 hover:text-white transition-colors">
                    {copy.migrationCenter}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-sm text-neutral-300 hover:text-white transition-colors">
                    {copy.studio}
                  </Link>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
                {copy.legal}
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/terms-and-conditions"
                    className="text-sm text-neutral-300 hover:text-white transition-colors">
                    {copy.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-sm text-neutral-300 hover:text-white transition-colors">
                    {copy.privacy}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR (SOCIAL + COPYRIGHT + STATUS) */}
        <div className="mt-16 pt-12 border-t border-neutral-900">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
            {/* Left: Metadata & Status */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-4 gap-y-2 text-xs text-neutral-300 font-medium">
                <span>© {year} Noctra Studio</span>
                <span className="hidden sm:inline text-neutral-800">•</span>
                <span>{copy.rights}</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 py-2 px-4 bg-neutral-900/50 rounded-full border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                      {copy.systems}
                    </span>
                  </div>
                  <div className="w-px h-3 bg-neutral-800" />
                  <span className="text-[10px] uppercase tracking-widest text-neutral-300 font-bold">
                    {copy.operational}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Casual Tagline */}
            <div className="hidden xl:block">
              <p className="text-xs text-neutral-400 font-medium tracking-tight">
                {copy.designedIn}
              </p>
            </div>

            {/* Right: Social Media */}
            <div className="flex items-center gap-3">
              {[
                {
                  icon: Instagram,
                  href: "https://instagram.com/noctra_studio",
                  label: "Instagram",
                },
                {
                  icon: FaXTwitter,
                  href: "https://x.com/NoctraStudio",
                  label: "X (Twitter)",
                },
              ].map((social) => (
                <a
                  key={social.href}
                  href={social.href as any}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition-all duration-300 group">
                  <social.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Only Casual Tagline */}
          <div className="mt-12 xl:hidden text-center">
            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold">
              {copy.designedIn}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
