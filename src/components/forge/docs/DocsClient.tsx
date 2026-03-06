"use client";

import { useState } from "react";
import { DocsSidebar } from "./DocsSidebar";
import { DocsToc } from "./DocsToc";

// Content Components Loader
import GettingStartedDoc from "./content/GettingStarted";
import {
  DashboardDoc,
  LeadsDoc,
  ClientesDoc,
  PipelineDoc,
  PropuestasDoc,
  ContratosDoc,
  ProyectosDoc,
  MetricsDoc,
} from "./content/ModulesDocs";
import NoctraAiDoc from "./content/NoctraAiDoc";
import ConfigurationDoc from "./content/ConfigurationDoc";
import DeveloperDoc from "./content/DeveloperDoc";
import ReferenceDoc from "./content/ReferenceDoc";

// Fallback registry matching IDs from DocsSidebar
const contentRegistry: Record<string, React.FC> = {
  "getting-started": GettingStartedDoc,
  dashboard: DashboardDoc,
  leads: LeadsDoc,
  clients: ClientesDoc,
  pipeline: PipelineDoc,
  proposals: PropuestasDoc,
  contracts: ContratosDoc,
  projects: ProyectosDoc,
  metrics: MetricsDoc,
  "noctra-ai": NoctraAiDoc,
  security: ConfigurationDoc,
  architecture: DeveloperDoc,
  shortcuts: ReferenceDoc,
};

export default function DocsClient() {
  const [activeDocId, setActiveDocId] = useState("getting-started");

  const ActiveComponent = contentRegistry[activeDocId] || GettingStartedDoc;

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] w-full">
      {/* 1. Sidebar Navigation */}
      <DocsSidebar
        activeDocId={activeDocId}
        onSelect={(id) => {
          setActiveDocId(id);
          // Auto scroll to top on mobile or container
          document
            .getElementById("docs-main-scroll")
            ?.scrollTo({ top: 0, behavior: "instant" });
        }}
      />

      {/* 2. Main Content */}
      <main
        id="docs-main-scroll"
        className="flex-1 overflow-y-auto px-6 py-10 md:px-12 lg:px-20 forge-scroll scroll-smooth w-full lg:max-w-3xl xl:max-w-4xl max-w-full">
        <div className="pb-32 w-full max-w-full lg:mx-auto">
          {/* Desktop only breadcrumb placeholder as decorative */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest mb-12">
            <span>Noctra Docs</span>
            <span>/</span>
            <span className="text-emerald-500/50">
              {activeDocId.replace("-", " ")}
            </span>
          </div>

          <ActiveComponent />

          {/* Pagination Placeholder (Design flourish) */}
          <div className="mt-24 pt-8 border-t border-white/5 flex justify-between items-center text-xs">
            <span className="text-white/30 italic">
              Documentación Oficial de Noctra Forge
            </span>
          </div>
        </div>
      </main>

      {/* 3. Right Table of Contents */}
      <DocsToc key={activeDocId} />
    </div>
  );
}
