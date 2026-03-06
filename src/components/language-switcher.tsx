"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTransition } from "react";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: "en" | "es") => {
    if (newLocale === locale) return;

    startTransition(() => {
      router.push(pathname, { locale: newLocale, scroll: false });
    });
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        onClick={() => handleLocaleChange("en")}
        disabled={isPending}
        className={cn(
          "text-sm font-medium transition-colors font-mono",
          locale === "en" ? "text-white" : "text-neutral-300 hover:text-white",
          isPending && "opacity-50 cursor-not-allowed"
        )}>
        EN
      </button>
      <span className="text-neutral-400">/</span>
      <button
        onClick={() => handleLocaleChange("es")}
        disabled={isPending}
        className={cn(
          "text-sm font-medium transition-colors font-mono",
          locale === "es" ? "text-white" : "text-neutral-300 hover:text-white",
          isPending && "opacity-50 cursor-not-allowed"
        )}>
        ES
      </button>
    </div>
  );
}
