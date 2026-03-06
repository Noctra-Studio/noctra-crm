"use client";

import { useActionState } from "react";
import { deployClientInfrastructure, type ActionResponse } from "./actions";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

const initialState: ActionResponse = {
  success: false,
  message: "",
  error: "",
};

export default function AdminDashboard() {
  const t = useTranslations("Admin");
  const [state, formAction] = useActionState(
    deployClientInfrastructure,
    initialState
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border border-zinc-800 bg-zinc-900/50 p-8 rounded-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-zinc-400 font-mono text-sm">{t("subtitle")}</p>
        </div>

        {state?.success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded text-green-400 text-sm">
            {state.message}
          </div>
        )}

        {state?.error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Client Details */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                {t("form.client_email")}
              </label>
              <input
                name="email"
                type="email"
                placeholder={t("placeholders.client_email")}
                className="w-full bg-black border border-zinc-800 p-3 rounded text-sm focus:border-white outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                {t("form.client_name")}
              </label>
              <input
                name="clientName"
                type="text"
                placeholder={t("placeholders.client_name")}
                className="w-full bg-black border border-zinc-800 p-3 rounded text-sm focus:border-white outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              {t("form.company_name")}
            </label>
            <input
              name="companyName"
              type="text"
              placeholder={t("placeholders.company_name")}
              className="w-full bg-black border border-zinc-800 p-3 rounded text-sm focus:border-white outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Project Details */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                {t("form.project_name")}
              </label>
              <input
                name="projectName"
                type="text"
                placeholder={t("placeholders.project_name")}
                className="w-full bg-black border border-zinc-800 p-3 rounded text-sm focus:border-white outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                {t("form.total_budget")}
              </label>
              <input
                name="budget"
                type="number"
                placeholder={t("placeholders.total_budget")}
                className="w-full bg-black border border-zinc-800 p-3 rounded text-sm focus:border-white outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-bold py-3 rounded hover:bg-zinc-200 transition-colors mt-4 flex items-center justify-center gap-2">
            {t("form.deploy_button")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
