"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useFollowUps } from "@/hooks/useFollowUps";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Kanban,
  BarChart3,
  StickyNote,
  Send,
  UserCheck,
  Home,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  User,
  Shuffle,
  FileSignature,
  Megaphone,
} from "lucide-react";

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
  const router = useRouter();
  const supabase = createClient();
  const { suggestions } = useFollowUps(enabled);
  const t = useTranslations("forge.nav");

  const [alertCount, setAlertCount] = useState(0);

  // Collapsible state handling
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem("forge-sidebar-collapsed");
    if (savedState) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const fetchAlerts = async () => {
      const { data, error } = await supabase.rpc("get_leads_needing_attention");
      if (!error && data) {
        setAlertCount(data.length);
      }
    };
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [supabase]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("forge-sidebar-collapsed", String(newState));
  };

  const navGroups = [
    {
      group: "Main",
      items: [
        { label: t("inicio"), href: "/", icon: Home },
        {
          label: t("projects"),
          href: "/projects",
          icon: LayoutDashboard,
        },
        { label: t("pipeline"), href: "/pipeline", icon: Kanban },
      ],
    },
    {
      group: "CRM",
      items: [
        { label: t("propuestas"), href: "/proposals", icon: StickyNote },
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

  if (!isMounted) return null; // Prevent hydration mismatch to visual flicker

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div
        className={`hidden md:flex flex-col h-full bg-[#0a0a0a] transition-all duration-200 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}>
        <div className="px-6 border-b border-white/5 flex items-center relative h-16 shrink-0 overflow-hidden">
          {/* Logo container area */}
          <div className="flex-1 relative h-8 flex items-center">
            {/* Full Logo (Visible when NOT collapsed) */}
            <div
              className={`absolute left-0 flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${
                isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}>
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

            {/* Icon Logo (Visible when collapsed) */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}>
              <Image
                src="/favicon-light.svg"
                alt="Noctra"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
          </div>

          {/* Collapse Button */}
          <button
            onClick={toggleCollapse}
            className={`p-1 rounded hover:bg-white/5 text-neutral-400 hover:text-white transition-all duration-300 flex-none absolute right-4 bg-[#0a0a0a] z-10 ${
              isCollapsed
                ? "opacity-0 pointer-events-none translate-x-4"
                : "opacity-100 translate-x-0"
            }`}
            title="Contraer menú">
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Floating Expand Button when collapsed */}
        {isCollapsed && (
          <div className="flex justify-center mt-4">
            <button
              onClick={toggleCollapse}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Expandir menú">
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto custom-scrollbar ${isCollapsed ? "py-4" : "p-4"} space-y-2`}>
          <div
            className={`flex flex-col ${isCollapsed ? "gap-4 px-2" : "gap-1"}`}>
            {/* Grouped Nav Items */}
            {navGroups.map((group, groupIdx) => (
              <div key={group.group} className="flex flex-col gap-1">
                {groupIdx > 0 && <hr className="border-white/5 my-2 mx-2" />}

                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.includes(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center ${isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"} rounded-md transition-all duration-150 text-sm font-medium group relative border-l-2 ${
                        isActive
                          ? "bg-white/[0.08] text-white border-emerald-500"
                          : "border-transparent text-neutral-400 hover:text-white hover:bg-white/5"
                      }`}>
                      <item.icon
                        className={`w-4 h-4 flex-none ${isActive ? "text-emerald-400" : ""}`}
                        strokeWidth={1.5}
                      />

                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}

                      {item.label === t("pipeline") &&
                        alertCount > 0 &&
                        (isCollapsed ? (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        ) : (
                          <span className="ml-auto w-4 h-4 rounded-full bg-red-500 text-black text-[9px] font-black flex items-center justify-center animate-pulse">
                            {alertCount}
                          </span>
                        ))}

                      {item.label === t("propuestas") &&
                        suggestions.length > 0 &&
                        (isCollapsed ? (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        ) : (
                          <span className="ml-auto w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center animate-pulse">
                            {suggestions.length}
                          </span>
                        ))}

                      {/* Tooltip */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-4 hidden group-hover:block bg-neutral-800 text-white text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Area - Documentación */}
        <div
          className={`p-4 border-t border-white/5 ${isCollapsed ? "flex justify-center" : ""}`}>
          <Link
            href="/docs"
            title={isCollapsed ? t("documentacion") : undefined}
            className={`flex items-center ${isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"} rounded-md transition-all duration-150 text-sm font-medium group relative ${
              pathname.includes("/docs")
                ? isCollapsed
                  ? "text-emerald-500 border-l-2 border-emerald-500 bg-white/[0.05]"
                  : "bg-white/[0.05] text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
            }`}>
            <BookOpen
              className={`w-4 h-4 flex-none ${pathname.includes("/docs") ? "text-emerald-400" : ""}`}
              strokeWidth={1.5}
            />
            {!isCollapsed && (
              <span className="truncate">{t("documentacion")}</span>
            )}
            {/* Tooltip */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 hidden group-hover:block bg-neutral-800 text-white text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                {t("documentacion")}
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* MOBILE TOP HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 w-full bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1f1f1f] flex items-center justify-between px-4">
        <div className="w-8" /> {/* Placeholder for balance/alignment */}
        <div className="flex justify-center items-center flex-1">
          <img
            src="/images/noctra-logo-white.png"
            alt="Noctra Studio"
            className="h-5 w-auto"
          />
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <User className="w-4 h-4 text-white/50" strokeWidth={1.5} />
        </div>
      </header>
    </>
  );
}
