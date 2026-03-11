"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";

const NOCTRA_FIELDS = [
  { key: "first_name", label: "Nombre" },
  { key: "last_name", label: "Apellidos" },
  { key: "email", label: "Email", required: true },
  { key: "phone", label: "Teléfono" },
  { key: "company_name", label: "Empresa" },
  { key: "job_title", label: "Puesto" },
  { key: "notes", label: "Notas" },
];

export function FieldMapping({
  onComplete,
  onBack,
}: {
  onComplete: (mapping: any) => void;
  onBack: () => void;
}) {
  // Mock detected fields from the source
  const detectedFields = [
    "First Name",
    "Last Name",
    "Email Address",
    "Work Phone",
    "Org",
    "Role",
    "Comments",
  ];

  const [mapping, setMapping] = useState<Record<string, string>>(() => {
    // Initial auto-mapping logic
    const initial: Record<string, string> = {};
    detectedFields.forEach((df) => {
      const match = NOCTRA_FIELDS.find(
        (nf) =>
          df.toLowerCase().includes(nf.key.replace("_", " ")) ||
          df.toLowerCase().includes(nf.label.toLowerCase()),
      );
      if (match) initial[df] = match.key;
    });
    return initial;
  });

  const handleNext = () => {
    // Check required fields
    const mappedNoctraFields = Object.values(mapping);
    const missing = NOCTRA_FIELDS.filter(
      (f) => f.required && !mappedNoctraFields.includes(f.key),
    );

    if (missing.length > 0) {
      return alert(
        `Por favor, mapea el campo obligatorio: ${missing[0].label}`,
      );
    }

    onComplete(mapping);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">
          Paso 3: Mapeo de Campos
        </h2>
        <p className="text-neutral-400 text-sm">
          Asocia las columnas de tu origen con los campos de Noctra CRM.
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                Origen (Detectado)
              </th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-mono text-neutral-500">
                Destino (Noctra CRM)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {detectedFields.map((df) => (
              <tr key={df} className="hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-white">{df}</span>
                </td>
                <td className="px-6 py-4">
                  <select
                    className="w-full bg-neutral-800 border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    value={mapping[df] || ""}
                    onChange={(e) =>
                      setMapping({ ...mapping, [df]: e.target.value })
                    }>
                    <option value="">— Ignorar este campo —</option>
                    {NOCTRA_FIELDS.map((nf) => (
                      <option key={nf.key} value={nf.key}>
                        {nf.label} {nf.required ? "*" : ""}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-all text-sm font-bold shadow-lg shadow-emerald-500/10">
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
