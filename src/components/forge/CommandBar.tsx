"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  FileText,
  Users,
  Briefcase,
  UserPlus,
  LayoutDashboard,
  KanbanSquare,
  BarChart,
  BookOpen,
  Search,
  Loader2,
} from "lucide-react";

interface Action {
  id: string;
  label: string;
  sublabel?: string; // Optional for search results
  href: string;
  icon: any;
  category: string;
}

const QUICK_ACTIONS: Action[] = [
  {
    id: "new-proposal",
    label: "Nueva Propuesta",
    href: "/forge/propuestas/nueva",
    icon: FileText,
    category: "ACCIONES RÁPIDAS",
  },
  {
    id: "new-lead",
    label: "Nuevo Lead",
    href: "/forge/leads/nuevo",
    icon: Users,
    category: "ACCIONES RÁPIDAS",
  },
  {
    id: "new-project",
    label: "Nuevo Proyecto",
    href: "/forge/projects/nuevo",
    icon: Briefcase,
    category: "ACCIONES RÁPIDAS",
  },
  {
    id: "new-client",
    label: "Nuevo Cliente",
    href: "/forge/clientes/nuevo",
    icon: UserPlus,
    category: "ACCIONES RÁPIDAS",
  },
  {
    id: "nav-dashboard",
    label: "Ir a Dashboard",
    href: "/forge",
    icon: LayoutDashboard,
    category: "NAVEGACIÓN",
  },
  {
    id: "nav-pipeline",
    label: "Ir a Pipeline",
    href: "/forge/pipeline",
    icon: KanbanSquare,
    category: "NAVEGACIÓN",
  },
  {
    id: "nav-metrics",
    label: "Ir a Métricas",
    href: "/forge/metricas",
    icon: BarChart,
    category: "NAVEGACIÓN",
  },
  {
    id: "nav-docs",
    label: "Ir a Docs",
    href: "/forge/docs",
    icon: BookOpen,
    category: "NAVEGACIÓN",
  },
];

export function CommandBar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Search state
  const [searchResults, setSearchResults] = useState<Action[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // If query is short, we filter QUICK_ACTIONS. If >= 3, we use searchResults.
  const displayItems =
    query.length >= 3
      ? searchResults
      : QUICK_ACTIONS.filter((action) =>
          action.label.toLowerCase().includes(query.toLowerCase()),
        );

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSearchResults([]);
      setSelectedIndex(0);
      setIsSearching(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset index when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayItems.length]);

  // Debounced Supabase search
  useEffect(() => {
    if (query.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const [projectsRes, prospectsRes, proposalsRes, clientsRes] =
          await Promise.all([
            supabase
              .from("projects")
              .select("id, name")
              .ilike("name", `%${query}%`)
              .limit(3),
            supabase
              .from("prospects")
              .select("id, name, company_name")
              .or(`name.ilike.%${query}%,company_name.ilike.%${query}%`)
              .limit(3),
            supabase
              .from("proposals")
              .select("id, title, public_uuid")
              .ilike("title", `%${query}%`)
              .limit(3),
            supabase
              .from("profiles")
              .select("id, email, company_name")
              .eq("role", "client")
              .or(`company_name.ilike.%${query}%,email.ilike.%${query}%`)
              .limit(3),
          ]);

        const newResults: Action[] = [];

        if (proposalsRes.data) {
          proposalsRes.data.forEach((p) => {
            newResults.push({
              id: `prop-${p.id}`,
              label: `Propuesta - ${p.title}`,
              sublabel: p.public_uuid.split("-")[0].toUpperCase(),
              href: `/forge/proposals/${p.id}`,
              icon: FileText,
              category: "PROPUESTAS",
            });
          });
        }

        if (clientsRes.data) {
          clientsRes.data.forEach((c) => {
            newResults.push({
              id: `cli-${c.id}`,
              // Provide a fallback name if company_name is null
              label: c.company_name || c.email.split("@")[0],
              sublabel: c.email,
              href: `/forge/clients/${c.id}`,
              icon: Users,
              category: "CLIENTES",
            });
          });
        }

        if (prospectsRes.data) {
          prospectsRes.data.forEach((p) => {
            newResults.push({
              id: `lead-${p.id}`,
              label: p.name,
              sublabel: p.company_name || "Sin empresa",
              href: `/forge/leads/${p.id}`,
              icon: UserPlus,
              category: "LEADS",
            });
          });
        }

        if (projectsRes.data) {
          projectsRes.data.forEach((p) => {
            newResults.push({
              id: `proj-${p.id}`,
              label: p.name,
              href: `/forge/projects/${p.id}`,
              icon: Briefcase,
              category: "PROYECTOS",
            });
          });
        }

        setSearchResults(newResults);
      } catch (err) {
        console.error("Global search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, supabase]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % displayItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + displayItems.length) % displayItems.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (displayItems[selectedIndex]) {
          handleSelect(displayItems[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, displayItems, selectedIndex, onClose]);

  const handleSelect = (action: Action) => {
    router.push(action.href);
    onClose();
  };

  if (!isOpen) return null;

  // Extract unique categories in exact appearance order
  const getCategories = () => {
    const cats: string[] = [];
    displayItems.forEach((a) => {
      if (!cats.includes(a.category)) cats.push(a.category);
    });
    return cats;
  };

  const categories = getCategories();

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Input */}
        <div className="flex items-center px-4 border-b border-white/10 shrink-0 relative">
          {isSearching ? (
            <Loader2
              className="w-4 h-4 text-emerald-500 mr-3 animate-spin"
              strokeWidth={1.5}
            />
          ) : (
            <Search className="w-4 h-4 text-white/40 mr-3" strokeWidth={1.5} />
          )}

          <input
            ref={inputRef}
            type="text"
            className="w-full py-4 bg-transparent text-white placeholder:text-white/20 text-sm focus:outline-none"
            placeholder="Buscar proyectos, clientes, propuestas o leads..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto forge-scroll">
          {query.length >= 3 && displayItems.length === 0 && !isSearching ? (
            <div className="py-8 text-center">
              <p className="text-white/20 text-sm">
                Sin resultados para '{query}'
              </p>
            </div>
          ) : displayItems.length === 0 && !isSearching ? (
            <div className="py-8 text-center">
              <p className="text-white/20 text-sm">
                Escribe al menos 3 caracteres para buscar globalmente.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {categories.map((category) => {
                const categoryActions = displayItems.filter(
                  (a) => a.category === category,
                );

                return (
                  <div key={category} className="mb-4 last:mb-0 space-y-1">
                    <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white/30">
                      {category}
                    </p>
                    {categoryActions.map((action) => {
                      const globalIndex = displayItems.indexOf(action);
                      const active = globalIndex === selectedIndex;
                      const Icon = action.icon;

                      return (
                        <button
                          key={action.id}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${active ? "bg-white/5" : "hover:bg-white/5"}`}
                          onClick={() => handleSelect(action)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}>
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${active ? "text-emerald-400" : "text-white/30"}`}
                              strokeWidth={1.5}
                            />
                            <div className="flex flex-col min-w-0">
                              <span
                                className={`text-sm truncate ${active ? "text-white" : "text-white/70"}`}>
                                {action.label}
                              </span>
                              {action.sublabel && (
                                <span className="text-[10px] text-white/30 truncate mt-0.5">
                                  {action.sublabel}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-mono shrink-0 transition-opacity duration-200 ${active ? "text-white/40 opacity-100" : "opacity-0"}`}>
                            ↵ ir
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex gap-4">
            <span className="text-[10px] text-white/30 flex items-center gap-1">
              <kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded">
                ↑
              </kbd>
              <kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded">
                ↓
              </kbd>{" "}
              Navegar
            </span>
            <span className="text-[10px] text-white/30 flex items-center gap-1">
              <kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded">
                ↵
              </kbd>{" "}
              Seleccionar
            </span>
          </div>
          <span className="text-[10px] text-white/30 flex items-center gap-1">
            <kbd className="font-sans bg-white/10 px-1.5 py-0.5 rounded">
              esc
            </kbd>{" "}
            Cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
