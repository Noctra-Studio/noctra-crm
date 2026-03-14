"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  FileSignature,
  Home,
  Kanban,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Send,
  Settings,
  Shuffle,
  StickyNote,
  UserCheck,
  Users,
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
  group: string;
  items: ForgeNavItem[];
}

type ForgeTranslator = (key: string) => string;

export function getForgePrimaryNav(t: ForgeTranslator): ForgeNavGroup[] {
  return [
    {
      group: "Main",
      items: [
        { label: t("inicio"), href: "/", icon: Home },
        { label: t("projects"), href: "/projects", icon: LayoutDashboard },
        {
          label: t("pipeline"),
          href: "/pipeline",
          icon: Kanban,
          badgeKey: "pipelineAlerts",
        },
      ],
    },
    {
      group: "CRM",
      items: [
        {
          label: t("propuestas"),
          href: "/proposals",
          icon: StickyNote,
          badgeKey: "proposalSuggestions",
        },
        { label: t("contratos"), href: "/contracts", icon: Send },
        { label: "Documentos", href: "/documents", icon: FileSignature },
        { label: t("clientes"), href: "/clients", icon: UserCheck },
        { label: t("leads"), href: "/leads", icon: Users },
      ],
    },
    {
      group: "Tools",
      items: [
        { label: "Migración", href: "/migration", icon: Shuffle },
        { label: t("metricas"), href: "/metrics", icon: BarChart3 },
      ],
    },
    {
      group: "Configuración",
      items: [
        {
          label: "Marketing",
          href: "/settings/marketing",
          icon: Megaphone,
        },
      ],
    },
  ];
}

export function getForgeSecondaryNav(t: ForgeTranslator): ForgeNavItem[] {
  return [{ label: t("documentacion"), href: "/docs", icon: BookOpen }];
}

export function getForgeAccountNav(): ForgeNavItem[] {
  return [
    { label: "Configuración", href: "/settings/security", icon: Settings },
    { label: "Facturación y planes", href: "/settings/billing", icon: CreditCard },
    { label: "Soporte", href: "/support", icon: LifeBuoy },
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
