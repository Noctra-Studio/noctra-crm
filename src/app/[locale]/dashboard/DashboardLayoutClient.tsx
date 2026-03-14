"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Sidebar from "@/components/forge/dashboard/Sidebar";
import { DashboardMobileNav } from "@/components/forge/dashboard/DashboardMobileNav";
import {
  DASHBOARD_NAV_ITEMS,
  getActiveDashboardNavItem,
  getDashboardHref,
} from "@/components/forge/dashboard/dashboard-navigation";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayoutClient({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: any;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1279px)");
  const hasFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeItem = getActiveDashboardNavItem(pathname, currentTab);
  const bottomNavItems = DASHBOARD_NAV_ITEMS.filter((item) => item.showInBottomNav);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setIsCollapsed(isTablet);
  }, [isTablet]);

  useEffect(() => {
    if (!hasFinePointer || isMobile) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasFinePointer, isMobile, mouseX, mouseY]);

  const spotlightBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]: number[]) =>
      `radial-gradient(600px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
  );

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      {hasFinePointer && !isMobile ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: spotlightBackground,
          }}
        />
      ) : null}

      <div className="relative z-10 flex min-h-dvh min-w-0 w-full max-w-full overflow-hidden bg-[#020202] text-white">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          profile={profile}
        />

        <main className="relative z-20 flex min-h-dvh min-w-0 flex-1 flex-col overflow-hidden">
          <div className="md:hidden">
            <header className="mobile-safe-x sticky top-0 z-40 border-b border-white/6 bg-[#050505]/92 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                      aria-label="Abrir navegación"
                      aria-expanded={mobileNavOpen}
                      aria-controls="dashboard-mobile-nav"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </SheetTrigger>

                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/35">
                      Dashboard
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <activeItem.icon className="h-4 w-4 text-white/65" />
                      <h1 className="truncate text-base font-semibold text-white">
                        {activeItem.label}
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                  <LanguageSwitcher
                    className="gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.22em]"
                    inactiveClassName="text-white/45 hover:text-white/80"
                    separatorClassName="text-white/20"
                  />
                </div>
              </div>
            </header>
          </div>

          <div className="hidden border-b border-white/6 bg-[#050505]/72 px-6 py-5 backdrop-blur-xl md:flex md:items-center md:justify-between xl:px-8">
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/32">
                Dashboard
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-white/75">
                  <activeItem.icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold text-white">
                    {activeItem.label}
                  </h1>
                  <p className="truncate text-sm text-white/45">
                    {activeItem.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 lg:block">
              <LanguageSwitcher
                className="gap-2 text-xs font-mono font-bold uppercase tracking-[0.25em]"
                inactiveClassName="text-white/45 hover:text-white/80"
                separatorClassName="text-white/20"
              />
            </div>
          </div>

          <div
            className={cn(
              "mobile-safe-x forge-scroll flex-1 overflow-y-auto scroll-smooth",
              isMobile ? "pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-4" : "py-5 md:px-6 xl:px-8",
            )}
          >
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </div>

          {!isMobile ? (
            <footer className="border-t border-white/5 bg-black/50 py-4 backdrop-blur-sm">
              <p className="text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                © 2026 Noctra Studio. PROCESSED SECURELY.
              </p>
            </footer>
          ) : null}
        </main>

        {isMobile ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-[max(0.75rem,env(safe-area-inset-left))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <nav className="pointer-events-auto grid grid-cols-5 gap-1 rounded-[2rem] border border-white/10 bg-[#090909]/92 p-2 shadow-[0_-20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              {bottomNavItems.map((item) => {
                const href = getDashboardHref(locale, item.href);
                const isActive = item.id === activeItem.id;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-w-0 flex-col items-center gap-1 rounded-[1.35rem] px-1 py-2 text-center transition-colors",
                      isActive
                        ? "bg-white text-black"
                        : "text-white/55 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.85} />
                    <span className="truncate text-[10px] font-semibold">
                      {item.shortLabel}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}

        <DashboardMobileNav
          onOpenChange={setMobileNavOpen}
          profile={profile}
        />
      </div>
    </Sheet>
  );
}
