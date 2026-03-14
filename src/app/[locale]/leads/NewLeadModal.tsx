"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { createLeadAction } from "@/app/actions/leads";

const SERVICE_OPTIONS = [
  "Web Presence",
  "E-commerce",
  "Custom System",
  "Noctra CRM",
  "General",
];

export function NewLeadModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    service_interest: SERVICE_OPTIONS[0],
    estimated_value: "",
    next_action: "",
    next_action_date: "",
  });

  const canSubmit = useMemo(
    () => form.name.trim().length > 1 && form.email.trim().length > 3,
    [form.email, form.name],
  );

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!canSubmit) return;
    setIsCreating(true);
    setErrorMessage(null);
    try {
      const lead = await createLeadAction({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company_name: form.company_name.trim() || undefined,
        service_interest: form.service_interest,
        estimated_value: form.estimated_value
          ? Number(form.estimated_value)
          : undefined,
        next_action: form.next_action.trim() || undefined,
        next_action_date: form.next_action_date || undefined,
      });

      onClose();
      router.push(`/leads?leadId=${lead.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "No pudimos crear el lead. Revisa los datos e intenta de nuevo.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/5 p-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-emerald-400/80">
              Captura manual
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">Nuevo Lead</h3>
            <p className="mt-2 max-w-lg text-sm text-white/55">
              Agrega un prospecto al pipeline con el contexto mínimo para poder
              contactarlo y moverlo sin perder seguimiento.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto p-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Nombre
            </span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="María López"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Email
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="maria@empresa.com"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Teléfono
            </span>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+52 55 0000 0000"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Empresa
            </span>
            <input
              value={form.company_name}
              onChange={(event) => updateField("company_name", event.target.value)}
              placeholder="Empresa o marca"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Servicio
            </span>
            <select
              value={form.service_interest}
              onChange={(event) =>
                updateField("service_interest", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            >
              {SERVICE_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-[#0A0A0A]">
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Valor estimado
            </span>
            <input
              type="number"
              min="0"
              value={form.estimated_value}
              onChange={(event) =>
                updateField("estimated_value", event.target.value)
              }
              placeholder="25000"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Siguiente acción
            </span>
            <input
              value={form.next_action}
              onChange={(event) => updateField("next_action", event.target.value)}
              placeholder="Llamar para discovery o enviar resumen"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Fecha de seguimiento
            </span>
            <input
              type="date"
              value={form.next_action_date}
              onChange={(event) =>
                updateField("next_action_date", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50 [color-scheme:dark]"
            />
          </label>

          {errorMessage && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 md:col-span-2">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/5 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs text-white/45">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Se guardará en Supabase y aparecerá de inmediato en el pipeline.
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/65 transition-colors hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!canSubmit || isCreating}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? "Creando..." : "Crear lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
