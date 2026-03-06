"use client";

import { useState } from "react";
import { ForgeSidebar } from "@/components/forge/ForgeSidebar";
import { format } from "date-fns";
import {
  Plus,
  Search,
  MoreHorizontal,
  Send,
  Eye,
  Edit3,
  FileText,
  ExternalLink,
  ChevronRight,
  Shield,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { NewContractModal } from "./NewContractModal";

type Contract = {
  id: string;
  contract_number: string;
  client_name: string;
  client_company: string;
  total_price: number;
  status: "draft" | "sent" | "signed" | "cancelled";
  noctra_signed: boolean;
  signed_by_client: boolean;
  created_at: string;
  proposal?: {
    proposal_number: string;
  };
};

export default function ContractsClient({
  initialContracts,
}: {
  initialContracts: any[];
}) {
  const [contracts] = useState<Contract[]>(initialContracts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredContracts = contracts.filter(
    (c) =>
      c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contract_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.client_company &&
        c.client_company.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "text-neutral-300 bg-neutral-500/10 border-neutral-500/20";
      case "sent":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "signed":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "cancelled":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-neutral-300 bg-neutral-500/10 border-neutral-500/20";
    }
  };

  return (
    <>
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#050505]/50 backdrop-blur-xl sticky top-0 z-10">
        <div>
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-300 mb-1">
            Legal & Acuerdos
          </h2>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Contratos
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-4 py-2 flex items-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 group">
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span className="text-[11px] font-black uppercase tracking-widest">
            Nuevo Contrato
          </span>
        </button>
      </header>

      <NewContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-white/5 flex items-center gap-4 shrink-0 overflow-x-auto bg-[#050505]">
        <div className="relative flex-1 max-w-md min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300" />
          <input
            type="text"
            placeholder="Buscar por cliente, empresa o folio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 px-9 py-2 text-[11px] font-mono text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "draft", "sent", "signed"].map((status) => (
            <button
              key={status}
              className="px-3 py-1.5 border border-white/5 bg-white/[0.02] text-[9px] font-mono uppercase tracking-widest text-neutral-300 hover:text-white hover:border-white/20 transition-all capitalize">
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto px-8 py-6 forge-scroll">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                Folio
              </th>
              <th className="text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                Cliente / Empresa
              </th>
              <th className="text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                Propuesta
              </th>
              <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                Inversión
              </th>
              <th className="text-center py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                Firmas
              </th>
              <th className="text-center py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                Estatus
              </th>
              <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-neutral-300 font-medium">
                Fecha
              </th>
              <th className="py-4 px-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <div className="text-neutral-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-4">
                    No se encontraron contratos
                  </div>
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="group hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-transparent">
                  <td className="py-5 px-4 font-mono text-[11px] text-white/40 group-hover:text-emerald-500 transition-colors">
                    {contract.contract_number}
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-200">
                        {contract.client_name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {contract.client_company || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4 font-mono text-[10px] text-neutral-300">
                    {contract.proposal?.proposal_number || "Manual"}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <span className="font-mono text-[11px] font-bold text-white">
                      ${contract.total_price?.toLocaleString("es-MX")}
                      <span className="text-[9px] text-neutral-400 ml-1">
                        MXN
                      </span>
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex justify-center gap-3">
                      <div
                        title="Firma Noctra"
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${contract.noctra_signed ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-white/5 border-white/10 text-neutral-700"}`}>
                        <Shield className="w-2.5 h-2.5" />
                      </div>
                      <div
                        title="Firma Cliente"
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${contract.signed_by_client ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-white/5 border-white/10 text-neutral-700"}`}>
                        <UserCheck className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-0.5 border text-[9px] font-mono uppercase tracking-widest ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-right font-mono text-[10px] text-neutral-300">
                    {format(new Date(contract.created_at), "dd/MM/yyyy")}
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex justify-end relative">
                      <Link
                        href={`/forge/contracts/${contract.id}/edit`}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-group-hover:100">
                        <Edit3 className="w-4 h-4 text-neutral-300" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
