"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, X } from "lucide-react";
import { createProjectAction } from "@/app/actions/projects";
import {
  buildProjectSlug,
  PROJECT_SERVICE_TYPE_VALUES,
  type ProjectServiceType,
} from "@/lib/project-core";

type NewProjectFormState = {
  name: string;
  slug: string;
  industry: string;
  service_type: ProjectServiceType;
  start_date: string;
  launch_date: string;
};

const INITIAL_FORM: NewProjectFormState = {
  name: "",
  slug: "",
  industry: "",
  service_type: PROJECT_SERVICE_TYPE_VALUES[0],
  start_date: "",
  launch_date: "",
};

const SERVICE_LABELS: Record<ProjectServiceType, string> = {
  web_presence: "Web Presence",
  ecommerce: "E-commerce",
  custom_system: "Custom System",
};

export function NewProjectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<NewProjectFormState>(INITIAL_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_FORM);
      setErrorMessage(null);
      setIsCreating(false);
    }
  }, [isOpen]);

  const canSubmit = useMemo(
    () => form.name.trim().length > 1 && form.slug.trim().length > 1,
    [form.name, form.slug],
  );

  const updateField = <Field extends keyof NewProjectFormState>(
    field: Field,
    value: NewProjectFormState[Field],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => {
      const nextSlug =
        prev.slug.trim() === "" || prev.slug === buildProjectSlug(prev.name)
          ? buildProjectSlug(value)
          : prev.slug;

      return {
        ...prev,
        name: value,
        slug: nextSlug,
      };
    });
  };

  const handleCreate = async () => {
    if (!canSubmit) return;

    setIsCreating(true);
    setErrorMessage(null);

    const result = await createProjectAction({
      name: form.name,
      slug: form.slug,
      industry: form.industry || undefined,
      service_type: form.service_type,
      start_date: form.start_date || undefined,
      launch_date: form.launch_date || undefined,
    });

    if (!result.success) {
      setErrorMessage(result.error);
      setIsCreating(false);
      return;
    }

    onClose();
    router.push(`/projects?projectId=${result.project.id}`);
    router.refresh();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/5 p-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-emerald-400/80">
              Operaciones
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              Nuevo Proyecto
            </h3>
            <p className="mt-2 max-w-lg text-sm text-white/55">
              Crea un proyecto operativo con la configuración base para arrancar
              planeación, tareas y seguimiento desde Noctra CRM.
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

        <div className="grid gap-5 overflow-y-auto p-6">
          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Nombre
            </span>
            <input
              autoFocus
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Portal Cliente Acme"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Slug
            </span>
            <input
              value={form.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              placeholder="portal-cliente-acme"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Industria
            </span>
            <input
              value={form.industry}
              onChange={(event) => updateField("industry", event.target.value)}
              placeholder="SaaS, educación, retail..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              Tipo de servicio
            </span>
            <select
              value={form.service_type}
              onChange={(event) =>
                updateField(
                  "service_type",
                  event.target.value as ProjectServiceType,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
            >
              {PROJECT_SERVICE_TYPE_VALUES.map((serviceType) => (
                <option
                  key={serviceType}
                  value={serviceType}
                  className="bg-[#0A0A0A]"
                >
                  {SERVICE_LABELS[serviceType]}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
                Inicio
              </span>
              <input
                type="date"
                value={form.start_date}
                onChange={(event) => updateField("start_date", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50 [color-scheme:dark]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
                Fecha objetivo
              </span>
              <input
                type="text"
                value={form.launch_date}
                onChange={(event) => updateField("launch_date", event.target.value)}
                placeholder="Q2 2026 o 2026-06-30"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-emerald-500/50"
              />
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/5 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs text-white/45">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Se crea en Supabase con tareas iniciales y actividad del workspace.
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isCreating ? "Creando..." : "Crear proyecto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
