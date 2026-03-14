"use client";

import { useState, useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { localizeForgeHref } from "@/components/forge/forge-navigation";
import {
  FileText,
  Users,
  Briefcase,
  UserPlus,
  FileSignature,
  LayoutDashboard,
  KanbanSquare,
  BarChart,
  BookOpen,
  Send,
  Search,
  Loader2,
} from "lucide-react";

export type QuickCreateActionId =
  | "new-lead"
  | "new-proposal"
  | "new-project"
  | "new-contract";

type CommandAction = {
  id: string;
  label: string;
  sublabel?: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  category: string;
} & (
  | {
      kind: "create";
      createActionId: QuickCreateActionId;
    }
  | {
      kind: "navigate";
      href: string;
    }
);

const QUICK_ACTIONS: CommandAction[] = [
  {
    id: "new-proposal",
    label: "Nueva Propuesta",
    sublabel: "Crear borrador comercial",
    kind: "create",
    createActionId: "new-proposal",
    icon: FileText,
    category: "CREAR",
  },
  {
    id: "new-lead",
    label: "Nuevo Lead",
    sublabel: "Agregar prospecto manualmente",
    kind: "create",
    createActionId: "new-lead",
    icon: Users,
    category: "CREAR",
  },
  {
    id: "new-project",
    label: "Nuevo Proyecto",
    sublabel: "Abrir proyecto operativo",
    kind: "create",
    createActionId: "new-project",
    icon: Briefcase,
    category: "CREAR",
  },
  {
    id: "new-contract",
    label: "Nuevo Contrato",
    sublabel: "Preparar acuerdo manual",
    kind: "create",
    createActionId: "new-contract",
    icon: FileSignature,
    category: "CREAR",
  },
  {
    id: "nav-dashboard",
    label: "Ir a Dashboard",
    kind: "navigate",
    href: "/",
    icon: LayoutDashboard,
    category: "NAVEGACIÓN",
  },
  {
    id: "nav-pipeline",
    label: "Ir a Pipeline",
    kind: "navigate",
    href: "/pipeline",
    icon: KanbanSquare,
    category: "NAVEGACIÓN",
  },
  {
    id: "nav-metrics",
    label: "Ir a Métricas",
    kind: "navigate",
    href: "/metrics",
    icon: BarChart,
    category: "NAVEGACIÓN",
  },
  {
    id: "nav-contracts",
    label: "Ir a Contratos",
    kind: "navigate",
    href: "/contracts",
    icon: Send,
    category: "NAVEGACIÓN",
  },
  {
    id: "nav-documents",
    label: "Ir a Documentos",
    kind: "navigate",
    href: "/documents",
    icon: FileSignature,
    category: "NAVEGACIÓN",
  },
  {
    id: "nav-docs",
    label: "Ir a Docs",
    kind: "navigate",
    href: "/docs",
    icon: BookOpen,
    category: "NAVEGACIÓN",
  },
];

export function CommandBar({
  isOpen,
  onClose,
  onSelectCreateAction,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectCreateAction: (actionId: QuickCreateActionId) => void;
}) {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Search state
  const [searchResults, setSearchResults] = useState<CommandAction[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const displayItems =
    query.trim().length >= 2
      ? searchResults
      : QUICK_ACTIONS.filter((action) =>
          `${action.label} ${action.sublabel || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
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
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const [projectsRes, leadsRes, proposalsRes, contractsRes] =
          await Promise.all([
            supabase
              .from("projects")
              .select("id, name, status")
              .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
              .limit(3),
            supabase
              .from("contact_submissions")
              .select("id, name, email, request_id")
              .or(
                `name.ilike.%${query}%,email.ilike.%${query}%,request_id.ilike.%${query}%`,
              )
              .limit(3),
            supabase
              .from("proposals")
              .select("id, title, proposal_number")
              .or(`title.ilike.%${query}%,proposal_number.ilike.%${query}%`)
              .limit(3),
            supabase
              .from("contracts")
              .select("id, client_name, client_company, contract_number")
              .or(
                `client_name.ilike.%${query}%,client_company.ilike.%${query}%,contract_number.ilike.%${query}%`,
              )
              .limit(3),
          ]);

        const newResults: CommandAction[] = [];

        if (proposalsRes.data) {
          proposalsRes.data.forEach((p) => {
            newResults.push({
              id: `prop-${p.id}`,
              kind: "navigate",
              label: `Propuesta - ${p.title}`,
              sublabel: p.proposal_number || "Sin folio",
              href: `/proposals/${p.id}/edit`,
              icon: FileText,
              category: "PROPUESTAS",
            });
          });
        }

        if (contractsRes.data) {
          contractsRes.data.forEach((c) => {
            newResults.push({
              id: `contract-${c.id}`,
              kind: "navigate",
              label: c.client_name || "Contrato sin cliente",
              sublabel:
                c.contract_number || c.client_company || "Contrato activo",
              href: `/contracts/${c.id}/edit`,
              icon: Send,
              category: "CONTRATOS",
            });
            newResults.push({
              id: `client-${c.id}`,
              kind: "navigate",
              label: `Cliente - ${c.client_name || "Sin nombre"}`,
              sublabel: c.client_company || c.contract_number || "Expediente",
              href: `/clients/${c.id}`,
              icon: UserPlus,
              category: "CLIENTES",
            });
          });
        }

        if (leadsRes.data) {
          leadsRes.data.forEach((p) => {
            newResults.push({
              id: `lead-${p.id}`,
              kind: "navigate",
              label: p.name,
              sublabel: p.request_id || p.email || "Lead reciente",
              href: `/leads?leadId=${p.id}`,
              icon: UserPlus,
              category: "LEADS",
            });
          });
        }

        if (projectsRes.data) {
          projectsRes.data.forEach((p) => {
            newResults.push({
              id: `proj-${p.id}`,
              kind: "navigate",
              label: p.name,
              sublabel: p.status || "Proyecto",
              href: `/projects?projectId=${p.id}`,
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
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [query, supabase]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (displayItems.length === 0 && e.key !== "Escape") return;

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

  const handleSelect = (action: CommandAction) => {
    if (action.kind === "create") {
      onSelectCreateAction(action.createActionId);
      onClose();
      return;
    }

    router.push(localizeForgeHref(locale, action.href));
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
            placeholder="Crear algo o buscar leads, propuestas, contratos y proyectos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto forge-scroll">
          {query.trim().length >= 2 && displayItems.length === 0 && !isSearching ? (
            <div className="py-8 text-center">
              <p className="text-white/20 text-sm">
                Sin resultados para '{query}'
              </p>
            </div>
          ) : displayItems.length === 0 && !isSearching ? (
            <div className="py-8 text-center">
              <p className="text-white/20 text-sm">
                No hay acciones disponibles.
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
                            {action.kind === "create" ? "↵ abrir" : "↵ ir"}
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
