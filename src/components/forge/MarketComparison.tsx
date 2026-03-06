"use client";

import React from "react";
import { m } from "framer-motion";
import { Check, TrendingUp, Globe, Brain, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const MarketComparison = () => {
  const competitors = [
    {
      feature: "Precio Base",
      noctra: "$9 / usuario",
      hubspot: "$15 - $90",
      salesforce: "$25 - $165",
      zoho: "$14 - $52",
      pipedrive: "$14 - $99",
    },
    {
      feature: "Modelo AI",
      noctra: "Nativa (Incluida)",
      hubspot: "Créditos ($1/chat)",
      salesforce: "Add-on ($50/mes)",
      zoho: "Zia (Tier Alto)",
      pipedrive: "Asistente Básico",
    },
    {
      feature: "Enfoque",
      noctra: "Servicios (PSOs)",
      hubspot: "Inbound Marketing",
      salesforce: "Enterprise Corp",
      zoho: "Generalista",
      pipedrive: "Ventas Puras",
    },
    {
      feature: "LATAM Ready",
      noctra: "WhatsApp + Pagos",
      hubspot: "Integración Ext.",
      salesforce: "Complejo",
      zoho: "Sí",
      pipedrive: "No Nativo",
    },
    {
      feature: "TCO (Año 1)",
      noctra: "~$2,500 (Bajo)",
      hubspot: "~$12,000 (Alto)",
      salesforce: "~$18,000 (V. Alto)",
      zoho: "~$4,500",
      pipedrive: "~$3,500",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-black relative border-t border-white/5 overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <m.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-500 mb-6 block">
            Market Intelligence 2026
          </m.span>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
            Deja de pagar "Impuestos por Crecimiento".{" "}
            <br className="hidden md:block" />
            <span className="text-white/40">
              Pásate a la Rentabilidad Real.
            </span>
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Mientras los gigantes te cobran por cada mensaje de IA y cada
            integración, Noctra CRM unifica tu pipeline, tus proyectos y tu
            facturación en un solo cerebro operativo por{" "}
            <span className="text-white font-bold">$9 USD</span>.
          </m.p>
        </div>

        {/* Comparison Table */}
        <div className="relative group mb-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-white/5 to-transparent rounded-3xl blur opacity-50 pointer-events-none" />
          <div className="relative bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-8 text-xs font-black uppercase tracking-widest text-neutral-500">
                      Feature
                    </th>
                    <th className="px-6 py-8 text-xs font-black uppercase tracking-widest text-white relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                      Noctra CRM
                    </th>
                    <th className="px-6 py-8 text-xs font-bold uppercase tracking-widest text-neutral-500">
                      HubSpot
                    </th>
                    <th className="px-6 py-8 text-xs font-bold uppercase tracking-widest text-neutral-500">
                      Salesforce
                    </th>
                    <th className="px-6 py-8 text-xs font-bold uppercase tracking-widest text-neutral-500">
                      Zoho CRM
                    </th>
                    <th className="px-6 py-8 text-xs font-bold uppercase tracking-widest text-neutral-500">
                      Pipedrive
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {competitors.map((row, idx) => (
                    <tr
                      key={idx}
                      className="group/row hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-6 text-sm font-bold text-neutral-300">
                        {row.feature}
                      </td>
                      <td className="px-6 py-6 text-sm font-black text-white bg-white/5 border-x border-white/5">
                        <div className="flex items-center gap-2">
                          <Check
                            size={14}
                            className="text-emerald-500"
                            strokeWidth={3}
                          />
                          {row.noctra}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm text-neutral-500">
                        {row.hubspot}
                      </td>
                      <td className="px-6 py-6 text-sm text-neutral-500">
                        {row.salesforce}
                      </td>
                      <td className="px-6 py-6 text-sm text-neutral-500">
                        {row.zoho}
                      </td>
                      <td className="px-6 py-6 text-sm text-neutral-500">
                        {row.pipedrive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <Brain size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              Agentic AI sin sorpresas
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Matching de recursos y revenue forecasting incluidos en tu plan
              base. Sin créditos oscuros ni cobros extra por cada chat.
            </p>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <Globe size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              Diseñado para LATAM
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Integración nativa con WhatsApp Business API, cobros en moneda
              local vía OXXO y PSE. Sin necesidad de middlewares costosos.
            </p>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              ROI de $8.71 por dólar
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Reduce tu Costo Total de Propiedad (TCO) hasta un 75% vs CRMs
              legados. Más margen para reinvertir en tu equipo creativo.
            </p>
          </m.div>
        </div>
      </div>
    </section>
  );
};
