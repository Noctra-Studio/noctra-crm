"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { CommandDropdown } from "@/components/forge/CommandDropdown";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("forge.search");
  const router = useRouter();

  // Handle global Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsExpanded(true);
      }
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    } else if (!isExpanded) {
      setQuery(""); // Clear query on close
    }
  }, [isExpanded]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (href: string) => {
    setIsExpanded(false);
    router.push(href);
  };

  return (
    <div
      className="relative flex items-center justify-center w-full"
      ref={containerRef}>
      {/* Ghost button when collapsed */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
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
      ) : (
        /* Expanded Input */
        <div className="absolute sm:relative top-0 right-0 sm:top-auto sm:right-auto w-[calc(100vw-4rem)] sm:w-full max-w-2xl mx-auto z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full bg-[#111] border-2 border-emerald-500/50 rounded-xl py-3 pl-11 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 transition-colors shadow-2xl shadow-emerald-900/20"
            placeholder={t("placeholder")}
          />
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white transition-colors">
            <kbd className="text-[10px] border border-white/10 rounded px-1.5 py-0.5 font-mono mr-2 bg-white/5 hidden sm:inline-block">
              ESC
            </kbd>
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Dropdown Results */}
      <CommandDropdown
        isOpen={isExpanded}
        query={query}
        onSelect={handleSelect}
      />

      {/* Global Backdrop when expanded */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      )}
    </div>
  );
}
