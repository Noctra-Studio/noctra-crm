"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  format,
  differenceInDays,
  isSameMonth,
  isAfter,
  subMonths,
  isBefore,
  addDays,
} from "date-fns";
import { es } from "date-fns/locale";
import { ForgeSidebar } from "@/components/forge/ForgeSidebar";
import {
  Bell,
  FileText,
  PenTool,
  Clock,
  Users,
  TrendingUp,
  Briefcase,
  DollarSign,
  ArrowRight,
  Activity,
  Calendar,
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  MessageSquare,
  User,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { useFollowUps } from "@/hooks/useFollowUps";
import { FollowUpModal } from "@/components/forge/FollowUpModal";
import { RevenueForecast } from "@/app/actions/metrics";
import { createClient } from "@/utils/supabase/client";
import { EarlyAccessWidget } from "@/components/forge/EarlyAccessWidget";

type Lead = any;
type Proposal = any;
type Contract = any;
type Project = any;

const STAGES = [
  "nuevo",
  "contactado",
  "propuesta_enviada",
  "en_negociacion",
  "cerrado",
  "perdido",
];
const STAGE_LABELS: Record<string, string> = {
  nuevo: "NUEVO",
  contactado: "CONTACTADO",
  propuesta_enviada: "PROPUESTA",
  en_negociacion: "NEGOCIACIÓN",
  cerrado: "CERRADO",
  perdido: "PERDIDO",
};

export default function DashboardClient({
  leads,
  proposals,
  contracts,
  projects,
  forecast,
  isTrial,
}: {
  leads: Lead[];
  proposals: Proposal[];
  contracts: Contract[];
  projects: Project[];
  forecast: RevenueForecast;
  isTrial?: boolean;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { suggestions, refresh } = useFollowUps();
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

  const t = useTranslations("forge.dashboard");
  const tSearch = useTranslations("forge.search");
  const supabase = createClient();

  const uncontactedLeadsCount = leads.filter(
    (l) => l.pipeline_status === "nuevo",
  ).length;
  const pendingProposalsCount = Math.max(
    0,
    proposals.filter(
      (p) =>
        p.status === "sent" &&
        differenceInDays(new Date(), new Date(p.updated_at)) > 3,
    ).length,
  );
  const activeProjectsCount = projects.filter(
    (p) => p.status === "active",
  ).length;

  let dynamicStatus = t("todoAlDia");
  if (uncontactedLeadsCount > 0) {
    dynamicStatus = t("leadsSinContactar", { count: uncontactedLeadsCount });
  } else if (pendingProposalsCount > 0) {
    dynamicStatus = t("propuestasEsperando", { count: pendingProposalsCount });
  } else if (activeProjectsCount > 0) {
    dynamicStatus = t("proyectosActivosSemana", { count: activeProjectsCount });
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 transition-all duration-200 min-h-full relative w-full">
      {/* Main Content Area */}
      <div className="px-8 py-6 space-y-8 w-full flex-1">
        {/* Follow-up Smart Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest font-black">
                  {t("atencionRequerida")}
                </p>
                <p className="text-sm font-bold text-white">
                  {t("propuestasEstancadas", { count: suggestions.length })}
                </p>
              </div>
            </div>
            <Link
              href={
                suggestions.length === 1 &&
                suggestions[0].type.includes("proposal")
                  ? `/forge/proposals/${suggestions[0].id}/edit`
                  : "/forge/pipeline"
              }
              className="px-4 py-2 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all text-center rounded-md">
              {t("verDetalle")}
            </Link>
          </div>
        )}

        {/* Upgrade Soft Wall Banner */}
        {isTrial && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group animate-in slide-in-from-top-4 duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Potencia tu Imagen Profesional
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                  Personaliza tu portal con tu propio dominio y elimina el sello
                  de Noctra.
                </p>
              </div>
            </div>
            <Link
              href="/forge/settings/billing"
              className="relative z-10 px-6 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all text-center rounded-lg flex items-center justify-center gap-2 group/btn">
              Mejorar a Plan Pro
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* Row 1: Alertas del Día */}
        <AlertsRow leads={leads} proposals={proposals} contracts={contracts} />

        <div className="md:hidden mt-6 mb-2">
          <PipelineSnapshot leads={leads} />
        </div>

        {/* Early Access Widget (Conditionally shown for trials) */}
        {isTrial && (
          <div className="mt-6">
            <EarlyAccessWidget />
          </div>
        )}

        <div className="mt-8 mb-8 space-y-6">
          <KpiRow
            leads={leads}
            proposals={proposals}
            projects={projects}
            contracts={contracts}
            forecast={forecast}
          />

          {/* AI Assistant Full Width Row */}
          <NoctraAiPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <RecentActivity
            leads={leads}
            proposals={proposals}
            contracts={contracts}
            projects={projects}
          />
          <UpcomingActions leads={leads} />
        </div>

        {/* Row 4: Pipeline Snapshot */}
        <PipelineSnapshot leads={leads} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// ROW 1: ALERTAS DEL DÍA
// ----------------------------------------------------------------------
function AlertsRow({ leads, proposals, contracts }: any) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const alerts = [];

  // 1. Nuevos leads desde ayer
  const newLeads = leads.filter((l: any) =>
    isAfter(new Date(l.created_at), yesterday),
  );
  if (newLeads.length > 0) {
    alerts.push({
      type: "red",
      icon: Users,
      text: `${newLeads.length} lead${newLeads.length > 1 ? "s" : ""} nuevo${newLeads.length > 1 ? "s" : ""}`,
      link: "/forge/leads",
    });
  }

  // 2. Propuestas vistas sin firma (older than 2 days)
  const twoDaysAgoDate = addDays(today, -2);
  const hangingProposals = proposals.filter(
    (p: any) =>
      p.status === "viewed" &&
      isBefore(new Date(p.updated_at || p.created_at), twoDaysAgoDate),
  );
  if (hangingProposals.length > 0) {
    alerts.push({
      type: "orange",
      icon: FileText,
      text: `${hangingProposals.length} propuesta${hangingProposals.length > 1 ? "s" : ""} vista${hangingProposals.length > 1 ? "s" : ""} sin firma`,
      link: "/forge/proposals",
    });
  }

  // 3. Propuestas DRAFT sin fecha límite
  const draftProposalsWithoutDate = proposals.filter(
    (p: any) => p.status === "draft" && !p.valid_until,
  );
  if (draftProposalsWithoutDate.length > 0) {
    alerts.push({
      type: "orange",
      icon: FileText,
      text: `${draftProposalsWithoutDate.length} propuesta${draftProposalsWithoutDate.length > 1 ? "s" : ""} sin fecha de vencimiento`,
      linkText: "→ Agregar fechas",
      link: "/forge/proposals",
    });
  }

  // 4. Contratos pendientes de firma ("sent")
  const pendingContracts = contracts.filter((c: any) => c.status === "pending");
  if (pendingContracts.length > 0) {
    alerts.push({
      type: "orange",
      icon: PenTool,
      text: `${pendingContracts.length} contrato${pendingContracts.length > 1 ? "s" : ""} pendiente${pendingContracts.length > 1 ? "s" : ""} de firma`,
      link: "/forge/contracts",
    });
  }

  // 4. Acciones vencidas
  const overdueActions = leads.filter(
    (l: any) =>
      l.next_action_date &&
      isBefore(new Date(l.next_action_date), today) &&
      l.pipeline_status !== "cerrado" &&
      l.pipeline_status !== "perdido",
  );
  if (overdueActions.length > 0) {
    alerts.push({
      type: "red",
      icon: AlertCircle,
      text: `${overdueActions.length} acción${overdueActions.length > 1 ? "es" : ""} vencida${overdueActions.length > 1 ? "s" : ""}`,
      link: "/forge/pipeline",
    });
  }

  // 5. Leads sin contactar en 3+ días
  const threeDaysAgoDate = addDays(today, -3);
  const ghostingLeads = leads.filter(
    (l: any) =>
      l.pipeline_status === "nuevo" &&
      isBefore(new Date(l.created_at), threeDaysAgoDate),
  );
  if (ghostingLeads.length > 0) {
    alerts.push({
      type: "yellow",
      icon: Clock,
      text: `${ghostingLeads.length} lead${ghostingLeads.length > 1 ? "s" : ""} sin contactar (3+ días)`,
      link: "/forge/pipeline",
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="w-full bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
          Todo al día. Sin pendientes.
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex w-full overflow-x-auto gap-4 scrollbar-hide snap-x"
      data-lenis-prevent>
      {alerts.map((a, i) => {
        let colors =
          "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700";
        if (a.type === "red")
          colors =
            "bg-red-500/10 border-red-500/30 text-red-500 hover:border-red-500/50 hover:bg-red-500/20";
        if (a.type === "orange")
          colors =
            "bg-orange-500/10 border-orange-500/30 text-orange-500 hover:border-orange-500/50 hover:bg-orange-500/20";
        if (a.type === "yellow")
          colors =
            "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:border-yellow-500/50 hover:bg-yellow-500/20";

        return (
          <Link
            key={i}
            href={a.link}
            className={`flex-shrink-0 snap-start flex flex-col justify-center gap-2 p-4 pr-8 rounded-lg border transition-colors min-w-[200px] ${colors}`}>
            <div className="flex items-center gap-2">
              <a.icon className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest leading-none mt-0.5">
                {a.text}
              </span>
            </div>
            {a.linkText && (
              <span className="text-xs font-bold pl-6 hover:underline">
                {a.linkText}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------
// SPARKLINE COMPONENT (Pure SVG)
// ----------------------------------------------------------------------
function SparkLine({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;

  // Normalize data for SVG coordinates
  const height = 30;
  const width = 100;
  const max = Math.max(...data, 1); // Avoid div by zero
  const min = Math.min(...data, 0);
  const range = max - min;

  // Generate path points
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Gradient definitions (optional but nice)
  const gradientId = `spark-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      className="w-full h-[30px] mt-4 overflow-visible"
      viewBox={`0 -5 100 40`}
      preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area under the curve */}
      <path
        d={`${pathD} L 100,${height} L 0,${height} Z`}
        fill={`url(#${gradientId})`}
        stroke="none"
      />

      {/* Smooth line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Last point dot */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].split(",")[0]}
          cy={points[points.length - 1].split(",")[1]}
          r="2.5"
          fill={color}
          className="animate-pulse"
        />
      )}
    </svg>
  );
}

// ----------------------------------------------------------------------
// ROW 2: KPIs RÁPIDOS
// ----------------------------------------------------------------------
function KpiRow({ leads, proposals, projects, contracts, forecast }: any) {
  const t = useTranslations("forge.dashboard");
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);

  // 1. Leads este mes vs last month
  const leadsThisMonth = leads.filter((l: any) =>
    isSameMonth(new Date(l.created_at), currentMonth),
  ).length;
  const leadsLastMonth = leads.filter((l: any) =>
    isSameMonth(new Date(l.created_at), lastMonth),
  ).length;
  const leadDelta = leadsThisMonth - leadsLastMonth;

  // 2. Propuestas activas (sent, viewed)
  const activeProposals = proposals.filter(
    (p: any) => p.status === "sent" || p.status === "viewed",
  );
  const activeProposalsValue = activeProposals.reduce(
    (sum: number, p: any) => sum + (p.total_price || 0),
    0,
  );

  // 3. Proyectos en curso (not completed or cancelled)
  const ongoingProjects = projects.filter(
    (p: any) => !["completed", "cancelled"].includes(p.status),
  );

  // No longer using simplistic closedValue calculation as we have the engine.
  const formatCurrency = (val: number) => {
    return (
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      }).format(val) + " MXN"
    );
  };

  // Dummy 7-day data arrays since we don't track metrics heavily yet
  // Once historical tracking goes live, these can be replaced dynamically
  const placeholderArr = [0, 0, 0, 0, 0, 0, 0];
  // Slightly varying static data just so the dashboard looks alive for demo
  const dummyTrendLeads = [
    1,
    2,
    0,
    3,
    1,
    5,
    leadsThisMonth > 0 ? leadsThisMonth : 0,
  ];
  const dummyTrendProposals = [
    0,
    1000,
    1500,
    500,
    2000,
    0,
    activeProposals.length > 0 ? 3000 : 0,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label={t("leadsEsteMes")}
        value={leadsThisMonth.toString()}
        subtext={`${leadDelta > 0 ? "▲ +" : leadDelta < 0 ? "▼ " : ""}${leadDelta} ${t("vsMesAnterior")}`}
        subtextColor={
          leadDelta > 0
            ? "text-emerald-400"
            : leadDelta < 0
              ? "text-red-400"
              : "text-neutral-500"
        }
        sparklineData={leadsThisMonth > 0 ? dummyTrendLeads : placeholderArr}
        color={
          leadDelta > 0 ? "#10b981" : leadDelta < 0 ? "#ef4444" : "#737373"
        }
        link="/forge/leads"
      />
      <KpiCard
        label={t("propuestasActivas")}
        value={activeProposals.length.toString()}
        subtext={`${formatCurrency(activeProposalsValue)} ${t("mxnAcumulado")}`}
        sparklineData={
          activeProposals.length > 0 ? dummyTrendProposals : placeholderArr
        }
        color="#10b981"
        link="/forge/proposals"
      />

      {/* Ongoing Projects specialized card */}
      <div className="bg-[#111111] border border-neutral-900 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-150 cursor-pointer p-6 flex flex-col justify-between relative group rounded-xl min-h-[160px]">
        <span className="text-sm font-medium text-white/60 mb-2">
          {t("proyectosEnCurso")}
        </span>
        <div className="text-3xl font-black">{ongoingProjects.length}</div>

        {/* Removed SparkLine to free up space */}

        <div className="flex justify-end mt-auto pt-4">
          <Link
            href="/forge/projects"
            className="text-xs font-medium text-white/30 hover:text-white/60 transition-colors">
            {t("verDetalles")} →
          </Link>
        </div>

        <div className="absolute inset-0 bg-[#111] p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center overflow-hidden z-20 overflow-y-auto rounded-xl">
          {ongoingProjects.length === 0 ? (
            <span className="text-xs text-neutral-500">Ninguno</span>
          ) : (
            ongoingProjects.map((p: any) => (
              <p
                key={p.id}
                className="text-[10px] font-mono uppercase text-emerald-400 truncate w-full mb-1">
                • {p.name}
              </p>
            ))
          )}
        </div>
      </div>

      <KpiCard
        label={t("forecastIngresos")}
        value={formatCurrency(forecast.total)}
        subtext={t("proyeccionPonderada")}
        valueColor="text-emerald-500"
        sparklineData={
          forecast.total > 0
            ? [2000, 1000, 3000, 5000, 4000, 8000, 10000]
            : placeholderArr
        }
        color="#10b981"
        link="/forge/metrics"
        isForecast={true}
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtext,
  subtextColor = "text-neutral-500",
  valueColor = "text-white",
  sparklineData,
  color,
  link,
  isForecast = false,
}: any) {
  const t = useTranslations("forge.dashboard");
  const containerClasses = isForecast
    ? "bg-emerald-500/5 border border-emerald-500/15 shadow-[0_0_20px_rgba(0,255,136,0.04)]"
    : "bg-[#111111] border border-neutral-900 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-150 cursor-pointer";

  return (
    <div
      className={`${containerClasses} p-6 flex flex-col justify-between rounded-xl relative min-h-[160px]`}>
      <div className="flex-1">
        <span className="text-sm font-medium text-white/60 mb-2 block">
          {label}
        </span>
        <div className={`text-3xl font-black ${valueColor}`}>{value}</div>
        <div className={`text-xs font-medium mt-2 ${subtextColor}`}>
          {subtext}
        </div>
      </div>
      {/* Removed SparkLine block entirely */}{" "}
      {link && (
        <div className="flex justify-end mt-auto pt-4">
          <Link
            href={link}
            className="text-xs font-medium text-white/30 hover:text-white/60 transition-colors">
            {t("verDetalles")} →
          </Link>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// NOCTRA AI COPILOT
// ----------------------------------------------------------------------
function NoctraAiPanel() {
  const t = useTranslations("forge.dashboard");
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch("/api/forge/ai-insights");
        const data = await res.json();
        if (data.insights) {
          setInsights(data.insights);
        }
      } catch (err) {
        console.error("Failed to load Noctra AI insights", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  const dismissInsight = (idx: number) => {
    setInsights((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-emerald-500/[0.02] border border-emerald-500/20 rounded-xl p-6 relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transition-opacity duration-1000" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h2 className="text-sm font-semibold text-emerald-500">Noctra AI</h2>
        </div>
        {!loading && (
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
            className="border border-white/10 rounded px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all">
            Actualizar
          </button>
        )}
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="flex items-center gap-3 py-4 text-white/50">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            <span className="text-sm font-medium">Analizando CRM...</span>
          </div>
        ) : insights.length === 0 ? (
          <p className="text-white/40 text-sm py-2 italic font-serif">
            "{t("todoAlDia")}"
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-black/40 border-l-4 border-l-emerald-500 border-y border-y-white/5 border-r border-r-white/5 p-5 flex flex-col justify-between shadow-lg">
                <div className="flex gap-3 mb-5">
                  <p className="text-sm text-white font-medium leading-relaxed text-balance">
                    {insight.mensaje}
                  </p>
                </div>

                <div className="flex items-center mt-auto">
                  <button className="bg-emerald-500 text-black rounded-md px-4 py-2 text-xs font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    {insight.accion_label}
                  </button>
                  <button
                    onClick={() => dismissInsight(idx)}
                    className="text-xs font-medium text-white/40 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors ml-3">
                    Ignorar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// ROW 3: ACTIVIDAD RECIENTE & PRÓXIMAS ACCIONES
// ----------------------------------------------------------------------
function RecentActivity({ leads, proposals, contracts, projects }: any) {
  const t = useTranslations("forge.dashboard");
  // Aggregate events into a unified chronological array
  const events: any[] = [];

  leads.forEach((l: any) => {
    events.push({
      id: `l-${l.id}`,
      date: new Date(l.created_at),
      type: "lead",
      desc: `Nuevo lead: ${l.name}`,
      link: `/forge/leads`,
    });
  });

  proposals.forEach((p: any) => {
    const label = p.proposal_number || p.title || "Propuesta sin nombre";
    const client = p.client_name || p.company_name || "Cliente";

    const statusMap: Record<string, string> = {
      draft: "creada",
      sent: "enviada",
      viewed: "vista",
      accepted: "firmada",
      rejected: "rechazada",
      expired: "expirada",
    };

    events.push({
      id: `p-${p.id}`,
      date: new Date(p.updated_at || p.created_at),
      type: "proposal",
      desc: `Propuesta ${statusMap[p.status] || "actualizada"}: ${label} (${client})`,
      link: `/forge/proposals`,
    });
  });

  contracts.forEach((c: any) => {
    const label = c.contract_number || "Contrato";
    const client = c.client_name || "Cliente";

    const statusMap: Record<string, string> = {
      pending: "pendiente",
      signed: "firmado",
      expired: "expirado",
    };

    events.push({
      id: `c-${c.id}`,
      date: new Date(c.updated_at || c.created_at),
      type: "contract",
      desc: `Contrato ${statusMap[c.status] || "actualizado"}: ${label} (${client})`,
      link: `/forge/contracts`,
    });
  });

  projects.forEach((prj: any) => {
    const label = prj.name || "Proyecto sin nombre";

    const statusMap: Record<string, string> = {
      active: "activo",
      on_hold: "en pausa",
      completed: "completado",
      cancelled: "cancelado",
      maintenance: "mantenimiento",
    };

    events.push({
      id: `prj-${prj.id}`,
      date: new Date(prj.updated_at || prj.created_at),
      type: "project",
      desc: `Proyecto ${statusMap[prj.status] || "actualizado"}: ${label}`,
      link: `/forge/projects`,
    });
  });

  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentEvents = events.slice(0, 8);

  const getEventStyles = (type: string) => {
    switch (type) {
      case "proposal":
        return { icon: FileText, bg: "bg-blue-500/20", color: "text-blue-400" };
      case "project":
        return {
          icon: Briefcase,
          bg: "bg-purple-500/20",
          color: "text-purple-400",
        };
      case "lead":
        return {
          icon: Users,
          bg: "bg-emerald-500/20",
          color: "text-emerald-400",
        };
      case "contract":
        return {
          icon: PenTool,
          bg: "bg-yellow-500/20",
          color: "text-yellow-400",
        };
      default:
        return {
          icon: Activity,
          bg: "bg-neutral-800",
          color: "text-neutral-400",
        };
    }
  };

  return (
    <div className="lg:col-span-3 bg-[#111111] border border-neutral-900 flex flex-col h-auto rounded-xl">
      <div className="p-6 md:p-8 flex-none border-b border-neutral-900 flex justify-between items-center bg-[#0a0a0a] rounded-t-xl">
        <h3 className="text-sm font-medium text-white/50">
          {t("actividadReciente")}
        </h3>
      </div>
      <div className="max-h-[280px] overflow-y-auto p-4 md:p-6 flex flex-col forge-scroll">
        {recentEvents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
            <Activity className="w-6 h-6 text-white/10" />
            <p className="text-xs font-medium text-white/20">
              Sin actividad hoy
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-1">
            {recentEvents.map((evt) => {
              const { icon: EventIcon, bg, color } = getEventStyles(evt.type);

              return (
                <Link
                  key={evt.id}
                  href={evt.link}
                  className="flex gap-4 group hover:bg-white/[0.04] rounded-lg cursor-pointer transition-colors p-3 w-full items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                    <EventIcon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 justify-center">
                    <span className="text-xs font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors truncate">
                      {evt.desc}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5">
                      {differenceInDays(new Date(), evt.date) === 0
                        ? "Hoy"
                        : `Hace ${differenceInDays(new Date(), evt.date)} días`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer actions view more */}
        <Link
          href="/forge"
          className="block text-center mt-auto pt-6 border-t border-neutral-900 text-xs font-medium text-white/30 hover:text-white/60 transition-colors">
          Ver toda la actividad →
        </Link>
      </div>
    </div>
  );
}

function UpcomingActions({ leads }: any) {
  const t = useTranslations("forge.dashboard");
  const today = new Date();
  const next7Days = addDays(today, 7);

  const actions = leads
    .filter(
      (l: any) =>
        l.next_action_date &&
        l.pipeline_status !== "cerrado" &&
        l.pipeline_status !== "perdido",
    )
    .filter((l: any) => isBefore(new Date(l.next_action_date), next7Days))
    .sort(
      (a: any, b: any) =>
        new Date(a.next_action_date).getTime() -
        new Date(b.next_action_date).getTime(),
    );

  return (
    <div className="lg:col-span-2 bg-[#111111] border border-neutral-900 flex flex-col h-auto rounded-xl">
      <div className="p-6 md:p-8 flex-none border-b border-neutral-900 flex justify-between items-center bg-[#0a0a0a] rounded-t-xl">
        <h3 className="text-sm font-medium text-white/50">
          {t("proximasAcciones")}
        </h3>
      </div>
      <div className="max-h-[280px] overflow-y-auto p-4 md:p-6 flex flex-col forge-scroll">
        {actions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10">
            <Calendar className="w-6 h-6 text-white/10" />
            <p className="text-xs font-medium text-white/30 leading-tight">
              {t("sinAcciones")}
            </p>
            <Link
              href="/forge/pipeline"
              className="mt-2 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/40 hover:border-white/20 hover:text-white/60 transition-all font-medium">
              {t("programarAccion")}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map((l: any) => {
              const isOverdue = isBefore(new Date(l.next_action_date), today);
              return (
                <Link
                  key={l.id}
                  href="/forge/pipeline"
                  className={`flex flex-col p-4 rounded-lg border transition-colors ${isOverdue ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40" : "bg-neutral-900 border-neutral-800 hover:border-neutral-600"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest ${isOverdue ? "text-red-400" : "text-emerald-400"}`}>
                      {format(new Date(l.next_action_date), "MMM d", {
                        locale: es,
                      })}
                    </span>
                    {isOverdue && (
                      <span className="text-[8px] font-black uppercase text-red-500 bg-red-500/20 px-2 py-0.5 rounded-sm">
                        Atrasado
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold truncate ${isOverdue ? "text-red-100" : "text-white"}`}>
                    {l.name}
                  </span>
                  {l.next_action_notes && (
                    <span className="text-xs text-neutral-500 truncate mt-1">
                      {l.next_action_notes}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// ROW 4: PIPELINE SNAPSHOT
// ----------------------------------------------------------------------

function PipelineSnapshot({ leads }: any) {
  const t = useTranslations("forge.dashboard");
  const STAGES = [
    "nuevo",
    "contactado",
    "calificado",
    "propuesta",
    "negociacion",
    "ganado",
    "perdido",
  ];
  const STAGE_LABELS: Record<string, string> = {
    nuevo: "Nuevo",
    contactado: "Contactado",
    calificado: "Calificado",
    propuesta: "Propuesta",
    negociacion: "Negociación",
    ganado: "Ganado",
    perdido: "Perdido",
  };

  const activeLeads = leads.filter(
    (l: any) =>
      l.pipeline_status !== "ganado" && l.pipeline_status !== "perdido",
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const calculateTotal = (stage: string) => {
    return leads
      .filter((l: any) => l.pipeline_status === stage)
      .reduce((sum: number, l: any) => sum + (l.estimated_value || 0), 0);
  };

  const calculateCount = (stage: string) =>
    leads.filter((l: any) => l.pipeline_status === stage).length;

  const totalPipelineValue = activeLeads.reduce(
    (sum: number, l: any) => sum + (l.estimated_value || 0),
    0,
  );

  const validStages = STAGES.filter((s) => !["ganado", "perdido"].includes(s));
  const activeLeadsCount = activeLeads.length;

  return (
    <div className="bg-[#111111] border border-neutral-900 p-6 md:p-8 flex flex-col rounded-xl relative overflow-hidden">
      {/* Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900 flex">
        {validStages.map((stage) => {
          const count = calculateCount(stage);
          const widthPercent =
            activeLeadsCount > 0 ? (count / activeLeadsCount) * 100 : 0;
          return (
            <div
              key={`progress-${stage}`}
              className="h-full bg-emerald-500 transition-all duration-500 border-r border-black/50 last:border-r-0"
              style={{ width: `${widthPercent}%`, opacity: count > 0 ? 1 : 0 }}
            />
          );
        })}
      </div>

      <div className="flex justify-between items-start mb-8 mt-2">
        <div>
          <h3 className="uppercase tracking-widest text-xs text-white/40 mb-2">
            {t("pipelineSnapshot")}
          </h3>
          <p className="text-3xl font-black text-white">
            {formatCurrency(totalPipelineValue)}
          </p>
        </div>
        <Link
          href="/forge/pipeline"
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400 hover:text-white transition-colors border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10">
          {t("verPipeline")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full h-auto">
        {validStages.map((stage) => {
          const count = calculateCount(stage);
          const value = calculateTotal(stage);
          const stageLeads = leads
            .filter((l: any) => l.pipeline_status === stage)
            .sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            );

          const displayLeads = stageLeads.slice(0, 2);
          const hasMore = count > 2;

          return (
            <div
              key={stage}
              className="flex-1 bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col min-w-0 hover:border-white/10 hover:bg-white/[0.03] transition-colors">
              {/* Stage Header */}
              <div className="mb-3">
                <span className="uppercase tracking-widest text-xs text-white/40 truncate block">
                  {STAGE_LABELS[stage]}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-white truncate">
                    {count > 0 ? formatCurrency(value) : "$0"}
                  </span>
                  <span className="text-xs text-white/30 font-medium">
                    {count} {count === 1 ? "deal" : "deals"}
                  </span>
                </div>
              </div>

              {/* Mini Deal List */}
              <div className="flex-1 flex flex-col gap-1 mt-2">
                {displayLeads.length > 0 ? (
                  displayLeads.map((l: any) => (
                    <div
                      key={l.id}
                      className="flex justify-between items-center text-xs text-white/50 py-1.5 border-b border-white/5 hover:text-white/70 transition-colors">
                      <span className="truncate pr-2">• {l.name}</span>
                      <span className="shrink-0">
                        {l.estimated_value > 0
                          ? formatCurrency(l.estimated_value)
                          : "---"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center py-2">
                    <span className="text-[10px] text-white/10 uppercase font-mono tracking-widest">
                      Vacío
                    </span>
                  </div>
                )}

                {hasMore && (
                  <Link
                    href="/forge/pipeline"
                    className="text-[10px] text-emerald-500/50 hover:text-emerald-400 py-1.5 transition-colors mt-auto">
                    And {count - 2} more...
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
