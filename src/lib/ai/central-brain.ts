import type { SupabaseClient } from "@supabase/supabase-js";

export type BrainProvider = "anthropic" | "gemini" | "openai";
export type BrainComplexity = "simple" | "medium" | "complex";
export type BrainWorkspaceState = "empty" | "migration" | "active";

type JsonRecord = Record<string, any>;

export type BrainInsight = {
  id: string;
  title: string;
  mensaje: string;
  accion_label: string;
  accion_tipo:
    | "contact_lead"
    | "follow_up"
    | "project_review"
    | "migration_review"
    | "pipeline_cleanup"
    | "setup_crm";
  severity: "high" | "medium" | "low";
  entityType?: "lead" | "proposal" | "project" | "migration" | "workspace";
  entityId?: string;
  href?: string;
  dueLabel?: string;
};

export type BrainSnapshot = {
  workspaceId: string;
  generatedAt: string;
  state: BrainWorkspaceState;
  counts: {
    leads: number;
    proposals: number;
    projects: number;
    migrations: number;
  };
  leads: JsonRecord[];
  proposals: JsonRecord[];
  projects: JsonRecord[];
  migrations: JsonRecord[];
  config: JsonRecord | null;
};

export type BrainRouteDecision = {
  provider: BrainProvider;
  model: string;
  complexity: BrainComplexity;
  reason: string;
  confidence: number;
  requiresClarification: boolean;
  clarificationQuestions: string[];
};

const WRITING_PATTERN =
  /\b(redacta|escribe|draft|write|email|correo|mensaje|reply|respuesta|whatsapp|follow-?up|copy)\b/i;
const COMPLEX_PATTERN =
  /\b(estrategia|strategy|arquitectura|architecture|diagn[oó]stico|diagnosis|forecast|rentabilidad|riesgo|churn|pipeline completo|prioriza|prioritize|score|scoring|segmenta|segment|roadmap|workflow)\b/i;
const SIMPLE_PATTERN =
  /\b(resume|summary|lista|list|muestra|show|dame|give me|qu[eé] sigue|what next|hoy|today|status|estatus)\b/i;
const ENTITY_PATTERN =
  /\b(lead|leads|prospecto|prospectos|cliente|clientes|proyecto|proyectos|propuesta|propuestas|pipeline|crm|migraci[oó]n|migraciones|contrato|workspace)\b/i;
const VAGUE_REFERENCE_PATTERN =
  /\b(esto|eso|aquello|este|ese|esta|esa|rev[ií]salo|anal[ií]zalo|hazlo|arr[eé]glalo)\b/i;

function hoursAgo(timestamp?: string | null) {
  if (!timestamp) return Number.POSITIVE_INFINITY;
  return (Date.now() - new Date(timestamp).getTime()) / 3_600_000;
}

function daysAgo(timestamp?: string | null) {
  return hoursAgo(timestamp) / 24;
}

function isTruthyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function getProviderAvailability() {
  return {
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    gemini: Boolean(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    ),
    openai: Boolean(process.env.OPENAI_API_KEY),
  } as const;
}

function selectFallbackProvider(preferred: BrainProvider): BrainProvider {
  const available = getProviderAvailability();
  if (available[preferred]) return preferred;

  if (preferred === "anthropic") {
    return available.openai ? "openai" : "gemini";
  }

  if (preferred === "openai") {
    return available.gemini ? "gemini" : "anthropic";
  }

  return available.openai ? "openai" : "anthropic";
}

export function getProviderModel(provider: BrainProvider) {
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  }

  if (provider === "openai") {
    return process.env.OPENAI_MODEL || "gpt-4o";
  }

  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

export async function buildBrainSnapshot(
  supabase: SupabaseClient,
  workspaceId: string,
): Promise<BrainSnapshot> {
  const [{ data: leads }, { data: proposals }, { data: projects }, { data: migrations }, { data: config }] =
    await Promise.all([
      supabase
        .from("contact_submissions")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("proposals")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false })
        .limit(150),
      supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false })
        .limit(150),
      supabase
        .from("migrations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("workspace_config")
        .select("*")
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
    ]);

  const leadRows = (leads ?? []) as JsonRecord[];
  const proposalRows = (proposals ?? []) as JsonRecord[];
  const projectRows = (projects ?? []) as JsonRecord[];
  const migrationRows = (migrations ?? []) as JsonRecord[];

  const hasImportedData =
    migrationRows.some((item) => item.status === "completed") &&
    leadRows.length + proposalRows.length + projectRows.length > 0;

  const state: BrainWorkspaceState =
    leadRows.length + proposalRows.length + projectRows.length === 0
      ? "empty"
      : hasImportedData
        ? "migration"
        : "active";

  return {
    workspaceId,
    generatedAt: new Date().toISOString(),
    state,
    counts: {
      leads: leadRows.length,
      proposals: proposalRows.length,
      projects: projectRows.length,
      migrations: migrationRows.length,
    },
    leads: leadRows,
    proposals: proposalRows,
    projects: projectRows,
    migrations: migrationRows,
    config: (config ?? null) as JsonRecord | null,
  };
}

export function generateBrainInsights(snapshot: BrainSnapshot): BrainInsight[] {
  const insights: BrainInsight[] = [];

  if (snapshot.state === "empty") {
    insights.push({
      id: "setup-pipeline",
      title: "Activa el pipeline base",
      mensaje:
        "Tu CRM está vacío. Configura primero etapas de pipeline, tipos de servicio y la primera fuente de captura para que la IA pueda priorizar oportunidades desde el día uno.",
      accion_label: "Configurar CRM",
      accion_tipo: "setup_crm",
      severity: "high",
      entityType: "workspace",
      href: "/settings",
      dueLabel: "Hoy",
    });
    insights.push({
      id: "setup-import",
      title: "Decide si importar o arrancar limpio",
      mensaje:
        "Si ya operabas en otro CRM, importa primero tus leads, propuestas y proyectos. Si empiezas desde cero, crea tu primer lead ideal y una propuesta base para entrenar el contexto operativo del workspace.",
      accion_label: "Ir a migraciones",
      accion_tipo: "migration_review",
      severity: "medium",
      entityType: "workspace",
      href: "/migration/new",
      dueLabel: "Antes de vender",
    });
    return insights;
  }

  const staleUncontactedLead = snapshot.leads
    .filter(
      (lead) =>
        (lead.pipeline_status || "nuevo") === "nuevo" &&
        daysAgo(lead.contacted_at || lead.created_at) >= 1,
    )
    .sort(
      (a, b) =>
        (b.lead_score || 0) - (a.lead_score || 0) ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )[0];

  if (staleUncontactedLead) {
    insights.push({
      id: `lead-${staleUncontactedLead.id}`,
      title: "Lead sin contacto inicial",
      mensaje: `${staleUncontactedLead.name || "Un lead"} sigue en estado nuevo desde hace ${Math.max(1, Math.floor(daysAgo(staleUncontactedLead.created_at)))} día(s). Contacta hoy y define el siguiente paso explícito en el pipeline.`,
      accion_label: "Atender lead",
      accion_tipo: "contact_lead",
      severity: "high",
      entityType: "lead",
      entityId: staleUncontactedLead.id,
      href: "/leads",
      dueLabel: "Hoy",
    });
  }

  const overdueNextActionLead = snapshot.leads
    .filter(
      (lead) =>
        isTruthyString(lead.next_action_date) &&
        new Date(lead.next_action_date).getTime() < Date.now() &&
        !["cerrado", "perdido"].includes((lead.pipeline_status || "").toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(a.next_action_date).getTime() -
        new Date(b.next_action_date).getTime(),
    )[0];

  if (overdueNextActionLead) {
    insights.push({
      id: `followup-${overdueNextActionLead.id}`,
      title: "Siguiente acción vencida",
      mensaje: `La acción pendiente de ${overdueNextActionLead.name || "este lead"} ya venció. Ejecuta el seguimiento prometido y actualiza fecha y resultado para no perder contexto comercial.`,
      accion_label: "Ver pipeline",
      accion_tipo: "follow_up",
      severity: "high",
      entityType: "lead",
      entityId: overdueNextActionLead.id,
      href: "/pipeline",
      dueLabel: "Vencido",
    });
  }

  const stalledProposal = snapshot.proposals
    .filter((proposal) => {
      const status = (proposal.status || "").toLowerCase();
      return ["sent", "viewed"].includes(status) && daysAgo(proposal.updated_at || proposal.created_at) >= 3;
    })
    .sort(
      (a, b) =>
        new Date(a.updated_at || a.created_at).getTime() -
        new Date(b.updated_at || b.created_at).getTime(),
    )[0];

  if (stalledProposal) {
    insights.push({
      id: `proposal-${stalledProposal.id}`,
      title: "Propuesta enfriándose",
      mensaje: `${stalledProposal.title || stalledProposal.proposal_number || "Una propuesta"} lleva más de 72 horas sin avance. Haz follow-up con una pregunta concreta sobre decisión, presupuesto o timing.`,
      accion_label: "Revisar propuestas",
      accion_tipo: "follow_up",
      severity: "medium",
      entityType: "proposal",
      entityId: stalledProposal.id,
      href: "/proposals",
      dueLabel: "En 24h",
    });
  }

  const staleProject = snapshot.projects
    .filter((project) => {
      const status = (project.status || "").toLowerCase();
      return ["active", "in_progress", "paused"].includes(status) && daysAgo(project.updated_at || project.created_at) >= 7;
    })
    .sort(
      (a, b) =>
        new Date(a.updated_at || a.created_at).getTime() -
        new Date(b.updated_at || b.created_at).getTime(),
    )[0];

  if (staleProject) {
    insights.push({
      id: `project-${staleProject.id}`,
      title: "Proyecto sin actualización reciente",
      mensaje: `${staleProject.name || "Un proyecto activo"} no registra movimiento desde hace ${Math.max(7, Math.floor(daysAgo(staleProject.updated_at || staleProject.created_at)))} días. Actualiza estatus, siguiente bloqueo y fecha de entrega para evitar desviaciones.`,
      accion_label: "Revisar proyecto",
      accion_tipo: "project_review",
      severity: "medium",
      entityType: "project",
      entityId: staleProject.id,
      href: "/projects",
      dueLabel: "Esta semana",
    });
  }

  const inFlightMigration = snapshot.migrations.find((migration) =>
    ["pending", "processing"].includes((migration.status || "").toLowerCase()),
  );

  if (inFlightMigration) {
    insights.push({
      id: `migration-${inFlightMigration.id}`,
      title: "Migración en proceso",
      mensaje: `La migración desde ${inFlightMigration.source || "tu CRM anterior"} sigue ${inFlightMigration.status === "processing" ? "procesándose" : "pendiente"}. Revisa el mapeo y prepara una validación comercial apenas termine.`,
      accion_label: "Abrir migración",
      accion_tipo: "migration_review",
      severity: "medium",
      entityType: "migration",
      entityId: inFlightMigration.id,
      href: "/migration",
      dueLabel: "Hoy",
    });
  }

  const migrationNeedsCleanup =
    snapshot.state === "migration" &&
    snapshot.leads.filter((lead) => !isTruthyString(lead.pipeline_status)).length > 0;

  if (migrationNeedsCleanup) {
    insights.push({
      id: "cleanup-imported-pipeline",
      title: "Normaliza estatus importados",
      mensaje:
        "Hay registros importados sin etapa de pipeline definida. Homologa estados y próximos pasos antes de automatizar sugerencias o scoring.",
      accion_label: "Limpiar pipeline",
      accion_tipo: "pipeline_cleanup",
      severity: "high",
      entityType: "workspace",
      href: "/pipeline",
      dueLabel: "Antes de automatizar",
    });
  }

  return insights
    .sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.severity] - priority[b.severity];
    })
    .slice(0, 6);
}

export function buildBrainOverview(snapshot: BrainSnapshot, insights: BrainInsight[]) {
  if (snapshot.state === "empty") {
    return "No hay datos operativos todavía. El cerebro puede ayudarte a configurar el CRM o preparar una migración limpia.";
  }

  if (insights.length === 0) {
    return "El workspace está al día. No detecté leads, propuestas o proyectos con riesgo inmediato.";
  }

  return `${insights.length} foco(s) de atención detectados entre leads, propuestas, proyectos o migraciones.`;
}

export function analyzeClarificationNeed(input: string) {
  const trimmed = input.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const hasEntity = ENTITY_PATTERN.test(trimmed);
  const hasWritingIntent = WRITING_PATTERN.test(trimmed);
  const hasAction = SIMPLE_PATTERN.test(trimmed) || hasWritingIntent || COMPLEX_PATTERN.test(trimmed);
  const vagueReference = VAGUE_REFERENCE_PATTERN.test(trimmed);

  const questions: string[] = [];

  if (wordCount < 4) {
    questions.push("¿Qué entidad del CRM quieres analizar: leads, propuestas, proyectos, clientes o migraciones?");
  }

  if (!hasEntity && !/hoy|today|prioriza|priority|siguiente paso|next step/i.test(trimmed)) {
    questions.push("¿Sobre qué parte del CRM necesitas la respuesta?");
  }

  if (!hasAction) {
    questions.push("¿Qué esperas exactamente: diagnóstico, priorización, redacción, resumen o plan de acción?");
  }

  if (vagueReference) {
    questions.push("Menciona el registro o contexto concreto al que te refieres para evitar una respuesta incorrecta.");
  }

  return {
    requiresClarification: questions.length > 0,
    questions: questions.slice(0, 3),
  };
}

export function routeBrainRequest(input: string): BrainRouteDecision {
  const clarification = analyzeClarificationNeed(input);
  const trimmed = input.trim();
  const approxTokens = Math.ceil(trimmed.length / 4);
  const isComplex = COMPLEX_PATTERN.test(trimmed) || approxTokens > 350;
  const isWritingTask = WRITING_PATTERN.test(trimmed);
  const isSimple = SIMPLE_PATTERN.test(trimmed) && approxTokens < 180 && !isComplex;

  let preferredProvider: BrainProvider = "gemini";
  let complexity: BrainComplexity = "medium";
  let reason = "Consulta operacional balanceada";
  let confidence = 0.8;

  if (isComplex) {
    preferredProvider = "anthropic";
    complexity = "complex";
    reason = "Solicitud con diagnóstico, priorización o razonamiento multi-factor";
    confidence = 0.88;
  } else if (isWritingTask) {
    preferredProvider = "openai";
    complexity = approxTokens > 200 ? "medium" : "simple";
    reason = "Solicitud orientada a redacción y comunicación comercial";
    confidence = 0.83;
  } else if (isSimple) {
    preferredProvider = "gemini";
    complexity = "simple";
    reason = "Consulta rápida de estado o siguiente acción";
    confidence = 0.86;
  }

  const provider = selectFallbackProvider(preferredProvider);

  return {
    provider,
    model: getProviderModel(provider),
    complexity,
    reason,
    confidence,
    requiresClarification: clarification.requiresClarification,
    clarificationQuestions: clarification.questions,
  };
}

export function buildClarificationResponse(questions: string[]) {
  return [
    "Antes de responder necesito afinar el requerimiento para no devolverte una recomendación equivocada.",
    "",
    ...questions.map((question, index) => `${index + 1}. ${question}`),
  ].join("\n");
}

export function buildBrainSystemPrompt(
  snapshot: BrainSnapshot,
  route: BrainRouteDecision,
  insights: BrainInsight[],
) {
  const topLines = insights
    .slice(0, 4)
    .map(
      (insight) =>
        `- ${insight.title}: ${insight.mensaje} Accion sugerida: ${insight.accion_label}.`,
    )
    .join("\n");

  return [
    "Eres el Cerebro Central de Noctra CRM.",
    "No actuas como addon; eres la capa operativa nativa del CRM.",
    "Tu trabajo es interpretar el estado del negocio y responder con recomendaciones accionables, concretas y priorizadas.",
    "Reglas:",
    "- No inventes datos que no existan en el contexto del workspace.",
    "- Si sugieres una accion, di que hacer, sobre que registro y cuando hacerlo.",
    "- Si el workspace esta vacio, enfocate en onboarding operativo y captura inicial de datos.",
    "- Responde en espanol salvo que el usuario escriba claramente en ingles.",
    `Enrutamiento actual: ${route.provider} / ${route.model} / ${route.complexity}.`,
    `Estado del workspace: ${snapshot.state}.`,
    `Conteos: ${snapshot.counts.leads} leads, ${snapshot.counts.proposals} propuestas, ${snapshot.counts.projects} proyectos, ${snapshot.counts.migrations} migraciones.`,
    topLines ? `Focos actuales:\n${topLines}` : "Focos actuales: sin alertas criticas.",
  ].join("\n");
}

