import type { ComponentType } from "react";
import {
  Activity,
  CreditCard,
  FolderGit2,
  LayoutDashboard,
  ListTodo,
  Settings,
  Zap,
} from "lucide-react";

export type DashboardTab =
  | "overview"
  | "tasks"
  | "deliverables"
  | "financials"
  | "activity"
  | "settings";

export type DashboardNavItem = {
  id: DashboardTab | "migration";
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  tab?: DashboardTab;
  showInBottomNav?: boolean;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    shortLabel: "Home",
    description: "Resumen general del proyecto y del trabajo pendiente.",
    href: "/dashboard",
    icon: LayoutDashboard,
    tab: "overview",
    showInBottomNav: true,
  },
  {
    id: "tasks",
    label: "Tasks",
    shortLabel: "Tasks",
    description: "Pendientes, seguimiento y próximas acciones.",
    href: "/dashboard?tab=tasks",
    icon: ListTodo,
    tab: "tasks",
    showInBottomNav: true,
  },
  {
    id: "deliverables",
    label: "Deliverables",
    shortLabel: "Files",
    description: "Entregables recientes, aprobaciones y assets.",
    href: "/dashboard?tab=deliverables",
    icon: FolderGit2,
    tab: "deliverables",
    showInBottomNav: true,
  },
  {
    id: "financials",
    label: "Financials",
    shortLabel: "Billing",
    description: "Facturas, contratos y estado financiero del proyecto.",
    href: "/dashboard?tab=financials",
    icon: CreditCard,
    tab: "financials",
    showInBottomNav: true,
  },
  {
    id: "activity",
    label: "Activity",
    shortLabel: "Log",
    description: "Registro de actividad y cambios recientes.",
    href: "/dashboard?tab=activity",
    icon: Activity,
    tab: "activity",
    showInBottomNav: true,
  },
  {
    id: "migration",
    label: "Migration",
    shortLabel: "Migrate",
    description: "Migración de datos y onboarding del workspace.",
    href: "/migration",
    icon: Zap,
  },
  {
    id: "settings",
    label: "Settings",
    shortLabel: "Settings",
    description: "Perfil, idioma y preferencias de cuenta.",
    href: "/dashboard?tab=settings",
    icon: Settings,
    tab: "settings",
  },
];

export function getDashboardHref(locale: string, href: string) {
  return `/${locale}${href}`;
}

export function getDashboardTab(
  pathname: string,
  currentTab?: string | null,
): DashboardTab | null {
  if (!pathname.endsWith("/dashboard")) {
    return null;
  }

  const requestedTab = currentTab ?? "overview";
  const matchedItem = DASHBOARD_NAV_ITEMS.find(
    (item) => item.tab && item.tab === requestedTab,
  );

  return matchedItem?.tab ?? "overview";
}

export function isDashboardNavItemActive(
  item: DashboardNavItem,
  pathname: string,
  currentTab?: string | null,
) {
  if (item.id === "migration") {
    return pathname.includes("/migration");
  }

  const activeTab = getDashboardTab(pathname, currentTab);
  return activeTab === item.tab;
}

export function getActiveDashboardNavItem(
  pathname: string,
  currentTab?: string | null,
) {
  return (
    DASHBOARD_NAV_ITEMS.find((item) =>
      isDashboardNavItemActive(item, pathname, currentTab),
    ) ?? DASHBOARD_NAV_ITEMS[0]
  );
}
