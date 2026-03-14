"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  X,
  Search,
  ArrowRight,
  ChevronRight,
  Globe,
  ShoppingCart,
  Code2,
  BarChart,
  Settings,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createProposalAction } from "@/app/actions/proposals";
import { UpgradeLimitModal } from "@/components/forge/modals/UpgradeLimitModal";
import { ForgeEmptyState } from "@/components/forge/ForgeEmptyState";

type Lead = {
  id: string;
  name: string;
  email: string;
  service_interest: string;
};

const SERVICES = [
  {
    id: "web_presence",
    name: "Presencia Web",
    description: "desde $20,000 MXN",
    icon: Globe,
    basePrice: 20000,
    deliverables: [
      "Sitio web de 5-10 páginas estratégicas",
      "Optimización SEO técnica incluida",
      "Diseño mobile-first responsive",
      "Velocidad < 1.5 segundos",
      "60 días de soporte post-lanzamiento",
      "Analytics y tracking configurado",
      "Documentación y video walkthrough",
    ],
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "desde $35,000 MXN",
    icon: ShoppingCart,
    basePrice: 35000,
    deliverables: [
      "Tienda online completa (10-20 páginas)",
      "Pasarela de pago integrada",
      "Carrito y checkout optimizado",
      "Panel de administración de productos",
      "90 días de soporte post-lanzamiento",
      "Velocidad < 1.5 segundos",
      "SEO para productos incluido",
    ],
  },
  {
    id: "custom_system",
    name: "Sistema Personalizado",
    description: "$35,000 - $150,000 MXN",
    icon: Code2,
    basePrice: 35000,
    deliverables: [
      "Análisis y arquitectura del sistema",
      "Desarrollo backend personalizado",
      "Panel de administración",
      "API documentation",
      "Soporte personalizado",
    ],
  },
  {
    id: "seo_growth",
    name: "SEO & Crecimiento",
    description: "$8,000 MXN/mes",
    icon: BarChart,
    basePrice: 8000,
    deliverables: [
      "Auditoría SEO mensual",
      "Optimización de contenidos",
      "Link building estratégico",
      "Reporte de métricas mensual",
    ],
  },
  {
    id: "ongoing_management",
    name: "Gestión Continua",
    description: "$5,500 MXN/mes",
    icon: Settings,
    basePrice: 5500,
    deliverables: [
      "Soporte técnico prioritario",
      "Actualizaciones de seguridad",
      "Pequeñas modificaciones mensuales",
      "Monitoreo 24/7",
    ],
  },
];

export function NewProposalModal({
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
    } else {
      setStep(1);
      setSelectedLead(null);
      setSearch("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  const fetchLeads = async () => {
    const { data } = await supabase
      .from("contact_submissions")
      .select("id, name, email, service_interest")
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
    setErrorMessage(null);
    const service = SERVICES.find((s) => s.id === serviceId);

    try {
      const result = await createProposalAction({
        lead_id: selectedLead?.id,
        manual_lead:
          !selectedLead?.id && manualEntry.name
            ? {
                name: manualEntry.name,
                email: manualEntry.email,
                service_interest: service?.name || "Manual",
              }
            : undefined,
        service: {
          name: service?.name || "Manual",
          basePrice: service?.basePrice || 0,
        },
      });

      onClose();
      router.push(`/proposals/${result.id}/edit`);
      router.refresh();
    } catch (err: any) {
      console.error("Proposal creation failed:", err);
      if (err.message === "TRIAL_LIMIT_REACHED") {
        setShowUpgradeModal(true);
        return;
      }
      const detail = err?.message || "Error desconocido";
      setErrorMessage(`Error al crear propuesta: ${detail}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <UpgradeLimitModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {!isOpen ? null : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                  Paso {step} de 2
                </span>
                <h3 className="text-lg font-bold text-white">
                  {step === 1
                    ? "Información del Cliente"
                    : "Seleccionar Servicio"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 text-neutral-300" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {step === 1 ? (
                <div className="p-8 space-y-8">
                  {/* Search Lead */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                      Seleccionar Lead Existente
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 px-10 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredLeads.map((lead) => (
                        <button
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`text-left p-3 border transition-all flex items-center justify-between group ${
                            selectedLead?.id === lead.id
                              ? "bg-emerald-500/10 border-emerald-500/50"
                              : "bg-white/[0.02] border-white/5 hover:border-white/20"
                          }`}>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {lead.name}
                            </p>
                            <p className="text-[10px] font-mono text-neutral-300">
                              {lead.email}
                            </p>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 text-neutral-400 ${selectedLead?.id === lead.id ? "text-emerald-500" : ""}`}
                          />
                        </button>
                      ))}
                      {filteredLeads.length === 0 && (
                        <ForgeEmptyState
                          icon={leads.length === 0 ? "users" : "search"}
                          eyebrow="Propuestas"
                          title={
                            leads.length === 0
                              ? "Todavía no hay leads para vincular"
                              : "No encontramos leads con esa búsqueda"
                          }
                          description={
                            leads.length === 0
                              ? "Puedes seguir con entrada manual y preparar la propuesta aunque el lead aún no exista en el CRM."
                              : "Prueba con otro nombre o email, o continúa por entrada manual si todavía no quieres asociar un lead."
                          }
                          size="compact"
                          primaryAction={
                            search
                              ? {
                                  label: "Limpiar búsqueda",
                                  onClick: () => setSearch(""),
                                }
                              : undefined
                          }
                        />
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest leading-none">
                      <span className="bg-[#0a0a0a] px-4 text-neutral-400">
                        o
                      </span>
                    </div>
                  </div>

                  {/* Manual Entry */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-neutral-400" />
                      <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                        Entrada Manual
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre Completo"
                        value={manualEntry.name}
                        onChange={(e) => {
                          setManualEntry({
                            ...manualEntry,
                            name: e.target.value,
                          });
                          setSelectedLead(null);
                        }}
                        className="bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={manualEntry.email}
                        onChange={(e) => {
                          setManualEntry({
                            ...manualEntry,
                            email: e.target.value,
                          });
                          setSelectedLead(null);
                        }}
                        className="bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 grid grid-cols-1 gap-4 overflow-y-auto">
                  {SERVICES.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleCreate(service.id)}
                      disabled={isCreating}
                      className="group relative flex items-center gap-6 p-6 bg-white/[0.02] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all text-left overflow-hidden active:scale-[0.99]">
                      <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-300 group-hover:text-emerald-400 group-hover:scale-110 transition-all shrink-0">
                        <service.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white mb-1 tracking-tight group-hover:text-emerald-400 transition-colors uppercase italic">
                          {service.name}
                        </h4>
                        <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest">
                          {service.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-neutral-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />

                      {/* Decorative background number if any or just lines */}
                      <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05]">
                        <service.icon className="w-32 h-32 -mr-16 -mt-16" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="border-t border-white/5 px-6 py-4">
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Footer */}
            {step === 1 && (
              <div className="p-6 border-t border-white/5 flex justify-end">
                <button
                  disabled={
                    !selectedLead && (!manualEntry.name || !manualEntry.email)
                  }
                  onClick={() => setStep(2)}
                  className="bg-white text-black px-6 py-2.5 flex items-center gap-2 hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none">
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Siguiente Paso
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.02);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `}</style>
        </div>
      )}
    </>
  );
}
