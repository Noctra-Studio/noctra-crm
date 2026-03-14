"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import {
  DASHBOARD_NAV_ITEMS,
  getDashboardHref,
  isDashboardNavItemActive,
} from "./dashboard-navigation";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  profile?: {
    company_name?: string | null;
    full_name?: string | null;
  } | null;
}

const getInitials = (fullName?: string | null, companyName?: string | null) => {
  const source = fullName || companyName || "Noctra";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  profile,
}: SidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const companyName = profile?.company_name || "Noctra Studio";
  const displayName = profile?.full_name || "Client workspace";
  const initials = getInitials(profile?.full_name, profile?.company_name);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : 288 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden h-full shrink-0 border-r border-white/8 bg-[#050505]/90 backdrop-blur-xl supports-backdrop-filter:bg-[#050505]/72 md:flex md:flex-col"
    >
      <div className="border-b border-white/6 px-4 py-5">
        <div className="flex items-center justify-between gap-3">
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/30">
                Noctra
              </p>
              <p className="mt-2 truncate text-sm font-semibold text-white">
                {companyName}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            aria-label={isCollapsed ? "Expandir navegación" : "Colapsar navegación"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <nav className="forge-scroll flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const fullHref = getDashboardHref(locale, item.href);
          const isActive = isDashboardNavItemActive(item, pathname, currentTab);

          return (
            <Link
              key={item.id}
              href={fullHref}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-3xl border px-3 py-3.5 transition-all duration-200",
                isCollapsed ? "justify-center px-2.5" : "",
                isActive
                  ? "border-white/14 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "border-transparent text-white/62 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                  isActive
                    ? "border-white/10 bg-white text-black"
                    : "border-white/8 bg-white/[0.03] text-white/55 group-hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.8} />
              </div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-semibold">{item.label}</p>
                  <p className="truncate text-xs text-white/42">
                    {item.description}
                  </p>
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/6 p-4">
        <div
          className={cn(
            "rounded-3xl border border-white/8 bg-white/[0.02] p-3",
            isCollapsed ? "px-2 py-3" : "",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed ? "justify-center" : "",
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-white/45">
                  {companyName}
                </p>
              </div>
            )}
          </div>

          <form action={`/${locale}/auth/signout`} method="post" className="mt-3">
            <button
              type="submit"
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white",
                isCollapsed ? "justify-center px-0" : "",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Cerrar sesión</span>}
            </button>
          </form>
        </div>
      </div>
    </motion.aside>
  );
}
