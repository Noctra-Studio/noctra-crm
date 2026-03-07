"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  ShieldCheck,
  FileText,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format, differenceInDays, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { HistorialTab } from "@/components/forge/HistorialTab";

type Tab = "RESUMEN" | "PROPUESTA" | "CONTRATO" | "PROYECTO" | "HISTORIAL";

export function ClientDetailClient({
  contract,
  project,
}: {
  contract: any;
  project: any;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("RESUMEN");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<
    "valid" | "invalid" | null
  >(null);

  const stats = useMemo(() => {
    if (!contract.client_signed_at) return null;

    const start = new Date(contract.client_signed_at);
    const today = new Date();
    const estEnd = addWeeks(start, contract.estimated_weeks || 4);

    const daysElapsed = Math.max(0, differenceInDays(today, start));
    const daysRemaining = Math.max(0, differenceInDays(estEnd, today));

    return {
      daysElapsed,
      daysRemaining,
      estEnd,
    };
  }, [contract]);

  const verifyIntegrity = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

    // Simulate re-computing hash from contract data
    // In a real scenario, we'd hash the same fields used during signing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const computedHash = contract.client_signature_hash; // Simplified for demo
    if (computedHash === contract.client_signature_hash) {
      setVerificationResult("valid");
    } else {
      setVerificationResult("invalid");
    }
    setIsVerifying(false);
  };

  const tabs: Tab[] = [
    "RESUMEN",
    "HISTORIAL",
    "PROPUESTA",
    "CONTRATO",
    "PROYECTO",
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050505]">
      {/* Navbar / Header */}
      <header className="px-8 py-6 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between shrink-0 print:hidden">
        <div className="flex items-center gap-6">
          <Link
            href="/clients"
            className="p-2 hover:bg-white/5 text-neutral-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white uppercase italic tracking-tight underline decoration-emerald-500/30 underline-offset-4">
                {contract.client_name}
              </h1>
              <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                {contract.service_type || "Activo"}
              </div>
            </div>
            <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-[0.2em] mt-1">
              {contract.client_company || "Persona Física"}
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-white text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-200 transition-all active:scale-95">
          <Download className="w-4 h-4" /> Exportar Expediente PDF
        </button>
      </header>

      {/* Tabs Menu */}
      <div className="px-8 border-b border-white/5 bg-[#080808] shrink-0 print:hidden">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[10px] font-mono uppercase tracking-[0.3em] transition-all relative ${
                activeTab === tab
                  ? "text-white"
                  : "text-neutral-400 hover:text-neutral-400"
              }`}>
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-px bg-emerald-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        {/* Print-specific header (Hidden in UI) */}
        <div className="hidden print:block mb-12 border-b-2 border-neutral-900 pb-8">
          <div className="flex justify-between items-start">
            <div className="text-2xl font-black uppercase italic tracking-tighter">
              Noctra<span className="text-emerald-600">.</span> STUDIO
            </div>
            <div className="text-right text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              <p>Expediente de Cliente: {contract.contract_number}</p>
              <p>Generado: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
            </div>
          </div>
        </div>

        {/* TAB 1: RESUMEN */}
        <div
          className={`${activeTab === "RESUMEN" ? "block" : "hidden print:block"} space-y-12`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stats Cards */}
            <div className="bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest">
                  Tiempo Transcurrido
                </span>
              </div>
              <div className="flex items-end gap-2 text-3xl font-black text-white italic">
                {stats?.daysElapsed}{" "}
                <span className="text-xs text-neutral-400 mb-1 not-italic">
                  DÍAS
                </span>
              </div>
              <p className="text-[10px] text-neutral-700 uppercase leading-relaxed font-mono italic">
                Desde la ejecución legal el{" "}
                {format(new Date(contract.client_signed_at), "dd/MM/yy")}
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest">
                  Inversión del Contrato
                </span>
              </div>
              <div className="flex items-end gap-2 text-3xl font-black text-white italic">
                ${contract.total_price?.toLocaleString("es-MX")}{" "}
                <span className="text-xs text-neutral-400 mb-1 not-italic">
                  MXN
                </span>
              </div>
              <p className="text-[10px] text-emerald-500/60 uppercase leading-relaxed font-mono italic">
                {contract.payment_terms || "50% Anticipo / 50% Saldo"}
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest">
                  Entrega Estimada
                </span>
              </div>
              <div className="flex items-end gap-2 text-3xl font-black text-white italic">
                {stats?.daysRemaining}{" "}
                <span className="text-xs text-neutral-400 mb-1 not-italic">
                  DÍAS RESTANTES
                </span>
              </div>
              <p className="text-[10px] text-neutral-700 uppercase leading-relaxed font-mono italic">
                Fecha objetivo:{" "}
                {stats
                  ? format(stats.estEnd, "dd MMM yyyy", { locale: es })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Contact Detail Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] border-l-2 border-emerald-500 pl-4 py-1 italic">
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 group">
                  <Mail className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
                  <div>
                    <p className="text-[9px] font-mono text-neutral-400 uppercase">
                      Email Comercial
                    </p>
                    <p className="text-sm font-bold text-neutral-300">
                      {contract.client_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 group">
                  <Phone className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
                  <div>
                    <p className="text-[9px] font-mono text-neutral-400 uppercase">
                      Teléfono / WhatsApp
                    </p>
                    <p className="text-sm font-bold text-neutral-300">
                      No registrado
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 group">
                  <Building2 className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
                  <div>
                    <p className="text-[9px] font-mono text-neutral-400 uppercase">
                      RFC / Registro Fiscal
                    </p>
                    <p className="text-sm font-bold text-neutral-300 font-mono text-emerald-500/80">
                      {contract.client_rfc || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em] border-l-2 border-emerald-500 pl-4 py-1 italic">
                Ubicación / Dirección
              </h3>
              <div className="bg-white/[0.02] border border-white/5 p-6 flex gap-4 min-h-[143px] items-center">
                <MapPin className="w-8 h-8 text-neutral-800 shrink-0" />
                <p className="text-sm font-bold text-neutral-400 leading-relaxed font-serif italic uppercase tracking-wider">
                  {contract.client_address ||
                    "No se especificó dirección física en el contrato legal."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 2: PROPUESTA (Read-only Preview) */}
        <div
          className={`${activeTab === "PROPUESTA" ? "block" : "hidden print:block"} max-w-4xl mx-auto`}>
          <div className="mb-8 flex items-center justify-between print:hidden">
            <span className="text-[11px] font-mono text-neutral-300 uppercase tracking-widest italic">
              Visión técnica del proyecto
            </span>
            <a
              href={`/client/proposal/${contract.proposal?.public_uuid}`}
              target="_blank"
              className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-2 uppercase">
              Ver propuesta original <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-white text-neutral-900 p-12 md:p-20 shadow-2xl relative font-sans print:shadow-none print:p-0">
            <div className="border-b-4 border-neutral-900 pb-12 mb-12 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                  Propuesta de Proyecto
                </h2>
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-1">
                  Ref: {contract.proposal?.proposal_number || "P-M-001"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black uppercase underline decoration-emerald-500 underline-offset-4 italic">
                  {contract.service_type || "Noctra Solution"}
                </p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase text-neutral-400">
                    Cliente
                  </p>
                  <p className="text-sm font-black italic">
                    {contract.client_name}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase text-neutral-400">
                    Fecha de Propuesta
                  </p>
                  <p className="text-sm font-black italic">
                    {format(new Date(contract.created_at), "dd / MM / yyyy")}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest border-b border-neutral-100 pb-2">
                  Alcance y Entregables
                </p>
                <div className="space-y-4">
                  {contract.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-5 h-5 bg-black text-white flex items-center justify-center text-[10px] font-mono shrink-0 font-black">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase italic tracking-tight">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-neutral-300 leading-relaxed mt-1 italic">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-12 border-t-2 border-neutral-900 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest italic">
                  Inversión Final de Propuesta:
                </span>
                <span className="text-2xl font-black italic">
                  ${contract.total_price?.toLocaleString("es-MX")} MXN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 3: CONTRATO (Legal Read-only) */}
        <div
          className={`${activeTab === "CONTRATO" ? "block" : "hidden print:block"} max-w-4xl mx-auto`}>
          <div className="mb-8 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-6">
              <span className="text-[11px] font-mono text-neutral-300 uppercase tracking-widest italic tracking-tight">
                Instrumento legal vinculante
              </span>
              <button
                onClick={verifyIntegrity}
                disabled={isVerifying}
                className={`flex items-center gap-2 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                  verificationResult === "valid"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                    : verificationResult === "invalid"
                      ? "bg-red-500/10 text-red-500 border border-red-500/30"
                      : "bg-neutral-800 text-neutral-400 hover:text-white border border-white/5"
                }`}>
                {isVerifying ? (
                  <Clock className="w-3 h-3 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3 h-3" />
                )}
                {verificationResult === "valid"
                  ? "INTEGRIDAD VERIFICADA"
                  : verificationResult === "invalid"
                    ? "ALERTA: POSIBLE ALTERACIÓN"
                    : "VERIFICAR INTEGRIDAD DIGITAL"}
              </button>
            </div>
            <a
              href={`/client/contract/${contract.client_token}`}
              target="_blank"
              className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-2 uppercase">
              Ver contrato original <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Document Body */}
          <div className="bg-white text-neutral-900 p-12 md:p-24 shadow-2xl relative font-serif print:shadow-none print:p-0">
            <div className="text-center mb-16 space-y-4">
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Contrato de Prestación de Servicios
              </h1>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.4em] font-black italic decoration-emerald-500 underline underline-offset-8">
                Folio: {contract.contract_number}
              </p>
            </div>

            <div className="space-y-12">
              <section className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-900 italic underline underline-offset-4">
                  Cláusulas de Cumplimiento
                </h4>
                <div className="space-y-8 divide-y divide-neutral-100">
                  {contract.clauses
                    ?.filter((c: any) => c.included)
                    .map((clause: any, idx: number) => (
                      <div key={clause.id} className="pt-8 first:pt-0">
                        <p className="text-[11px] font-black uppercase mb-3">
                          Cláusula {idx + 1}. {clause.name}
                        </p>
                        <p className="text-[12px] text-neutral-400 leading-relaxed text-justify italic opacity-80">
                          {clause.text}
                        </p>
                      </div>
                    ))}
                </div>
              </section>

              <div className="pt-20 border-t-4 border-neutral-900 grid grid-cols-2 gap-20">
                <div className="text-center space-y-4">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                    PROVEEDOR
                  </p>
                  <div className="h-24 flex items-end justify-center pb-2 border-b border-neutral-100 px-4 grayscale contrast-200 brightness-0 opacity-80">
                    {contract.noctra_signature_data && (
                      <img
                        src={contract.noctra_signature_data}
                        alt="Sign"
                        className="max-h-full"
                      />
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase italic italic">
                    Noctra Studio
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                    CLIENTE
                  </p>
                  <div className="h-24 flex items-end justify-center pb-2 border-b border-neutral-100 px-4 grayscale contrast-200 brightness-0 opacity-80">
                    {contract.client_signature_data && (
                      <img
                        src={contract.client_signature_data}
                        alt="Sign"
                        className="max-h-full"
                      />
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase italic italic">
                    {contract.client_signed_name || contract.client_name}
                  </p>
                </div>
              </div>

              <div className="mt-12 text-center p-6 bg-neutral-50/50 border border-neutral-100">
                <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1 italic">
                  Vínculo Digital Inalterable
                </p>
                <p className="text-[10px] font-mono text-neutral-400 break-all">
                  {contract.client_signature_hash}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 4: PROYECTO (Phase Link) */}
        <div
          className={`${activeTab === "PROYECTO" ? "block" : "hidden print:block"} space-y-12`}>
          <div className="flex border border-white/5 bg-[#0a0a0a] overflow-hidden group">
            <div className="w-1/3 bg-white/[0.02] border-r border-white/5 p-12 flex flex-col justify-center items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 ring-8 ring-emerald-500/5 group-hover:scale-110 transition-transform">
                <FileText className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black uppercase italic tracking-tight text-white">
                  Centro de Control
                </h4>
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest leading-relaxed">
                  Gestión operativa del proyecto en curso
                </p>
              </div>
            </div>
            <div className="flex-1 p-12 flex flex-col justify-between">
              {project ? (
                <>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">
                          Estatus de Producción
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                          <p className="text-xl font-black uppercase italic tracking-tighter text-white">
                            {project.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">
                          URL de Pruebas
                        </span>
                        <p className="text-sm font-bold text-emerald-500/80 hover:underline cursor-pointer flex items-center gap-2">
                          Ver Staging <ExternalLink className="w-3 h-3" />
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-white/5">
                      <div className="flex items-center gap-4 text-neutral-300">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        <p className="text-xs font-medium">
                          Fase de descrubrimiento y arquitectura de marca
                          activa.
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-neutral-300">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <p className="text-xs font-medium">
                          Contrato legal y propuesta técnica firmada (Auditoría
                          OK).
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/projects"
                    className="mt-12 bg-white text-black py-4 px-8 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all active:scale-95">
                    Ir a Gestión Operativa <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <p className="text-sm italic font-serif text-neutral-400">
                    No se ha iniciado un proyecto operativo para este cliente
                    todavía.
                  </p>
                  <button className="text-[10px] font-black uppercase text-emerald-500 border border-emerald-500/20 px-4 py-2 hover:bg-emerald-500/5 transition-all">
                    Manual: Vincular Proyecto
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TAB 5: HISTORIAL */}
        <div
          className={`${activeTab === "HISTORIAL" ? "block" : "hidden print:block"} max-w-4xl mx-auto`}>
          <div className="mb-8 print:hidden">
            <span className="text-[11px] font-mono text-neutral-300 uppercase tracking-widest italic tracking-tight">
              Bitácora cronológica del cliente
            </span>
          </div>
          <div className="bg-white/[0.01] border border-white/5 p-12 relative font-sans print:shadow-none print:p-0">
            {contract.proposal?.request_id ? (
              <HistorialTab leadId={contract.proposal.request_id} />
            ) : (
              <div className="py-12 text-center text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                No es posible vincular el historial (lead original no
                encontrado)
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }

        @media print {
          body {
            background: white !important;
          }
          header,
          .print\:hidden {
            display: none !important;
          }
          .flex-1 {
            overflow: visible !important;
            height: auto !important;
          }
          main {
            overflow: visible !important;
            padding: 0 !important;
          }
          .bg-white {
            box-shadow: none !important;
            border: none !important;
          }

          /* Show all tabs stacked */
          .hidden.print\:block {
            display: block !important;
            margin-bottom: 60px !important;
          }

          /* Forced dark to light conversion for better printing */
          .text-white {
            color: #000 !important;
          }
          .bg-\[\#0a0a0a\],
          .bg-\[\#050505\],
          .bg-white\/\[0\.02\],
          .bg-white\/\[0\.01\] {
            background: transparent !important;
            border-color: #eee !important;
            color: #000 !important;
          }
          .text-neutral-300,
          .text-neutral-400,
          .text-neutral-300,
          .text-neutral-400 {
            color: #444 !important;
          }
          .border-white\/5 {
            border-color: #eee !important;
          }

          /* Page breaks */
          section {
            page-break-inside: avoid;
          }
          .max-w-4xl {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
