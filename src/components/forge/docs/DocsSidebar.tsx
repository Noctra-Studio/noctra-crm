"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const DOCS_NAVIGATION: NavSection[] = [
  {
    title: "Primeros Pasos",
    items: [{ id: "getting-started", label: "Guía de Inicio" }],
  },
  {
    title: "Módulos Principales",
    items: [
      { id: "dashboard", label: "Dashboard" },
      { id: "leads", label: "Leads" },
      { id: "clients", label: "Clientes" },
      { id: "pipeline", label: "Pipeline" },
      { id: "proposals", label: "Propuestas" },
      { id: "contracts", label: "Contratos" },
      { id: "projects", label: "Proyectos" },
      { id: "metrics", label: "Métricas" },
    ],
  },
  {
    title: "Inteligencia Artificial",
    items: [{ id: "noctra-ai", label: "NOCTRA AI" }],
  },
  {
    title: "Configuración",
    items: [{ id: "security", label: "Seguridad y 2FA" }],
  },
  {
    title: "Para Desarrolladores",
    items: [{ id: "architecture", label: "Stack y Arquitectura" }],
  },
  {
    title: "Referencia Rápida",
    items: [{ id: "shortcuts", label: "Teclado y Atajos" }],
  },
];

export function DocsSidebar({
  activeDocId,
  onSelect,
}: {
  activeDocId: string;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filteredNav = DOCS_NAVIGATION.map((sec) => ({
    ...sec,
    items: sec.items.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((sec) => sec.items.length > 0);

  return (
    <aside className="w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-white/5 py-8 px-4 custom-scrollbar lg:block hidden">
      <div className="relative mb-8">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"
          strokeWidth={1.5}
        />
        <input
          type="text"
          placeholder="Buscar en docs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-[11px] font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/30 transition-colors focus:bg-white/[0.05]"
        />
      </div>

      <nav className="space-y-8 pb-12">
        {filteredNav.map((section) => (
          <div key={section.title} className="space-y-3">
            <h4 className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-mono px-2">
              {section.title}
            </h4>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const isActive = item.id === activeDocId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-all duration-150 ${
                      isActive
                        ? "bg-white/10 text-white font-medium shadow-sm"
                        : "text-white/50 hover:text-white/90 hover:bg-white/[0.03]"
                    }`}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {filteredNav.length === 0 && (
          <div className="text-xs text-white/30 text-center italic py-4">
            No se encontraron resultados
          </div>
        )}
      </nav>
    </aside>
  );
}
