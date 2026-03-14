"use client";

import { Building2 } from "lucide-react";
import { useLocale } from "next-intl";

import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface HeaderGreetingProps {
  companyName: string;
  fullName: string;
}

const getGreeting = (locale: string) => {
  const hour = new Date().getHours();
  if (locale === "es") {
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const getFormattedDate = (locale: string) => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString(locale === "es" ? "es-MX" : "en-US", options);
};

const getUserName = (fullName: string) => {
  return fullName.split(" ")[0];
};

export default function HeaderGreeting({
  companyName,
  fullName,
}: HeaderGreetingProps) {
  const locale = useLocale();
  const greeting = getGreeting(locale);
  const name = getUserName(fullName);
  const date = getFormattedDate(locale);

  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/60">
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{companyName}</span>
        </div>
        <h1 className="mb-1 text-3xl font-bold text-white sm:text-4xl">
          {greeting}, {name}
        </h1>
        <p className="text-sm text-neutral-300">{date}</p>
      </div>
      <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 sm:block">
        <LanguageSwitcher
          className="gap-2 text-xs font-mono font-bold uppercase tracking-[0.24em]"
          inactiveClassName="text-white/45 hover:text-white/80"
          separatorClassName="text-white/20"
        />
      </div>
    </div>
  );
}
