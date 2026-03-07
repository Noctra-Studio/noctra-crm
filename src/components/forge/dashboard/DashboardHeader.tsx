"use client";

import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-end px-6 py-4 border-b border-neutral-800 bg-black/50 backdrop-blur-sm sticky top-0 z-20">
      <LanguageSwitcher />
    </header>
  );
}
