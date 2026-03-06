"use client";

import React, { useState, useEffect } from "react";
import { SignaturePad } from "@/components/sign/SignaturePad";
import { AuditTrailBadge } from "@/components/sign/AuditTrailBadge";
import {
  validateSigningHash,
  stampDocumentSignature,
} from "@/app/actions/sign-actions";
import { Loader2, FileCheck, AlertCircle, ShieldCheck } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

export default function SignPageContent({ hash }: { hash: string }) {
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await validateSigningHash(hash);
        if (!result) {
          setError("El link ha expirado o no es válido.");
        } else {
          setDoc(result);
        }
      } catch (err) {
        setError("Error al cargar el documento.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hash]);

  const handleSign = async (signatureDataUrl: string) => {
    setIsSigning(true);
    try {
      // Get client-side metadata
      const response = await fetch("https://api64.ipify.org?format=json");
      const { ip } = await response.json();

      await stampDocumentSignature(
        doc.envelope.id, // Using Envelope ID instead of document ID
        signatureDataUrl,
        {
          ip,
          userAgent: navigator.userAgent,
          name: doc.data.lead?.name || "Desconocido", // Extract from document lead
          email: doc.data.lead?.email || "desconocido@example.com",
        },
      );

      setSignedSuccess(true);
    } catch (err) {
      alert("Error al procesar la firma. Por favor intenta de nuevo.");
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-white">{error}</h1>
          <p className="text-neutral-500 text-sm">
            Si crees que esto es un error, por favor contacta a tu asesor de
            Noctra Studio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
          <div className="space-y-4">
            <img
              src="/images/noctra-logo-white.png"
              alt="Noctra"
              className="h-6 w-auto"
            />
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight uppercase">
                Firmar {doc.type === "proposal" ? "Propuesta" : "Contrato"}
              </h1>
              <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">
                ID: {doc.data.proposal_number || doc.data.id.substring(0, 8)}
              </p>
            </div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg flex items-center gap-3">
            <ShieldCheck className="text-emerald-500 w-5 h-5" />
            <div className="text-[10px] uppercase font-mono tracking-widest leading-none">
              <span className="text-white block mb-1">Conexión Segura</span>
              <span className="text-emerald-500/60">ESIGN Compliant</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!signedSuccess ? (
            <m.div
              key="sign-flow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Document Summary */}
              <div className="space-y-8">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                    Detalles del Documento
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[10px] font-mono text-neutral-600 uppercase mb-1">
                        Título
                      </span>
                      <p className="text-lg font-bold">{doc.data.title}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono text-neutral-600 uppercase mb-1">
                        Cliente
                      </span>
                      <p className="text-white">{doc.data.lead?.name}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <span className="block text-[10px] font-mono text-neutral-600 uppercase mb-2">
                        Resumen
                      </span>
                      <p className="text-sm text-neutral-400 leading-relaxed italic">
                        {doc.data.description?.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-600 leading-relaxed italic">
                  Al firmar este documento, aceptas los términos y condiciones
                  estipulados en el mismo. Tu firma digital tiene la misma
                  validez legal que una firma autógrafa bajo la ley ESIGN.
                </p>
              </div>

              {/* Signature Pad */}
              <div className="space-y-8">
                <div className="text-center md:text-left">
                  <h2 className="text-xl font-bold mb-2">Tu Firma</h2>
                  <p className="text-sm text-neutral-500">
                    Usa tu dedo o mouse para firmar en el recuadro blanco.
                  </p>
                </div>

                <div className="relative">
                  {isSigning && (
                    <div className="absolute inset-0 z-50 bg-[#050505]/80 backdrop-blur-sm flex items-center justify-center rounded-2xl border border-white/10">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                        <p className="text-xs font-mono uppercase tracking-widest text-emerald-500">
                          Procesando Firma...
                        </p>
                      </div>
                    </div>
                  )}
                  <SignaturePad onSave={handleSign} />
                </div>
              </div>
            </m.div>
          ) : (
            <m.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto py-20 text-center space-y-8">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <FileCheck className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-black uppercase">
                  ¡Documento Firmado!
                </h1>
                <p className="text-neutral-400">
                  Gracias, {doc.data.lead?.name}. El documento ha sido procesado
                  y una copia te será enviada por correo automáticamente.
                </p>
              </div>
              <div className="pt-8 mt-8 border-t border-white/5">
                <AuditTrailBadge
                  timestamp={new Date().toLocaleDateString()}
                  ip="Verificado"
                  userAgent={navigator.userAgent}
                />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
