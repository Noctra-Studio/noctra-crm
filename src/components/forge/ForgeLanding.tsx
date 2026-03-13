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
    badge: "Acceso anticipado previsto entre finales de 2026 e inicios de 2027",
    heroTitle: "El Client Operations System para gestionar relaciones con clientes",
    personaFreelancer: "Trabajo por mi cuenta",
    personaAgency: "Lidero un equipo",
    proDescription:
      "Para profesionales que necesitan un sistema claro para ordenar leads, seguimiento e interacciones con clientes sin complejidad innecesaria.",
    agencyDescription:
      "Para equipos que necesitan operar su pipeline, actividad y próximos pasos con visibilidad compartida y ayuda inteligente dentro de un mismo sistema.",
    startFree: "Unirme al acceso anticipado",
    watchDemo: "Ver el sistema",
    trustIndicators: ["Client Operations System", "Transparente por diseño", "Diseñado para negocios reales"],
    builtBy: "Creado a partir de operaciones reales en Noctra Studio",
    internalSystem:
      "Noctra CRM nace del trabajo de Noctra Studio diseñando sistemas para ventas, seguimiento y operación con clientes en negocios reales.",
    painEyebrow: "El problema",
    painTitle: "El problema de gestionar clientes sin un sistema",
    productEyebrow: "Client Operations System",
    productTitle: "Un sistema claro para operar relaciones con clientes",
    productDescription:
      "Noctra CRM ayuda a organizar pipeline, interacciones e historial del cliente en un solo lugar. Así el equipo puede entender qué está pasando, qué sigue y dónde actuar con más claridad.",
    workflowEyebrow: "Cómo funciona",
    workflowTitle: "Cómo funciona Noctra CRM",
    featuresEyebrow: "Capacidades",
    featuresTitle: "Un sistema para operar relaciones con estructura, visibilidad y apoyo inteligente.",
    stackTitle: "Menos herramientas sueltas, más claridad operativa.",
    stackDescription:
      "Muchos negocios sostienen ventas y seguimiento entre inbox, hojas de cálculo y tableros. Noctra reúne contexto, responsables, próximos pasos y apoyo inteligente en un mismo sistema.",
    chaos: "Flujo desconectado",
    total: "Stack mensual típico",
    efficiency: "Un solo sistema claro",
    pricingStarterNote: "precios planeados visibles y fáciles de entender antes del lanzamiento",
    audienceEyebrow: "Para quién es",
    audienceTitle: "Quién puede aprovechar Noctra CRM",
    principlesEyebrow: "Principios del producto",
    principlesTitle: "Construido sobre tres principios",
    storyEyebrow: "Por qué construimos Noctra CRM",
    storyTitle: "Por qué construimos Noctra CRM",
    storyDescription:
      "La idea de Noctra CRM nace de una frustración real usando otros CRMs: eran difíciles de adoptar, costosos para equipos pequeños y estaban llenos de funciones pensadas para empresas mucho más grandes. En muchos casos, los equipos terminaban usándolos a medias o abandonándolos porque aprender el sistema no compensaba el valor real que recibían, y la ayuda inteligente se sentía más como un extra ineficiente que como una parte útil del trabajo diario. Noctra CRM se está desarrollando como un Client Operations System, pensado para dar claridad, eficiencia y transparencia a la operación con clientes. El producto sigue en una etapa temprana y todavía no ha sido usado ampliamente por clientes externos, pero se está construyendo de forma intencional para ayudar a los equipos a gestionar relaciones con clientes sin complejidad innecesaria.",
    faqEyebrow: "Preguntas",
    faqTitle: "Lo que los equipos suelen preguntar antes de unirse al acceso anticipado.",
    finalTitle: "Sé de las primeras empresas en usar Noctra CRM",
    finalDescription: "Abriremos el acceso de forma gradual mientras el sistema evoluciona.",
    finalCta: "Unirme a la lista de espera",
    finalFootnote: "Ventana estimada de lanzamiento: finales de 2026 a inicios de 2027.",
    painPoints: [
      ["Los leads llegan por distintos canales y algunos se pierden antes del primer seguimiento", "Captura cada lead en un solo lugar desde el primer contacto"],
      ["Los seguimientos dependen de la memoria y las oportunidades se enfrían", "Mantén recordatorios y próximos pasos visibles para que nadie quede olvidado"],
      ["La información del cliente se reparte entre chats, notas y hojas de cálculo", "Reúne conversaciones, historial y decisiones en un solo sistema"],
      ["El pipeline no se entiende con claridad y cada persona lo interpreta distinto", "Ordena cada oportunidad por etapa, prioridad y siguiente acción"],
      ["El equipo trabaja sin visibilidad compartida y los traspasos se vuelven confusos", "Dale a ventas, operación y liderazgo la misma vista de clientes y actividad"],
      ["Los líderes pierden tiempo pidiendo actualizaciones en lugar de ver el estado real", "Noctra CRM aporta claridad a la operación comercial con pipeline, historial y visibilidad en un mismo lugar"],
    ],
    steps: [
      ["01", "Captura leads", "Reúne formularios, mensajes y referencias en un solo lugar para que cada oportunidad entre al sistema desde el inicio.", "UserPlus"],
      ["02", "Organiza oportunidades", "Ordena cada oportunidad por etapa, prioridad y siguiente paso para que el pipeline sea claro para todo el equipo.", "Layers"],
      ["03", "Da seguimiento a las interacciones", "Guarda conversaciones, notas, archivos y decisiones en un mismo historial para entender cada relación con contexto.", "Search"],
      ["04", "Automatiza follow-ups", "Noctra recuerda próximos pasos y sugiere seguimientos para que ninguna oportunidad quede olvidada.", "Brain"],
      ["05", "Cierra oportunidades", "Llega a cada negociación con una vista clara del historial, la actividad y el estado real de la oportunidad.", "BarChart2"],
    ],
    features: [
      ["Sparkles", "Client Operations System", "Noctra reúne pipeline, interacciones, historial y ayuda inteligente dentro de un mismo sistema para que la operación con clientes sea más clara."],
      ["UserPlus", "Pipeline estructurado", "Captura, clasifica y prioriza oportunidades desde el primer contacto para que el pipeline avance con más orden."],
      ["BarChart2", "Visibilidad clara", "Ordena etapas, responsables y siguiente acción para que el equipo entienda qué está avanzando y qué necesita atención."],
      ["Users", "Interacciones organizadas", "Conserva conversaciones, notas, archivos y acuerdos en una historia única que cualquier persona puede entender."],
      ["Brain", "Asistencia inteligente", "Sugiere siguientes pasos, recuerda follow-ups y ayuda a detectar oportunidades dentro del trabajo diario."],
      ["Search", "Mejor seguimiento", "Muestra qué se movió, qué está detenido y dónde hace falta intervenir para decidir mejor."],
      ["Globe", "Colaboración bilingüe", "Funciona en español e inglés para mantener alineación entre personas, áreas y sedes."],
      ["Shield", "Permisos claros", "Cada persona ve solo la información que necesita para su trabajo, con acceso definido por rol."],
      ["Smartphone", "Continuidad móvil", "Consulta pipeline, clientes y actividad desde desktop o móvil sin perder el hilo del trabajo."],
    ],
    faqs: [
      ["¿Cuándo está previsto el lanzamiento?", "La meta actual es lanzar entre finales de 2026 e inicios de 2027, porque el producto incorpora una capa de IA y una lógica operativa más profunda que un CRM tradicional."],
      ["¿Es solo para agencias?", "No. Está pensado para profesionales, PyMES, escuelas, startups y agencias inmobiliarias que necesitan gestionar relaciones y seguimiento con más estructura."],
      ["¿Cómo funciona el uso de IA?", "La ayuda inteligente de Noctra trabaja dentro del sistema sobre conversaciones, historial, pipeline y actividad. Se usa cuando resume, organiza información, sugiere siguientes pasos o detecta oportunidades, para que el equipo entienda cuándo está recibiendo apoyo."],
      ["¿Qué significan los tokens?", "Piensa en los tokens como la capacidad de ayuda inteligente incluida en tu plan. Solo se consumen cuando Noctra realiza trabajo útil, como resumir una conversación o sugerir un seguimiento."],
      ["¿Cómo funciona el acceso para equipos?", "El sistema define permisos por rol para que cada persona vea lo que le corresponde, sin abrir más información de la necesaria."],
      ["¿Qué recibe alguien que se une al acceso anticipado?", "Recibe avances del desarrollo, hitos del producto y el primer aviso cuando Noctra CRM abra oficialmente."],
      ["¿La estructura de precios será transparente?", "Sí. Queremos que el precio, el uso de IA y el alcance de cada plan se entiendan desde el primer día, sin cargos opacos ni capas ocultas."],
    ],
    tools: [
      ["Inbox y chats", "Comunicación", "$12"],
      ["Hojas de cálculo", "Contexto", "$10"],
      ["Tablero de tareas", "Seguimiento", "$15"],
      ["CRM con add-ons", "Pipeline + automatización", "$25"],
    ],
    solutionTitle: "Noctra CRM",
    solutionDescription: "Un Client Operations System donde pipeline, historial, interacciones y seguimiento viven dentro de una sola operación clara.",
    audiences: [
      ["Profesionales", "Necesitan seguimiento confiable sin convertirse en administradores de herramientas.", "Noctra concentra clientes, actividad y próximos pasos en un mismo lugar."],
      ["PyMES", "Superan rápido las hojas de cálculo pero no necesitan complejidad empresarial.", "Noctra aporta estructura, visibilidad y apoyo de IA sin inflar la operación."],
      ["Escuelas e instituciones educativas", "Coordinan admisiones, seguimiento y comunicación entre varias personas.", "Noctra centraliza el historial y aclara responsabilidades en cada etapa."],
      ["Startups", "Necesitan velocidad comercial sin construir procesos frágiles.", "Noctra conecta contexto, pipeline y acción para que el equipo avance con orden."],
      ["Agencias inmobiliarias", "Gestionan muchos leads, seguimiento repetitivo y oportunidades sensibles al tiempo.", "Noctra organiza interacciones, recordatorios y movimiento del pipeline con claridad."],
    ],
    principles: [
      ["Claridad", "Cada relación con clientes debe ser fácil de entender, fácil de actualizar y fácil de actuar."],
      ["Eficiencia", "La IA y la automatización deben ahorrar trabajo útil, no agregar pasos ni complejidad."],
      ["Transparencia", "El precio, el uso de IA, el consumo de tokens y las reglas de acceso deben ser claros desde el inicio."],
    ],
  },
  en: {
    badge: "Early access planned for late 2026 to early 2027",
    heroTitle: "The client operations system for managing client relationships",
    personaFreelancer: "I work solo",
    personaAgency: "I lead a team",
    proDescription:
      "For professionals who need a clear system to organize leads, follow-through, and client interactions without unnecessary complexity.",
    agencyDescription:
      "For teams that need to run their pipeline, activity, and next steps with shared visibility and intelligent assistance inside one system.",
    startFree: "Join early access",
    watchDemo: "See the system",
    trustIndicators: ["Client Operations System", "Transparent by design", "Built for real businesses"],
    builtBy: "Built from real operational work at Noctra Studio",
    internalSystem:
      "Noctra CRM grows out of Noctra Studio's work designing systems for sales, follow-through, and client operations in real businesses.",
    painEyebrow: "The problem",
    painTitle: "The problem with managing clients without a system",
    productEyebrow: "Client Operations System",
    productTitle: "A clear system for operating client relationships",
    productDescription:
      "Noctra CRM helps organize pipeline, interactions, and client history in one place. That gives the team a clearer view of what is happening, what comes next, and where to act.",
    workflowEyebrow: "How it works",
    workflowTitle: "How Noctra CRM works",
    featuresEyebrow: "Capabilities",
    featuresTitle: "A system built to run client relationships with structure, visibility, and intelligent support.",
    stackTitle: "Fewer loose tools, more operational clarity.",
    stackDescription:
      "Many businesses hold sales and follow-through together across inboxes, spreadsheets, and task boards. Noctra keeps context, ownership, next steps, and intelligent assistance inside one system.",
    chaos: "Disconnected workflow",
    total: "Typical monthly stack",
    efficiency: "One clear system",
    pricingStarterNote: "planned pricing stays visible and easy to understand before launch",
    audienceEyebrow: "Who it is for",
    audienceTitle: "Who Noctra CRM is designed for",
    principlesEyebrow: "Product principles",
    principlesTitle: "Built on three principles",
    storyEyebrow: "Why we built Noctra CRM",
    storyTitle: "Why we built Noctra CRM",
    storyDescription:
      "The idea for Noctra CRM came from real frustration with other CRM tools. They were hard to adopt, expensive for small teams, and filled with features designed for large enterprises rather than teams trying to operate efficiently, so many businesses either stopped using them or only used a small part of what they paid for. Intelligent assistance often felt inefficient or poorly integrated instead of being genuinely useful in daily work. Noctra CRM is being developed as a Client Operations System built around clarity, efficiency, and transparency. The product is still in its early stages and has not yet been widely used with external clients, but it is being built intentionally to help teams manage client relationships without unnecessary complexity.",
    faqEyebrow: "Questions",
    faqTitle: "What teams usually ask before joining early access.",
    finalTitle: "Be among the first businesses using Noctra CRM",
    finalDescription: "We're opening access gradually while the system evolves.",
    finalCta: "Join the waitlist",
    finalFootnote: "Estimated launch window: late 2026 to early 2027.",
    painPoints: [
      ["Leads come in from different places and some disappear before anyone responds", "Capture every lead in one place from first contact"],
      ["Follow-ups live in people's heads, so opportunities go cold", "Keep reminders and next steps visible so follow-up actually happens"],
      ["Client information is scattered across chats, notes, and spreadsheets", "Bring conversations, history, and decisions into one shared record"],
      ["The pipeline is hard to read, so nobody is sure what stage a deal is in", "Organize every opportunity by stage, priority, and next action"],
      ["The team lacks a shared view, so handoffs get messy and accountability gets blurry", "Give sales, operations, and leadership the same view of clients and activity"],
      ["Leaders spend time asking for updates instead of seeing what is moving", "Noctra CRM brings client history, pipeline, and team visibility into one clear system"],
    ],
    steps: [
      ["01", "Capture leads", "Bring forms, messages, and referrals into one place so every opportunity enters the system from the start.", "UserPlus"],
      ["02", "Organize opportunities", "Arrange each opportunity by stage, priority, and next step so the pipeline stays clear across the team.", "Layers"],
      ["03", "Track interactions", "Keep conversations, notes, files, and decisions in one shared history so every relationship stays easy to understand.", "Search"],
      ["04", "Automate follow-ups", "Noctra keeps next steps visible and suggests follow-ups so opportunities do not get forgotten.", "Brain"],
      ["05", "Close deals", "Reach each decision with a clear view of history, activity, and the real status of the opportunity.", "BarChart2"],
    ],
    features: [
      ["Sparkles", "Client Operations System", "Noctra brings pipeline, interactions, history, and intelligent assistance into one system so client operations are easier to run with clarity."],
      ["UserPlus", "Structured pipeline", "Capture, classify, and prioritize opportunities from first contact so the pipeline moves with more order."],
      ["BarChart2", "Clear visibility", "Organize stages, ownership, and next action so the team can see what is moving and what needs attention."],
      ["Users", "Organized interactions", "Keep conversations, notes, files, and agreements in one shared record any teammate can understand."],
      ["Brain", "Intelligent assistance", "Suggest next steps, remember follow-ups, and help identify opportunities inside the daily workflow."],
      ["Search", "Better follow-through", "Show what moved, what stalled, and where attention is needed so teams can make better decisions."],
      ["Globe", "Bilingual collaboration", "Work in Spanish or English while keeping the same structured operational view."],
      ["Shield", "Clear permissions", "Each person sees only the information they need for their role, with access defined clearly."],
      ["Smartphone", "Mobile continuity", "Review clients, pipeline, and activity from desktop or mobile without losing the thread."],
    ],
    faqs: [
      ["When is the launch expected?", "The current goal is a late 2026 to early 2027 launch because the product includes a deeper AI layer and shared operational workflows, not just a standard CRM shell."],
      ["Is this only for agencies?", "No. It is designed for professionals, SMBs, schools, startups, and real estate teams that need more structure in how they manage relationships and follow-through."],
      ["How does AI usage work?", "Noctra's intelligent assistance works inside the system on conversations, history, pipeline, and activity. It is used when Noctra summarizes, organizes information, suggests next steps, or surfaces opportunities, so teams can understand when the system is helping."],
      ["What do tokens mean?", "Think of tokens as the amount of intelligent-assistance work included in your plan. They are only consumed when Noctra does useful work, such as summarizing a conversation or suggesting a follow-up."],
      ["How does team access work?", "The system uses role-based permissions so each person sees what is relevant to their work without opening up more information than necessary."],
      ["What will early access members receive?", "They receive product updates, roadmap milestones, and the first notification when Noctra CRM opens publicly."],
      ["Will pricing be transparent at launch?", "Yes. The goal is to make pricing, AI usage, and the scope of each plan understandable from day one without hidden layers or surprise charges."],
    ],
    tools: [
      ["Inbox + chat", "Communication", "$12"],
      ["Spreadsheets", "Context", "$10"],
      ["Task board", "Execution", "$15"],
      ["Traditional CRM add-ons", "Pipeline + automation", "$25"],
    ],
    solutionTitle: "Noctra CRM",
    solutionDescription: "A Client Operations System where pipeline, history, interactions, and follow-through live inside one clear operation.",
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
      ["Transparency", "Pricing, AI usage, token consumption, and access rules should be clear from the start."],
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {audiences.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  "group relative overflow-hidden border border-white/5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#10b981]/20 transition-all",
                  index === audiences.length - 1
                    ? "lg:col-span-2 p-6 md:p-7 lg:p-8"
                    : "p-6 md:p-7 min-h-[320px]",
                )}>
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br pointer-events-none",
                    index === 0
                      ? "from-emerald-500/10 via-transparent to-transparent"
                      : index === 1
                        ? "from-white/[0.07] via-transparent to-transparent"
                        : index === 2
                          ? "from-cyan-500/10 via-transparent to-transparent"
                          : index === 3
                            ? "from-amber-500/10 via-transparent to-transparent"
                            : "from-fuchsia-500/10 via-transparent to-transparent",
                  )}
                />
                <div
                  className={cn(
                    "relative z-10 h-full",
                    index === audiences.length - 1
                      ? "grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end"
                      : "flex h-full flex-col",
                  )}>
                  <div className={cn(index === audiences.length - 1 ? "lg:max-w-sm" : "")}>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                      <DynamicIcon
                        name={item.icon}
                        size={22}
                        className="text-white/60"
                      />
                    </div>
                    <h3
                      className={cn(
                        "font-bold text-white mb-3 text-balance",
                        index === audiences.length - 1 ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
                      )}>
                      {item.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/35 font-bold mb-3">
                      {locale === "es" ? "Reto común" : "Common challenge"}
                    </p>
                    <p className="text-neutral-400 leading-relaxed text-sm md:text-base max-w-[34rem]">
                      {item.challenge}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "border-t border-white/5 pt-5",
                      index === audiences.length - 1 ? "lg:pt-0 lg:pl-8 lg:border-t-0 lg:border-l" : "mt-auto",
                    )}>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#10b981] font-bold mb-3">
                      {locale === "es" ? "Cómo ayuda Noctra" : "How Noctra helps"}
                    </p>
                    <p className="text-neutral-200 leading-relaxed text-sm md:text-base max-w-[42rem]">
                      {item.outcome}
                    </p>
                  </div>
                </div>
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
            {copy.finalCta} <ArrowRight size={18} />
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
