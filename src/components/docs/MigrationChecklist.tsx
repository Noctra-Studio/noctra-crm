"use client";

import { useState } from "react";

interface ChecklistItem {
  label: string;
  details?: string;
  required: boolean;
}

export default function MigrationChecklist({
  items,
  platform,
}: {
  items: ChecklistItem[];
  platform: string;
}) {
  const [checked, setChecked] = useState<boolean[]>(
    new Array(items.length).fill(false),
  );

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const completedCount = checked.filter(Boolean).length;
  const requiredItems = items.filter((item) => item.required);
  const requiredCompleted = requiredItems.filter((_, i) => checked[i]).length;
  const allRequiredDone = requiredCompleted === requiredItems.length;

  return (
    <div>
      {/* Barra de progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>
            {completedCount} de {items.length} completados
          </span>
          {allRequiredDone && (
            <span className="text-emerald-400 font-medium">
              ✅ Listo para importar
            </span>
          )}
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full transition-all duration-300"
            style={{
              width: `${(items.length > 0 ? completedCount / items.length : 0) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              checked[i]
                ? "bg-emerald-950/30 border-emerald-800/40"
                : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
            }`}>
            <div
              className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                checked[i]
                  ? "bg-emerald-600 border-emerald-600"
                  : "border-slate-600"
              }`}>
              {checked[i] && <span className="text-white text-xs">✓</span>}
            </div>
            <div>
              <p
                className={`text-sm font-medium ${checked[i] ? "text-emerald-300 line-through" : "text-slate-200"}`}>
                {item.label}
                {item.required && (
                  <span className="ml-2 text-xs text-red-400 no-underline">
                    obligatorio
                  </span>
                )}
              </p>
              {item.details && (
                <p className="text-xs text-slate-500 mt-1">{item.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA si todos los obligatorios están completos */}
      {allRequiredDone && (
        <a
          href={`/migration/new?source=${platform.toLowerCase()}`}
          className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors">
          ¡Estoy listo! Iniciar migración desde {platform} →
        </a>
      )}
    </div>
  );
}
