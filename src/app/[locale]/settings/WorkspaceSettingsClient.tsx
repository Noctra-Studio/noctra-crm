"use client";

import { useState } from "react";
import {
  Save,
  Settings,
  Briefcase,
  Layers,
  Image as ImageIcon,
  Palette,
  Globe,
  Plus,
  Trash2,
  Check,
  Zap,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateWorkspaceAction,
  updateWorkspaceConfigAction,
} from "@/app/actions/workspace";

interface WorkspaceSettingsProps {
  workspace: any;
  config: any;
}

export default function WorkspaceSettingsClient({
  workspace,
  config,
}: WorkspaceSettingsProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  // General States
  const [name, setName] = useState(workspace.name);
  const [logoUrl, setLogoUrl] = useState(workspace.logo_url || "");
  const [email, setEmail] = useState(workspace.email || "");
  const [websiteUrl, setWebsiteUrl] = useState(workspace.website_url || "");
  const [primaryColor, setPrimaryColor] = useState(
    workspace.primary_color || "#10b981",
  );
  const [subdomain, setSubdomain] = useState(workspace.subdomain || "");
  const [customDomain, setCustomDomain] = useState(
    workspace.custom_domain || "",
  );

  const isFree = workspace.tier === "free";

  // Config States
  const [serviceTypes, setServiceTypes] = useState(config.serviceTypes || []);
  const [pipelineStages, setPipelineStages] = useState(
    config.pipelineStages || [],
  );

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      await updateWorkspaceAction({
        name,
        logo_url: logoUrl,
        email,
        website_url: websiteUrl,
        primary_color: primaryColor,
        subdomain: activeTab === "branding" ? subdomain : workspace.subdomain,
        custom_domain:
          activeTab === "branding" ? customDomain : workspace.custom_domain,
      });
      alert("Configuración actualizada");
    } catch (error) {
      alert("Error al actualizar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await updateWorkspaceConfigAction({
        serviceTypes,
        pipelineStages,
      });
      alert("Configuración de negocio actualizada");
    } catch (error) {
      alert("Error al actualizar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const addServiceType = () => {
    setServiceTypes([...serviceTypes, "Nuevo Servicio"]);
  };

  const removeServiceType = (index: number) => {
    setServiceTypes(serviceTypes.filter((_: any, i: number) => i !== index));
  };

  const updateServiceType = (index: number, val: string) => {
    const next = [...serviceTypes];
    next[index] = val;
    setServiceTypes(next);
  };

  const addStage = () => {
    setPipelineStages([...pipelineStages, "Nueva Etapa"]);
  };

  const removeStage = (index: number) => {
    setPipelineStages(
      pipelineStages.filter((_: any, i: number) => i !== index),
    );
  };

  const updateStage = (index: number, val: string) => {
    const next = [...pipelineStages];
    next[index] = val;
    setPipelineStages(next);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">
            Configuración del Workspace
          </h1>
          <p className="text-neutral-400 text-sm font-mono mt-1 uppercase tracking-widest">
            Gestiona la identidad y flujo de trabajo de {workspace.name}
          </p>
        </div>
        <div className="flex bg-[#0a0a0a] border border-[#1f1f1f] p-1 rounded-sm shadow-2xl">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "general" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}>
            <Settings className="w-3 h-3" /> General
          </button>
          <button
            onClick={() => setActiveTab("work")}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "work" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}>
            <Briefcase className="w-3 h-3" /> Negocio
          </button>
          <button
            onClick={() => setActiveTab("branding")}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "branding" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}>
            <Globe className="w-3 h-3" /> Marca & PDF
          </button>
        </div>
      </div>

      <main className="bg-[#0a0a0a] border border-[#1f1f1f] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {activeTab === "general" && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    Nombre de la Organización
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-[#1f1f1f] p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    Email de Contacto
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-[#1f1f1f] p-4 text-sm focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    Sitio Web
                  </label>
                  <div className="flex">
                    <span className="bg-[#1a1a1a] border border-[#1f1f1f] border-r-0 px-4 flex items-center text-xs text-neutral-500">
                      https://
                    </span>
                    <input
                      value={websiteUrl.replace("https://", "")}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full bg-black border border-[#1f1f1f] p-4 text-sm focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                    Logo URL
                  </label>
                  <div className="flex gap-4">
                    <input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full bg-black border border-[#1f1f1f] p-4 text-sm focus:outline-none focus:border-white transition-colors"
                    />
                    <div className="w-14 h-14 bg-black border border-[#1f1f1f] flex items-center justify-center shrink-0">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          className="max-w-[70%] max-h-[70%] object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-neutral-700" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                    Color Primario
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-14 h-14 bg-transparent border-none p-0 cursor-pointer"
                    />
                    <input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full bg-black border border-[#1f1f1f] p-4 text-sm font-mono focus:outline-none focus:border-white transition-colors uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#1f1f1f] flex justify-end">
              <button
                onClick={handleSaveGeneral}
                disabled={isSaving}
                className="bg-white text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-3 disabled:opacity-50">
                {isSaving ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                    <Globe className="w-5 h-5" /> Dominio Personalizado
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Configura un subdominio o tu propio dominio para el portal
                    de clientes.
                  </p>
                </div>

                <div className="space-y-6 relative">
                  {isFree && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center border border-emerald-500/20 rounded-lg">
                      <Lock className="w-8 h-8 text-emerald-500 mb-3" />
                      <p className="text-sm font-bold text-white mb-2">
                        Función Premium
                      </p>
                      <p className="text-[10px] text-neutral-400 max-w-[200px] leading-relaxed mb-4">
                        Personaliza tu portal con tu propio dominio y elimina el
                        sello de Noctra.
                      </p>
                      <button
                        onClick={() =>
                          (window.location.href = "/settings/billing")
                        }
                        className="bg-emerald-500 text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">
                        Upgrade a Pro
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                      Subdominio Noctra
                    </label>
                    <div className="flex">
                      <input
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value)}
                        disabled={isFree}
                        className="w-full bg-black border border-[#1f1f1f] p-4 text-sm focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                        placeholder="tu-marca"
                      />
                      <span className="bg-[#1a1a1a] border border-[#1f1f1f] border-l-0 px-4 flex items-center text-xs text-neutral-500">
                        .noctra.studio
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                      Dominio Propio (CNAME)
                    </label>
                    <input
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      disabled={isFree}
                      className="w-full bg-black border border-[#1f1f1f] p-4 text-sm focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                      placeholder="propuestas.tuempresa.com"
                    />
                    <p className="text-[9px] text-neutral-600 font-mono">
                      Apunta tu CNAME a custom.noctra.studio
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Marca en PDF
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Controla la visibilidad de la marca de Noctra en tus
                    documentos.
                  </p>
                </div>

                <div className="bg-[#white]/[0.02] border border-[#1f1f1f] p-6 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">
                        Sello de Noctra
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        "Generado por Noctra CRM" en el pie de página.
                      </p>
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        isFree
                          ? "bg-red-500/10 border-red-500/20 text-red-500"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                      )}>
                      {isFree ? "Activo (Trial)" : "Eliminado (Pro)"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#1f1f1f] flex justify-end">
              <button
                onClick={handleSaveGeneral}
                disabled={isSaving || isFree}
                className="bg-white text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-3 disabled:opacity-50">
                {isSaving ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Guardar Marca
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "work" && (
          <div className="space-y-16">
            {/* Service Types */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                  <Briefcase className="w-5 h-5" /> Tipos de Servicio
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Define los servicios que tu agencia ofrece para filtrar leads
                  y proyectos.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceTypes.map((service: string, idx: number) => (
                  <div key={idx} className="group relative">
                    <input
                      value={service}
                      onChange={(e) => updateServiceType(idx, e.target.value)}
                      className="w-full bg-black border border-[#1f1f1f] p-4 pr-12 text-sm focus:outline-none focus:border-white transition-colors pr-10"
                    />
                    <button
                      onClick={() => removeServiceType(idx)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addServiceType}
                  className="border border-[#1f1f1f] border-dashed p-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white hover:border-white transition-all">
                  <Plus className="w-4 h-4" /> Agregar Servicio
                </button>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5" /> Etapas del Pipeline
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Configura las columnas de tu tablero Kanban de prospección.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pipelineStages.map((stage: string, idx: number) => (
                  <div key={idx} className="group relative">
                    <input
                      value={stage}
                      onChange={(e) => updateStage(idx, e.target.value)}
                      className="w-full bg-black border border-[#1f1f1f] p-4 text-sm focus:outline-none focus:border-white transition-colors pr-10"
                    />
                    <button
                      onClick={() => removeStage(idx)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addStage}
                  className="border border-[#1f1f1f] border-dashed p-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white hover:border-white transition-all">
                  <Plus className="w-4 h-4" /> Agregar Etapa
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-[#1f1f1f] flex justify-end">
              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="bg-white text-black px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-3 disabled:opacity-50">
                {isSaving ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Guardar Negocio
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
