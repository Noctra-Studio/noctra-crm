"use client";

import React from "react";
import { m } from "framer-motion";
import { Check, TrendingUp, Globe, Brain } from "lucide-react";
import { useLocale } from "next-intl";

const MARKET_COPY = {
  es: {
    rows: [
      ["Precio Base", "$9 / usuario", "$15 - $90", "$25 - $165", "$14 - $52", "$14 - $99"],
      ["Modelo AI", "Nativa (Incluida)", "Créditos ($1/chat)", "Add-on ($50/mes)", "Zia (Tier Alto)", "Asistente Básico"],
      ["Enfoque", "Servicios (PSOs)", "Inbound Marketing", "Enterprise Corp", "Generalista", "Ventas Puras"],
      ["LATAM Ready", "WhatsApp + Pagos", "Integración Ext.", "Complejo", "Sí", "No Nativo"],
      ["TCO (Año 1)", "~$2,500 (Bajo)", "~$12,000 (Alto)", "~$18,000 (V. Alto)", "~$4,500", "~$3,500"],
    ],
    eyebrow: "Market Intelligence 2026",
    title: 'Deja de pagar "Impuestos por Crecimiento".',
    accent: "Pásate a la Rentabilidad Real.",
    description:
      "Mientras los gigantes te cobran por cada mensaje de IA y cada integración, Noctra CRM unifica tu pipeline, tus proyectos y tu facturación en un solo cerebro operativo por ",
    featureHeader: "Feature",
    aiTitle: "Agentic AI sin sorpresas",
    aiDescription:
      "Matching de recursos y revenue forecasting incluidos en tu plan base. Sin créditos oscuros ni cobros extra por cada chat.",
    latamTitle: "Diseñado para LATAM",
    latamDescription:
      "Integración nativa con WhatsApp Business API, cobros en moneda local vía OXXO y PSE. Sin necesidad de middlewares costosos.",
    roiTitle: "ROI de $8.71 por dólar",
    roiDescription:
      "Reduce tu Costo Total de Propiedad (TCO) hasta un 75% vs CRMs legados. Más margen para reinvertir en tu equipo creativo.",
  },
  en: {
    rows: [
      ["Base Price", "$9 / user", "$15 - $90", "$25 - $165", "$14 - $52", "$14 - $99"],
      ["AI Model", "Native (Included)", "Credits ($1/chat)", "Add-on ($50/mo)", "Zia (Upper Tier)", "Basic assistant"],
      ["Focus", "Services (PSOs)", "Inbound marketing", "Enterprise corp", "Generalist", "Pure sales"],
      ["LATAM Ready", "WhatsApp + Payments", "External integration", "Complex", "Yes", "Not native"],
      ["TCO (Year 1)", "~$2,500 (Low)", "~$12,000 (High)", "~$18,000 (Very High)", "~$4,500", "~$3,500"],
    ],
    eyebrow: "Market Intelligence 2026",
    title: 'Stop paying "growth tax".',
    accent: "Move to real profitability.",
    description:
      "While legacy platforms charge for every AI interaction and every integration, Noctra CRM unifies pipeline, projects, and billing into a single operating brain for ",
    featureHeader: "Feature",
    aiTitle: "Agentic AI without surprise fees",
    aiDescription:
      "Resource matching and revenue forecasting are included in your base plan. No hidden credits and no extra charge per chat.",
    latamTitle: "Built for LATAM",
    latamDescription:
      "Native WhatsApp Business API support plus local-currency payments through OXXO and PSE. No costly middleware stack required.",
    roiTitle: "$8.71 ROI per dollar",
    roiDescription:
      "Reduce total cost of ownership by up to 75% versus legacy CRMs and reinvest margin back into your creative team.",
  },
} as const;

export const MarketComparison = () => {
  const locale = useLocale();
  const copy = MARKET_COPY[locale as "es" | "en"] ?? MARKET_COPY.es;
  const competitors = [
    {
      feature: copy.rows[0][0],
      noctra: copy.rows[0][1],
      hubspot: copy.rows[0][2],
      salesforce: copy.rows[0][3],
      zoho: copy.rows[0][4],
      pipedrive: copy.rows[0][5],
    },
    {
      feature: copy.rows[1][0],
      noctra: copy.rows[1][1],
      hubspot: copy.rows[1][2],
      salesforce: copy.rows[1][3],
      zoho: copy.rows[1][4],
      pipedrive: copy.rows[1][5],
    },
    {
      feature: copy.rows[2][0],
      noctra: copy.rows[2][1],
      hubspot: copy.rows[2][2],
      salesforce: copy.rows[2][3],
      zoho: copy.rows[2][4],
      pipedrive: copy.rows[2][5],
    },
    {
      feature: copy.rows[3][0],
      noctra: copy.rows[3][1],
      hubspot: copy.rows[3][2],
      salesforce: copy.rows[3][3],
      zoho: copy.rows[3][4],
      pipedrive: copy.rows[3][5],
    },
    {
      feature: copy.rows[4][0],
      noctra: copy.rows[4][1],
      hubspot: copy.rows[4][2],
      salesforce: copy.rows[4][3],
      zoho: copy.rows[4][4],
      pipedrive: copy.rows[4][5],
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
            {copy.eyebrow}
          </m.span>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
            {copy.title} <br className="hidden md:block" />
            <span className="text-white/40">{copy.accent}</span>
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {copy.description}
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
                      {copy.featureHeader}
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
              {copy.aiTitle}
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {copy.aiDescription}
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
              {copy.latamTitle}
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {copy.latamDescription}
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
              {copy.roiTitle}
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {copy.roiDescription}
            </p>
          </m.div>
        </div>
      </div>
    </section>
  );
};
