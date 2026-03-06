"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = (newLocale: "en" | "es") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <button
        onClick={() => toggleLanguage("en")}
        className={`transition-colors ${
          locale === "en"
            ? "text-white"
            : "text-neutral-400 hover:text-neutral-400"
        }`}>
        EN
      </button>
      <span className="text-neutral-700">/</span>
      <button
        onClick={() => toggleLanguage("es")}
        className={`transition-colors ${
          locale === "es"
            ? "text-white"
            : "text-neutral-400 hover:text-neutral-400"
        }`}>
        ES
      </button>
    </div>
  );
}
