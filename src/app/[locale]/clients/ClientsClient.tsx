"use client";

import { useState, useEffect } from "react";
import {
  Search,
  UserCheck,
  ExternalLink,
  Calendar,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  PlusCircle,
  FileText,
  MessageSquare,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { ForgeSkeleton, ForgeMetricCardSkeleton } from "@/components/forge/ForgeSkeleton";
import { toast } from "sonner";

type ClientCardData = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  serviceType: string | null;
  status: string | null;
  source: string;
  projectIds: string[];
  totalRevenue: number;
  activeProjects: number;
  createdAt: string;
  lastActivity: string;
  health: 'healthy' | 'attention' | 'risk';
};

export function ClientsClient({
  initialClients,
}: {
  initialClients: ClientCardData[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "contract_only">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [focusIndex, setFocusIndex] = useState(0);

  const filteredClients = initialClients.filter((c) => {
    const matchesSearch =
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "active") return matchesSearch && c.source === "project";
    if (filter === "contract_only")
      return matchesSearch && c.source === "contract";
    return matchesSearch;
  });

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleNavigate = (e: CustomEvent<{ direction: "up" | "down" }>) => {
      if (filteredClients.length === 0) return;
      setFocusIndex(prev => {
        const next = e.detail.direction === "down" ? prev + 1 : prev - 1;
        return (next + filteredClients.length) % filteredClients.length;
      });
    };

    const handleSelect = () => {
      const activeClient = filteredClients[focusIndex];
      if (activeClient) {
        window.location.href = `/es/clients/${activeClient.id}`;
      }
    };

    window.addEventListener("forge-navigate", handleNavigate as EventListener);
    window.addEventListener("forge-select-active", handleSelect as EventListener);
    return () => {
      window.removeEventListener("forge-navigate", handleNavigate as EventListener);
      window.removeEventListener("forge-select-active", handleSelect as EventListener);
    };
  }, [filteredClients, focusIndex]);

  const getHealthBadge = (health: ClientCardData['health']) => {
    switch (health) {
      case 'healthy':
        return {
          label: 'Saludable',
          color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
          icon: <CheckCircle2 className="w-2.5 h-2.5" />
        };
      case 'attention':
        return {
          label: 'Atención',
          color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
          icon: <AlertCircle className="w-2.5 h-2.5" />
        };
      case 'risk':
        return {
          label: 'En Riesgo',
          color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
          icon: <AlertCircle className="w-2.5 h-2.5" />
        };
    }
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050505]">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0a0a0a]">
        <div>
          <h1 className="text-xl font-bold text-white uppercase italic flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-500" />
            Clientes Activos
          </h1>
          <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest mt-1">
            Gestión de relaciones y proyectos en curso
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white/[0.02] border border-white/10 p-1 rounded-md">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white/5 text-emerald-400" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded transition-colors ${viewMode === "table" ? "bg-white/5 text-emerald-400" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-white/5 flex items-center gap-4 shrink-0 bg-[#080808]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 px-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-300" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-transparent text-[10px] font-mono text-neutral-400 uppercase tracking-widest focus:outline-none cursor-pointer">
            <option value="all">Todos</option>
            <option value="active">Proyectos Activos</option>
            <option value="contract_only">Solo Contrato</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <ForgeMetricCardSkeleton />
              <ForgeMetricCardSkeleton />
              <ForgeMetricCardSkeleton />
              <ForgeMetricCardSkeleton />
              <ForgeMetricCardSkeleton />
              <ForgeMetricCardSkeleton />
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredClients.map((client, idx) => {
                const health = getHealthBadge(client.health);
                const isFocused = idx === focusIndex;
                return (
                  <div
                    key={client.id}
                    onMouseEnter={() => setFocusIndex(idx)}
                    className={`group bg-[#0a0a0a] border hover:border-emerald-500/30 transition-all rounded-lg overflow-hidden flex flex-col relative ${
                      isFocused ? "border-emerald-500/40 bg-white/[0.02]" : "border-white/5"
                    }`}
                  >
                    {/* Hover Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button title="Enviar Mensaje" className="p-1.5 bg-white/5 border border-white/10 hover:border-emerald-500/50 rounded-md text-neutral-400 hover:text-emerald-400 transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <Link href={`/proposals?new=${client.id}`} title="Nueva Propuesta" className="p-1.5 bg-white/5 border border-white/10 hover:border-emerald-500/50 rounded-md text-neutral-400 hover:text-emerald-400 transition-colors">
                        <PlusCircle className="w-3.5 h-3.5" />
                      </Link>
                      <Link href={`/clients/${client.id}`} title="Ver Detalle" className="p-1.5 bg-white/5 border border-white/10 hover:border-emerald-500/50 rounded-md text-neutral-400 hover:text-emerald-400 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Card Header */}
                    <div className="p-5 border-b border-white/5 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 ${health.color}`}>
                          {health.icon}
                          {health.label}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                        {client.name}
                      </h3>
                      <p className="text-[11px] font-medium text-neutral-400 truncate uppercase tracking-wide">
                        {client.company || "Personal"}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-500 truncate lowercase">
                        {client.email}
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="p-5 grid grid-cols-2 gap-4 flex-1">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3" /> Revenue
                        </span>
                        <p className="text-sm font-bold text-white tracking-tight">
                          {formatCurrency(client.totalRevenue)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Activity className="w-3 h-3" /> Proyectos
                        </span>
                        <p className="text-sm font-bold text-white">
                          {client.activeProjects} activos
                        </p>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> Última actividad
                        </span>
                        <p className="text-xs font-semibold text-neutral-300">
                          {client.lastActivity ? format(new Date(client.lastActivity), "d 'de' MMMM", { locale: es }) : 'No hay registro'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Footer */}
                    <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01] flex justify-between items-center group-hover:bg-emerald-500/[0.02]">
                       <Link href={`/clients/${client.id}`} className="text-[9px] font-bold text-neutral-400 hover:text-emerald-500 transition-colors uppercase tracking-widest">
                        Expediente Completo
                      </Link>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="table"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest text-center">Salud</th>
                    <th className="px-6 py-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Revenue</th>
                    <th className="px-6 py-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest text-center">Proyectos</th>
                    <th className="px-6 py-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Actividad</th>
                    <th className="px-6 py-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClients.map((client, idx) => {
                    const health = getHealthBadge(client.health);
                    const isFocused = idx === focusIndex;
                    return (
                      <tr 
                        key={client.id} 
                        onMouseEnter={() => setFocusIndex(idx)}
                        className={`group transition-colors ${isFocused ? "bg-emerald-500/[0.04]" : "hover:bg-emerald-500/[0.02]"}`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{client.name}</span>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wide">{client.company}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest rounded-full ${health.color}`}>
                            {health.icon}
                            {health.label}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-mono font-bold text-emerald-500/80">{formatCurrency(client.totalRevenue)}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-bold text-white">{client.activeProjects}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs text-neutral-400">{client.lastActivity ? format(new Date(client.lastActivity), "dd/MM/yyyy") : '-'}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/clients/${client.id}`} className="p-2 bg-white/5 hover:bg-emerald-500/20 rounded-md text-neutral-400 hover:text-emerald-400 transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}

          {filteredClients.length === 0 && (
            <ForgeEmptyState
              icon={initialClients.length === 0 ? "user-check" : "search"}
              eyebrow="Clientes"
              title={
                initialClients.length === 0
                  ? "Aún no hay clientes activos"
                  : "No encontramos clientes con ese filtro"
              }
              description={
                initialClients.length === 0
                  ? "Esta vista se alimenta cuando una relación comercial ya tiene contrato firmado o proyecto operativo."
                  : "Prueba con otro nombre, empresa o email."
              }
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
