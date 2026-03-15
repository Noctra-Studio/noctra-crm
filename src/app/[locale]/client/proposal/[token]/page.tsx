import { notFound } from "next/navigation";
import { format, addWeeks, differenceInDays } from "date-fns";
import { createAdminClient } from "@/utils/supabase/admin";
import { recordWorkspaceActivity } from "@/lib/activity";
import {
  Check,
  Download,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  Lock,
  Zap,
  MousePointer2,
  Shield,
  FileText,
} from "lucide-react";
import { SignatureForm } from "./SignatureSection";
import { ProposalTracker } from "@/components/forge/proposals/ProposalTracker";

export const dynamic = "force-dynamic";

export default async function ClientProposalPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createAdminClient();

  // Fetch proposal by client_token with workspace info
  const { data: proposal, error } = await supabase
    .from("proposals")
    .select(
      `
      *,
      lead:contact_submissions(*),
      items:proposal_items(*),
      workspace:workspaces(*)
    `,
    )
    .eq("client_token", params.token)
    .single();

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-neutral-300" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">
          Propuesta no encontrada
        </h1>
        <p className="text-neutral-300 text-sm font-mono uppercase tracking-widest">
          Verifica el enlace o contacta con nosotros.
        </p>
      </div>
    );
  }

  const workspace = proposal.workspace;

  // Tracking Logic (On Load)
  if (proposal.status === "sent") {
    await supabase
      .from("proposals")
      .update({
        viewed_at: proposal.viewed_at || new Date().toISOString(),
        view_count: (proposal.view_count || 0) + 1,
        status: "viewed",
      })
      .eq("id", proposal.id);

    await recordWorkspaceActivity(supabase, {
      workspaceId: proposal.workspace_id,
      entityType: "proposal",
      entityId: proposal.id,
      eventType: "proposal.viewed",
      title: "Propuesta vista",
      description: `${proposal.lead?.name || "Un cliente"} abrió la propuesta ${proposal.proposal_number || proposal.title || ""}.`,
      metadata: {
        proposalNumber: proposal.proposal_number || "",
        leadName: proposal.lead?.name || "",
      },
    });
  } else if (proposal.status === "viewed") {
    await supabase
      .from("proposals")
      .update({
        view_count: (proposal.view_count || 0) + 1,
      })
      .eq("id", proposal.id);
  }

  const isSigned = proposal.signed;
  const isExpired =
    proposal.valid_until && new Date(proposal.valid_until) < new Date();
  const daysRemaining = proposal.valid_until
    ? differenceInDays(new Date(proposal.valid_until), new Date())
    : null;

  const start_date = new Date(proposal.created_at);
  const estimated_delivery = addWeeks(start_date, 6); // Hardcoded 6 weeks as per timeline

  const primaryColor = workspace?.primary_color || "#10b981"; // Default emerald-600
  const showWatermark =
    workspace?.tier === "free" || workspace?.subscription_status === "trialing";

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 selection:bg-emerald-100 pb-32">
      <ProposalTracker proposalId={proposal.id} />
      {/* Top Navigation / Status */}
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
              {proposal.proposal_number}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isSigned && (
              <span
                className="text-[10px] font-mono bg-emerald-50 content-center px-3 py-1 text-emerald-600 font-bold uppercase tracking-widest border border-emerald-100"
                style={{
                  color: primaryColor,
                  backgroundColor: `${primaryColor}10`,
                  borderColor: `${primaryColor}20`,
                }}>
                Propuesta Aceptada
              </span>
            )}
            <button
              className="hidden md:flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-300 hover:text-black transition-colors"
              onClick={() => window.print()}>
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            {!isSigned && !isExpired && (
              <a
                href="#signature"
                className="bg-neutral-900 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
                style={{ backgroundColor: primaryColor }}>
                Firmar Ahora
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-[800px] mx-auto bg-white mt-12 shadow-2xl shadow-black/[0.02] border border-neutral-100 min-h-screen flex flex-col p-12 md:p-20 relative overflow-hidden">
        {/* Refined Watermark Overlay (Print Optimized) */}
        {showWatermark && (
          <>
            {/* Central Watermark - Fixed position repeats on print pages */}
            <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-[100] flex items-center justify-center">
              <div className="text-neutral-400 text-[5rem] md:text-[6rem] font-black uppercase whitespace-nowrap tracking-[0.2em] -rotate-[45deg] opacity-[0.12] print:opacity-[0.15] pointer-events-none">
                Generado por Noctra CRM
              </div>
            </div>

            {/* Footer Identifier - Bottom Right */}
            <div className="hidden print:block fixed bottom-8 right-8 text-neutral-400 text-[8pt] font-mono pointer-events-none">
              Propuesta creada en noctra.studio - Plan Trial
            </div>
          </>
        )}

        {/* Background Decorative Element */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 blur-[100px] rounded-full"
          style={{ backgroundColor: `${primaryColor}15` }}></div>

        {/* SECTION 1: PORTADA */}
        <section className="mb-24" data-section="portada">
          <div className="flex justify-between items-start mb-20">
            <div className="text-xl font-black tracking-tighter uppercase italic">
              {workspace?.logo_url ? (
                <img
                  src={workspace.logo_url}
                  alt={workspace.name}
                  className="h-6 w-auto"
                />
              ) : (
                workspace?.name || "Noctra"
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.3em]">
                PROPUESTA DE PROYECTO
              </span>
              <p className="text-[10px] font-mono text-neutral-300 mt-1 uppercase tracking-widest">
                {proposal.proposal_number}
              </p>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-10">
            Propuesta para <br />
            <span className="text-emerald-600">
              {proposal.lead?.company || proposal.lead?.name}
            </span>
          </h1>

          <div className="grid grid-cols-2 gap-12 border-t border-neutral-100 pt-10">
            <div>
              <h4 className="text-[9px] font-mono uppercase text-neutral-400 mb-3 tracking-[0.2em]">
                FECHA DE EMISIÓN
              </h4>
              <p className="font-bold text-lg">
                {format(new Date(proposal.created_at), "MMMM d, yyyy")}
              </p>
            </div>
            <div className="text-right">
              <h4 className="text-[9px] font-mono uppercase text-neutral-400 mb-3 tracking-[0.2em]">
                VÁLIDO HASTA
              </h4>
              <p className="font-bold text-lg text-emerald-600">
                {proposal.valid_until
                  ? format(new Date(proposal.valid_until), "MMMM d, yyyy")
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: RESUMEN EJECUTIVO */}
        <section className="mb-24 space-y-16" data-section="resumen_ejecutivo">
          <div className="space-y-6">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 font-bold border-l-2 border-neutral-100 pl-4">
              EL DESAFÍO
            </h3>
            <p className="text-xl leading-relaxed text-neutral-800 italic">
              {proposal.problem_statement ||
                "Buscamos transformar su visión actual en una plataforma digital de alto rendimiento que no solo comunique, sino que convierta cada visitante en un cliente potencial."}
            </p>
          </div>
          <div className="space-y-6">
            <h3
              className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 font-bold border-l-2 pl-4"
              style={{ borderLeftColor: primaryColor }}>
              NUESTRA PROPUESTA
            </h3>
            <p className="text-lg leading-relaxed text-neutral-400">
              {proposal.proposed_solution ||
                "Implementaremos una arquitectura moderna basada en Next.js, enfocada en la velocidad extrema y una experiencia de usuario sin fricciones, asegurando que su marca destaque en un mercado saturado."}
            </p>
          </div>
        </section>

        {/* SECTION 3: ALCANCE DEL PROYECTO */}
        <section className="mb-24" data-section="alcance">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 font-bold mb-10 text-center">
            QUÉ ENTREGAMOS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {proposal.items?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="group p-6 border border-neutral-50 hover:border-emerald-100 transition-all bg-neutral-50/50">
                <div className="flex items-start gap-4">
                  <div
                    className="mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: primaryColor }}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tight mb-2 italic">
                      {item.name}
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: PROCESO Y TIMELINE */}
        <section className="mb-24" data-section="timeline">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 font-bold mb-16 text-center">
            NUESTRO PROCESO
          </h3>
          <div className="relative">
            {/* Horizontal Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-neutral-100 -translate-y-1/2"></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { name: "Discovery", time: "Semana 1", icon: Calendar },
                { name: "Diseño", time: "Semanas 2-3", icon: MousePointer2 },
                { name: "Desarrollo", time: "Semanas 3-5", icon: Globe },
                { name: "Lanzamiento", time: "Semana 6", icon: Zap },
                { name: "Crecimiento", time: "Meses 2-3", icon: Shield },
              ].map((phase, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center relative z-10">
                  <div className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center mb-4 group transition-colors shadow-sm">
                    <phase.icon
                      className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500"
                      style={{ color: "var(--primary-hover-color)" }}
                    />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-tight mb-1">
                    {phase.name}
                  </h4>
                  <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                    {phase.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 bg-neutral-50 p-6 border border-neutral-100 border-dashed">
            <div className="text-center">
              <p className="text-[8px] font-mono text-neutral-400 uppercase mb-2">
                INICIO ESTIMADO
              </p>
              <p className="text-sm font-bold uppercase tracking-tight">
                {format(start_date, "MMMM d, yyyy")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-mono text-neutral-400 uppercase mb-2">
                ENTREGA ESTIMADA
              </p>
              <p
                className="text-sm font-bold uppercase tracking-tight"
                style={{ color: primaryColor }}>
                {format(estimated_delivery, "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: INVERSIÓN */}
        <section className="mb-24 py-16 border-y-2 border-neutral-900" data-section="inversion">
          <div className="max-w-[500px] mx-auto space-y-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-300 uppercase tracking-widest text-[10px] font-mono">
                Servicio Base
              </span>
              <span className="font-mono">
                ${proposal.subtotal?.toLocaleString("es-MX")} MXN
              </span>
            </div>
            {/* Optional: Add-ons logic would go here if differentiated */}
            <div className="h-px bg-neutral-100"></div>
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 font-bold mb-1">
                  TOTAL DE INVERSIÓN
                </h3>
                <p className="text-[9px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-sm inline-block">
                  50% ANTICIPO / 50% ENTREGA
                </p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black tracking-tighter">
                  ${proposal.total?.toLocaleString("es-MX")}{" "}
                  <span className="text-sm font-mono text-neutral-400 font-normal">
                    MXN
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: LO QUE INCLUYE SIEMPRE */}
        <section className="mb-24">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400 font-bold mb-10 text-center">
            EL ESTÁNDAR{" "}
            {workspace?.name?.split(" ")[0].toUpperCase() || "NOCTRA"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Código Propio",
              "SEO Técnico",
              "Soporte",
              "Velocidad",
              "Mobile-First",
              "Analytics",
              "Seguridad",
              "Documentación",
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest font-bold">
                <div
                  className="w-1.5 h-1.5 rotate-45"
                  style={{ backgroundColor: primaryColor }}></div>
                {feature}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: VIGENCIA */}
        <section className="mb-24 text-center space-y-4">
          <div className="inline-block p-4 bg-emerald-50 border border-emerald-100 rounded-sm">
            {isExpired ? (
              <p className="text-sm font-bold text-red-600 uppercase tracking-tighter">
                Esta propuesta ha vencido. Contacta con nosotros para renovarla.
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-neutral-300 uppercase tracking-widest font-bold">
                  Respuesta solicitada en
                </p>
                <p className="text-2xl font-black italic tracking-tighter uppercase">
                  {daysRemaining} DÍAS RESTANTES
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 8: FIRMA ELECTRÓNICA */}
        {!isExpired && !isSigned && (
          <div
            id="signature"
            className="border-t-4 border-neutral-900 mt-12 bg-neutral-50 -mx-12 md:-mx-20 px-12 md:px-20">
            <SignatureForm
              proposalId={proposal.id}
              clientToken={params.token}
              expectedName={proposal.lead?.name || "CLIENTE"}
              onSuccess={() => {
                /* Redirect or show success logic handled in component usually, but we could pass a success state if we want better transition */
              }}
            />
          </div>
        )}

        {isSigned && (
          <div className="mt-12 bg-emerald-50 p-12 -mx-12 md:-mx-20 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                Propuesta Firmada
              </h3>
              <p className="text-neutral-300 text-sm italic">
                Recibimos la aceptación por parte de{" "}
                <span className="font-bold text-neutral-900 uppercase tracking-tight">
                  {proposal.signed_name}
                </span>{" "}
                el {format(new Date(proposal.signed_at), "MMMM d, yyyy")}.
              </p>
            </div>
            <div className="mt-8 p-4 bg-white/50 border border-emerald-100 rounded text-[9px] font-mono text-neutral-400 uppercase tracking-[0.2em] max-w-sm mx-auto backdrop-blur-sm">
              Digital Audit ID: {proposal.signature_hash?.substring(0, 16)}...
            </div>
          </div>
        )}

        {/* Footer Audit */}
        <div className="mt-24 text-center opacity-10">
          <p className="text-[8px] font-mono tracking-[0.5em] uppercase italic">
            The Digital Future is Crafted with Precision
          </p>
        </div>
      </main>

      {/* Success Notification Placeholder (Client Side could handle toast) */}
    </div>
  );
}
