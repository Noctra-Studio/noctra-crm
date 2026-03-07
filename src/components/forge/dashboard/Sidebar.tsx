"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderGit2,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ListTodo,
  History,
  Zap,
} from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  userEmail?: string;
}

const navItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  { id: "tasks", label: "Tasks", icon: ListTodo, href: "/dashboard?tab=tasks" },
  {
    id: "deliverables",
    label: "Deliverables",
    icon: FolderGit2,
    href: "/dashboard?tab=deliverables",
  },
  {
    id: "financials",
    label: "Financials",
    icon: CreditCard,
    href: "/dashboard?tab=financials",
  },
  {
    id: "activity",
    label: "Activity",
    icon: History,
    href: "/dashboard?tab=activity",
  },
  {
    id: "migration",
    label: "Migración",
    icon: Zap,
    href: "/migration",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard?tab=settings",
  },
];

// Generate initials from email
const getInitials = (email?: string) => {
  if (!email) return "U";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Get display name from email
const getDisplayName = (email?: string) => {
  if (!email) return "User";
  const name = email.split("@")[0];
  const formatted = name
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  // Smart truncation: If > 18 chars, show First Name + Last Initial
  if (formatted.length > 18) {
    const parts = formatted.split(" ");
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    }
    return formatted.substring(0, 18);
  }
  return formatted;
};

// Get company name from email domain
const getCompanyName = (email?: string) => {
  if (!email) return "Noctra Client";
  const domain = email.split("@")[1];
  if (!domain) return "Noctra Client";

  // Remove common TLDs and capitalize
  const companyPart = domain.split(".")[0];
  return companyPart.charAt(0).toUpperCase() + companyPart.slice(1);
};

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  userEmail,
}: SidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const initials = getInitials(userEmail);
  const displayName = getDisplayName(userEmail);
  const companyName = getCompanyName(userEmail);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full bg-neutral-950/80 backdrop-blur-xl supports-backdrop-filter:bg-neutral-950/60 border-r border-neutral-800 flex flex-col relative shrink-0">
      {/* Header with Logo and Collapse Toggle */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-sm font-semibold tracking-tight text-white truncate pr-2">
            {companyName}
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-neutral-800 transition-colors shrink-0">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const fullHref = `/${locale}${item.href}`;
          const isActive =
            pathname === fullHref ||
            (item.href === "/dashboard" && pathname === `/${locale}/dashboard`);

          return (
            <Link
              key={item.id}
              href={fullHref}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}>
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium text-sm truncate">
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-neutral-800 space-y-3">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2" title={userEmail}>
            {/* Avatar with Initials */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-neutral-300">Client Account</p>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <form action={`/${locale}/auth/signout`} method="post">
          <button
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}>
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Sign Out</span>
            )}
          </button>
        </form>
      </div>
    </motion.aside>
  );
}
