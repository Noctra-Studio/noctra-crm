"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  getForgeAccountNav,
  getForgePrimaryNav,
  getForgeSecondaryNav,
  isForgeNavItemActive,
  localizeForgeHref,
  type ForgeNavBadgeKey,
  type ForgeNavItem,
  useForgeNavBadges,
} from "@/components/forge/forge-navigation";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface ForgeMobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgeMobileNav({
  open,
  onOpenChange,
}: ForgeMobileNavProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("forge.nav");
  const [supabase] = useState(() => createClient(false));
  const [userEmail, setUserEmail] = useState("");
  const previousPathname = useRef(pathname);
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);
  const { alertCount, suggestionCount } = useForgeNavBadges(open);

  const navGroups = getForgePrimaryNav(t);
  const secondaryNav = getForgeSecondaryNav(t);
  const accountNav = getForgeAccountNav();
  const languageHeading = locale === "en" ? "Language" : "Idioma";
  const languageDescription =
    locale === "en"
      ? "Switch the CRM between English and Spanish."
      : "Cambia el CRM entre inglés y español.";

  useEffect(() => {
    if (!open) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, [open, supabase]);

  useEffect(() => {
    if (open && previousPathname.current !== pathname) {
      onOpenChange(false);
    }

    previousPathname.current = pathname;
  }, [open, onOpenChange, pathname]);

  const getBadgeValue = (badgeKey?: ForgeNavBadgeKey) => {
    if (badgeKey === "pipelineAlerts") return alertCount;
    if (badgeKey === "proposalSuggestions") return suggestionCount;
    return 0;
  };

  const handleSignOut = async () => {
    onOpenChange(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const renderNavLink = (item: ForgeNavItem, isPrimary = false) => {
    const isActive = isForgeNavItemActive(pathname, item.href);
    const localizedHref = localizeForgeHref(locale, item.href);
    const badgeValue = getBadgeValue(item.badgeKey);

    return (
      <SheetClose asChild key={item.href}>
        <Link
          ref={isPrimary ? firstNavLinkRef : undefined}
          href={localizedHref}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "flex items-center gap-4 rounded-2xl border px-4 py-3.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
            isActive
              ? "border-emerald-500/30 bg-emerald-500/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              : "border-transparent bg-white/[0.02] text-white/72 hover:border-white/10 hover:bg-white/[0.05] hover:text-white",
          )}>
          <item.icon
            className={cn(
              "h-5 w-5 shrink-0",
              isActive ? "text-emerald-400" : "text-white/40",
            )}
            strokeWidth={1.75}
          />
          <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
          {badgeValue > 0 && (
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black",
                item.badgeKey === "pipelineAlerts"
                  ? "bg-red-500 text-black"
                  : "bg-amber-500 text-black",
              )}>
              {badgeValue}
            </span>
          )}
        </Link>
      </SheetClose>
    );
  };

  return (
    <SheetContent
      id="forge-mobile-nav"
      side="right"
      showCloseButton={false}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        firstNavLinkRef.current?.focus();
      }}
      className="md:hidden w-[min(90vw,22rem)] border-l border-white/10 bg-[#0A0A0A] p-0 text-white shadow-[-24px_0_80px_rgba(0,0,0,0.45)]"
    >
      <SheetTitle className="sr-only">Noctra CRM navigation</SheetTitle>
      <SheetDescription className="sr-only">
        Main navigation for the Noctra CRM mobile app.
      </SheetDescription>

      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/5 px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
              Navegación
            </p>
            {userEmail && (
              <p className="mt-2 truncate text-sm text-white/55">{userEmail}</p>
            )}
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

        <div className="forge-scroll flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-5">
          <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">
              Noctra CRM
            </p>
            <p className="mt-2 text-sm text-white/75">
              Acceso directo a la navegación principal y a los ajustes de tu cuenta.
            </p>
          </div>

          <section className="mb-5 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">
              {languageHeading}
            </p>
            <p className="mt-2 text-sm text-white/65">{languageDescription}</p>
            <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
              <LanguageSwitcher
                className="gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.24em]"
                inactiveClassName="text-white/45 hover:text-white/80"
                separatorClassName="text-white/20"
              />
            </div>
          </section>

          <div className="space-y-5">
            {navGroups.map((group) => (
              <section key={group.group}>
                <p className="mb-2 px-1 text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                  {group.group}
                </p>
                <div className="space-y-2">
                  {group.items.map((item, index) =>
                    renderNavLink(item, group.group === navGroups[0].group && index === 0),
                  )}
                </div>
              </section>
            ))}

            <section>
              <p className="mb-2 px-1 text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                Recursos
              </p>
              <div className="space-y-2">{secondaryNav.map((item) => renderNavLink(item))}</div>
            </section>

            <section>
              <p className="mb-2 px-1 text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">
                Cuenta
              </p>
              <div className="space-y-2">{accountNav.map((item) => renderNavLink(item))}</div>
            </section>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-4 text-sm font-bold tracking-wide text-red-500 transition-colors hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </SheetContent>
  );
}
