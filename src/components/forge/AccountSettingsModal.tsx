"use client";

import { useState, useEffect } from "react";
import { X, User, Shield, Globe, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function AccountSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [user, setUser] = useState<any>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [language, setLanguage] = useState("es");

  // Danger Zone
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      loadUser();
    } else {
      // Reset state when closed
      setMessage(null);
      setNewPassword("");
      setDeleteEmailConfirm("");
      setActiveTab("profile");
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const loadUser = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUser(user);
      setEmail(user.email || "");
      setDisplayName(
        user.user_metadata?.full_name || user.user_metadata?.name || "",
      );
      setLanguage(user.user_metadata?.language || "es");

      // Check MFA status
      const { data: mfaData } = await supabase.auth.mfa.listFactors();
      setIs2FAEnabled(
        mfaData?.totp?.some((f) => f.status === "verified") || false,
      );
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    const updates: any = {};
    if (displayName !== user?.user_metadata?.full_name) {
      updates.data = { ...updates.data, full_name: displayName };
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Perfil actualizado correctamente.",
        });
        loadUser();
      }
    } else {
      setMessage({ type: "success", text: "No hay cambios para guardar." });
    }

    setSaving(false);
  };

  const handleSavePassword = async () => {
    if (!newPassword) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Contraseña actualizada correctamente.",
      });
      setNewPassword("");
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteEmailConfirm !== email) return;
    setIsDeleting(true);

    const { error } = await supabase.rpc("delete_user");
    if (error) {
      setMessage({ type: "error", text: "Error eliminando cuenta." });
      setIsDeleting(false);
    } else {
      await supabase.auth.signOut();
      router.push("/forge/login");
    }
  };

  if (!isOpen) return null;

  const getInitials = (name: string, emailStr: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (emailStr) return emailStr.substring(0, 2).toUpperCase();
    return "US";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-[#0f0f0f] border-b md:border-b-0 md:border-r border-white/5 flex flex-col shrink-0">
          <div className="p-6">
            <h2 className="text-sm font-semibold text-white">Configuración</h2>
            <p className="text-xs text-white/40 mt-1">Administra tu cuenta</p>
          </div>
          <div className="flex flex-row md:flex-col gap-1 px-4 pb-4 md:px-3 overflow-x-auto md:overflow-x-visible">
            <button
              onClick={() => {
                setActiveTab("profile");
                setMessage(null);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === "profile" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              <User className="w-4 h-4" /> Perfil
            </button>
            <button
              onClick={() => {
                setActiveTab("security");
                setMessage(null);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === "security" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              <Shield className="w-4 h-4" /> Seguridad
            </button>
            <button
              onClick={() => {
                setActiveTab("preferences");
                setMessage(null);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === "preferences" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              <Globe className="w-4 h-4" /> Preferencias
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full bg-[#050505] relative overflow-y-auto custom-scrollbar">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>

          <div className="p-8 pb-20 max-w-md w-full">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
              </div>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-6">
                        Tu Perfil
                      </h3>
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl font-mono text-emerald-500">
                          {getInitials(displayName, email)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {displayName || "Usuario"}
                          </p>
                          <p className="text-xs text-white/40 font-mono mt-1">
                            {email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-white/40">
                          Nombre a mostrar
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-white/40">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white/40 cursor-not-allowed"
                        />
                        <p className="text-[10px] text-emerald-500/80">
                          Verificado
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-white text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors">
                        {saving ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-6">
                        Seguridad
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-white/40">
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                      <button
                        onClick={handleSavePassword}
                        disabled={saving || !newPassword}
                        className="bg-white/10 text-white border border-white/10 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/20 disabled:opacity-50 transition-colors">
                        {saving ? "Actualizando..." : "Actualizar contraseña"}
                      </button>
                    </div>

                    <div className="border-t border-white/5 pt-8 mt-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-white">
                            Autenticación de 2 Factores
                          </h4>
                          <p className="text-xs text-white/40 mt-1">
                            Añade una capa extra de seguridad.
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest ${is2FAEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-400"}`}>
                          {is2FAEnabled ? "Activado" : "Desactivado"}
                        </div>
                      </div>
                      {!is2FAEnabled && (
                        <p className="text-xs text-amber-500 mt-4 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                          Aún no tienes 2FA configurado. Te recomendamos
                          activarlo desde los ajustes globales de seguridad.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-6">
                        Preferencias
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-white/40">
                          Idioma de la Interfaz
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors">
                          <option value="es">Español</option>
                          <option value="en">English (Próximamente)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Global Message Toast inside modal */}
            {message && (
              <div
                className={`mt-6 p-3 rounded-lg text-xs flex items-center gap-2 ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                {message.type === "error" && (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            )}

            {/* Danger Zone appended to all tabs but pinned to bottom logic or separated? Better to put it only in Security or a dedicated Danger tab. Let's add it to Security at the bottom. */}
            {activeTab === "security" && !loading && (
              <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6 mt-12 mb-8">
                <h4 className="text-red-500 font-semibold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Zona de Peligro
                </h4>
                <p className="text-xs text-white/40 mt-2 mb-4">
                  Eliminar tu cuenta es una acción permanente y no se puede
                  deshacer. Todos tus datos se perderán de inmediato.
                </p>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
                    Escribe tu correo para confirmar:
                  </label>
                  <input
                    type="text"
                    value={deleteEmailConfirm}
                    onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                    placeholder={email}
                    className="w-full bg-black/50 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteEmailConfirm !== email || isDeleting}
                    className="w-full bg-red-500 text-white font-semibold text-xs py-2.5 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isDeleting
                      ? "Eliminando..."
                      : "Eliminar cuenta permanentemente"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
