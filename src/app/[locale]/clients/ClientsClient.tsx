"use client";

import { useState } from "react";
import {
  Search,
  UserCheck,
  ExternalLink,
  Calendar,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Filter,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type ClientCardData = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  serviceType: string | null;
  status: string | null;
  phase: string | null;
  source: string;
  projectId: string | null;
  createdAt: string;
};

export function ClientsClient({
  initialClients,
}: {
  initialClients: ClientCardData[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "contract_only">(
    "all",
  );

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

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case "active":
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "pending_project":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
    }
  };

  const getPhaseLabel = (client: ClientCardData) => {
    if (client.source === "contract") return "PDTE. PROYECTO";
    if (client.phase) return client.phase.toUpperCase();
    return client.status?.toUpperCase() || "ACTIVO";
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
            <option value="all">Estatus: Todos</option>
            <option value="active">Con Proyecto Activo</option>
            <option value="contract_only">Solo Contrato</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="group block bg-[#0a0a0a] border border-white/5 hover:border-emerald-500/30 transition-all overflow-hidden relative">
              {/* Card Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight uppercase italic underline decoration-transparent group-hover:decoration-emerald-500/30 underline-offset-4">
                    {client.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[11px] font-mono text-neutral-300 uppercase tracking-widest">
                      {client.company || "Empresa no especificada"}
                    </p>
                  </div>
                  {/* INLINE CONTACT INFO */}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[10px] font-mono text-neutral-500 lowercase">
                      {client.email || "sin email"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`px-2 py-1 border text-[9px] font-black uppercase tracking-widest rounded-sm ${getStatusColor(client.status)}`}>
                    {getPhaseLabel(client)}
                  </div>
                </div>
              </div>

              {/* Card Info Grid */}
              <div className="p-6 grid grid-cols-2 gap-y-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3 text-neutral-700" />{" "}
                    Servicio
                  </span>
                  <p className="text-xs font-bold text-neutral-300 truncate pr-4 uppercase">
                    {(client.serviceType || "No especificado").replace(
                      "_",
                      " ",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-neutral-700" /> Inicio
                  </span>
                  <p className="text-xs font-bold text-neutral-300">
                    {client.createdAt
                      ? format(new Date(client.createdAt), "dd MMM yyyy", {
                          locale: es,
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between group-hover:bg-emerald-500/[0.02] transition-colors">
                <div className="flex gap-4">
                  {client.projectId && (
                    <Link
                      href={`/projects?id=${client.projectId}`}
                      className="text-[9px] font-bold text-neutral-400 hover:text-emerald-500 transition-colors uppercase tracking-widest flex items-center gap-1.5">
                      Ver Proyecto <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <Link
                  href={`/clients/${client.id}`}
                  className="text-[10px] font-bold text-neutral-400 group-hover:text-emerald-500 transition-colors uppercase tracking-widest">
                  Expediente completo
                </Link>
              </div>

              {/* Background Accent */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity pointer-events-none">
                <UserCheck className="w-32 h-32 -mr-16 -mt-16" />
              </div>
            </div>
          ))}

          {filteredClients.length === 0 && (
            <div className="col-span-full border border-dashed border-white/5 rounded-lg py-20 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-neutral-700" />
              </div>
              <p className="text-[11px] font-mono text-neutral-300 uppercase tracking-widest">
                No se encontraron clientes activos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
