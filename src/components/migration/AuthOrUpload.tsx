"use client";

import { useState } from "react";
import { Upload, Key, ArrowLeft, ArrowRight, FileText } from "lucide-react";

export function AuthOrUpload({
  source,
  onComplete,
  onBack,
}: {
  source: string;
  onComplete: (data: any) => void;
  onBack: () => void;
}) {
  const isTier1 = !["csv", "excel", "json"].includes(source);
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleNext = async () => {
    if (isTier1) {
      if (!apiKey) return alert("Por favor, ingresa tu API Key o Token");
      onComplete({ accessToken: apiKey });
    } else {
      if (!file) return alert("Por favor, sube un archivo");
      // In a real implementation, we would upload to Supabase Storage here
      // and pass the file URL to the next step.
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        onComplete({ fileUrl: "temp-storage-url" });
      }, 1500);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">
          Paso 2: {isTier1 ? "Conecta tu CRM" : "Sube tu Archivo"}
        </h2>
        <p className="text-neutral-400 text-sm">
          {isTier1
            ? `Necesitamos permiso para acceder a tus datos de ${source}. Ingresa tu API Key para continuar.`
            : "Sube tu archivo en formato .csv, .xlsx o .json para procesar los datos."}
        </p>
      </div>

      <div className="max-w-xl">
        {isTier1 ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-500/80 leading-relaxed font-medium">
                Tip: Generalmente puedes encontrar tu API Key en la sección de
                Configuración &gt; Integraciones &gt; API en tu panel de{" "}
                {source}.
              </p>
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                placeholder={`Ingresa tu ${source.toUpperCase()} API Key`}
                className="w-full bg-white/[0.02] border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="group block p-12 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/[0.01] transition-all cursor-pointer text-center">
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-neutral-400 group-hover:text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-white mb-1">
                {file ? file.name : "Click para subir o arrastra un archivo"}
              </p>
              <p className="text-xs text-neutral-500">
                CSV, XLSX o JSON (Máx. 50MB)
              </p>
            </label>
            {file && (
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-neutral-300 truncate flex-1">
                  {file.name}
                </span>
                <button
                  onClick={() => setFile(null)}
                  className="text-[10px] uppercase font-bold text-neutral-500 hover:text-white">
                  Quitar
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
          <button
            onClick={handleNext}
            disabled={isUploading}
            className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 transition-all text-sm font-bold shadow-lg shadow-emerald-500/10">
            {isUploading ? "Procesando..." : "Continuar"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
