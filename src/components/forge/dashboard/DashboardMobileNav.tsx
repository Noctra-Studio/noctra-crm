"use client";

import Link from "next/link";
import { LogOut, X } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";

import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import {
  DASHBOARD_NAV_ITEMS,
  getDashboardHref,
  isDashboardNavItemActive,
} from "./dashboard-navigation";

interface DashboardMobileNavProps {
  onOpenChange: (open: boolean) => void;
  profile?: {
    company_name?: string | null;
    full_name?: string | null;
  } | null;
}

export function DashboardMobileNav({
  onOpenChange,
  profile,
}: DashboardMobileNavProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const companyName = profile?.company_name || "Noctra Studio";
  const fullName = profile?.full_name || "Client workspace";

  return (
    <SheetContent
      id="dashboard-mobile-nav"
      side="left"
      showCloseButton={false}
      className="w-[min(90vw,22rem)] border-r border-white/10 bg-[#050505] p-0 text-white shadow-[24px_0_80px_rgba(0,0,0,0.45)] md:hidden"
    >
      <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
      <SheetDescription className="sr-only">
        Primary navigation for the Noctra dashboard.
      </SheetDescription>

      <div className="flex h-full flex-col">
        <div className="border-b border-white/6 px-5 pb-4 pt-[max(1.2rem,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/35">
                Workspace
              </p>
              <p className="mt-2 truncate text-base font-semibold text-white">
                {companyName}
              </p>
              <p className="truncate text-sm text-white/55">{fullName}</p>
            </div>

            <SheetClose asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </SheetClose>
          </div>

          <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
            <LanguageSwitcher
              className="gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.24em]"
              inactiveClassName="text-white/45 hover:text-white/80"
              separatorClassName="text-white/20"
            />
          </div>
        </div>

        <div className="forge-scroll flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
          <div className="space-y-2">
            {DASHBOARD_NAV_ITEMS.map((item) => {
              const isActive = isDashboardNavItemActive(
                item,
                pathname,
                currentTab,
              );
              const href = getDashboardHref(locale, item.href);

              return (
                <SheetClose asChild key={item.id}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-start gap-3 rounded-3xl border px-4 py-4 transition-all duration-200",
                      isActive
                        ? "border-white/15 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                        : "border-transparent bg-white/[0.02] text-white/72 hover:border-white/10 hover:bg-white/[0.05] hover:text-white",
                    )}
                    onClick={() => onOpenChange(false)}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
                        isActive
                          ? "border-white/10 bg-white text-black"
                          : "border-white/8 bg-white/[0.03] text-white/60",
                      )}
                    >
                      <item.icon className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-sm text-white/50">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </SheetClose>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/6 px-5 py-4">
          <form action={`/${locale}/auth/signout`} method="post">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-4 text-sm font-bold tracking-wide text-red-400 transition-colors hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </SheetContent>
  );
}
