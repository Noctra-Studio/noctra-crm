"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  StickyNote,
  UserCheck,
  Users,
  Briefcase,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface CommandDropdownProps {
  query: string;
  onSelect: (href: string) => void;
  isOpen: boolean;
}

export function CommandDropdown({
  query,
  onSelect,
  isOpen,
}: CommandDropdownProps) {
  const t = useTranslations("forge.search");
  const supabase = createClient();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchResults(query);
    }, 250); // debounce 250ms

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    // Simplified unified search using ILIKE across the 4 main modules.
    // In a real scenario, this would ideally be dedicated RPC or unified view.
    try {
      const q = `%${searchQuery}%`;
      const [pRes, cRes, lRes, prRes] = await Promise.all([
        supabase
          .from("proposals")
          .select("id, title, folio")
          .ilike("title", q)
          .limit(3),
        supabase
          .from("clients")
          .select("id, first_name, last_name, company")
          .or(`first_name.ilike.${q},last_name.ilike.${q},company.ilike.${q}`)
          .limit(3),
        supabase
          .from("leads")
          .select("id, first_name, last_name, company")
          .or(`first_name.ilike.${q},last_name.ilike.${q},company.ilike.${q}`)
          .limit(3),
        supabase
          .from("projects")
          .select("id, name, folio")
          .or(`name.ilike.${q},folio.ilike.${q}`)
          .limit(3),
      ]);

      const unified = [
        ...(pRes.data?.map((o) => ({
          type: "proposal",
          id: o.id,
          title: `${o.folio || ""} ${o.title}`,
          icon: StickyNote,
        })) || []),
        ...(cRes.data?.map((o) => ({
          type: "client",
          id: o.id,
          title: `${o.first_name} ${o.last_name} - ${o.company || ""}`,
          icon: UserCheck,
        })) || []),
        ...(lRes.data?.map((o) => ({
          type: "lead",
          id: o.id,
          title: `${o.first_name} ${o.last_name} - ${o.company || ""}`,
          icon: Users,
        })) || []),
        ...(prRes.data?.map((o) => ({
          type: "project",
          id: o.id,
          title: `${o.folio || ""} ${o.name}`,
          icon: Briefcase,
        })) || []),
      ];

      setResults(unified.slice(0, 8)); // Max 8 results to avoid scroll madness
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full mt-2 w-full min-w-[300px] left-0 md:left-1/2 md:-translate-x-1/2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
      {!query ? (
        <div className="p-2 space-y-4">
          <div>
            <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">
              {t("accionesRapidas")}
            </p>
            <button
              onClick={() => onSelect("/forge/proposals/new")}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md text-sm text-white/80 transition-colors text-left">
              <StickyNote className="w-4 h-4 text-white/40" strokeWidth={1.5} />{" "}
              {t("acciones.nuevaPropuesta")}
            </button>
            <button
              onClick={() => onSelect("/forge/leads/new")}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md text-sm text-white/80 transition-colors text-left">
              <Users className="w-4 h-4 text-white/40" strokeWidth={1.5} />{" "}
              {t("acciones.nuevoLead")}
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="p-8 flex items-center justify-center text-white/40">
          <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
        </div>
      ) : results.length > 0 ? (
        <div className="p-2">
          {results.map((r, i) => {
            const Icon = r.icon;

            const baseUrls: Record<string, string> = {
              proposal: "/forge/proposals",
              client: "/forge/clients",
              lead: "/forge/leads",
              project: "/forge/projects",
            };
            const baseUrl = baseUrls[r.type];

            return (
              <button
                key={`${r.type}-${r.id}-${i}`}
                onClick={() => onSelect(`${baseUrl}/${r.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-md text-sm text-white/80 transition-colors text-left group">
                <Icon
                  className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors"
                  strokeWidth={1.5}
                />
                <span className="truncate">{r.title}</span>
              </button>
            );
          })}
          <div className="px-3 pt-2 mt-2 border-t border-white/5">
            <button
              onClick={() => onSelect(`/forge/search?q=${query}`)}
              className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1 w-full p-2 hover:bg-white/5 rounded-md">
              {t("verTodos")}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-white/40 text-sm">
          {t("sinResultados", { query })}
        </div>
      )}
    </div>
  );
}
