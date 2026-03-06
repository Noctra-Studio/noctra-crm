"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { isBefore, differenceInDays } from "date-fns";

export function NotificationsDropdown({
  leads,
  proposals,
}: {
  leads: any[];
  proposals: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Aggregate notifications
  const notifications: any[] = [];
  const today = new Date();

  // 1. Red Dot: Urgent/Overdue items (Leads with next_action_date < today)
  leads.forEach((l) => {
    if (
      l.next_action_date &&
      isBefore(new Date(l.next_action_date), today) &&
      l.pipeline_status !== "cerrado" &&
      l.pipeline_status !== "perdido"
    ) {
      notifications.push({
        id: `overdue-${l.id}`,
        type: "red",
        title: "Acción Vencida",
        desc: `La acción para ${l.name} está atrasada.`,
        link: "/forge/pipeline",
      });
    }
  });

  // 2. Yellow Dot: Draft Proposals (no expiry date)
  proposals.forEach((p) => {
    if (p.status === "draft" && !p.valid_until) {
      notifications.push({
        id: `draft-${p.id}`,
        type: "yellow",
        title: "Borrador sin Fecha",
        desc: `Propuesta ${p.title || p.proposal_number || "sin nombre"} no tiene vencimiento.`,
        link: "/forge/proposals",
      });
    }
  });

  // 3. Green Dot: New Leads (status "nuevo", created_at > 2 days ago)
  // Or "New Leads" in general if it means recent? The prompt said "created_at > 2 days".
  // Let's implement Leads that are "nuevo" and older than 2 days as they need attention,
  // OR maybe it just means any new lead created in the last 2 days?
  // Let's go with "status == nuevo and > 2 days" to align with "needs attention" logic,
  // or "status == nuevo" and show green dot. I will show new leads.
  leads.forEach((l) => {
    if (l.pipeline_status === "nuevo") {
      const daysOld = differenceInDays(today, new Date(l.created_at));
      if (daysOld > 2) {
        notifications.push({
          id: `new-${l.id}`,
          type: "green",
          title: "Lead sin contactar",
          desc: `${l.name} lleva ${daysOld} días en Nuevo.`,
          link: "/forge/leads",
        });
      }
    }
  });

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const handleNotificationClick = (id: string) => {
    setReadIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    setIsOpen(false);
  };

  const getDotColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-neutral-700";
    if (type === "red")
      return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
    if (type === "yellow")
      return "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
    if (type === "green")
      return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    return "bg-neutral-500";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group">
        <Bell
          className="w-4 h-4 text-white/60 group-hover:text-white transition-colors"
          strokeWidth={1.5}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#050505]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-[100] bg-[#0f0f0f] border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="uppercase tracking-widest text-[10px] font-bold text-white/70">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">
                {unreadCount} nuevas
              </span>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto forge-scroll custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Bell
                  className="w-6 h-6 text-white/10 mb-2"
                  strokeWidth={1.5}
                />
                <p className="text-xs text-white/30">
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((n) => {
                  const isRead = readIds.has(n.id);
                  return (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => handleNotificationClick(n.id)}
                      className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/[0.04] transition-colors last:border-0 ${isRead ? "opacity-50 grayscale hover:grayscale-0" : ""}`}>
                      <div className="pt-1.5 shrink-0">
                        <div
                          className={`w-2 h-2 rounded-full ${getDotColor(n.type, isRead)}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p
                          className={`text-xs font-semibold ${isRead ? "text-white/40" : "text-white/90"}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-white/40 leading-relaxed">
                          {n.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
