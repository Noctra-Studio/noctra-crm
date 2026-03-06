"use client";

import { useState } from "react";
import { ForgeContentWrapper } from "@/components/forge/ForgeContentWrapper";
import { ArrowLeft, HardDriveUpload, Sparkles } from "lucide-react";
import Link from "next/link";
import { MigrationDropzone } from "@/components/forge/migration/MigrationDropzone";
import { ConciergeModal } from "@/components/forge/migration/ConciergeModal";
import { MapColumnsModal } from "@/components/forge/migration/MapColumnsModal";
import { toast } from "sonner";

export default function ImportSettingsPage() {
  const [showConcierge, setShowConcierge] = useState(false);
  const [showMapColumns, setShowMapColumns] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileDrop = (file: File) => {
    setUploadedFile(file);
    setShowMapColumns(true);
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setShowMapColumns(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 md:px-12 w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <Link
          href="/forge/settings"
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Ajustes
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <HardDriveUpload className="w-8 h-8 text-emerald-500" />
          Importar Datos
        </h1>
        <p className="text-neutral-400 mt-2 text-sm leading-relaxed max-w-xl">
          Centraliza a todos tus clientes y prospectos en Noctra Forge. Sube un
          archivo CSV o Excel para comenzar el mapeo de columnas.
        </p>
      </div>

      <div className="space-y-8">
        {/* Main Dropzone Section */}
        <section className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden">
          <MigrationDropzone onFileAccepted={handleFileDrop} />
        </section>

        {/* Concierge Service Banner */}
        <section
          onClick={() => setShowConcierge(true)}
          className="relative group cursor-pointer bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-6 md:p-8 hover:bg-emerald-500/15 transition-all overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Servicio Concierge
              </div>
              <h3 className="text-xl font-bold text-white">
                ¿Muchos datos o formato complejo?
              </h3>
              <p className="text-sm text-neutral-400 max-w-md">
                Deja de pelear con columnas. Sube tu archivo tal como lo tienes
                y nuestro equipo lo mapeará e importará por ti sin costo.
              </p>
            </div>

            <button className="shrink-0 px-6 py-3 bg-emerald-500 text-black font-bold text-sm rounded-xl hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)]">
              Lo hacemos por ti
            </button>
          </div>
        </section>
      </div>

      {/* Modals */}
      {showConcierge && (
        <ConciergeModal onClose={() => setShowConcierge(false)} />
      )}

      {showMapColumns && uploadedFile && (
        <MapColumnsModal
          file={uploadedFile}
          onClose={clearUpload}
          onSuccess={() => {
            clearUpload();
            toast.success("¡Contactos importados exitosamente!");
          }}
        />
      )}
    </div>
  );
}
