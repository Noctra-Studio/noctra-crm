"use client";

import { useState } from "react";
import {
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Send,
  Check,
} from "lucide-react";
import { updateDeliverableReviewAction } from "@/app/actions/deliverables";

export default function DeliverablePortalClient({
  deliverable,
}: {
  deliverable: any;
}) {
  const workspace = deliverable.projects?.workspace;
  const primaryColor = workspace?.primary_color || "#000000";
  const [status, setStatus] = useState(deliverable.status);
  const [comment, setComment] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await updateDeliverableReviewAction(deliverable.id, {
        status: "approved",
      });
      setStatus("approved");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comment) return;
    setIsSubmitting(true);
    try {
      await updateDeliverableReviewAction(deliverable.id, {
        status: "rejected",
        client_comment: comment,
      });
      setStatus("rejected");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReviewed = status === "approved" || status === "rejected";

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {workspace?.logo_url ? (
              <img
                src={workspace.logo_url}
                alt={workspace.name}
                className="h-5 w-auto"
              />
            ) : (
              <span className="text-xl font-black tracking-tighter">
                ◆ {workspace?.name?.toUpperCase() || "NOCTRA STUDIO"}
              </span>
            )}
            <div className="w-[1px] h-4 bg-neutral-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Revisión de entregable
            </span>
          </div>
          <div className="text-xs font-medium text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full">
            Proyecto:{" "}
            <span className="text-neutral-900 font-bold">
              {deliverable.projects?.name}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20 space-y-24">
        {/* Content Section */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight leading-tight">
              {deliverable.title}
            </h1>
            {deliverable.description && (
              <p className="text-xl text-neutral-500 leading-relaxed font-light">
                {deliverable.description}
              </p>
            )}
          </div>

          <div className="pt-4">
            <a
              href={deliverable.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-white px-8 py-5 rounded-none font-bold uppercase tracking-widest text-xs hover:gap-5 shadow-2xl shadow-neutral-200 transition-all"
              style={{ backgroundColor: primaryColor }}>
              Ver entregable
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Review Section */}
        <section className="pt-20 border-t border-neutral-100">
          {submitted || isReviewed ? (
            <div className="bg-neutral-50 p-12 rounded-none space-y-6 text-center">
              {status === "approved" ? (
                <>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}>
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black">
                      ✓ Aprobado. Gracias por tu respuesta.
                    </h3>
                    <p className="text-neutral-500">
                      Hemos recibido tu conformidad y continuaremos con los
                      siguientes pasos.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black">
                      Comentarios enviados.
                    </h3>
                    <p className="text-neutral-500">
                      Te contactaremos a la brevedad para discutir los cambios
                      solicitados.
                    </p>
                  </div>
                  {deliverable.client_comment && (
                    <div className="mt-8 p-6 bg-white border border-neutral-200 text-left italic text-neutral-600">
                      "{deliverable.client_comment}"
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">
                  ¿Qué te parece este entregable?
                </h2>
                <p className="text-neutral-500">
                  Tu retroalimentación es vital para asegurar el mejor
                  resultado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  disabled={isSubmitting}
                  onClick={handleApprove}
                  className="flex items-center justify-center gap-3 border-2 p-6 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
                  style={{ borderColor: primaryColor, color: primaryColor }}>
                  <CheckCircle className="w-5 h-5" />
                  Aprobar
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowRejectForm(true)}
                  className={`flex items-center justify-center gap-3 border-2 border-red-600 text-red-600 p-6 font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all disabled:opacity-50 ${showRejectForm ? "bg-red-50" : ""}`}>
                  <AlertCircle className="w-5 h-5" />
                  Solicitar Cambios
                </button>
              </div>

              {showRejectForm && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Describe los cambios que necesitas
                    </label>
                    <textarea
                      autoFocus
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={6}
                      className="w-full bg-neutral-50 border-2 border-neutral-100 p-6 text-neutral-900 focus:outline-none focus:border-red-600 transition-colors placeholder-neutral-300 shadow-inner"
                      placeholder="Escribe aquí tus comentarios o ajustes necesarios..."
                    />
                  </div>
                  <button
                    disabled={isSubmitting || !comment}
                    onClick={handleReject}
                    className="w-full md:w-auto px-12 py-5 bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    {isSubmitting ? "Enviando..." : "Enviar comentarios"}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-neutral-100 py-12 bg-neutral-50/50">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Design & Strategy by {workspace?.name || "Noctra Studio"}
          </p>
        </div>
      </footer>
    </div>
  );
}
