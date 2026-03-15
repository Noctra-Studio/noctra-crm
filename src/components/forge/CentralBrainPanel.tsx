"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Brain,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  PhoneCall,
  RefreshCw,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { readNoctraResponse } from "@/lib/ai/read-noctra-response";
import type { BrainInsight } from "@/lib/ai/central-brain";
import {
  markLeadContacted,
  markProposalLost,
  scheduleLeadFollowUp,
} from "@/app/actions/brain-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type InsightsPayload = {
  state: "empty" | "migration" | "active";
  overview: string;
  counts: {
    leads: number;
    proposals: number;
    projects: number;
    migrations: number;
  };
  insights: BrainInsight[];
};

const quickPrompts = [
  "Prioriza los leads que debo contactar hoy y dime por qué.",
  "Detecta los proyectos con mayor riesgo operativo esta semana.",
  "Redacta un follow-up para la propuesta más estancada.",
];

const providerLabel: Record<string, string> = {
  anthropic: "Anthropic",
  gemini: "Gemini",
  openai: "OpenAI",
};

export function CentralBrainPanel() {
  const [payload, setPayload] = useState<InsightsPayload | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [isRunningPrompt, setIsRunningPrompt] = useState(false);
  const [routeMeta, setRouteMeta] = useState<{
    provider?: string;
    model?: string;
    complexity?: string;
    mode?: string;
  } | null>(null);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await fetch("/api/ai-insights", { cache: "no-store" });
      if (!response.ok) throw new Error("Insights request failed");
      const data = (await response.json()) as InsightsPayload;
      setPayload(data);
    } catch (error) {
      console.error("Failed to fetch insights", error);
      setPayload(null);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const submitPrompt = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    void (async () => {
      try {
        setIsRunningPrompt(true);
        setAnswer("");
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: trimmed }],
          }),
        });

        if (!response.ok) {
          throw new Error("Chat request failed");
        }

        setRouteMeta({
          provider: response.headers.get("x-noctra-provider") || undefined,
          model: response.headers.get("x-noctra-model") || undefined,
          complexity: response.headers.get("x-noctra-complexity") || undefined,
          mode: response.headers.get("x-noctra-mode") || undefined,
        });

        const text = await readNoctraResponse(response, setAnswer);
        if (!text) {
          setAnswer("No pude generar una respuesta para esa solicitud.");
        }
      } catch (error) {
        console.error("Central brain prompt failed", error);
        setRouteMeta(null);
        setAnswer("No pude procesar la consulta en este momento.");
      } finally {
        setIsRunningPrompt(false);
      }
    })();
  };

  const insights = payload?.insights ?? [];
  const hasInsights = insights.length > 0;
  const stateLabel =
    payload?.state === "migration"
      ? "Modo migracion"
      : payload?.state === "empty"
        ? "Modo inicial"
        : "Modo activo";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_32%),linear-gradient(180deg,rgba(7,16,14,0.96),rgba(4,7,7,0.98))] p-6 md:p-7 xl:p-8">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] xl:gap-8">
        <section className="flex h-full flex-col gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-[11px] font-mono uppercase tracking-[0.28em]">
                Cerebro Central
              </span>
            </div>
            <h2 className="max-w-3xl text-xl font-semibold leading-tight text-white md:text-[1.9rem] md:leading-[1.15]">
              IA operativa para entender el CRM y decidir qué sigue.
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-white/60 md:text-base">
              {payload?.overview ||
                "Analiza leads, propuestas, proyectos y migraciones para sugerir acciones accionables desde el primer momento."}
            </p>
          </div>

          <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch xl:gap-6">
            <section className="flex h-full flex-col gap-4">
              <div className="flex items-center gap-2 text-white">
                <Brain className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold">Sugerencias accionables</h3>
              </div>

              {loadingInsights ? (
                <div className="grid gap-3 2xl:grid-cols-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-44 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"
                    />
                  ))}
                </div>
              ) : hasInsights ? (
                <div
                  className={`grid flex-1 auto-rows-fr gap-4 ${
                    insights.length > 1 ? "2xl:grid-cols-2" : ""
                  }`}>
                  {insights.map((insight) => (
                    <article
                      key={insight.id}
                      className="group flex h-full min-h-[260px] flex-col justify-between rounded-[28px] border border-white/8 bg-black/30 p-5 transition hover:border-emerald-500/25 hover:bg-black/40 md:min-h-[320px] md:p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${
                              insight.severity === "high"
                                ? "bg-red-500/10 text-red-300"
                                : insight.severity === "medium"
                                  ? "bg-amber-500/10 text-amber-300"
                                  : "bg-white/10 text-white/65"
                            }`}>
                            {insight.severity}
                          </span>
                          {insight.dueLabel ? (
                            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">
                              {insight.dueLabel}
                            </span>
                          ) : null}
                        </div>
                        <div className="space-y-3">
                          <h4 className="max-w-xl text-[1.65rem] font-semibold leading-tight text-white">
                            {insight.title}
                          </h4>
                          <p className="max-w-2xl text-base leading-8 text-white/65">
                            {insight.mensaje}
                          </p>
                        </div>
                      </div>

                      <InsightActions
                        insight={insight}
                        onActionComplete={fetchInsights}
                      />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-black/20 p-6 text-sm text-white/55">
                  No hay alertas activas. El CRM luce estable.
                </div>
              )}
            </section>

            <aside className="space-y-4 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 md:p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/45">
                    Pulso operativo
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-white/55">
                    {stateLabel}
                  </span>
                </div>
                <p className="text-sm leading-6 text-white/60">
                  Señales en vivo para decidir qué atender ahora sin perder el
                  contexto del workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricBadge label="Leads" value={payload?.counts.leads ?? "—"} />
                <MetricBadge
                  label="Propuestas"
                  value={payload?.counts.proposals ?? "—"}
                />
                <MetricBadge
                  label="Proyectos"
                  value={payload?.counts.projects ?? "—"}
                />
                <MetricBadge
                  label="Migraciones"
                  value={payload?.counts.migrations ?? "—"}
                />
              </div>

              <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-emerald-300/75">
                  Prioridad sugerida
                </p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  {hasInsights
                    ? "Empieza por la alerta de mayor severidad y luego usa la consulta natural para pedir el siguiente paso."
                    : "No hay fricciones detectadas. Usa la consulta natural para explorar pipeline, seguimiento o riesgos."}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchInsights}
                disabled={loadingInsights}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
                {loadingInsights ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Actualizar señales
              </button>
            </aside>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/8 bg-black/35 p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/45">
                Consulta natural
              </p>
              <h3 className="mt-2 max-w-md text-[1.9rem] font-semibold leading-tight text-white">
                Pídele contexto, prioridades o redacción.
              </h3>
            </div>

            {routeMeta?.provider ? (
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-white/65">
                {providerLabel[routeMeta.provider] || routeMeta.provider}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitPrompt(input);
            }}
            className="space-y-4">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ej. Prioriza los leads que debo contactar hoy y redacta el primer mensaje para el más urgente."
              rows={4}
              className="min-h-[152px] w-full resize-none rounded-[24px] border border-white/10 bg-[#060908] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500/35"
            />

            <div className="space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/35">
                Atajos sugeridos
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      submitPrompt(prompt);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isRunningPrompt || !input.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40">
              {isRunningPrompt ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Ejecutar consulta
            </button>
          </form>

          <div className="mt-5 rounded-[24px] border border-white/8 bg-[#050505] p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/40">
                Respuesta del cerebro
              </span>
              {routeMeta?.complexity ? (
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    routeMeta.mode === "clarification"
                      ? "bg-amber-500/10 text-amber-300"
                      : "bg-emerald-500/10 text-emerald-300"
                  }`}>
                  {routeMeta.mode === "clarification"
                    ? "Necesita aclaración"
                    : routeMeta.complexity}
                </span>
              ) : null}
            </div>

            {answer ? (
              <div
                className={`whitespace-pre-wrap text-sm leading-7 ${
                  routeMeta?.mode === "clarification"
                    ? "text-amber-100/85"
                    : "text-white/75"
                }`}>
                {routeMeta?.mode === "clarification" ? (
                  <div className="mb-3 flex items-center gap-2 text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Antes de responder
                    </span>
                  </div>
                ) : null}
                {answer}
              </div>
            ) : (
              <p className="text-sm leading-7 text-white/35">
                Aquí verás la respuesta contextual del CRM. Si la petición no es
                clara, la IA pedirá precisión antes de generar una recomendación.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

type InsightActionDef = {
  label: string;
  icon: typeof ChevronRight;
  handler: "navigate" | "markContacted" | "scheduleFollowUp" | "markLost";
  href?: string;
};

function getInsightActions(insight: BrainInsight): InsightActionDef[] {
  const { accion_tipo, entityType, href } = insight;

  if (entityType === "lead" && accion_tipo === "contact_lead") {
    return [
      { label: "Contactar lead", icon: PhoneCall, handler: "markContacted" },
      { label: "Programar seguimiento", icon: Calendar, handler: "scheduleFollowUp" },
      { label: "Ver en pipeline", icon: ExternalLink, handler: "navigate", href: "/pipeline" },
    ];
  }

  if (entityType === "lead" && accion_tipo === "follow_up") {
    return [
      { label: "Ver en pipeline", icon: ExternalLink, handler: "navigate", href: "/pipeline" },
      { label: "Marcar contactado", icon: Check, handler: "markContacted" },
      { label: "Programar seguimiento", icon: Calendar, handler: "scheduleFollowUp" },
    ];
  }

  if (entityType === "proposal" && accion_tipo === "follow_up") {
    return [
      { label: "Abrir propuesta", icon: ExternalLink, handler: "navigate", href: "/proposals" },
      { label: "Programar recordatorio", icon: Calendar, handler: "scheduleFollowUp" },
      { label: "Marcar como perdida", icon: XCircle, handler: "markLost" },
    ];
  }

  if (entityType === "project") {
    return [
      { label: "Revisar proyecto", icon: ExternalLink, handler: "navigate", href: "/projects" },
    ];
  }

  if (href) {
    return [{ label: insight.accion_label, icon: ChevronRight, handler: "navigate", href }];
  }

  return [];
}

function InsightActions({
  insight,
  onActionComplete,
}: {
  insight: BrainInsight;
  onActionComplete: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [completedAction, setCompletedAction] = useState<string | null>(null);

  const actions = getInsightActions(insight);
  if (actions.length === 0) {
    return (
      <div className="mt-6">
        <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-xs font-semibold text-white/65">
          {insight.accion_label}
        </span>
      </div>
    );
  }

  const [primary, ...secondary] = actions;

  const executeAction = (action: InsightActionDef) => {
    if (action.handler === "navigate") {
      router.push(action.href || insight.href || "/");
      return;
    }

    startTransition(async () => {
      let result: { success: boolean } = { success: false };

      if (action.handler === "markContacted" && insight.entityId) {
        result = await markLeadContacted(insight.entityId);
      } else if (action.handler === "scheduleFollowUp" && insight.entityId) {
        result = await scheduleLeadFollowUp(insight.entityId, 1);
      } else if (action.handler === "markLost" && insight.entityId) {
        result = await markProposalLost(insight.entityId);
      }

      if (result.success) {
        setCompletedAction(action.label);
        setTimeout(() => {
          setCompletedAction(null);
          onActionComplete();
        }, 1500);
      }
    });
  };

  if (completedAction) {
    return (
      <div className="mt-6">
        <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 px-5 py-3 text-xs font-semibold text-emerald-300">
          <Check className="h-3.5 w-3.5" />
          {completedAction}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-6 flex items-center gap-2">
      <button
        type="button"
        onClick={() => executeAction(primary)}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-emerald-400 disabled:opacity-50">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <primary.icon className="h-3.5 w-3.5" />
        )}
        {primary.label}
      </button>

      {secondary.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={isPending}
              className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/65 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-50">
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[200px] rounded-xl border border-white/10 bg-[#111111] p-1"
          >
            {secondary.map((action) => (
              <DropdownMenuItem
                key={action.label}
                onClick={() => executeAction(action)}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-white/75 hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white"
              >
                <action.icon className="h-3.5 w-3.5 text-white/45" />
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function MetricBadge({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left">
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/35">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold leading-none text-white">
        {value}
      </div>
    </div>
  );
}
