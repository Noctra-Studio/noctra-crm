"use client";

import { useState, useEffect, useRef } from "react";
import { ForgeSidebar } from "@/components/forge/ForgeSidebar";
import {
  ChevronLeft,
  Save,
  Send,
  Eye,
  Check,
  Loader2,
  Trash2,
  Plus,
  Eraser,
  Shield,
  RotateCcw,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { ProposalItemsList } from "@/components/forge/proposals/ProposalItemsList";
import { AccountingSyncBadge } from "@/components/forge/finance/AccountingSyncBadge";

const DEFAULT_CLAUSES = [
  {
    id: "alcance",
    name: "Alcance del Proyecto",
    text: "El proveedor se compromete a entregar los elementos descritos en la sección de entregables de este contrato. Cualquier trabajo adicional fuera de este alcance requerirá una cotización separada y aprobación por escrito del cliente.",
    included: true,
  },
  {
    id: "pago",
    name: "Forma de Pago",
    text: "El cliente se compromete a realizar los pagos acordados según los términos establecidos. El retraso en pagos puede resultar en la suspensión del trabajo hasta regularizar el saldo pendiente.",
    included: true,
  },
  {
    id: "intelectual",
    name: "Propiedad Intelectual",
    text: "Una vez liquidado el pago total, el cliente recibirá todos los derechos sobre el código fuente, diseños y activos digitales desarrollados específicamente para este proyecto.",
    included: true,
  },
  {
    id: "confidencialidad",
    name: "Confidencialidad",
    text: "Ambas partes se comprometen a mantener confidencialidad sobre información sensible compartida durante el proyecto, incluyendo estrategias de negocio, datos de clientes y procesos internos.",
    included: true,
  },
  {
    id: "revisiones",
    name: "Revisiones y Cambios",
    text: "El proyecto incluye hasta 2 rondas de revisiones por fase. Cambios que alteren significativamente el alcance original serán cotizados por separado.",
    included: true,
  },
  {
    id: "garantia",
    name: "Garantía Post-Entrega",
    text: "Noctra Studio ofrece 60 días de soporte post-lanzamiento para corrección de errores. Este período no incluye nuevas funcionalidades o cambios de diseño.",
    included: true,
  },
  {
    id: "disputas",
    name: "Resolución de Disputas",
    text: "Cualquier disputa se resolverá mediante mediación. Ambas partes acuerdan que la jurisdicción aplicable es la del estado de Querétaro, México.",
    included: true,
  },
];

export default function ContractBuilderClient({
  initialContract,
}: {
  initialContract: any;
}) {
  const [contract, setContract] = useState({
    ...initialContract,
    clauses:
      initialContract.clauses?.length > 0
        ? initialContract.clauses
        : DEFAULT_CLAUSES,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const supabase = createClient();

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(contract) !== JSON.stringify(initialContract)) {
        handleSave();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [contract]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("contracts")
        .update({
          client_name: contract.client_name,
          client_email: contract.client_email,
          client_company: contract.client_company,
          client_rfc: contract.client_rfc,
          client_address: contract.client_address,
          total_price: contract.total_price,
          payment_terms: contract.payment_terms,
          start_date: contract.start_date,
          estimated_weeks: contract.estimated_weeks || 1,
          items: contract.items,
          clauses: contract.clauses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contract.id);

      if (error) throw error;
      setLastSaved(new Date());
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = (field: string, value: any) => {
    setContract((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleClause = (id: string) => {
    const newClauses = contract.clauses.map((c: any) =>
      c.id === id ? { ...c, included: !c.included } : c,
    );
    handleUpdate("clauses", newClauses);
  };

  const updateClauseText = (id: string, text: string) => {
    const newClauses = contract.clauses.map((c: any) =>
      c.id === id ? { ...c, text } : c,
    );
    handleUpdate("clauses", newClauses);
  };

  const resetClause = (id: string) => {
    const defaultText = DEFAULT_CLAUSES.find((c) => c.id === id)?.text;
    if (defaultText) updateClauseText(id, defaultText);
  };

  // Canvas Signature logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
  }, []);

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !ctx) return;
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const rect = canvas?.getBoundingClientRect();
    if (!rect || !ctx) return;
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsCanvasEmpty(false);
  };

  const handleInternalSign = async () => {
    setIsSigning(true);
    try {
      const signatureData = canvasRef.current?.toDataURL("image/png") || "";
      const { error } = await supabase
        .from("contracts")
        .update({
          noctra_signed: true,
          noctra_signed_at: new Date().toISOString(),
          noctra_signature_data: signatureData,
        })
        .eq("id", contract.id);

      if (error) throw error;
      setContract((prev: any) => ({
        ...prev,
        noctra_signed: true,
        noctra_signed_at: new Date().toISOString(),
        noctra_signature_data: signatureData,
      }));
    } catch (err) {
      console.error(err);
      alert("Error al firmar");
    } finally {
      setIsSigning(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsCanvasEmpty(true);
  };

  return (
    <div className="flex bg-[#050505] text-white">
      <ForgeSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#080808]">
          <div className="flex items-center gap-6">
            <Link
              href="/forge/contracts"
              className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <ChevronLeft className="w-5 h-5 text-neutral-300 group-hover:text-white" />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20">
                  {contract.contract_number}
                </span>
                <h1 className="text-sm font-bold truncate max-w-[300px]">
                  Contrato: {contract.client_name}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-neutral-400 mr-4">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />{" "}
                  {lastSaved
                    ? `Guardado ${lastSaved.toLocaleTimeString()}`
                    : "Todo guardado"}
                </>
              )}
            </div>

            {contract.noctra_signed && contract.signed_by_client && (
              <AccountingSyncBadge
                invoiceId={contract.id}
                status={contract.accounting_sync_status || "pending"}
                syncedAt={contract.accounting_synced_at}
                error={contract.accounting_sync_error}
                externalId={contract.accounting_external_id}
                onSyncComplete={() => {
                  // A full refresh or re-fetch would be ideal here if not relying completely on Next.js revalidatePath
                  window.location.reload();
                }}
              />
            )}

            <button
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              disabled={!contract.noctra_signed}>
              <Send className="w-3.5 h-3.5" /> Enviar al Cliente
            </button>
          </div>
        </header>

        <div className="flex-1 flex min-h-[calc(100vh-64px)]">
          {/* LEFT PANEL: Editing */}
          <div className="w-full lg:w-[45%] border-r border-white/5 overflow-y-auto bg-[#050505] p-8 space-y-12 forge-scroll h-[calc(100vh-64px)]">
            <section className="space-y-6">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                Datos del Cliente
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[9px] font-mono text-neutral-300 uppercase">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={contract.client_name}
                    onChange={(e) =>
                      handleUpdate("client_name", e.target.value)
                    }
                    className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-300 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contract.client_email}
                    onChange={(e) =>
                      handleUpdate("client_email", e.target.value)
                    }
                    className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-300 uppercase">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={contract.client_company || ""}
                    onChange={(e) =>
                      handleUpdate("client_company", e.target.value)
                    }
                    className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-300 uppercase">
                    RFC / ID Fiscal
                  </label>
                  <input
                    type="text"
                    value={contract.client_rfc || ""}
                    onChange={(e) => handleUpdate("client_rfc", e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[9px] font-mono text-neutral-300 uppercase">
                    Dirección Legal
                  </label>
                  <textarea
                    value={contract.client_address || ""}
                    onChange={(e) =>
                      handleUpdate("client_address", e.target.value)
                    }
                    rows={2}
                    className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                Servicio y Entregables
              </h3>
              <ProposalItemsList
                items={contract.items || []}
                onChange={(items) => {
                  const total = items.reduce(
                    (acc, i) => acc + i.quantity * i.unit_price,
                    0,
                  );
                  setContract((prev: any) => ({
                    ...prev,
                    items,
                    total_price: total,
                  }));
                }}
              />
            </section>

            <section className="space-y-6">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                Cláusulas del Contrato
              </h3>
              <div className="space-y-4">
                {contract.clauses.map((clause: any) => (
                  <div
                    key={clause.id}
                    className={`p-4 border transition-all ${clause.included ? "bg-white/[0.02] border-white/10" : "bg-transparent border-dashed border-white/5 opacity-40"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleClause(clause.id)}
                          className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border transition-all ${clause.included ? "bg-emerald-500 border-emerald-500 text-black" : "bg-transparent border-white/10 text-neutral-300"}`}>
                          {clause.included ? "Incluida" : "Excluida"}
                        </button>
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {clause.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => resetClause(clause.id)}
                          className="p-1.5 hover:bg-white/5 rounded text-neutral-400 hover:text-white transition-colors"
                          title="Restaurar predeterminado">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {clause.included && (
                      <textarea
                        value={clause.text}
                        onChange={(e) =>
                          updateClauseText(clause.id, e.target.value)
                        }
                        rows={3}
                        className="w-full bg-black/40 border border-white/5 p-3 text-xs text-neutral-400 focus:outline-none focus:border-emerald-500/30 resize-none leading-relaxed"
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6 border-t border-white/5 pt-10 pb-20">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                  Firma de Noctra Studio
                </h3>
              </div>

              {!contract.noctra_signed ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-neutral-300 uppercase font-mono tracking-widest">
                      Dibujar firma interna
                    </p>
                    <button
                      onClick={clearCanvas}
                      className="text-[9px] text-neutral-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest">
                      <Eraser className="w-3 h-3" /> Limpiar
                    </button>
                  </div>
                  <div className="bg-white/5 border border-white/10 h-32 relative rounded-sm touch-none overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={() => setIsDrawing(false)}
                      onMouseOut={() => setIsDrawing(false)}
                      className="w-full h-full cursor-crosshair"
                    />
                    {isCanvasEmpty && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-[9px] font-mono uppercase tracking-[0.4em]">
                        Firma aquí
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleInternalSign}
                    disabled={isCanvasEmpty || isSigning}
                    className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all disabled:opacity-30">
                    {isSigning ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Firmar como Noctra Studio"
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 flex flex-col items-center text-center space-y-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-black">
                      DOCUMENTO FIRMADO INTERNAMENTE
                    </p>
                    <p className="text-[9px] font-mono text-neutral-400 uppercase">
                      {format(
                        new Date(contract.noctra_signed_at),
                        "dd MMMM yyyy HH:mm",
                      )}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT PANEL: Live Preview */}
          <div className="hidden lg:block lg:flex-1 bg-[#080808] overflow-y-auto p-12 forge-scroll h-[calc(100vh-64px)]">
            <div className="max-w-3xl mx-auto bg-white text-neutral-900 shadow-2xl min-h-[1000px] p-16 flex flex-col font-serif">
              {/* Contract Header */}
              <div className="text-center mb-16">
                <h1 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-neutral-900 pb-4 mb-4">
                  Contrato de Prestación de Servicios
                </h1>
                <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest leading-relaxed">
                  Studio de Diseño & Desarrollo Digital
                  <br />
                  Folio Digital: {contract.contract_number}
                </p>
              </div>

              <div className="text-[13px] space-y-8 leading-relaxed text-justify">
                <p>
                  Contrato celebrado entre <strong>Manuel de Quevedo</strong>{" "}
                  (en adelante "EL PROVEEDOR" o "Noctra Studio") y
                  <strong> {contract.client_name}</strong>{" "}
                  {contract.client_company
                    ? `representando a ${contract.client_company}`
                    : ""}{" "}
                  (en adelante "EL CLIENTE") con RFC{" "}
                  <strong>{contract.client_rfc || "—"}</strong> y domicilio en{" "}
                  {contract.client_address || "—"}.
                </p>

                <div>
                  <h4 className="font-bold uppercase mb-4 text-[11px] border-b border-neutral-100 pb-2">
                    I. Los Servicios
                  </h4>
                  <p className="mb-4 opacity-80">
                    EL PROVEEDOR se compromete a realizar los siguientes
                    servicios:
                  </p>
                  <ul className="list-disc pl-5 space-y-3 text-[12px]">
                    {contract.items?.map((item: any, idx: number) => (
                      <li key={idx} className="pl-2">
                        <strong>{item.name}</strong>:{" "}
                        <span className="opacity-70">{item.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold uppercase mb-4 text-[11px] border-b border-neutral-100 pb-2">
                    II. Inversión y Tiempos
                  </h4>
                  <p>
                    La inversión total por los servicios descritos es de{" "}
                    <strong>
                      ${contract.total_price?.toLocaleString("es-MX")} MXN
                    </strong>
                    . El tiempo estimado de ejecución es de{" "}
                    <strong>{contract.estimated_weeks || 1} semanas</strong>{" "}
                    iniciando el día{" "}
                    {contract.start_date
                      ? format(new Date(contract.start_date), "dd/MM/yyyy")
                      : "—"}
                    .
                  </p>
                  <p className="mt-2 italic opacity-60">
                    Condiciones de pago:{" "}
                    {contract.payment_terms || "50% anticipo, 50% al finalizar"}
                    .
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="font-bold uppercase text-[11px] border-b border-neutral-100 pb-2">
                    III. Cláusulas Legales
                  </h4>
                  {contract.clauses
                    ?.filter((c: any) => c.included)
                    .map((clause: any, idx: number) => (
                      <div key={clause.id} className="space-y-2">
                        <p className="font-bold text-[10px] uppercase tracking-wide">
                          Cláusula {idx + 1}. {clause.name}
                        </p>
                        <p className="text-[12px] opacity-70">{clause.text}</p>
                      </div>
                    ))}
                </div>

                {/* Signatures Grid */}
                <div className="mt-24 grid grid-cols-2 gap-20 pt-12 border-t border-neutral-100">
                  <div className="text-center space-y-4">
                    <div className="h-24 flex items-end justify-center pb-2 overflow-hidden border-b border-neutral-900">
                      {contract.noctra_signed && (
                        <img
                          src={contract.noctra_signature_data}
                          alt="Firma Noctra"
                          className="max-h-full grayscale contrast-200"
                          style={{ filter: "brightness(0)" }}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-tight">
                        Manuel de Quevedo
                      </p>
                      <p className="text-[9px] text-neutral-300 uppercase font-mono tracking-widest">
                        Noctra Studio (EL PROVEEDOR)
                      </p>
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="h-24 flex items-end justify-center pb-2 border-b border-neutral-900">
                      {contract.signed_by_client && (
                        <img
                          src={contract.client_signature_data}
                          alt="Firma Cliente"
                          className="max-h-full grayscale contrast-200"
                          style={{ filter: "brightness(0)" }}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-tight">
                        {contract.client_name}
                      </p>
                      <p className="text-[9px] text-neutral-300 uppercase font-mono tracking-widest">
                        EL CLIENTE
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-20 text-[8px] font-mono text-neutral-400 text-center uppercase tracking-[0.3em]">
                Documento Generado Digitalmente por Noctra Studio &copy;{" "}
                {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
