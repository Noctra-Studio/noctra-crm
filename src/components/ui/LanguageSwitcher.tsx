"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  buttonClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  separatorClassName?: string;
}

export default function LanguageSwitcher({
  className,
  buttonClassName,
  activeClassName = "text-white",
  inactiveClassName = "text-neutral-400 hover:text-white",
  separatorClassName = "text-neutral-700",
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = (newLocale: "en" | "es") => {
    if (newLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale, scroll: false });
    });
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm font-medium", className)}>
      <button
        type="button"
        onClick={() => toggleLanguage("en")}
        disabled={isPending}
        aria-pressed={locale === "en"}
        className={cn(
          "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          buttonClassName,
          locale === "en" ? activeClassName : inactiveClassName,
        )}>
        EN
      </button>
      <span className={cn(separatorClassName)}>/</span>
      <button
        type="button"
        onClick={() => toggleLanguage("es")}
        disabled={isPending}
        aria-pressed={locale === "es"}
        className={cn(
          "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          buttonClassName,
          locale === "es" ? activeClassName : inactiveClassName,
        )}>
        ES
      </button>
    </div>
  );
}
