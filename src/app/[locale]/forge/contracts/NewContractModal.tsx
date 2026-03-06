"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  X,
  Search,
  ArrowRight,
  Globe,
  ShoppingCart,
  Code2,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
};

const SERVICES = [
  {
    id: "web_presence",
    name: "Presencia Web",
    description: "Sitios corporativos y landing pages",
    icon: Globe,
    items: [
      {
        name: "Desarrollo Web",
        description: "Sitio web corporativo optimizado para conversión.",
        quantity: 1,
        unit_price: 20000,
      },
    ],
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Tiendas online completas",
    icon: ShoppingCart,
    items: [
      {
        name: "E-Commerce",
        description:
          "Tienda online con pasarela de pagos y gestión de productos.",
        quantity: 1,
        unit_price: 35000,
      },
    ],
  },
  {
    id: "custom_system",
    name: "Sistema Personalizado",
    description: "Software a la medida y CRMs",
    icon: Code2,
    items: [
      {
        name: "Sistema a Medida",
        description: "Arquitectura y desarrollo de software personalizado.",
        quantity: 1,
        unit_price: 35000,
      },
    ],
  },
];

export function NewContractModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [manualEntry, setManualEntry] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
    } else {
      setStep(1);
      setSelectedLead(null);
      setSearch("");
    }
  }, [isOpen]);

  const fetchLeads = async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("id, name, email, company_name")
      .order("created_at", { ascending: false })
      .limit(20);
    setLeads(data || []);
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async (serviceId: string) => {
    setIsCreating(true);
    const service = SERVICES.find((s) => s.id === serviceId);

    try {
      const { data: contract, error } = await supabase
        .from("contracts")
        .insert({
          client_name: selectedLead?.name || manualEntry.name,
          client_email: selectedLead?.email || manualEntry.email,
          client_company: selectedLead?.company_name || manualEntry.company,
          total_price: service?.items[0].unit_price || 0,
          items: service?.items || [],
          status: "draft",
        })
        .select("id")
        .single();

      if (error) throw error;
      router.push(`/forge/contracts/${contract.id}/edit`);
    } catch (err) {
      console.error(err);
      alert("Error al crear contrato");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
              Manual / Paso {step} de 2
            </span>
            <h3 className="text-lg font-bold text-white uppercase italic">
              Nuevo Contrato
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-neutral-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 1 ? (
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                  Buscar Lead Existente
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre o correo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 px-10 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar focus:outline-none">
                  {filteredLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead);
                        setManualEntry({ name: "", email: "", company: "" });
                      }}
                      className={`text-left p-4 border transition-all flex items-center justify-between group outline-none ${
                        selectedLead?.id === lead.id
                          ? "bg-emerald-500/10 border-emerald-500/50"
                          : "bg-white/[0.01] border-white/5 hover:border-white/10"
                      }`}>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {lead.name}
                        </p>
                        <p className="text-[10px] font-mono text-neutral-400">
                          {lead.email}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-all ${selectedLead?.id === lead.id ? "text-emerald-500 translate-x-1" : "text-neutral-800"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[9px] font-mono text-neutral-700 uppercase">
                  o Registrar Manualmente
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Juan Perez"
                      value={manualEntry.name}
                      onChange={(e) => {
                        setManualEntry({
                          ...manualEntry,
                          name: e.target.value,
                        });
                        setSelectedLead(null);
                      }}
                      className="w-full bg-white/[0.02] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={manualEntry.email}
                      onChange={(e) => {
                        setManualEntry({
                          ...manualEntry,
                          email: e.target.value,
                        });
                        setSelectedLead(null);
                      }}
                      className="w-full bg-white/[0.02] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 grid grid-cols-1 gap-3">
              <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                Seleccionar Plantilla de Servicio
              </label>
              {SERVICES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleCreate(service.id)}
                  disabled={isCreating}
                  className="group relative flex items-center gap-6 p-6 bg-white/[0.01] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all text-left overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 group-hover:text-emerald-400 transition-all shrink-0">
                    <service.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1 uppercase italic tracking-tight group-hover:text-emerald-400 transition-colors">
                      {service.name}
                    </h4>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-800 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {step === 1 && (
          <div className="p-6 border-t border-white/5 flex justify-end">
            <button
              disabled={
                !selectedLead && (!manualEntry.name || !manualEntry.email)
              }
              onClick={() => setStep(2)}
              className="bg-white text-black px-6 py-3 flex items-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-20 uppercase font-black text-[11px] tracking-widest">
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
