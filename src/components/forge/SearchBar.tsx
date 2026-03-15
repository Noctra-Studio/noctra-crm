"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

export function SearchBar({
  onOpenCommandBar,
}: {
  onOpenCommandBar?: () => void;
}) {
  const t = useTranslations("forge.search");

  return (
    <div className="relative flex items-center justify-center w-full">
      <button
        onClick={onOpenCommandBar}
        className="flex items-center justify-center sm:justify-start gap-2 bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 hover:border-white/20 hover:bg-white/10 transition-all w-10 sm:w-full sm:min-w-[240px] sm:max-w-sm ml-auto md:mx-auto">
        <Search
          size={14}
          className="text-white/40 w-4 h-4 sm:w-3.5 sm:h-3.5"
          strokeWidth={1.5}
        />
        <span className="text-sm text-white/30 hidden sm:inline-block truncate">
          {t("placeholderCollapsed")}
        </span>
        <kbd className="ml-auto text-[10px] text-white/20 border border-white/10 rounded px-1.5 py-0.5 font-mono bg-white/5 hidden sm:inline-block">
          ⌘K
        </kbd>
      </button>
    </div>
  );
}
