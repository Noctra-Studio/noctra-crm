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
    badge: "Lanzamiento previsto entre finales de 2026 e inicios de 2027",
    heroTitle: "El sistema operativo para gestionar tus clientes.",
    personaFreelancer: "Trabajo por mi cuenta",
    personaAgency: "Lidero un equipo",
    proDescription:
      "Para profesionales que necesitan captar leads, dar seguimiento con orden y mantener cada relación con clientes en un solo sistema claro.",
    agencyDescription:
      "Para equipos que necesitan visibilidad compartida sobre pipeline, conversaciones, responsabilidades y próximos pasos sin sumar más ruido operativo.",
    startFree: "Unirme a la lista de espera",
    watchDemo: "Ver cómo funciona",
    trustIndicators: ["IA nativa desde el sistema", "Uso de IA transparente", "Diseñado para operaciones reales"],
    builtBy: "Nacido del trabajo operativo real en Noctra Studio",
    internalSystem:
      "Noctra CRM surge de los sistemas que construimos para dar seguimiento a clientes, oportunidades y operación con más claridad.",
    painEyebrow: "El problema",
    painTitle: "Cuando la operación comercial vive en muchos lugares, el seguimiento se rompe.",
    productEyebrow: "Vista general del sistema",
    productTitle: "Una sola vista estructurada para cada relación.",
    productDescription:
      "Visualiza leads, clientes, pipeline, actividad y próximos pasos en un solo lugar para que el equipo siempre sepa qué está pasando y qué sigue.",
    workflowEyebrow: "Flujo de trabajo",
    workflowTitle: "Un flujo claro desde el primer contacto hasta el cierre.",
    featuresEyebrow: "Capacidades",
    featuresTitle: "Diseñado para que la operación con clientes sea clara, constante y visible.",
    stackTitle: "Sustituye la dispersión operativa por un solo sistema.",
    stackDescription:
      "La mayoría de los equipos arma la operación con inbox, hojas de cálculo, tableros y CRMs desconectados. Noctra reúne relación, contexto y seguimiento en un mismo sistema operativo.",
    chaos: "Flujo desconectado",
    total: "Stack mensual típico",
    efficiency: "Un solo sistema claro",
    pricingStarterNote: "precios planeados visibles antes del lanzamiento",
    audienceEyebrow: "Para quién es",
    audienceTitle: "Quién puede aprovechar Noctra CRM",
    principlesEyebrow: "Principios del producto",
    principlesTitle: "Construido sobre tres principios",
    storyEyebrow: "Por qué construimos Noctra CRM",
    storyTitle: "No nació para verse bien en una demo. Nació para resolver una operación real.",
    storyDescription:
      "En Noctra Studio vimos el mismo patrón una y otra vez: leads perdidos, contexto disperso, seguimientos inconsistentes y poca visibilidad de lo que realmente estaba avanzando. Noctra CRM nace para resolver eso con estructura, IA integrada y uso transparente.",
    faqEyebrow: "Preguntas",
    faqTitle: "Lo que los equipos suelen preguntar antes de unirse a la lista.",
    finalTitle: "Recibe noticias cuando Noctra CRM esté listo para lanzarse.",
    finalDescription: "Únete a la lista de espera para seguir el desarrollo del producto, recibir actualizaciones y enterarte primero cuando Noctra CRM abra oficialmente.",
    finalFootnote: "Ventana estimada de lanzamiento: finales de 2026 a inicios de 2027.",
    painPoints: [
      ["Los leads llegan por mensajes, formularios y referencias sin un solo registro confiable", "Captura cada oportunidad en una línea de tiempo estructurada"],
      ["Los follow-ups dependen de la memoria y no del proceso", "Mantén próximos pasos visibles para que ninguna conversación se enfríe"],
      ["El contexto importante se pierde entre chats, notas y hojas de cálculo", "Concentra historial, actividad y decisiones en un mismo sistema"],
      ["El pipeline cambia según la persona que lo mire", "Dale a todo el equipo una sola vista operativa"],
      ["Las herramientas de IA generan texto, pero no orden operativo", "Usa IA dentro del flujo para resumir, organizar y sugerir acción"],
      ["Los líderes no ven con claridad qué avanza y qué está detenido", "Haz visible la salud del pipeline y la actividad sin reportes manuales"],
    ],
    steps: [
      ["01", "Captura leads sin perder contexto", "Centraliza formularios, mensajes y referencias para que toda oportunidad entre al sistema con información útil desde el primer momento.", "UserPlus"],
      ["02", "Organiza oportunidades con claridad", "Ordena el pipeline por etapa, prioridad y siguiente acción para que el trabajo comercial deje de depender de recordatorios personales.", "Layers"],
      ["03", "Da seguimiento a cada interacción", "Conserva conversaciones, notas, documentos y decisiones en una sola historia compartida para que cualquier persona entienda la relación.", "Search"],
      ["04", "Automatiza los follow-ups importantes", "Noctra identifica tareas repetitivas, recuerda próximos pasos y sugiere acciones cuando una oportunidad requiere atención.", "Brain"],
      ["05", "Cierra con más visibilidad", "Llega a cada negociación con una vista clara de actividad, responsables y estado real del pipeline.", "BarChart2"],
    ],
    features: [
      ["Sparkles", "Operación AI-native", "La IA vive dentro del sistema y trabaja sobre el contexto real de clientes, conversaciones y pipeline para ayudarte a decidir mejor."],
      ["UserPlus", "Lead Management", "Captura y organiza oportunidades desde el inicio para que ningún lead quede fuera del proceso."],
      ["BarChart2", "Sales Pipeline", "Visualiza etapas, riesgos y próximos pasos para dar seguimiento con más consistencia."],
      ["Users", "Client History", "Mantén juntas conversaciones, notas, archivos y decisiones para entender cada relación sin reconstruirla a mano."],
      ["Brain", "Automations", "Genera recordatorios, sugerencias y acciones útiles donde el equipo realmente trabaja."],
      ["Search", "Operational Visibility", "Detecta rápido qué se movió, qué está detenido y dónde hace falta intervenir."],
      ["Globe", "Claridad para equipos diversos", "Funciona en español e inglés para mantener alineación entre personas, áreas y sedes."],
      ["Shield", "Acceso por roles", "Cada usuario ve la información relevante para su trabajo, sin exponer más de lo necesario."],
      ["Smartphone", "Trabajo en movimiento", "Consulta clientes, pipeline y actividad desde desktop o móvil sin perder continuidad."],
    ],
    faqs: [
      ["¿Cuándo está previsto el lanzamiento?", "La meta actual es lanzar entre finales de 2026 e inicios de 2027, porque el producto incorpora una capa de IA y una lógica operativa más profunda que un CRM tradicional."],
      ["¿Es solo para agencias?", "No. Está pensado para profesionales, PyMES, escuelas, startups y agencias inmobiliarias que necesitan gestionar relaciones y seguimiento con más estructura."],
      ["¿Cómo funciona el uso de IA?", "Cada plan incluye una capacidad de uso de IA. Esa capacidad se utiliza cuando Noctra genera resúmenes, sugerencias o insights dentro del flujo de trabajo."],
      ["¿Qué significan los tokens?", "Piensa en los tokens como la capacidad de trabajo de IA incluida en tu plan, no como algo técnico que tengas que administrar manualmente."],
      ["¿Cómo funciona el acceso para equipos?", "El sistema permite dar visibilidad según rol para que ventas, operación y liderazgo vean lo que les corresponde."],
      ["¿Qué recibe alguien que se une a la lista de espera?", "Recibe actualizaciones del desarrollo, hitos del producto y el primer aviso cuando Noctra CRM abra oficialmente."],
      ["¿La estructura de precios será transparente?", "Sí. Queremos que el precio y el uso de IA se entiendan desde el primer día, sin cargos opacos ni capas ocultas."],
    ],
    tools: [
      ["Inbox y chats", "Comunicación", "$12"],
      ["Hojas de cálculo", "Contexto", "$10"],
      ["Tablero de tareas", "Seguimiento", "$15"],
      ["CRM con add-ons", "Pipeline + automatización", "$25"],
    ],
    solutionTitle: "Noctra CRM",
    solutionDescription: "Un sistema AI-native para pipeline, historial, seguimiento y claridad operativa.",
    audiences: [
      ["Profesionales", "Necesitan seguimiento confiable sin volverse administradores de herramientas.", "Noctra concentra clientes, actividad y próximos pasos en un mismo lugar."],
      ["PyMES", "Superan rápidamente las hojas de cálculo pero no necesitan complejidad empresarial.", "Noctra aporta estructura, visibilidad y apoyo de IA sin inflar la operación."],
      ["Escuelas e instituciones educativas", "Coordinan admisiones, seguimiento y comunicación entre varias personas.", "Noctra centraliza el historial y aclara responsabilidades en cada etapa."],
      ["Startups", "Necesitan velocidad comercial sin construir procesos frágiles.", "Noctra conecta contexto, pipeline y acción para que el equipo avance con orden."],
      ["Agencias inmobiliarias", "Gestionan muchos leads, seguimiento repetitivo y oportunidades sensibles al tiempo.", "Noctra organiza interacciones, recordatorios y movimiento del pipeline con claridad."],
    ],
    principles: [
      ["Claridad", "Cada relación con clientes debe ser fácil de entender, fácil de actualizar y fácil de actuar."],
      ["Eficiencia", "La IA y la automatización deben ahorrar trabajo útil, no agregar pasos ni complejidad."],
      ["Transparencia", "El precio, el uso de IA y el alcance del sistema deben ser visibles desde el inicio."],
    ],
  },
  en: {
    badge: "Planned launch window: late 2026 to early 2027",
    heroTitle: "The operating system for managing your clients.",
    personaFreelancer: "I work solo",
    personaAgency: "I lead a team",
    proDescription:
      "For professionals who need one clear place to capture leads, follow up consistently, and keep every client relationship organized.",
    agencyDescription:
      "For teams that need shared visibility across pipeline, conversations, responsibilities, and next steps without adding more operational noise.",
    startFree: "Join the waitlist",
    watchDemo: "See how it works",
    trustIndicators: ["AI-native by design", "Transparent AI usage", "Built for real operations"],
    builtBy: "Built from real operational work at Noctra Studio",
    internalSystem:
      "Noctra CRM grows out of the systems we build to manage clients, opportunities, and follow-through with more clarity.",
    painEyebrow: "The problem",
    painTitle: "When client operations live everywhere, follow-through breaks.",
    productEyebrow: "System overview",
    productTitle: "One structured view of every relationship.",
    productDescription:
      "See leads, clients, pipeline, activity, and next actions in one place so the team always knows what is happening and what comes next.",
    workflowEyebrow: "Workflow",
    workflowTitle: "A clear flow from first contact to closed deal.",
    featuresEyebrow: "Capabilities",
    featuresTitle: "Built to keep client operations clear, consistent, and visible.",
    stackTitle: "Replace operational sprawl with one system.",
    stackDescription:
      "Most teams piece client work together across inboxes, spreadsheets, task boards, and disconnected CRM tools. Noctra keeps the relationship, the context, and the follow-through in one operating system.",
    chaos: "Disconnected workflow",
    total: "Typical monthly stack",
    efficiency: "One clear system",
    pricingStarterNote: "planned pricing stays visible before launch",
    audienceEyebrow: "Who it is for",
    audienceTitle: "Who Noctra CRM is designed for",
    principlesEyebrow: "Product principles",
    principlesTitle: "Built on three principles",
    storyEyebrow: "Why we built Noctra CRM",
    storyTitle: "It was not created to look good in a demo. It was created to fix a real operation.",
    storyDescription:
      "At Noctra Studio we kept seeing the same pattern: lost leads, fragmented context, inconsistent follow-up, and limited visibility into what was actually moving. Noctra CRM is being built to solve that with structure, embedded AI, and transparent usage.",
    faqEyebrow: "Questions",
    faqTitle: "What teams usually ask before joining the waitlist.",
    finalTitle: "Be the first to hear when Noctra CRM is ready to launch.",
    finalDescription: "Join the waitlist to follow the product roadmap, receive launch updates, and hear first when Noctra CRM officially opens.",
    finalFootnote: "Estimated launch window: late 2026 to early 2027.",
    painPoints: [
      ["Leads arrive through messages, forms, and referrals with no single reliable record", "Capture every opportunity inside one structured timeline"],
      ["Follow-ups depend on memory instead of process", "Keep next steps visible so conversations do not go cold"],
      ["Important context gets buried across chats, notes, and spreadsheets", "Bring history, activity, and decisions into one system"],
      ["The pipeline looks different depending on who you ask", "Give the whole team one shared operational view"],
      ["AI tools create text, but not operational clarity", "Use AI inside the workflow to summarize, organize, and suggest action"],
      ["Leaders cannot clearly see what is moving and what is stuck", "Surface pipeline health and team activity without manual reporting"],
    ],
    steps: [
      ["01", "Capture leads without losing context", "Bring forms, messages, and referrals into one system so every opportunity starts with useful information.", "UserPlus"],
      ["02", "Organize opportunities clearly", "Structure the pipeline by stage, priority, and next action so commercial work stops depending on personal memory.", "Layers"],
      ["03", "Track every interaction", "Keep conversations, notes, files, and decisions inside one shared relationship history.", "Search"],
      ["04", "Automate the follow-ups that matter", "Noctra identifies repetitive work, reminds the team about next steps, and suggests action when a deal needs attention.", "Brain"],
      ["05", "Close with more visibility", "Reach each decision point with a clear view of activity, ownership, and real pipeline status.", "BarChart2"],
    ],
    features: [
      ["Sparkles", "AI-native workflows", "AI lives inside the system and works with real client, conversation, and pipeline context so teams can act with better judgment."],
      ["UserPlus", "Lead Management", "Capture and organize opportunities from the start so no lead falls outside the process."],
      ["BarChart2", "Sales Pipeline", "See stages, risk, and next steps clearly so follow-through becomes consistent."],
      ["Users", "Client History", "Keep conversations, notes, files, and decisions together so every relationship stays understandable."],
      ["Brain", "Automations", "Generate reminders, suggestions, and useful actions exactly where the team already works."],
      ["Search", "Operational Visibility", "Surface what moved, what stalled, and where attention is needed without digging through tools."],
      ["Globe", "Clarity for diverse teams", "Work in Spanish or English while keeping the same structured operational view."],
      ["Shield", "Role-based access", "Each user sees the information they need for their job without exposing more than necessary."],
      ["Smartphone", "Built for movement", "Review clients, pipeline, and activity from desktop or mobile without losing continuity."],
    ],
    faqs: [
      ["When is the launch expected?", "The current goal is a late 2026 to early 2027 launch because the product includes a deeper AI layer and shared operational workflows, not just a standard CRM shell."],
      ["Is this only for agencies?", "No. It is designed for professionals, SMBs, schools, startups, and real estate teams that need more structure in how they manage relationships and follow-through."],
      ["How does AI usage work?", "Each plan includes AI usage capacity. That capacity is used when Noctra creates summaries, suggestions, or insights inside the workflow."],
      ["What do tokens mean?", "Think of tokens as the amount of AI work included in your plan, not as a technical resource you need to manage manually."],
      ["How does team access work?", "The system supports role-based visibility so sales, operations, and leadership can see what is relevant to them."],
      ["What will waitlist members receive?", "They receive product updates, roadmap milestones, and the first notification when Noctra CRM opens publicly."],
      ["Will pricing be transparent at launch?", "Yes. The goal is to make pricing and AI usage understandable from day one without hidden layers or surprise charges."],
    ],
    tools: [
      ["Inbox + chat", "Communication", "$12"],
      ["Spreadsheets", "Context", "$10"],
      ["Task board", "Execution", "$15"],
      ["Traditional CRM add-ons", "Pipeline + automation", "$25"],
    ],
    solutionTitle: "Noctra CRM",
    solutionDescription: "One AI-native client operations system for pipeline, history, follow-through, and clarity.",
    audiences: [
      ["Professionals", "They need reliable follow-through without becoming administrators of five different tools.", "Noctra keeps clients, activity, and next actions in one place."],
      ["SMBs", "They outgrow spreadsheets before they can justify enterprise complexity.", "Noctra adds structure, visibility, and AI assistance without unnecessary overhead."],
      ["Schools and educational institutions", "They coordinate admissions, follow-up, and communication across multiple people.", "Noctra centralizes relationship history and makes responsibilities clearer."],
      ["Startups", "They need commercial speed without building fragile operating habits.", "Noctra connects context, pipeline, and action in one system."],
      ["Real estate agencies", "They manage many leads, repetitive follow-ups, and time-sensitive opportunities.", "Noctra helps organize interactions, reminders, and pipeline movement with more clarity."],
    ],
    principles: [
      ["Clarity", "Every client relationship should be easy to understand, easy to update, and easy to act on."],
      ["Efficiency", "AI and automation should remove useful work, not create more process to manage."],
      ["Transparency", "Pricing, AI usage, and system scope should be visible from the start."],
    ],
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

  const audienceIcons = ["UserPlus", "Layers", "Users", "Brain", "BarChart2"] as const;
  const audiences = copy.audiences.map(([title, challenge, outcome], index) => ({
    icon: audienceIcons[index],
    title,
    challenge,
    outcome,
  }));

  const principles = copy.principles.map(([title, desc], index) => ({
    icon: ["SearchCode", "Sparkles", "Shield"][index],
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
              href="/waitlist"
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
              alt="Noctra CRM dashboard preview"
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
                  ~$62 <span className="text-xs">/mo</span>
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
                    $39
                    <span className="text-sm font-bold">
                      {locale === "es" ? "/mes" : "/mo"}
                    </span>
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

      {/* --- SECTION 7: AUDIENCE --- */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#10b981] font-bold text-center mb-4">
            {copy.audienceEyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center mb-16">
            {copy.audienceTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            {audiences.map((item) => (
              <div
                key={item.title}
                className="border border-white/5 rounded-3xl p-6 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#10b981]/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                  <DynamicIcon
                    name={item.icon}
                    size={22}
                    className="text-white/60"
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                  {item.challenge}
                </p>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {item.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 8: PRINCIPLES --- */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#10b981] font-bold text-center mb-4">
            {copy.principlesEyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center mb-16">
            {copy.principlesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((item) => (
              <div
                key={item.title}
                className="border border-white/5 rounded-3xl p-8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#10b981]/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  <DynamicIcon
                    name={item.icon}
                    size={22}
                    className="text-white/60"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 9: STORY --- */}
      <section className="py-20 md:py-28 px-6 border-t border-white/5 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#10b981] font-bold mb-4">
            {copy.storyEyebrow}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8 text-balance">
            {copy.storyTitle}
          </h2>
          <p className="text-base md:text-xl text-neutral-400 leading-relaxed max-w-3xl mx-auto">
            {copy.storyDescription}
          </p>
        </div>
      </section>

      {/* --- SECTION 10: FAQ --- */}
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

      {/* --- SECTION 11: CTA FINAL --- */}
      <section className="py-28 md:py-40 px-6 border-t border-white/5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10b981]/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white leading-[1.1] mb-6">
            {copy.finalTitle}
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-xl leading-relaxed">
            {copy.finalDescription}
          </p>
          <Link
            href="/waitlist"
            className="flex items-center justify-center gap-2 bg-white text-black font-bold h-12 rounded-full px-10 text-base hover:bg-gray-200 transition-all duration-300">
            {copy.startFree} <ArrowRight size={18} />
          </Link>
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
