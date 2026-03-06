"use client";

import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MigrationDropzoneProps {
  onFileAccepted: (file: File) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function MigrationDropzone({ onFileAccepted }: MigrationDropzoneProps) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
  });

  const hasRejections = fileRejections.length > 0;
  const isTooLarge = fileRejections.some((rej) =>
    rej.errors.some((err) => err.code === "file-too-large"),
  );

  const isInvalidType = fileRejections.some((rej) =>
    rej.errors.some((err) => err.code === "file-invalid-type"),
  );

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden",
        isDragActive
          ? "border-emerald-500 bg-emerald-500/5 scale-[1.02]"
          : "border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/30",
        isDragReject || hasRejections ? "border-red-500/50 bg-red-500/5" : "",
      )}>
      <input {...getInputProps()} />

      {/* Decorative Icons */}
      <div className="flex gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 -rotate-6">
          <FileText className="w-6 h-6" />
        </div>
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 z-10 shadow-xl relative top-2">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 rotate-6">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
      </div>

      <div className="text-center px-4 relative z-10">
        <h3 className="text-xl font-bold text-white mb-2">
          {isDragActive
            ? "Suelta aquí para mapear"
            : "Arrastra y suelta tu base de datos"}
        </h3>
        <p className="text-sm text-neutral-400 max-w-sm mx-auto">
          Archivos soportados: .csv y .xlsx
          <br />
          Máximo 5MB por carga.
        </p>

        {hasRejections && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in slide-in-from-bottom-2">
            <AlertCircle className="w-4 h-4" />
            {isTooLarge
              ? "El archivo supera los 5MB máximos."
              : isInvalidType
                ? "Solo aceptamos archivos CSV y Excel."
                : "No se pudo subir el archivo."}
          </div>
        )}

        {/* Hidden Upload Button for purely click-based users */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold shadow-sm">
            Explorar Computadora
          </button>
        </div>
      </div>
    </div>
  );
}
