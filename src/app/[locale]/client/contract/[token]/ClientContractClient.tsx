"use client";

import { Check, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { ContractSignatureForm } from "./ContractSignatureForm";

export function ClientContractClient({
  contract,
  params,
}: {
  contract: any;
  params: { token: string };
}) {
  const isSigned = contract.signed_by_client;
  const workspace = contract.workspace;
  const primaryColor = workspace?.primary_color || "#10b981";

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 selection:bg-neutral-100 pb-32">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 print:hidden">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {workspace?.logo_url ? (
              <img
                src={workspace.logo_url}
                alt={workspace.name}
                className="h-4 w-auto"
              />
            ) : (
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                {workspace?.name || "Noctra"}
              </span>
            )}
            <div className="h-4 w-px bg-neutral-200"></div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              {contract.contract_number}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isSigned && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 border rounded-sm"
                style={{
                  color: primaryColor,
                  backgroundColor: `${primaryColor}10`,
                  borderColor: `${primaryColor}20`,
                }}>
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: primaryColor }}></div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                  Contrato Firmado
                </span>
              </div>
            )}
            <button
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
              onClick={() => typeof window !== "undefined" && window.print()}>
              <Download className="w-3.5 h-3.5" /> Descargar PDF
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[850px] mx-auto">
        <main className="bg-white mt-12 shadow-2xl shadow-black/[0.03] border border-neutral-100 min-h-screen flex flex-col p-12 md:p-24 relative overflow-hidden font-serif print:mt-0 print:shadow-none print:border-none print:p-0">
          {/* Section 1 — ENCABEZADO LEGAL */}
          <div className="flex justify-between items-start mb-20 relative z-10">
            <div className="space-y-4">
              <div className="text-xl font-black tracking-tighter uppercase italic">
                {workspace?.logo_url ? (
                  <img
                    src={workspace.logo_url}
                    alt={workspace.name}
                    className="h-6 w-auto"
                  />
                ) : (
                  <>(workspace?.name || "Noctra") STUDIO</>
                )}
              </div>
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest space-y-1">
                <p>Folio: {contract.contract_number}</p>
                <p>
                  Fecha: {format(new Date(contract.created_at), "dd/MM/yyyy")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-black uppercase tracking-tight mb-4">
                CONTRATO DE SERVICIOS DIGITALES
              </h1>
              <div className="text-[11px] font-bold uppercase italic text-neutral-300">
                Celebrado entre:
                <p className="text-neutral-900 mt-1">
                  {workspace?.name || "Noctra Studio"} (Proveedor)
                </p>
                <p className="text-neutral-900">
                  & {contract.client_company || contract.client_name} (Cliente)
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-1 bg-neutral-900 mb-20"></div>

          <div className="space-y-20">
            {/* Section 2 — DATOS DE LAS PARTES */}
            <section className="grid grid-cols-2 gap-20">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2">
                  PROVEEDOR
                </h4>
                <div className="text-[13px] space-y-1 text-neutral-400">
                  <p className="font-bold text-neutral-900">
                    {workspace?.name || "Noctra Studio"}
                  </p>
                  <p>{workspace?.address || "México"}</p>
                  <p>{workspace?.email || "hola@noctra.studio"}</p>
                  <p className="font-mono text-[11px]">
                    {workspace?.website_url || "noctra.studio"}
                  </p>
                </div>
              </div>
              <div className="space-y-6 text-right">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2">
                  CLIENTE
                </h4>
                <div className="text-[13px] space-y-1 text-neutral-400">
                  <p className="font-bold text-neutral-900">
                    {contract.client_name}
                  </p>
                  {contract.client_company && <p>{contract.client_company}</p>}
                  {contract.client_rfc && (
                    <p className="font-mono text-[11px]">
                      {contract.client_rfc}
                    </p>
                  )}
                  {contract.client_address && (
                    <p className="max-w-[250px] ml-auto leading-relaxed">
                      {contract.client_address}
                    </p>
                  )}
                  <p>{contract.client_email}</p>
                </div>
              </div>
            </section>

            {/* Section 3 — OBJETO DEL CONTRATO */}
            <section className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2 text-center">
                OBJETO DEL CONTRATO
              </h4>
              <p className="text-[14px] text-justify leading-relaxed">
                El presente instrumento tiene por objeto establecer los términos
                y condiciones bajo los cuales el <strong>PROVEEDOR</strong> se
                compromete a desarrollar para el <strong>CLIENTE</strong> los
                siguientes servicios y entregables digitales:
              </p>
              <div className="grid grid-cols-1 gap-4">
                {contract.items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 bg-neutral-50/50 p-4 border border-neutral-100">
                    <Check
                      className="w-4 h-4 mt-1 shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <div>
                      <p className="font-bold text-sm uppercase italic tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4 — INVERSIÓN Y FORMA DE PAGO */}
            <section className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2">
                INVERSIÓN Y TÉRMINOS
              </h4>
              <div className="grid grid-cols-3 gap-8 text-center pt-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-mono text-neutral-400 uppercase">
                    Inversión Total
                  </p>
                  <p className="text-xl font-black">
                    ${contract.total_price?.toLocaleString("es-MX")}{" "}
                    <span className="text-[10px] text-neutral-400">MXN</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-mono text-neutral-400 uppercase">
                    Tiempo Estimado
                  </p>
                  <p className="text-xl font-black">
                    {contract.estimated_weeks}{" "}
                    <span className="text-[10px] text-neutral-400">
                      Semanas
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-mono text-neutral-400 uppercase">
                    Forma de Pago
                  </p>
                  <p className="text-sm font-bold uppercase italic text-neutral-700 leading-tight">
                    {contract.payment_terms || "50% Anticipo / 50% Saldo"}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 — CLÁUSULAS */}
            <section className="space-y-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2 text-center">
                DISPOSICIONES LEGALES
              </h4>
              <div className="space-y-10 divide-y divide-neutral-100">
                {contract.clauses
                  ?.filter((c: any) => c.included)
                  .map((clause: any, idx: number) => (
                    <div key={clause.id} className="pt-10 first:pt-0">
                      <p className="text-[11px] font-black uppercase tracking-wider mb-4">
                        Cláusula {idx + 1}. {clause.name}
                      </p>
                      <p className="text-[13px] text-neutral-400 leading-relaxed text-justify italic opacity-90">
                        {clause.text}
                      </p>
                    </div>
                  ))}
              </div>
            </section>

            {/* Section 6 — FIRMAS */}
            <section className="pt-20 border-t-4 border-neutral-900 grid grid-cols-2 gap-20">
              {/* LEFT — NOCTRA STUDIO */}
              <div className="text-center space-y-6">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  PROVEEDOR
                </p>
                <div className="h-40 flex items-end justify-center pb-4 border-b border-neutral-100 px-4">
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
                  <p className="text-xs font-black uppercase italic tracking-tighter">
                    ◆ {workspace?.name || "Noctra Studio"}
                  </p>
                  <p className="text-[9px] font-mono text-neutral-400 uppercase">
                    {contract.noctra_signed_at
                      ? format(
                          new Date(contract.noctra_signed_at),
                          "dd/MM/yyyy HH:mm",
                        )
                      : ""}
                  </p>
                </div>
              </div>

              {/* RIGHT — CLIENTE */}
              <div className="text-center space-y-6">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  CLIENTE
                </p>
                <div className="h-40 flex items-end justify-center pb-4 border-b border-neutral-100 px-4">
                  {isSigned ? (
                    <img
                      src={contract.client_signature_data}
                      alt="Firma Cliente"
                      className="max-h-full grayscale contrast-200"
                      style={{ filter: "brightness(0)" }}
                    />
                  ) : (
                    <div className="flex items-center justify-center opacity-5">
                      <FileText className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase italic tracking-tighter">
                    {isSigned
                      ? contract.client_signed_name
                      : contract.client_name}
                  </p>
                  <p className="text-[9px] font-mono text-neutral-400 uppercase">
                    {isSigned && contract.client_signed_at
                      ? format(
                          new Date(contract.client_signed_at),
                          "dd/MM/yyyy HH:mm",
                        )
                      : "PENDIENTE DE FIRMA"}
                  </p>
                </div>
              </div>
            </section>

            {/* SIGNATURE FORM (If not signed) */}
            {!isSigned && (
              <div className="mt-20 pt-20 border-t border-neutral-100 print:hidden relative z-10">
                <ContractSignatureForm
                  contractId={contract.id}
                  clientToken={params.token}
                  expectedName={contract.client_name}
                />
              </div>
            )}
          </div>

          <footer className="mt-40 pt-10 border-t border-neutral-100 text-[8px] font-mono text-neutral-300 text-center uppercase tracking-[0.5em] italic">
            Precision Crafted by {workspace?.name || "Noctra Studio"} &copy;{" "}
            {new Date().getFullYear()}
          </footer>
        </main>
      </div>

      <style jsx global>{`
        @media print {
          nav {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print\:hidden {
            display: none !important;
          }
          main {
            margin-top: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
