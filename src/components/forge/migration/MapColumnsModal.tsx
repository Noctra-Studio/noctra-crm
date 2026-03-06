"use client";

import { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  Loader2,
  Database,
  Columns,
  LayoutGrid,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MapColumnsModalProps {
  file: File;
  onClose: () => void;
  onSuccess: () => void;
}

const REQUIRED_FIELDS = [
  { id: "name", label: "Nombre", required: true },
  { id: "email", label: "Email", required: true },
  { id: "phone", label: "Teléfono", required: false },
  { id: "company", label: "Empresa", required: false },
];

export function MapColumnsModal({
  file,
  onClose,
  onSuccess,
}: MapColumnsModalProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    const processFile = async () => {
      try {
        if (file.name.endsWith(".csv")) {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.meta.fields) {
                setHeaders(results.meta.fields);
                setData(results.data.slice(0, 3)); // show first 3 rows as preview
              }
              setIsProcessing(false);
            },
            error: (err) => {
              toast.error("Error al leer el CSV: " + err.message);
              onClose();
            },
          });
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(firstSheet, {
            header: 1,
          });

          if (json.length > 0) {
            setHeaders(json[0]);
            // Convert array of arrays to array of objects mapped by header
            const previewData = json.slice(1, 4).map((row) => {
              const obj: any = {};
              json[0].forEach((header: string, index: number) => {
                obj[header] = row[index];
              });
              return obj;
            });
            setData(previewData);
          }
          setIsProcessing(false);
        } else {
          toast.error("Formato no soportado.");
          onClose();
        }
      } catch (err) {
        console.error(err);
        toast.error("Ocurrió un error al procesar el archivo.");
        onClose();
      }
    };

    processFile();
  }, [file, onClose]);

  const handleMapChange = (requiredFieldId: string, header: string) => {
    setMapping((prev) => ({ ...prev, [requiredFieldId]: header }));
  };

  const remainingRequired = REQUIRED_FIELDS.filter((f) => f.required).filter(
    (f) => !mapping[f.id],
  ).length;

  const handleImport = async () => {
    if (remainingRequired > 0) {
      toast.error("Faltan mapear columnas obligatorias.");
      return;
    }

    setIsDeploying(true);

    // Simulating deployment latency, since the backend insertion action isn't fully spec'd yet.
    // In a real scenario, we'd send the full parsed data + mapping config to a Server Action.
    setTimeout(() => {
      setIsDeploying(false);
      onSuccess();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#050505] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 relative my-8">
        <div className="sticky top-0 z-20 bg-[#050505] border-b border-white/5 p-6 md:p-8 flex items-center justify-between rounded-t-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">
              <Database className="w-3.5 h-3.5" />
              Mapeo de Columnas
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Vincular con Noctra
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Conecta las columnas de {file.name} con nuestros campos.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-10">
          {isProcessing ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center text-neutral-400 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">
                Analizando estructura del archivo...
              </p>
            </div>
          ) : (
            <>
              {/* Mapping Section */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-2">
                  <Columns className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-white">
                    Campos Requeridos
                  </h3>
                </div>

                <div className="divide-y divide-white/5">
                  {REQUIRED_FIELDS.map((field) => (
                    <div
                      key={field.id}
                      className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {field.label}
                          </span>
                          {field.required && (
                            <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                              Req
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          El campo que almacenará el {field.label.toLowerCase()}
                          .
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center justify-center hidden md:flex">
                        <ArrowRight className="w-4 h-4 text-neutral-600" />
                      </div>

                      <div className="flex-1">
                        <select
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none"
                          value={mapping[field.id] || ""}
                          onChange={(e) =>
                            handleMapChange(field.id, e.target.value)
                          }>
                          <option value="" disabled>
                            Seleccionar columna del archivo...
                          </option>
                          {headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-white">
                    Vista Previa de Datos (Primeras 3 filas)
                  </h3>
                </div>

                <div className="bg-black border border-white/10 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        {headers.map((h) => (
                          <th
                            key={h}
                            className={cn(
                              "px-6 py-4 font-mono text-[10px] uppercase tracking-widest font-bold",
                              Object.values(mapping).includes(h)
                                ? "text-emerald-400"
                                : "text-neutral-500",
                            )}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.map((row, i) => (
                        <tr
                          key={i}
                          className="hover:bg-white/[0.02] transition-colors">
                          {headers.map((h) => (
                            <td key={h} className="px-6 py-4 text-neutral-300">
                              {row[h] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 bg-[#050505] border-t border-white/5 p-6 rounded-b-2xl flex items-center justify-between">
          <p className="text-xs text-neutral-500 font-medium">
            {remainingRequired > 0 ? (
              <span className="text-red-400">
                Faltan {remainingRequired} campos obligatorios.
              </span>
            ) : (
              <span className="text-emerald-500">
                Todo listo para importar.
              </span>
            )}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-sm font-bold">
              Cancelar
            </button>
            <button
              disabled={remainingRequired > 0 || isDeploying || isProcessing}
              onClick={handleImport}
              className={cn(
                "px-8 py-2.5 rounded-xl bg-white text-black font-black text-sm flex items-center gap-2 transition-all hover:bg-neutral-200",
                (remainingRequired > 0 || isDeploying || isProcessing) &&
                  "opacity-50 cursor-not-allowed",
              )}>
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Importando...
                </>
              ) : (
                "Comenzar Importación"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
