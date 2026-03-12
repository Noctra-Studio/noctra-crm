"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Megaphone,
} from "lucide-react";
import {
  getMailchimpConfig,
  saveMailchimpConfig,
  pingMailchimpConnection,
} from "@/app/actions/marketing-actions";

export default function MarketingSettingsClient() {
  const [apiKey, setApiKey] = useState("");
  const [audienceId, setAudienceId] = useState("");
  const [hasSavedApiKey, setHasSavedApiKey] = useState(false);
  const [savedApiKeyLast4, setSavedApiKeyLast4] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const supabase = createClient();
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch organization_id (assuming standard setup or metadata)
        // Adjust this query based on how your app links users to organizations
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        if (profile?.organization_id) {
          setOrganizationId(profile.organization_id);
          const config = await getMailchimpConfig(profile.organization_id);
          if (config) {
            setAudienceId(config.audience_id || "");
            setHasSavedApiKey(Boolean(config.has_api_key));
            setSavedApiKeyLast4(config.api_key_last4 || null);
          }
        }
      } catch (err) {
        console.error("Failed to load config", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    if (!organizationId) return alert("Organization ID not found.");
    setSaving(true);
    setTestResult(null);
    try {
      await saveMailchimpConfig(organizationId, apiKey, audienceId);
      alert("Configuración guardada exitosamente.");
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey || !audienceId) {
      setTestResult({
        success: false,
        message: "Ingresa un nuevo API key y el Audience ID para probar.",
      });
      return;
    }
    setTesting(true);
    try {
      const result = await pingMailchimpConnection(apiKey, audienceId);
      if (result.success) {
        setTestResult({
          success: true,
          message: `Conectado a la lista: ${result.listName}`,
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Error de conexión",
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Mailchimp Sync
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Conecta tu cuenta de Mailchimp para sincronizar automáticamente los
          contactos cuando una propuesta (Lead) se marca como "Ganada" (Won).
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Megaphone className="text-orange-500 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Credenciales de API</h3>
            <p className="text-xs text-neutral-500">
              Encuentra estos datos en Account &gt; Extras &gt; API keys en
              Mailchimp.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                hasSavedApiKey && savedApiKeyLast4
                  ? `API key cifrada guardada (termina en ${savedApiKeyLast4})`
                  : "Ej. xxxxxxxxxxxxxxxxxxxxxxxx-us14"
              }
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
            />
            {hasSavedApiKey && (
              <p className="text-xs text-neutral-500 mt-1">
                La llave guardada ya no se expone al navegador. Deja este campo
                vacío para conservarla o ingresa una nueva para rotarla.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Audience ID (List ID)
            </label>
            <input
              type="text"
              value={audienceId}
              onChange={(e) => setAudienceId(e.target.value)}
              placeholder="Ej. a1b2c3d4e5"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Encuéntralo en Audience &gt; Settings &gt; Audience name and
              defaults.
            </p>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-lg flex items-start gap-3 border ${
              testResult.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/5">
          <button
            onClick={handleTest}
            disabled={testing || !apiKey || !audienceId}
            className="w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono uppercase tracking-widest text-neutral-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {testing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="w-3.5 h-3.5" />
            )}
            Test Connection
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !organizationId}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
