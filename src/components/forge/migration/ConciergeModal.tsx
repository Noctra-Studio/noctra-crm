"use client";

import { useState } from "react";
import { X, UploadCloud, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConciergeModalProps {
  onClose: () => void;
}

export function ConciergeModal({ onClose }: ConciergeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("El archivo supera los 5MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Por favor, adjunta tu archivo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const base64Content = await toBase64(file);

      const res = await fetch("/api/migration/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment,
          fileName: file.name,
          fileContent: base64Content,
        }),
      });

      if (!res.ok) throw new Error("Error al enviar solicitud");

      toast.success(
        "¡Solicitud enviada! Nuestro equipo se encargará del resto.",
      );
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al enviar tu archivo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold text-white">Servicio Concierge</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Sube tus datos y nosotros hacemos la magia.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Archivo de Datos
            </label>
            <label
              className={cn(
                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20",
              )}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                {file ? (
                  <>
                    <FileText className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-white line-clamp-1">
                      {file.name}
                    </p>
                    <p className="text-xs text-emerald-500 mt-1">
                      Archivo listo
                    </p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-neutral-400 mb-2" />
                    <p className="text-sm font-medium text-white mb-1">
                      Click para subir tu archivo
                    </p>
                    <p className="text-xs text-neutral-500">
                      CSV, Excel, JSON... (Max 5MB)
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".csv, .xlsx, .xls, .json"
              />
            </label>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Instrucciones (Opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej: La columna 'Tel' es el teléfono principal, y solo importa las filas donde el status sea 'Activo'..."
              className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-sm font-bold transition-all">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className={cn(
                "px-5 py-2.5 rounded-xl text-black font-bold text-sm bg-emerald-500 hover:bg-emerald-400 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] flex items-center gap-2",
                isSubmitting || !file
                  ? "opacity-50 cursor-not-allowed shadow-none"
                  : "",
              )}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Solicitud"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
