"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  CreditCard,
  FileSignature,
  FileText,
  Home,
  Kanban,
  LifeBuoy,
  Megaphone,
  Shuffle,
  UserCheck,
  Users,
  Settings,
} from "lucide-react";
import { useFollowUps } from "@/hooks/useFollowUps";
import { createClient } from "@/utils/supabase/client";

export type ForgeNavBadgeKey = "pipelineAlerts" | "proposalSuggestions";

export interface ForgeNavItem {
  href: string;
  icon: typeof Home;
  label: string;
  badgeKey?: ForgeNavBadgeKey;
}

export interface ForgeNavGroup {
  /** Machine key used as React key */
  group: string;
  /** Human-readable section header shown in sidebar (omit for ungrouped items) */
  label?: string;
  items: ForgeNavItem[];
}

type ForgeTranslator = (key: string) => string;

export function getForgePrimaryNav(t: ForgeTranslator): ForgeNavGroup[] {
  return [
    // ── Home ────────────────────────────────────────────────────────────────
    {
      group: "home",
      items: [{ label: t("inicio"), href: "/", icon: Home }],
    },

    // ── RELATIONSHIPS ────────────────────────────────────────────────────────
    {
      group: "relationships",
      label: "Relationships",
      items: [
        { label: t("clientes"), href: "/clients", icon: UserCheck },
        {
          label: t("leads"),
          href: "/leads",
          icon: Users,
          badgeKey: "pipelineAlerts",
        },
      ],
    },

    // ── SALES ────────────────────────────────────────────────────────────────
    {
      group: "sales",
      label: "Sales",
      items: [
        { label: t("pipeline"), href: "/pipeline", icon: Kanban },
        {
          label: t("propuestas"),
          href: "/proposals",
          icon: FileText,
          badgeKey: "proposalSuggestions",
        },
        { label: t("contratos"), href: "/contracts", icon: FileSignature },
      ],
    },

    // ── DOCUMENTS ────────────────────────────────────────────────────────────
    {
      group: "documents",
      label: "Documents",
      items: [
        { label: t("documentos"), href: "/documents", icon: BookOpen },
      ],
    },

    // ── OPERATIONS ───────────────────────────────────────────────────────────
    {
      group: "operations",
      label: "Operations",
      items: [
        { label: t("projects"), href: "/projects", icon: Briefcase },
        { label: t("migration"), href: "/migration", icon: Shuffle },
      ],
    },

    // ── INTELLIGENCE ─────────────────────────────────────────────────────────
    {
      group: "intelligence",
      label: "Intelligence",
      items: [
        { label: t("metricas"), href: "/metrics", icon: BarChart3 },
        { label: t("marketing"), href: "/settings/marketing", icon: Megaphone },
      ],
    },
  ];
}

export function getForgeSecondaryNav(t: ForgeTranslator): ForgeNavItem[] {
  return [{ label: t("documentacion"), href: "/docs", icon: BookOpen }];
}

export function getForgeAccountNav(t: ForgeTranslator): ForgeNavItem[] {
  return [
    { label: t("configuracion"), href: "/settings/security", icon: Settings },
    { label: t("facturacion"), href: "/settings/billing", icon: CreditCard },
    { label: t("soporte"), href: "mailto:hola@noctra.studio", icon: LifeBuoy },
  ];
}

export function normalizeForgePathname(pathname: string) {
  const normalized = pathname.replace(/^\/(en|es)(?=\/|$)/, "");
  return normalized.length > 0 ? normalized : "/";
}

export function localizeForgeHref(locale: string, href: string) {
  if (!locale) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

export function isForgeNavItemActive(pathname: string, href: string) {
  const normalizedPathname = normalizeForgePathname(pathname);

  if (href === "/") {
    return normalizedPathname === "/";
  }

  return (
    normalizedPathname === href || normalizedPathname.startsWith(`${href}/`)
  );
}

export function useForgeNavBadges(enabled: boolean) {
  const [supabase] = useState(() => createClient());
  const { suggestions } = useFollowUps(enabled);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const fetchAlerts = async () => {
      const { data, error } = await supabase.rpc("get_leads_needing_attention");
      if (!error && data && isMounted) {
        setAlertCount(data.length);
      }
    };

    fetchAlerts();
    const interval = window.setInterval(fetchAlerts, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [enabled, supabase]);

  return {
    alertCount,
    suggestionCount: suggestions.length,
  };
}
