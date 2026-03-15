"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getForgePrimaryNav,
  getForgeSecondaryNav,
  isForgeNavItemActive,
  localizeForgeHref,
  useForgeNavBadges,
} from "@/components/forge/forge-navigation";

export interface ForgeSidebarProps {
  workspace?: {
    name: string;
    logo_url: string | null;
    primary_color: string;
  };
  enabled?: boolean;
}

export function ForgeSidebar({ workspace, enabled = true }: ForgeSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("forge.nav");
  const { alertCount, suggestionCount } = useForgeNavBadges(enabled);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem("forge-sidebar-collapsed");
    if (savedState) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("forge-sidebar-collapsed", String(newState));
  };

  const navGroups = getForgePrimaryNav(t);
  const secondaryNav = getForgeSecondaryNav(t);

  if (!isMounted) return null;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div
        className={`hidden md:flex flex-col h-full bg-[#0a0a0a] transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo / Header */}
        <div
          className={`border-b border-white/5 flex items-center h-16 shrink-0 overflow-hidden ${
            isCollapsed ? "px-3 justify-between gap-2" : "px-6"
          }`}
        >
          {isCollapsed ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-white/5">
                <Image
                  src="/favicon-light.svg"
                  alt="Noctra"
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </div>
              <button
                type="button"
                onClick={toggleCollapse}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-neutral-300 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
                title="Expandir menú"
                aria-label="Expandir menú"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-1 items-center gap-3 overflow-hidden">
                <img
                  src="/images/noctra-logo-white.png"
                  alt="Noctra Studio"
                  className="h-6 w-auto flex-none"
                />
                {workspace && workspace.name !== "Noctra Studio" && (
                  <>
                    <div className="h-4 w-px bg-neutral-800 flex-none" />
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest truncate">
                      {workspace.name}
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={toggleCollapse}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
                title="Contraer menú"
                aria-label="Contraer menú"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>

        {/* Nav items */}
        <div
          className={`flex-1 overflow-y-auto custom-scrollbar ${
            isCollapsed ? "py-4" : "px-3 py-3"
          } space-y-1`}
        >
          {navGroups.map((group, groupIdx) => (
            <div key={group.group}>
              {/* Section header — only shown when expanded and group has a label */}
              {!isCollapsed && group.label && (
                <div
                  className={`px-2 mb-1 ${groupIdx > 0 ? "pt-4" : ""}`}
                >
                  <span className="text-[9px] font-mono font-semibold uppercase tracking-[0.18em] text-neutral-600">
                    {group.label}
                  </span>
                </div>
              )}

              {/* Separator for collapsed mode */}
              {isCollapsed && groupIdx > 0 && (
                <hr className="border-white/5 my-3 mx-3" />
              )}

              <div className={`flex flex-col ${isCollapsed ? "gap-1 px-2" : "gap-0.5"}`}>
                {group.items.map((item) => {
                  const isActive = isForgeNavItemActive(pathname, item.href);
                  const localizedHref = localizeForgeHref(locale, item.href);
                  const badgeValue =
                    item.badgeKey === "pipelineAlerts"
                      ? alertCount
                      : item.badgeKey === "proposalSuggestions"
                        ? suggestionCount
                        : 0;

                  return (
                    <Link
                      key={item.href}
                      href={localizedHref}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center ${
                        isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2"
                      } rounded-lg transition-all duration-150 text-sm font-medium group relative ${
                        isActive
                          ? "bg-white/[0.07] text-white"
                          : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
                      }`}
                    >
                      {/* Active accent dot */}
                      {isActive && !isCollapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-emerald-500" />
                      )}
                      {isActive && isCollapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-emerald-500" />
                      )}

                      <item.icon
                        className={`w-4 h-4 flex-none ${
                          isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"
                        }`}
                        strokeWidth={isActive ? 2 : 1.5}
                      />

                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}

                      {/* Badges */}
                      {item.badgeKey === "pipelineAlerts" && badgeValue > 0 && (
                        isCollapsed ? (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        ) : (
                          <span className="ml-auto shrink-0 h-4 min-w-[1rem] px-1 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold font-mono flex items-center justify-center border border-red-500/30">
                            {badgeValue}
                          </span>
                        )
                      )}

                      {item.badgeKey === "proposalSuggestions" && badgeValue > 0 && (
                        isCollapsed ? (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        ) : (
                          <span className="ml-auto shrink-0 h-4 min-w-[1rem] px-1 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold font-mono flex items-center justify-center border border-amber-500/30">
                            {badgeValue}
                          </span>
                        )
                      )}

                      {/* Tooltip when collapsed */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 hidden group-hover:block bg-[#1a1a1a] border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer — Docs link */}
        <div
          className={`border-t border-white/5 ${
            isCollapsed ? "p-3 flex justify-center" : "px-3 py-3"
          }`}
        >
          {secondaryNav.map((item) => {
            const isActive = isForgeNavItemActive(pathname, item.href);
            const localizedHref = localizeForgeHref(locale, item.href);

            return (
              <Link
                key={item.href}
                href={localizedHref}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${
                  isCollapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2"
                } rounded-lg transition-all duration-150 text-sm font-medium group relative ${
                  isActive
                    ? "bg-white/[0.07] text-white"
                    : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
                }`}
              >
                <BookOpen
                  className={`w-4 h-4 flex-none ${
                    isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 hidden group-hover:block bg-[#1a1a1a] border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
