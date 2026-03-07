"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronDown,
  Check,
  Sparkles,
  FileText,
  BarChart2,
  FolderOpen,
  Users,
  Search,
  Globe,
  Shield,
  Smartphone,
  Plus,
  Minus,
  UserPlus,
  Menu,
  X,
  Clock,
  Brain,
  Layers,
  SearchCode,
} from "lucide-react";
import NextImage from "next/image";
import { PricingWithROI } from "./PricingWithROI";
import { PricingComparison } from "./PricingComparison";
import { MarketComparison } from "./MarketComparison";
import { UnifiedStack } from "./UnifiedStack";
import { ConnectivitySection } from "./ConnectivitySection";
import { ForgeNavbar } from "./ForgeNavbar";
import { ForgeFooter } from "./ForgeFooter";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";

const LANDING_COPY = {
  es: {
    badge: "14 días gratis · Sin tarjeta de crédito",
    heroTitle: "El Sistema Operativo para Negocios Creativos.",
    personaFreelancer: "Soy Freelancer",
    personaAgency: "Soy Agencia",
    proDescription:
      "Deja de perder tiempo en admin. Gestiona clientes, propuestas y cobros en un solo lugar.",
    agencyDescription:
      "Escala tus operaciones. Unifica tu equipo, proyectos y finanzas en una sola verdad.",
    startFree: "Empezar Gratis",
    watchDemo: "Ver demo",
    trustIndicators: ["Sin tarjeta de crédito", "Cancela cuando quieras", "Soporte incluido"],
    builtBy: "Construido por diseñadores, para creativos",
    internalSystem:
      "El sistema interno que usamos en Noctra Studio, ahora disponible para la comunidad.",
    painEyebrow: "¿Te suena familiar?",
    painTitle: "Las agencias pierden miles de dólares por mala organización.",
    productEyebrow: "El producto",
    productTitle: "Todo fluye mejor aquí adentro.",
    productDescription:
      "Una interfaz minimalista que te da toda la información que necesitas, sin el ruido que no necesitas.",
    workflowEyebrow: "Flujo de trabajo",
    workflowTitle: "De lead a proyecto entregado en 4 pasos.",
    featuresEyebrow: "Todo incluido",
    featuresTitle: "Todas las herramientas que necesitas. Ninguna que no.",
    stackTitle: "Deja de pagar por 5 herramientas.",
    stackDescription:
      "Todo tu sistema operativo por el precio de una sola de tus apps actuales. No más saltar entre pestañas.",
    chaos: "El Caos Actual",
    total: "Total aproximado",
    efficiency: "Eficiencia Radical",
    pricingStarterNote: "o comienza con el plan Starter por $9/mes",
    faqEyebrow: "Dudas comunes",
    faqTitle: "Preguntas frecuentes.",
    finalTitle: "El sistema operativo para tu negocio.",
    finalDescription: "Organiza tu pipeline. Entrega proyectos a tiempo. Escala tu operación hoy.",
    finalFootnote: "14 días gratis. Sin tarjeta. Cancela cuando quieras.",
    painPoints: [
      ["Propuestas en Word que se pierden en el email", "Crea y envía propuestas profesionales en minutos"],
      ["No sabes en qué etapa está cada cliente", "Pipeline visual con el estado de cada oportunidad"],
      ["Horas perdidas actualizando clientes manualmente", "Portal del cliente con actualizaciones en tiempo real"],
      ["4 herramientas distintas para lo que debería ser 1", "Todo en un solo lugar — desde el lead hasta el cierre"],
      ["Se te olvidan los follow-ups y pierdes oportunidades", "Noctra AI te recuerda cuándo actuar y qué hacer"],
      ["No tienes visibilidad real de tus ingresos futuros", "Forecast de ingresos calculado automáticamente"],
    ],
    steps: [
      ["01", "Nunca vuelvas a perder un lead ante el caos", "Captura automáticamente cada contacto. Noctra AI te alerta al instante para que ninguna oportunidad se enfríe.", "UserPlus"],
      ["02", "Envía propuestas en 3 clics, no en 3 horas", "Cierra tratos a la velocidad del pensamiento. Propuestas visuales de alto impacto que tus clientes pueden aprobar desde su móvil.", "FileText"],
      ["03", "Claridad total en cada proyecto", "La respuesta a '¿en qué vamos con esto?' siempre está aquí. Tu equipo sincronizado y tus clientes informados sin enviar un solo email.", "FolderOpen"],
      ["04", "Deja de adivinar tus márgenes", "Ve exactamente cuánto estás ganando en tiempo real. Análisis profundo de rentabilidad para que escales con datos, no con suposiciones.", "BarChart2"],
    ],
    features: [
      ["Sparkles", "Cerebro Central AI", "Orquestación inteligente de modelos. Noctra selecciona automáticamente el procesador más eficiente según la complejidad de tu tarea para maximizar tu ROI."],
      ["FileText", "Proposal Builder", "Crea propuestas con tu branding en minutos. El cliente las aprueba en línea con un solo click."],
      ["BarChart2", "Pipeline Visual", "Visualiza cada oportunidad por etapa. Forecast de ingresos calculado automáticamente."],
      ["FolderOpen", "Gestión de Proyectos", "Cada proyecto vinculado a su cliente, propuesta y entregables. Sin nada perdido."],
      ["Users", "CRM de Clientes", "Historial completo de cada cliente — comunicaciones, proyectos, propuestas y pagos."],
      ["Search", "Búsqueda Global", "Encuentra cualquier cliente, propuesta o proyecto en segundos con ⌘K."],
      ["Globe", "Bilingüe ES/EN", "Interfaz completa en español e inglés. Cambia de idioma instantáneamente."],
      ["Shield", "Seguridad 2FA", "Autenticación de dos factores para proteger la información de tus clientes."],
      ["Smartphone", "Mobile Nativo", "Experiencia de app nativa en mobile con navegación bottom tab y gestos."],
    ],
    faqs: [
      ["¿Necesito tarjeta de crédito para el trial?", "No. El trial de 14 días es completamente gratis y no requiere datos de pago. Solo necesitas un email."],
      ["¿Qué pasa cuando termina el trial?", "Te mostramos las opciones de plan. Todo tu contenido se mantiene intacto — clientes, propuestas y proyectos siguen disponibles al suscribirte."],
      ["¿Puedo cancelar en cualquier momento?", "Sí. En el plan mensual puedes cancelar cuando quieras. En el plan anual, el acceso se mantiene hasta el final del período pagado."],
      ["¿Es solo para agencias de diseño y desarrollo?", "Noctra Forge está optimizado para agencias creativas y digitales, pero cualquier negocio que gestione proyectos y clientes puede usarlo."],
      ["¿Cómo se consumen los tokens y qué modelo usa Noctra?", "El 'Cerebro Central' de Noctra analiza cada petición. Para tareas simples usa modelos ultra-rápidos, mientras que para análisis complejos rutea la tarea a modelos de alta potencia."],
      ["¿Mis datos están seguros?", "Sí. Todos los datos se almacenan en Supabase con Row Level Security — solo tú tienes acceso a tu información."],
      ["¿Tiene app móvil?", "Noctra Forge es una Progressive Web App con experiencia nativa en mobile. Puedes agregarla a tu pantalla de inicio desde el navegador."],
    ],
    tools: [
      ["Asana/ClickUp", "Proyectos", "$13"],
      ["DocuSign/PandaDoc", "Firmas", "$20"],
      ["Harvest/Toggl", "Tiempo y Cobros", "$12"],
      ["Pipedrive/Hubspot", "CRM/Leads", "$15"],
    ],
    solutionTitle: "Noctra Forge",
    solutionDescription: "Centraliza tu operación. Recupera tu enfoque. Quédate con el margen.",
  },
  en: {
    badge: "14 days free · No credit card required",
    heroTitle: "The Operating System for Creative Businesses.",
    personaFreelancer: "I'm a Freelancer",
    personaAgency: "I'm an Agency",
    proDescription:
      "Stop wasting hours on admin. Manage clients, proposals, and payments in one place.",
    agencyDescription:
      "Scale operations with clarity. Unify your team, projects, and finances in a single source of truth.",
    startFree: "Start Free",
    watchDemo: "Watch demo",
    trustIndicators: ["No credit card", "Cancel anytime", "Support included"],
    builtBy: "Built by designers, for creative operators",
    internalSystem:
      "The internal system we use at Noctra Studio, now available to the community.",
    painEyebrow: "Sound familiar?",
    painTitle: "Agencies lose thousands because operations stay fragmented.",
    productEyebrow: "The product",
    productTitle: "Everything flows better in here.",
    productDescription:
      "A minimal interface that gives you the information you need without the noise you do not.",
    workflowEyebrow: "Workflow",
    workflowTitle: "From lead to delivered project in 4 steps.",
    featuresEyebrow: "Everything included",
    featuresTitle: "Every tool you need. None that you do not.",
    stackTitle: "Stop paying for 5 different tools.",
    stackDescription:
      "Get your operating system for the cost of a single app in your current stack. No more context switching.",
    chaos: "Today's mess",
    total: "Estimated total",
    efficiency: "Radical Efficiency",
    pricingStarterNote: "or start with Starter at $9/mo",
    faqEyebrow: "Common questions",
    faqTitle: "Frequently asked questions.",
    finalTitle: "The operating system for your business.",
    finalDescription: "Organize pipeline. Deliver on time. Scale operations today.",
    finalFootnote: "14 days free. No card. Cancel anytime.",
    painPoints: [
      ["Word proposals lost in email threads", "Create and send polished proposals in minutes"],
      ["You do not know which stage each client is in", "A visual pipeline that shows every opportunity"],
      ["Hours lost updating clients manually", "Client portal with real-time updates"],
      ["4 tools for what should really be 1", "Everything in one place, from lead to close"],
      ["Follow-ups slip and opportunities disappear", "Noctra AI reminds you when to act and what to do"],
      ["You have no real view of future revenue", "Revenue forecasting calculated automatically"],
    ],
    steps: [
      ["01", "Never lose a lead to operational chaos again", "Capture every contact automatically. Noctra AI alerts you instantly so opportunities never go cold.", "UserPlus"],
      ["02", "Send proposals in 3 clicks, not 3 hours", "Close deals at the speed of thought. High-impact visual proposals that clients can approve from their phone.", "FileText"],
      ["03", "Total clarity in every project", "The answer to 'where are we on this?' is always here. Your team stays aligned and clients stay informed without extra email.", "FolderOpen"],
      ["04", "Stop guessing your margins", "See exactly what you are earning in real time. Deep profitability analysis so you scale with data, not assumptions.", "BarChart2"],
    ],
    features: [
      ["Sparkles", "Central AI Brain", "Intelligent model orchestration. Noctra automatically routes each task to the most efficient processor to maximize ROI."],
      ["FileText", "Proposal Builder", "Create branded proposals in minutes. Clients approve them online with a single click."],
      ["BarChart2", "Visual Pipeline", "See every opportunity by stage with automatically calculated revenue forecasting."],
      ["FolderOpen", "Project Management", "Every project tied to its client, proposal, and deliverables. Nothing gets lost."],
      ["Users", "Client CRM", "Full history for every client: communication, projects, proposals, and payments."],
      ["Search", "Global Search", "Find any client, proposal, or project in seconds with ⌘K."],
      ["Globe", "Bilingual ES/EN", "Full interface in Spanish and English. Switch language instantly."],
      ["Shield", "2FA Security", "Two-factor authentication to protect your client information."],
      ["Smartphone", "Native Mobile", "Native-feeling mobile experience with bottom tabs and gestures."],
    ],
    faqs: [
      ["Do I need a credit card for the trial?", "No. The 14-day trial is completely free and does not require payment details. You only need an email."],
      ["What happens when the trial ends?", "We show you the available plans. Your content stays intact, and clients, proposals, and projects remain available once you subscribe."],
      ["Can I cancel anytime?", "Yes. On the monthly plan you can cancel whenever you want. On annual billing, access remains active until the end of the paid period."],
      ["Is it only for design and development agencies?", "Noctra Forge is optimized for creative and digital agencies, but any business managing clients and projects can use it."],
      ["How are tokens used and what model does Noctra run?", "Noctra's central brain analyzes each request. Simple tasks use ultra-fast models, while more complex analysis is routed to higher-capability models."],
      ["Is my data secure?", "Yes. All data is stored in Supabase with Row Level Security, so only you can access your information."],
      ["Is there a mobile app?", "Noctra Forge is a progressive web app with a native-feeling mobile experience. You can add it to your home screen from the browser."],
    ],
    tools: [
      ["Asana/ClickUp", "Projects", "$13"],
      ["DocuSign/PandaDoc", "Signatures", "$20"],
      ["Harvest/Toggl", "Time & Billing", "$12"],
      ["Pipedrive/Hubspot", "CRM/Leads", "$15"],
    ],
    solutionTitle: "Noctra Forge",
    solutionDescription: "Centralize operations. Recover focus. Keep the margin.",
  },
} as const;

// --- DYNAMIC ICON HELPER ---
const DynamicIcon = ({
  name,
  size = 18,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) => {
  const icons: Record<string, any> = {
    Sparkles,
    FileText,
    BarChart2,
    FolderOpen,
    Users,
    Search,
    Globe,
    Shield,
    Smartphone,
    UserPlus,
    Clock,
    Brain,
    Layers,
    SearchCode,
  };
  const Icon = icons[name] || Sparkles;
  return <Icon size={size} className={className} strokeWidth={1.5} />;
};

// --- FAQ COMPONENT ---
const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left group">
        <span className="text-lg font-medium text-white group-hover:text-white/80 transition-colors">
          {question}
        </span>
        {isOpen ? (
          <Minus size={18} className="text-white/40" strokeWidth={1.5} />
        ) : (
          <Plus size={18} className="text-white/40" strokeWidth={1.5} />
        )}
      </button>
      {isOpen && (
        <p className="mt-4 text-neutral-400 text-sm leading-relaxed max-w-2xl">
          {answer}
        </p>
      )}
    </div>
  );
};

export default function ForgeLanding() {
  const locale = useLocale();
  const copy = LANDING_COPY[locale as "es" | "en"] ?? LANDING_COPY.es;
  const [userType, setUserType] = useState<"pro" | "agency">("pro");

  const painIcons = ["FileText", "SearchCode", "Clock", "Layers", "Brain", "BarChart2"] as const;
  const painPoints = copy.painPoints.map(([pain, fix], index) => ({
    icon: painIcons[index],
    pain,
    fix,
  }));

  const steps = copy.steps.map(([step, title, desc, icon]) => ({
    step,
    title,
    desc,
    icon,
  }));

  const features = copy.features.map(([icon, title, desc]) => ({
    icon,
    title,
    desc,
  }));

  const faqs = copy.faqs.map(([q, a]) => ({ q, a }));

  return (
    <div className="bg-black min-h-screen font-sans selection:bg-[var-verde] selection:text-black">
      {/* --- NAVBAR --- */}
      <ForgeNavbar />

      {/* --- SECTION 1: HERO --- */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden pt-36 md:pt-32">
        {/* Subtle radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_60%)] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="flex items-center gap-2 border border-[#10b981]/30 bg-[#10b981]/5 rounded-full px-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse" />
          <span className="text-[#10b981] text-xs uppercase tracking-widest font-medium">
            {copy.badge}
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter max-w-5xl mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          {copy.heroTitle}
        </h1>

        {/* --- PERSONA TOGGLE --- */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-full mb-10 relative z-10 animate-in fade-in duration-1000 delay-200">
          <button
            onClick={() => setUserType("pro")}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 min-h-[44px]",
              userType === "pro"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60",
            )}>
            {copy.personaFreelancer}
          </button>
          <button
            onClick={() => setUserType("agency")}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 min-h-[44px]",
              userType === "agency"
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60",
            )}>
            {copy.personaAgency}
          </button>
        </div>

        <div className="min-h-[80px] mb-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <m.p
              key={userType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed text-balance">
              {userType === "pro"
                ? copy.proDescription
                : copy.agencyDescription}
            </m.p>
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center w-full">
            <Link
              href={{
                pathname: "/login",
                query: { mode: "signup", plan: "starter" },
              }}
              className="flex items-center justify-center gap-2 bg-white text-black font-bold rounded-full h-12 px-8 text-base hover:bg-gray-200 transition-all duration-300 w-full sm:w-auto">
              {copy.startFree} <ArrowRight size={18} />
            </Link>
            <a
              href="#demo"
              className="flex items-center justify-center gap-2 rounded-full h-12 px-8 text-base border border-white/10 text-neutral-400 hover:text-white hover:border-white hover:bg-transparent transition-all duration-300 font-bold w-full sm:w-auto">
              {copy.watchDemo} <ChevronDown size={16} />
            </a>
          </div>

          {/* Trust Indicators Inline */}
          <div className="flex items-center flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-neutral-400 font-medium pt-2">
            {copy.trustIndicators.map((item, index) => (
              <React.Fragment key={item}>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#10b981]" /> {item}
                </span>
                {index < copy.trustIndicators.length - 1 && (
                  <span className="hidden sm:inline text-neutral-600">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center animate-in fade-in duration-1000 delay-700">
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
            ✨ {copy.builtBy}
          </p>
          <p className="text-[10px] text-neutral-500 mt-2 max-w-sm mx-auto">
            {copy.internalSystem}
          </p>
        </div>
      </section>

      {/* --- SECTION 2: PAIN POINTS --- */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#10b981] text-center mb-4 font-bold">
            {copy.painEyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center mb-16">
            {copy.painTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {painPoints.map((item) => (
              <div
                key={item.pain}
                className="border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group bg-white/[0.01]">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 transition-colors">
                  <DynamicIcon
                    name={item.icon}
                    size={20}
                    className="text-neutral-500 group-hover:text-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-sm text-neutral-400 line-through mb-1 group-hover:text-neutral-500 transition-colors">
                  {item.pain}
                </p>
                <p className="text-sm text-neutral-300 font-medium">
                  ✓ {item.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: DEMO VISUAL --- */}
      <section
        id="demo"
        className="py-20 md:py-28 px-6 border-t border-white/5 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#10b981] font-bold text-center mb-4">
            {copy.productEyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center mb-16">
            {copy.productTitle}
          </h2>
          <p className="text-neutral-400 text-center text-sm mb-12 max-w-lg mx-auto">
            {copy.productDescription}
          </p>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-[#0a0a0a]">
            {/* Fake Browser Bar */}
            <div className="bg-[#0a0a0a] border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 bg-white/5 rounded px-3 py-1 text-[10px] text-white/20 text-center mx-8 font-mono">
                noctra.studio/forge
              </div>
            </div>
            {/* Animated Screenshot (GIF behavior) */}
            <Image
              src="/images/forge-dashboard-animated.webp"
              alt="Noctra Forge Dashboard"
              width={1200}
              height={800}
              unoptimized
              className="w-full object-cover aspect-video"
            />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
          </div>
        </div>
      </section>

      {/* --- SECTION 4: HOW IT WORKS --- */}
      <section
        id="features"
        className="py-20 md:py-28 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#10b981] font-bold text-center mb-4">
            {copy.workflowEyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center mb-16 text-balance">
            {copy.workflowTitle}
          </h2>
          <div className="relative space-y-0 before:absolute before:inset-0 before:ml-[31px] md:before:ml-[39px] before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#10b981]/50 before:via-white/10 before:to-transparent">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="relative flex gap-8 md:gap-12 items-start py-10 group">
                {/* Visual Step Marker */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-1.5 group-hover:border-[#10b981]/50 group-hover:bg-[#10b981]/5 transition-colors">
                    <span className="text-[10px] font-bold bg-[#10b981] text-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {item.step}
                    </span>
                    <DynamicIcon
                      name={item.icon}
                      size={20}
                      className="text-neutral-400 group-hover:text-neutral-300 transition-colors leading-relaxed mt-1 text-sm md:text-base"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg text-neutral-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 5: FEATURES --- */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#10b981] font-bold text-center mb-4">
            {copy.featuresEyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center mb-16">
            {copy.featuresTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* COLUMN 1: AI (Hero Height) + 2 Standard */}
            <div className="flex flex-col gap-6">
              {[features[0], features[4], features[7]].map((feature, idx) => {
                const isHeroFeature = idx === 0;

                return (
                  <div
                    key={feature.title}
                    className={cn(
                      "border border-white/5 rounded-3xl p-8 transition-all cursor-default group hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(16,185,129,0.05)] relative overflow-hidden flex flex-col items-start justify-center text-left",
                      isHeroFeature
                        ? "bg-gradient-to-br from-[#10b981]/10 via-[#10b981]/[0.02] to-transparent hover:border-[#10b981]/30 md:min-h-[420px]"
                        : "bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#10b981]/20 md:min-h-[220px]",
                    )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors relative z-10",
                        isHeroFeature
                          ? "bg-[#10b981]/20 text-[#10b981]"
                          : "bg-white/5 group-hover:bg-[#10b981]/10",
                      )}>
                      <DynamicIcon
                        name={feature.icon}
                        size={24}
                        className={cn(
                          "transition-colors",
                          isHeroFeature
                            ? "text-[#10b981]"
                            : "text-white/60 group-hover:text-[#10b981]",
                        )}
                      />
                    </div>
                    <h3
                      className={cn(
                        "font-bold text-white mb-3 relative z-10",
                        isHeroFeature ? "text-2xl" : "text-lg",
                      )}>
                      {feature.title}
                    </h3>
                    <p
                      className={cn(
                        "leading-relaxed relative z-10",
                        isHeroFeature
                          ? "text-neutral-300 text-base md:text-lg max-w-sm"
                          : "text-neutral-400 text-sm md:text-base",
                      )}>
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* COLUMN 2: 3 Standard Features */}
            <div className="flex flex-col gap-6">
              {[features[1], features[2], features[3]].map((feature) => (
                <div
                  key={feature.title}
                  className="border border-white/5 rounded-3xl p-8 transition-all cursor-default group hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(16,185,129,0.05)] relative overflow-hidden flex flex-col justify-center text-left bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#10b981]/20 md:min-h-[280px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors relative z-10 bg-white/5 group-hover:bg-[#10b981]/10">
                    <DynamicIcon
                      name={feature.icon}
                      size={24}
                      className="transition-colors text-white/60 group-hover:text-[#10b981]"
                    />
                  </div>
                  <h3 className="font-bold text-white mb-3 relative z-10 text-lg">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed relative z-10 text-neutral-400 text-sm md:text-base">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* COLUMN 3: 3 Standard Features */}
            <div className="flex flex-col gap-6">
              {[features[5], features[6], features[8]].map((feature) => (
                <div
                  key={feature.title}
                  className="border border-white/5 rounded-3xl p-8 transition-all cursor-default group hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(16,185,129,0.05)] relative overflow-hidden flex flex-col justify-center text-left bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#10b981]/20 md:min-h-[280px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors relative z-10 bg-white/5 group-hover:bg-[#10b981]/10">
                    <DynamicIcon
                      name={feature.icon}
                      size={24}
                      className="transition-colors text-white/60 group-hover:text-[#10b981]"
                    />
                  </div>
                  <h3 className="font-bold text-white mb-3 relative z-10 text-lg">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed relative z-10 text-neutral-400 text-sm md:text-base">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5.5: STACK KILLER --- */}
      <section className="py-20 md:py-32 px-6 border-t border-white/5 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.02)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              {copy.stackTitle}
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
              {copy.stackDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* The Fragmented Stack */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative">
              <div className="absolute top-4 left-4">
                <span className="text-[10px] uppercase tracking-widest text-red-500/50 font-black">
                  {copy.chaos}
                </span>
              </div>
              <div className="space-y-4 mt-8">
                {copy.tools.map(([name, use, price], i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 opacity-60">
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm">
                        {name}
                      </span>
                      <span className="text-[10px] text-neutral-500 uppercase">
                        {use}
                      </span>
                    </div>
                    <span className="text-white/40 font-mono text-sm">
                      {price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center px-2">
                <span className="text-neutral-400 font-bold uppercase tracking-widest text-xs">
                  {copy.total}
                </span>
                <span className="text-red-500 font-mono text-xl font-bold">
                  ~$60 <span className="text-xs">/usuario</span>
                </span>
              </div>
            </div>

            {/* The Noctra Solution */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#10b981] to-emerald-500 rounded-[34px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#050505] border border-[#10b981]/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center h-full">
                <div className="w-20 h-20 rounded-2xl bg-[#10b981]/10 flex items-center justify-center mb-8">
                  <NextImage
                    src="/favicon-light.svg"
                    alt={copy.solutionTitle}
                    width={40}
                    height={40}
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {copy.solutionTitle}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-8 max-w-xs">
                  {copy.solutionDescription}
                </p>
                <div className="flex flex-col items-center">
                  <span className="text-[#10b981] text-5xl font-black tracking-tighter mb-1">
                    $29<span className="text-sm font-bold">/mes</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium mb-3">
                    {copy.pricingStarterNote}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#10b981] font-bold">
                    {copy.efficiency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5.7: MARKET COMPARISON (UPDATED) --- */}
      <PricingComparison />

      {/* --- SECTION 5.8: UNIFIED STACK BENTO --- */}
      <UnifiedStack />

      {/* --- SECTION 5.9: CONNECTIVITY & AI --- */}
      <ConnectivitySection />

      {/* --- SECTION 5.10: MIGRATION --- */}
      {/* <MigrationSection /> */}

      {/* --- SECTION 6: PRICING --- */}
      <PricingWithROI />

      {/* --- SECTION 7: FAQ --- */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#10b981] font-bold text-center mb-4">
            {copy.faqEyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center mb-16">
            {copy.faqTitle}
          </h2>
          <div className="border-t border-white/5">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 8: CTA FINAL --- */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10b981]/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white leading-[1.1] mb-6">
            {copy.finalTitle}
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-xl leading-relaxed">
            {copy.finalDescription}
          </p>
          {/* Beta Coming Soon - Temporarily Disabled */}
          <Link
            href={{
              pathname: "/login",
              query: { mode: "signup", plan: "starter" },
            }}
            className="flex items-center justify-center gap-2 bg-white text-black font-bold h-12 rounded-full px-10 text-base hover:bg-gray-200 transition-all duration-300">
            {copy.startFree} <ArrowRight size={18} />
          </Link>
          {/* Original Link: /login */}
          <p className="text-xs text-neutral-500 mt-6 tracking-wide">
            {copy.finalFootnote}
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <ForgeFooter />
    </div>
  );
}
