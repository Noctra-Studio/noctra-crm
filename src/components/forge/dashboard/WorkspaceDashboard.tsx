"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvidedDragHandleProps,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  addDays,
  differenceInDays,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  subDays,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Globe,
  GripVertical,
  Kanban,
  PenTool,
  Settings2,
  TrendingUp,
  Users,
} from "lucide-react";

import { useFollowUps } from "@/hooks/useFollowUps";
import { cn } from "@/lib/utils";
import {
  type DashboardMetricsTimeframe,
  type DashboardPipelineFilter,
  type DashboardPresetKey,
  type DashboardWidgetKey,
  type DashboardWidgetState,
  DASHBOARD_PRESETS,
  DASHBOARD_WIDGET_KEYS,
  DASHBOARD_WIDGET_MAP,
  getPresetWidgetState,
  normalizeDashboardWidgetState,
  PRODUCT_DEFAULT_PRESET,
} from "@/lib/dashboard/preferences";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CentralBrainPanel } from "@/components/forge/CentralBrainPanel";
import { EarlyAccessWidget } from "@/components/forge/EarlyAccessWidget";
import type { ActivityFeedItem } from "@/lib/activity";
import type {
  WorkspaceDashboardContract,
  WorkspaceDashboardData,
  WorkspaceDashboardLead,
  WorkspaceDashboardProject,
  WorkspaceDashboardProposal,
} from "@/types/forge-dashboard";
import { saveDashboardPreferences } from "@/app/actions/dashboard-preferences";

type WidgetLabelMap = Record<DashboardWidgetKey, string>;
type ActivityFilterValue =
  | "all"
  | "lead"
  | "proposal"
  | "project"
  | "contract"
  | "migration";

const KPI_WIDGETS: DashboardWidgetKey[] = [
  "leads_this_month",
  "active_proposals",
  "projects_in_progress",
  "revenue_forecast",
];

const ACTIVITY_FILTER_OPTIONS = [
  { value: "all", label: "allActivity" },
  { value: "lead", label: "leads" },
  { value: "proposal", label: "proposals" },
  { value: "project", label: "projects" },
  { value: "contract", label: "contracts" },
] as const;

const PIPELINE_FILTER_OPTIONS = [
  { value: "all", label: "pipelineAll" },
  { value: "early", label: "pipelineEarly" },
  { value: "closing", label: "pipelineClosing" },
] as const;

const TIMEFRAME_OPTIONS = [
  { value: "7d", label: "timeframe7d" },
  { value: "30d", label: "timeframe30d" },
  { value: "90d", label: "timeframe90d" },
] as const;

export default function WorkspaceDashboard({
  initialData,
}: {
  initialData: WorkspaceDashboardData;
}) {
  const t = useTranslations("forge.dashboard");
  const { suggestions } = useFollowUps();
  const [widgets, setWidgets] = useState(() =>
    normalizeDashboardWidgetState(initialData.widgetPreferences),
  );
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [isPending, startTransition] = useTransition();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef = useRef(serializeWidgetState(initialData.widgetPreferences));

  useEffect(() => {
    setWidgets(normalizeDashboardWidgetState(initialData.widgetPreferences));
    lastCommittedRef.current = serializeWidgetState(initialData.widgetPreferences);
  }, [initialData.widgetPreferences]);

  useEffect(() => {
    const signature = serializeWidgetState(widgets);

    if (signature === lastCommittedRef.current) {
      return;
    }

    setSaveState("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const nextWidgets = normalizeDashboardWidgetState(widgets);
      startTransition(async () => {
        try {
          const persisted = await saveDashboardPreferences({
            widgets: nextWidgets,
          });
          lastCommittedRef.current = serializeWidgetState(persisted);
          setWidgets((current) => {
            const currentSignature = serializeWidgetState(current);
            const persistedSignature = serializeWidgetState(persisted);
            return currentSignature === persistedSignature ? current : persisted;
          });
          setSaveState("saved");
        } catch (error) {
          console.error("[WorkspaceDashboard] save preferences failed", error);
          setSaveState("error");
        }
      });
    }, 450);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [initialData.locale, widgets, startTransition]);

  useEffect(() => {
    if (saveState !== "saved") {
      return;
    }

    const timeout = window.setTimeout(() => setSaveState("idle"), 1600);
    return () => window.clearTimeout(timeout);
  }, [saveState]);

  const widgetLabels = useMemo<WidgetLabelMap>(
    () => ({
      leads_this_month: t("leadsEsteMes"),
      active_proposals: t("propuestasActivas"),
      projects_in_progress: t("proyectosEnCurso"),
      revenue_forecast: t("forecastIngresos"),
      ai_insights: t("aiInsights"),
      recent_activity: t("actividadReciente"),
      metrics: t("metricsTitle"),
      pipeline_snapshot: t("pipelineSnapshot"),
    }),
    [t],
  );

  const visibleWidgets = widgets.filter((widget) => widget.visible);
  const hiddenCount = widgets.length - visibleWidgets.length;

  const dashboardSummary = useMemo(
    () => buildDashboardSummary(initialData),
    [initialData],
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    setWidgets((current) => {
      const visible = current.filter((widget) => widget.visible);
      const hidden = current.filter((widget) => !widget.visible);
      const reorderedVisible = reorderList(
        visible,
        result.source.index,
        result.destination!.index,
      );
      return normalizeDashboardWidgetState([...reorderedVisible, ...hidden]);
    });
  };

  const updateWidget = (
    widgetKey: DashboardWidgetKey,
    updater: (widget: DashboardWidgetState) => DashboardWidgetState,
  ) => {
    setWidgets((current) =>
      normalizeDashboardWidgetState(
        current.map((widget) =>
          widget.widgetKey === widgetKey ? updater(widget) : widget,
        ),
      ),
    );
  };

  const handleVisibilityChange = (
    widgetKey: DashboardWidgetKey,
    visible: boolean,
  ) => {
    setWidgets((current) => {
      const next = current.map((widget) =>
        widget.widgetKey === widgetKey ? { ...widget, visible } : widget,
      );
      const visibleWidgets = next.filter((widget) => widget.visible);
      const hiddenWidgets = next.filter((widget) => !widget.visible);
      return normalizeDashboardWidgetState([...visibleWidgets, ...hiddenWidgets]);
    });
  };

  const handleSizeChange = (
    widgetKey: DashboardWidgetKey,
    sizeVariant: DashboardWidgetState["sizeVariant"],
  ) => {
    updateWidget(widgetKey, (widget) => ({
      ...widget,
      sizeVariant,
    }));
  };

  const handleActivityPreferenceChange = (
    widgetKey: "recent_activity",
    partial: Partial<{
      type: ActivityFilterValue;
      sort: "newest" | "oldest";
    }>,
  ) => {
    updateWidget(widgetKey, (widget) => ({
      ...widget,
      preferences: {
        ...(widget.preferences as {
          type: ActivityFilterValue;
          sort: "newest" | "oldest";
        }),
        ...partial,
      } as {
        type: ActivityFilterValue;
        sort: "newest" | "oldest";
      },
    }));
  };

  const handleMetricsTimeframeChange = (
    widgetKey: "metrics",
    timeframe: DashboardMetricsTimeframe,
  ) => {
    updateWidget(widgetKey, (widget) => ({
      ...widget,
      preferences: {
        ...(widget.preferences as { timeframe: DashboardMetricsTimeframe }),
        timeframe,
      } as { timeframe: DashboardMetricsTimeframe },
    }));
  };

  const handlePipelineFilterChange = (
    widgetKey: "pipeline_snapshot",
    filter: DashboardPipelineFilter,
  ) => {
    updateWidget(widgetKey, (widget) => ({
      ...widget,
      preferences: {
        ...(widget.preferences as { filter: DashboardPipelineFilter }),
        filter,
      } as { filter: DashboardPipelineFilter },
    }));
  };

  const applyPresetLocally = (presetKey: DashboardPresetKey) => {
    setWidgets(getPresetWidgetState(presetKey));
    setIsCustomizeMode(true);
  };

  const restoreDefaultLocally = () => {
    setWidgets(getPresetWidgetState(PRODUCT_DEFAULT_PRESET));
    setIsCustomizeMode(true);
  };

  const renderWidget = (widget: DashboardWidgetState) => {
    switch (widget.widgetKey) {
      case "leads_this_month":
        return (
          <LeadsThisMonthWidget
            summary={dashboardSummary}
            t={t}
          />
        );
      case "active_proposals":
        return (
          <ActiveProposalsWidget
            summary={dashboardSummary}
            t={t}
          />
        );
      case "projects_in_progress":
        return (
          <ProjectsInProgressWidget
            summary={dashboardSummary}
            t={t}
          />
        );
      case "revenue_forecast":
        return (
          <RevenueForecastWidget
            summary={dashboardSummary}
            t={t}
          />
        );
      case "ai_insights":
        return (
          <AiInsightsWidget
            enabled={initialData.canUseCentralBrain}
            t={t}
          />
        );
      case "recent_activity":
        return (
          <RecentActivityWidget
            activityFeed={initialData.activityFeed}
            preferences={widget.preferences as {
              type: ActivityFilterValue;
              sort: "newest" | "oldest";
            }}
            onChange={(partial) =>
              handleActivityPreferenceChange("recent_activity", partial)
            }
            t={t}
          />
        );
      case "metrics":
        return (
          <MetricsWidget
            data={initialData}
            timeframe={(widget.preferences as { timeframe: DashboardMetricsTimeframe })
              .timeframe}
            onTimeframeChange={(timeframe) =>
              handleMetricsTimeframeChange("metrics", timeframe)
            }
            t={t}
          />
        );
      case "pipeline_snapshot":
        return (
          <PipelineSnapshotWidget
            leads={initialData.leads}
            filter={(widget.preferences as { filter: DashboardPipelineFilter }).filter}
            onFilterChange={(filter) =>
              handlePipelineFilterChange("pipeline_snapshot", filter)
            }
            t={t}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 transition-all duration-200 min-h-full relative w-full">
      <div className="mobile-safe-x w-full flex-1 space-y-6 py-6 sm:px-6 lg:px-8 overflow-x-clip">
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
              href="/pipeline"
              className="px-4 py-2 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all text-center rounded-md"
            >
              {t("verDetalle")}
            </Link>
          </div>
        )}

        {initialData.isTrial && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group animate-in slide-in-from-top-4 duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {t("trialBannerTitle")}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                  {t("trialBannerDescription")}
                </p>
              </div>
            </div>
            <Link
              href="/settings/billing"
              className="relative z-10 px-6 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all text-center rounded-lg flex items-center justify-center gap-2 group/btn"
            >
              {t("trialBannerCta")}
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        <DashboardCustomizationBar
          hiddenCount={hiddenCount}
          isCustomizeMode={isCustomizeMode}
          labels={widgetLabels}
          saveState={saveState}
          widgets={widgets}
          onApplyPreset={applyPresetLocally}
          onRestoreDefault={restoreDefaultLocally}
          onToggleCustomize={() => setIsCustomizeMode((current) => !current)}
          onVisibilityChange={handleVisibilityChange}
          t={t}
        />

        {isCustomizeMode && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-neutral-400">
            {t("customizeHelp")}
          </div>
        )}

        <AlertsRow
          contracts={initialData.contracts}
          leads={initialData.leads}
          proposals={initialData.proposals}
        />

        {initialData.isTrial && (
          <div className="mt-2">
            <EarlyAccessWidget />
          </div>
        )}

        {visibleWidgets.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] text-white/60">
              <Settings2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {t("allWidgetsHiddenTitle")}
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              {t("allWidgetsHiddenDescription")}
            </p>
            <button
              onClick={restoreDefaultLocally}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-100"
            >
              {t("restoreDefault")}
            </button>
          </div>
        ) : isCustomizeMode ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="workspace-dashboard-widgets">
              {(dropProvided) => (
                <div
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                  className="grid grid-cols-1 gap-6 auto-rows-[minmax(180px,auto)] lg:grid-cols-6 xl:grid-cols-12"
                >
                  {visibleWidgets.map((widget, index) => (
                    <Draggable
                      key={widget.widgetKey}
                      draggableId={widget.widgetKey}
                      index={index}
                    >
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          style={dragProvided.draggableProps.style}
                          className={cn(
                            getWidgetGridClass(widget),
                            snapshot.isDragging &&
                              "z-30 rotate-[0.6deg] scale-[1.01] opacity-95",
                          )}
                        >
                          <WidgetChrome
                            dragHandleProps={dragProvided.dragHandleProps}
                            isCustomizeMode
                            title={widgetLabels[widget.widgetKey]}
                            widget={widget}
                            onSizeChange={handleSizeChange}
                            t={t}
                          >
                            {renderWidget(widget)}
                          </WidgetChrome>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="grid grid-cols-1 gap-6 auto-rows-[minmax(180px,auto)] lg:grid-cols-6 xl:grid-cols-12">
            {visibleWidgets.map((widget) => (
              <div
                key={widget.widgetKey}
                className={getWidgetGridClass(widget)}
              >
                <WidgetChrome
                  dragHandleProps={undefined}
                  isCustomizeMode={false}
                  title={widgetLabels[widget.widgetKey]}
                  widget={widget}
                  onSizeChange={handleSizeChange}
                  t={t}
                >
                  {renderWidget(widget)}
                </WidgetChrome>
              </div>
            ))}
          </div>
        )}

        {(saveState === "saving" || isPending) && (
          <div className="pb-2 text-[11px] font-mono uppercase tracking-[0.24em] text-neutral-500">
            {t("savingLayout")}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardCustomizationBar({
  widgets,
  labels,
  hiddenCount,
  isCustomizeMode,
  saveState,
  onToggleCustomize,
  onVisibilityChange,
  onApplyPreset,
  onRestoreDefault,
  t,
}: {
  widgets: DashboardWidgetState[];
  labels: WidgetLabelMap;
  hiddenCount: number;
  isCustomizeMode: boolean;
  saveState: "idle" | "saving" | "saved" | "error";
  onToggleCustomize: () => void;
  onVisibilityChange: (
    widgetKey: DashboardWidgetKey,
    visible: boolean,
  ) => void;
  onApplyPreset: (presetKey: DashboardPresetKey) => void;
  onRestoreDefault: () => void;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[10px] font-mono uppercase tracking-[0.38em] text-neutral-500">
          {t("workspaceOverviewEyebrow")}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-2xl font-black tracking-tight text-white">
            {t("workspaceOverviewTitle")}
          </p>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-neutral-400">
            {hiddenCount > 0
              ? t("hiddenWidgetsCount", { count: hiddenCount })
              : t("allWidgetsVisible")}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {saveState === "saved" && (
          <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-emerald-400">
            {t("layoutSaved")}
          </span>
        )}
        {saveState === "error" && (
          <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-red-400">
            {t("layoutSaveError")}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06]">
              <Settings2 className="h-4 w-4" />
              {t("manageWidgets")}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-80 border-white/10 bg-[#111111] text-white shadow-2xl"
            align="end"
          >
            <DropdownMenuLabel>{t("showHideWidgets")}</DropdownMenuLabel>
            {widgets.map((widget) => (
              <DropdownMenuCheckboxItem
                key={widget.widgetKey}
                checked={widget.visible}
                onCheckedChange={(checked) =>
                  onVisibilityChange(widget.widgetKey, checked === true)
                }
                className="focus:bg-white/5 focus:text-white"
              >
                {labels[widget.widgetKey]}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="focus:bg-white/5 focus:text-white">
                {t("applyPreset")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64 border-white/10 bg-[#111111] text-white">
                {(
                  Object.entries(DASHBOARD_PRESETS) as Array<
                    [DashboardPresetKey, (typeof DASHBOARD_PRESETS)[DashboardPresetKey]]
                  >
                ).map(([presetKey, preset]) => (
                  <DropdownMenuItem
                    key={presetKey}
                    onSelect={() => onApplyPreset(presetKey)}
                    className="focus:bg-white/5 focus:text-white"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{preset.label}</span>
                      <span className="text-xs text-neutral-500">
                        {preset.description}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onSelect={onRestoreDefault}
              className="focus:bg-white/5 focus:text-white"
            >
              {t("restoreDefault")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={onToggleCustomize}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
            isCustomizeMode
              ? "bg-white text-black hover:bg-neutral-100"
              : "border border-white/10 bg-transparent text-white hover:border-white/20 hover:bg-white/[0.03]",
          )}
        >
          <GripVertical className="h-4 w-4" />
          {isCustomizeMode ? t("doneCustomizing") : t("customizeDashboard")}
        </button>
      </div>
    </div>
  );
}

function WidgetChrome({
  children,
  widget,
  title,
  isCustomizeMode,
  dragHandleProps,
  onSizeChange,
  t,
}: {
  children: React.ReactNode;
  widget: DashboardWidgetState;
  title: string;
  isCustomizeMode: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  onSizeChange: (
    widgetKey: DashboardWidgetKey,
    sizeVariant: DashboardWidgetState["sizeVariant"],
  ) => void;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  const definition = DASHBOARD_WIDGET_MAP[widget.widgetKey];

  return (
    <div className="relative h-full">
      {isCustomizeMode && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between">
          <div
            {...dragHandleProps}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.24em] text-neutral-300 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
            {title}
          </div>

          {definition.supportedSizes.length > 1 && (
            <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/80 p-1">
              {definition.supportedSizes.map((sizeVariant) => (
                <button
                  key={sizeVariant}
                  onClick={() => onSizeChange(widget.widgetKey, sizeVariant)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] transition",
                    widget.sizeVariant === sizeVariant
                      ? "bg-white text-black"
                      : "text-neutral-400 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {t(sizeVariant)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={cn(isCustomizeMode && "pt-8")}>{children}</div>
    </div>
  );
}

function LeadsThisMonthWidget({
  summary,
  t,
}: {
  summary: ReturnType<typeof buildDashboardSummary>;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  const leadDelta = summary.leadsThisMonth - summary.leadsLastMonth;
  return (
    <KpiCard
      label={t("leadsEsteMes")}
      value={summary.leadsThisMonth.toString()}
      subtext={`${leadDelta > 0 ? "▲ +" : leadDelta < 0 ? "▼ " : ""}${leadDelta} ${t("vsMesAnterior")}`}
      subtextColor={
        leadDelta > 0
          ? "text-emerald-400"
          : leadDelta < 0
            ? "text-red-400"
            : "text-neutral-500"
      }
      color={leadDelta >= 0 ? "#10b981" : "#ef4444"}
      link="/leads"
      sparklineData={summary.dummyTrendLeads}
    />
  );
}

function ActiveProposalsWidget({
  summary,
  t,
}: {
  summary: ReturnType<typeof buildDashboardSummary>;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  return (
    <KpiCard
      label={t("propuestasActivas")}
      value={summary.activeProposals.length.toString()}
      subtext={`${formatDashboardCurrency(summary.activeProposalsValue)} ${t("mxnAcumulado")}`}
      color="#10b981"
      link="/proposals"
      sparklineData={summary.dummyTrendProposals}
    />
  );
}

function ProjectsInProgressWidget({
  summary,
  t,
}: {
  summary: ReturnType<typeof buildDashboardSummary>;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  return (
    <div className="bg-[#111111] border border-neutral-900 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-150 p-6 flex h-full flex-col justify-between relative group rounded-xl min-h-[180px]">
      <span className="text-sm font-medium text-white/60 mb-2">
        {t("proyectosEnCurso")}
      </span>
      <div className="text-3xl font-black text-white">
        {summary.ongoingProjects.length}
      </div>
      <div className="text-xs text-neutral-500 mt-2">
        {summary.ongoingProjects.length > 0
          ? t("projectLoadSummary", { count: summary.ongoingProjects.length })
          : t("noProjectsInProgress")}
      </div>

      <div className="flex justify-end mt-auto pt-4">
        <Link
          href="/projects"
          className="text-xs font-medium text-white/30 hover:text-white/60 transition-colors"
        >
          {t("verDetalles")} →
        </Link>
      </div>

      <div className="absolute inset-0 bg-[#111111] p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center overflow-hidden z-20 overflow-y-auto rounded-xl">
        {summary.ongoingProjects.length === 0 ? (
          <span className="text-xs text-neutral-500">{t("noProjectsInProgress")}</span>
        ) : (
          summary.ongoingProjects.map((project) => (
            <p
              key={project.id}
              className="text-[10px] font-mono uppercase text-emerald-400 truncate w-full mb-1"
            >
              • {project.name || t("untitledProject")}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

function RevenueForecastWidget({
  summary,
  t,
}: {
  summary: ReturnType<typeof buildDashboardSummary>;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  return (
    <KpiCard
      label={t("forecastIngresos")}
      value={formatDashboardCurrency(summary.forecast.total)}
      subtext={t("proyeccionPonderada")}
      valueColor="text-emerald-500"
      color="#10b981"
      link="/metrics"
      sparklineData={[
        Math.max(summary.forecast.confirmed * 0.2, 1000),
        Math.max(summary.forecast.confirmed * 0.35, 2000),
        Math.max(summary.forecast.probable * 0.45, 2500),
        Math.max(summary.forecast.probable * 0.7, 3200),
        Math.max(summary.forecast.possible * 0.9, 3800),
        Math.max(summary.forecast.total * 0.82, 4500),
        Math.max(summary.forecast.total, 5500),
      ]}
      isForecast
    />
  );
}

function AiInsightsWidget({
  enabled,
  t,
}: {
  enabled: boolean;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  if (!enabled) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#111111] p-8">
        <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-white/60">
            <Activity className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">{t("aiInsights")}</h3>
          <p className="mt-2 max-w-md text-sm text-neutral-400">
            {t("aiInsightsUnavailable")}
          </p>
        </div>
      </div>
    );
  }

  return <CentralBrainPanel />;
}

function RecentActivityWidget({
  activityFeed,
  preferences,
  onChange,
  t,
}: {
  activityFeed: ActivityFeedItem[];
  preferences: {
    type: ActivityFilterValue;
    sort: "newest" | "oldest";
  };
  onChange: (
    partial: Partial<{ type: ActivityFilterValue; sort: "newest" | "oldest" }>,
  ) => void;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const filteredFeed = useMemo(() => {
    const byType =
      localPreferences.type === "all"
        ? activityFeed
        : activityFeed.filter((item) => item.entityType === localPreferences.type);

    return [...byType].sort((left, right) => {
      const leftDate = new Date(left.createdAt).getTime();
      const rightDate = new Date(right.createdAt).getTime();
      return localPreferences.sort === "newest"
        ? rightDate - leftDate
        : leftDate - rightDate;
    });
  }, [activityFeed, localPreferences.sort, localPreferences.type]);

  return (
    <div className="bg-[#111111] border border-neutral-900 flex flex-col h-full rounded-xl">
      <div className="p-6 md:p-8 flex-none border-b border-neutral-900 bg-[#0a0a0a] rounded-t-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h3 className="text-sm font-medium text-white/50">
            {t("actividadReciente")}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
              {ACTIVITY_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setLocalPreferences((current) => ({
                      ...current,
                      type: option.value,
                    }));
                    onChange({
                      type: option.value,
                    });
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] transition",
                    localPreferences.type === option.value
                      ? "bg-white text-black"
                      : "text-neutral-400 hover:text-white",
                  )}
                >
                  {t(option.label)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const nextSort =
                  localPreferences.sort === "newest" ? "oldest" : "newest";
                setLocalPreferences((current) => ({
                  ...current,
                  sort: nextSort,
                }));
                onChange({
                  sort: nextSort,
                });
              }}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-300 transition hover:border-white/20 hover:text-white"
            >
              {localPreferences.sort === "newest"
                ? t("sortNewest")
                : t("sortOldest")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[340px] overflow-y-auto p-4 md:p-6 flex flex-col forge-scroll">
        {filteredFeed.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
            <Activity className="w-6 h-6 text-white/10" />
            <p className="text-xs font-medium text-white/20">
              {t("noRecentActivity")}
            </p>
            <Link
              href="/leads?new=lead"
              className="mt-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/40 transition-all hover:border-white/20 hover:text-white/60"
            >
              {t("createFirstRecord")}
            </Link>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-1">
            {filteredFeed.map((event) => {
              const eventStyles = getEventStyles(event.entityType);
              const EventIcon = eventStyles.icon;

              return (
                <Link
                  key={event.id}
                  href={event.href}
                  className="flex gap-4 group hover:bg-white/[0.04] rounded-lg cursor-pointer transition-colors p-3 w-full items-center"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      eventStyles.bg,
                    )}
                  >
                    <EventIcon className={cn("w-3.5 h-3.5", eventStyles.color)} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 justify-center">
                    <span className="text-xs font-medium text-neutral-200 group-hover:text-emerald-400 transition-colors truncate">
                      {event.title}
                    </span>
                    {event.description && (
                      <span className="mt-0.5 truncate text-[11px] text-white/35">
                        {event.description}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5">
                      {differenceInDays(new Date(), new Date(event.createdAt)) === 0
                        ? t("today")
                        : t("daysAgo", {
                            count: differenceInDays(
                              new Date(),
                              new Date(event.createdAt),
                            ),
                          })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricsWidget({
  data,
  timeframe,
  onTimeframeChange,
  t,
}: {
  data: WorkspaceDashboardData;
  timeframe: DashboardMetricsTimeframe;
  onTimeframeChange: (timeframe: DashboardMetricsTimeframe) => void;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  const [localTimeframe, setLocalTimeframe] = useState(timeframe);

  useEffect(() => {
    setLocalTimeframe(timeframe);
  }, [timeframe]);

  const metrics = useMemo(() => {
    const now = new Date();
    const windowStart =
      localTimeframe === "7d"
        ? subDays(now, 7)
        : localTimeframe === "30d"
          ? subDays(now, 30)
          : subDays(now, 90);

    const leadsInWindow = data.leads.filter((lead) =>
      isAfter(new Date(lead.created_at), windowStart),
    );
    const proposalsInWindow = data.proposals.filter((proposal) =>
      isAfter(new Date(proposal.created_at), windowStart),
    );
    const activeProjects = data.projects.filter(isProjectInProgress);
    const closedLeads = data.leads.filter(
      (lead) =>
        lead.pipeline_status === "cerrado" &&
        lead.closed_at &&
        isAfter(new Date(lead.closed_at), windowStart),
    );

    const pipelineValue = leadsInWindow.reduce(
      (sum, lead) => sum + (lead.estimated_value || 0),
      0,
    );
    const winRate =
      leadsInWindow.length > 0
        ? Math.round((closedLeads.length / leadsInWindow.length) * 100)
        : 0;
    const proposalValue = proposalsInWindow.reduce(
      (sum, proposal) => sum + (proposal.total || 0),
      0,
    );

    return {
      leadsInWindow,
      proposalsInWindow,
      pipelineValue,
      proposalValue,
      activeProjects,
      winRate,
    };
  }, [data.leads, data.projects, data.proposals, localTimeframe]);

  return (
    <div className="bg-[#111111] border border-neutral-900 rounded-xl h-full flex flex-col">
      <div className="border-b border-neutral-900 bg-[#0a0a0a] px-6 py-5 rounded-t-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-sm font-medium text-white/60">{t("metricsTitle")}</h3>
            <p className="mt-1 text-xs text-neutral-500">
              {t("metricsSubtitle")}
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
            {TIMEFRAME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const nextTimeframe =
                    option.value as DashboardMetricsTimeframe;
                  setLocalTimeframe(nextTimeframe);
                  onTimeframeChange(nextTimeframe);
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] transition",
                  localTimeframe === option.value
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white",
                )}
              >
                {t(option.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-px bg-white/5 sm:grid-cols-2">
        <MetricCell
          label={t("metricsWindowLeads")}
          value={metrics.leadsInWindow.length.toString()}
          helper={t("metricsWindowLeadsHelper")}
        />
        <MetricCell
          label={t("metricsPipelineValue")}
          value={formatDashboardCurrency(metrics.pipelineValue)}
          helper={t("metricsPipelineValueHelper")}
        />
        <MetricCell
          label={t("metricsProposalValue")}
          value={formatDashboardCurrency(metrics.proposalValue)}
          helper={t("metricsProposalValueHelper", {
            count: metrics.proposalsInWindow.length,
          })}
        />
        <MetricCell
          label={t("metricsWinRate")}
          value={`${metrics.winRate}%`}
          helper={t("metricsWinRateHelper", {
            count: metrics.activeProjects.length,
          })}
        />
      </div>

      <div className="border-t border-neutral-900 px-6 py-4 text-right">
        <Link
          href="/metrics"
          className="text-xs font-medium text-white/30 hover:text-white/60 transition-colors"
        >
          {t("verDetalles")} →
        </Link>
      </div>
    </div>
  );
}

function PipelineSnapshotWidget({
  leads,
  filter,
  onFilterChange,
  t,
}: {
  leads: WorkspaceDashboardLead[];
  filter: DashboardPipelineFilter;
  onFilterChange: (filter: DashboardPipelineFilter) => void;
  t: ReturnType<typeof useTranslations<"forge.dashboard">>;
}) {
  const [localFilter, setLocalFilter] = useState(filter);

  useEffect(() => {
    setLocalFilter(filter);
  }, [filter]);

  const filteredLeads = useMemo(() => {
    const activeLeads = leads.filter(
      (lead) => !isResolvedPipelineStatus(lead.pipeline_status),
    );

    if (localFilter === "all") {
      return activeLeads;
    }

    if (localFilter === "early") {
      return activeLeads.filter((lead) =>
        matchesAnyStage(lead.pipeline_status, ["nuevo", "contactado", "calificado"]),
      );
    }

    return activeLeads.filter((lead) =>
      matchesAnyStage(lead.pipeline_status, [
        "propuesta",
        "propuesta_enviada",
        "en_negociacion",
        "negociacion",
        "viewed",
      ]),
    );
  }, [localFilter, leads]);

  const stages = useMemo(() => {
    const preferredStages = [
      "nuevo",
      "contactado",
      "calificado",
      "propuesta_enviada",
      "en_negociacion",
    ];
    const statusSet = new Set(
      filteredLeads.map((lead) => normalizePipelineStatus(lead.pipeline_status)),
    );

    return preferredStages.filter((stage) => statusSet.has(stage));
  }, [filteredLeads]);

  const totalPipelineValue = filteredLeads.reduce(
    (sum, lead) => sum + (lead.estimated_value || 0),
    0,
  );

  const activeLeadCount = filteredLeads.length;

  const visibleStages = stages.length > 0 ? stages : ["nuevo", "contactado"];

  return (
    <div className="bg-[#111111] border border-neutral-900 p-6 md:p-8 flex flex-col rounded-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900 flex">
        {visibleStages.map((stage) => {
          const count = filteredLeads.filter(
            (lead) => normalizePipelineStatus(lead.pipeline_status) === stage,
          ).length;
          const widthPercent =
            activeLeadCount > 0 ? (count / activeLeadCount) * 100 : 0;
          return (
            <div
              key={`progress-${stage}`}
              className="h-full bg-emerald-500 transition-all duration-500 border-r border-black/50 last:border-r-0"
              style={{ width: `${widthPercent}%`, opacity: count > 0 ? 1 : 0 }}
            />
          );
        })}
      </div>

      <div className="mt-2 mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="uppercase tracking-widest text-xs text-white/40 mb-2">
            {t("pipelineSnapshot")}
          </h3>
          <p className="text-3xl font-black text-white">
            {formatDashboardCurrency(totalPipelineValue)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
            {PIPELINE_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const nextFilter = option.value as DashboardPipelineFilter;
                  setLocalFilter(nextFilter);
                  onFilterChange(nextFilter);
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] transition",
                  localFilter === option.value
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white",
                )}
              >
                {t(option.label)}
              </button>
            ))}
          </div>
          <Link
            href="/pipeline"
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400 hover:text-white transition-colors border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10"
          >
            {t("verPipeline")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row w-full h-auto">
        {visibleStages.map((stage) => {
          const stageLeads = filteredLeads
            .filter(
              (lead) => normalizePipelineStatus(lead.pipeline_status) === stage,
            )
            .sort(
              (left, right) =>
                new Date(right.created_at).getTime() -
                new Date(left.created_at).getTime(),
            );
          const value = stageLeads.reduce(
            (sum, lead) => sum + (lead.estimated_value || 0),
            0,
          );
          const displayLeads = stageLeads.slice(0, 2);
          const hasMore = stageLeads.length > 2;

          return (
            <div
              key={stage}
              className="flex-1 bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col min-w-0 hover:border-white/10 hover:bg-white/[0.03] transition-colors"
            >
              <div className="mb-3">
                <span className="uppercase tracking-widest text-xs text-white/40 truncate block">
                  {getPipelineStageLabel(stage)}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-white truncate">
                    {stageLeads.length > 0
                      ? formatDashboardCurrency(value)
                      : "$0"}
                  </span>
                  <span className="text-xs text-white/30 font-medium">
                    {stageLeads.length} {stageLeads.length === 1 ? "deal" : "deals"}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1 mt-2">
                {displayLeads.length > 0 ? (
                  displayLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex justify-between items-center text-xs text-white/50 py-1.5 border-b border-white/5 hover:text-white/70 transition-colors"
                    >
                      <span className="truncate pr-2">• {lead.name}</span>
                      <span className="shrink-0">
                        {lead.estimated_value
                          ? formatDashboardCurrency(lead.estimated_value)
                          : "---"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center py-2">
                    <span className="text-[10px] text-white/10 uppercase font-mono tracking-widest">
                      {t("emptyStage")}
                    </span>
                  </div>
                )}

                {hasMore && (
                  <Link
                    href="/pipeline"
                    className="text-[10px] text-emerald-500/50 hover:text-emerald-400 py-1.5 transition-colors mt-auto"
                  >
                    {t("andMore", { count: stageLeads.length - 2 })}
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

function MetricCell({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="bg-[#111111] px-6 py-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-xs text-neutral-500">{helper}</p>
    </div>
  );
}

function AlertsRow({
  leads,
  proposals,
  contracts,
}: {
  leads: WorkspaceDashboardLead[];
  proposals: WorkspaceDashboardProposal[];
  contracts: WorkspaceDashboardContract[];
}) {
  const today = new Date();
  const yesterday = addDays(today, -1);
  const twoDaysAgoDate = addDays(today, -2);
  const threeDaysAgoDate = addDays(today, -3);

  const alerts: Array<{
    type: "red" | "orange" | "yellow";
    icon: typeof Users;
    text: string;
    link: string;
    linkText?: string;
  }> = [];

  const newLeads = leads.filter((lead) =>
    isAfter(new Date(lead.created_at), yesterday),
  );
  if (newLeads.length > 0) {
    alerts.push({
      type: "red",
      icon: Users,
      text: `${newLeads.length} lead${newLeads.length > 1 ? "s" : ""} nuevo${newLeads.length > 1 ? "s" : ""}`,
      link: "/leads",
    });
  }

  const hangingProposals = proposals.filter(
    (proposal) =>
      proposal.status === "viewed" &&
      isBefore(new Date(proposal.updated_at || proposal.created_at), twoDaysAgoDate),
  );
  if (hangingProposals.length > 0) {
    alerts.push({
      type: "orange",
      icon: Activity,
      text: `${hangingProposals.length} propuesta${hangingProposals.length > 1 ? "s" : ""} vista${hangingProposals.length > 1 ? "s" : ""} sin firma`,
      link: "/proposals",
    });
  }

  const draftProposalsWithoutDate = proposals.filter(
    (proposal) => proposal.status === "draft",
  );
  if (draftProposalsWithoutDate.length > 0) {
    alerts.push({
      type: "orange",
      icon: Activity,
      text: `${draftProposalsWithoutDate.length} propuesta${draftProposalsWithoutDate.length > 1 ? "s" : ""} sin fecha de vencimiento`,
      linkText: "→ Agregar fechas",
      link: "/proposals",
    });
  }

  const pendingContracts = contracts.filter(
    (contract) => contract.status === "pending",
  );
  if (pendingContracts.length > 0) {
    alerts.push({
      type: "orange",
      icon: PenTool,
      text: `${pendingContracts.length} contrato${pendingContracts.length > 1 ? "s" : ""} pendiente${pendingContracts.length > 1 ? "s" : ""} de firma`,
      link: "/contracts",
    });
  }

  const overdueActions = leads.filter(
    (lead) =>
      lead.next_action_date &&
      isBefore(new Date(lead.next_action_date), today) &&
      !isResolvedPipelineStatus(lead.pipeline_status),
  );
  if (overdueActions.length > 0) {
    alerts.push({
      type: "red",
      icon: AlertCircle,
      text: `${overdueActions.length} acción${overdueActions.length > 1 ? "es" : ""} vencida${overdueActions.length > 1 ? "s" : ""}`,
      link: "/pipeline",
    });
  }

  const ghostingLeads = leads.filter(
    (lead) =>
      matchesAnyStage(lead.pipeline_status, ["nuevo"]) &&
      isBefore(new Date(lead.created_at), threeDaysAgoDate),
  );
  if (ghostingLeads.length > 0) {
    alerts.push({
      type: "yellow",
      icon: Clock,
      text: `${ghostingLeads.length} lead${ghostingLeads.length > 1 ? "s" : ""} sin contactar (3+ días)`,
      link: "/pipeline",
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
    <div className="flex w-full overflow-x-auto gap-4 scrollbar-hide snap-x" data-lenis-prevent>
      {alerts.map((alert, index) => {
        let colors =
          "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700";
        if (alert.type === "red") {
          colors =
            "bg-red-500/10 border-red-500/30 text-red-500 hover:border-red-500/50 hover:bg-red-500/20";
        }
        if (alert.type === "orange") {
          colors =
            "bg-orange-500/10 border-orange-500/30 text-orange-500 hover:border-orange-500/50 hover:bg-orange-500/20";
        }
        if (alert.type === "yellow") {
          colors =
            "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:border-yellow-500/50 hover:bg-yellow-500/20";
        }

        return (
          <Link
            key={`${alert.link}-${index}`}
            href={alert.link}
            className={`flex-shrink-0 snap-start flex flex-col justify-center gap-2 p-4 pr-8 rounded-lg border transition-colors min-w-[220px] ${colors}`}
          >
            <div className="flex items-center gap-2">
              <alert.icon className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest leading-none mt-0.5">
                {alert.text}
              </span>
            </div>
            {alert.linkText && (
              <span className="text-xs font-bold pl-6 hover:underline">
                {alert.linkText}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtext,
  subtextColor = "text-neutral-500",
  valueColor = "text-white",
  color,
  link,
  sparklineData,
  isForecast = false,
}: {
  label: string;
  value: string;
  subtext: string;
  subtextColor?: string;
  valueColor?: string;
  color: string;
  link: string;
  sparklineData: number[];
  isForecast?: boolean;
}) {
  const t = useTranslations("forge.dashboard");
  const containerClasses = isForecast
    ? "bg-emerald-500/5 border border-emerald-500/15 shadow-[0_0_20px_rgba(0,255,136,0.04)]"
    : "bg-[#111111] border border-neutral-900 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-150";

  return (
    <div className={`${containerClasses} p-6 flex h-full flex-col justify-between rounded-xl relative min-h-[180px]`}>
      <div className="flex-1">
        <span className="text-sm font-medium text-white/60 mb-2 block">
          {label}
        </span>
        <div className={`text-3xl font-black ${valueColor}`}>{value}</div>
        <div className={`text-xs font-medium mt-2 ${subtextColor}`}>{subtext}</div>
        <SparkLine color={color} data={sparklineData} />
      </div>
      <div className="flex justify-end mt-auto pt-4">
        <Link
          href={link}
          className="text-xs font-medium text-white/30 hover:text-white/60 transition-colors"
        >
          {t("verDetalles")} →
        </Link>
      </div>
    </div>
  );
}

function SparkLine({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  if (data.length < 2) {
    return null;
  }

  const height = 30;
  const width = 100;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const path = `M ${points.join(" L ")}`;

  return (
    <svg
      className="mt-4 h-[30px] w-full overflow-visible"
      viewBox="0 -5 100 40"
      preserveAspectRatio="none"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildDashboardSummary(data: WorkspaceDashboardData) {
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);

  const leadsThisMonth = data.leads.filter((lead) =>
    isSameMonth(new Date(lead.created_at), currentMonth),
  ).length;
  const leadsLastMonth = data.leads.filter((lead) =>
    isSameMonth(new Date(lead.created_at), lastMonth),
  ).length;
  const activeProposals = data.proposals.filter(
    (proposal) => proposal.status === "sent" || proposal.status === "viewed",
  );
  const activeProposalsValue = activeProposals.reduce(
    (sum, proposal) => sum + (proposal.total || 0),
    0,
  );
  const ongoingProjects = data.projects.filter(isProjectInProgress);

  return {
    leadsThisMonth,
    leadsLastMonth,
    activeProposals,
    activeProposalsValue,
    ongoingProjects,
    forecast: data.forecast,
    dummyTrendLeads: [
      1,
      2,
      0,
      3,
      1,
      5,
      leadsThisMonth > 0 ? leadsThisMonth : 0,
    ],
    dummyTrendProposals: [
      0,
      1000,
      1500,
      500,
      2000,
      0,
      activeProposals.length > 0 ? 3000 : 0,
    ],
  };
}

function getWidgetGridClass(widget: DashboardWidgetState) {
  switch (widget.widgetKey) {
    case "leads_this_month":
    case "active_proposals":
    case "projects_in_progress":
    case "revenue_forecast":
      if (widget.sizeVariant === "compact") {
        return "lg:col-span-3 xl:col-span-2";
      }
      if (widget.sizeVariant === "expanded") {
        return "lg:col-span-3 xl:col-span-4";
      }
      return "lg:col-span-3 xl:col-span-3";
    case "ai_insights":
      return "lg:col-span-6 xl:col-span-12";
    case "recent_activity":
      return widget.sizeVariant === "expanded"
        ? "lg:col-span-6 xl:col-span-8"
        : "lg:col-span-6 xl:col-span-7";
    case "metrics":
      return widget.sizeVariant === "expanded"
        ? "lg:col-span-6 xl:col-span-6"
        : "lg:col-span-6 xl:col-span-5";
    case "pipeline_snapshot":
      return widget.sizeVariant === "expanded"
        ? "lg:col-span-6 xl:col-span-12"
        : "lg:col-span-6 xl:col-span-7";
    default:
      return "lg:col-span-6 xl:col-span-6";
  }
}

function reorderList<T>(items: T[], startIndex: number, endIndex: number) {
  const next = [...items];
  const [removed] = next.splice(startIndex, 1);
  next.splice(endIndex, 0, removed);
  return next;
}

function serializeWidgetState(widgets: DashboardWidgetState[]) {
  return JSON.stringify(normalizeDashboardWidgetState(widgets));
}

function isProjectInProgress(project: WorkspaceDashboardProject) {
  return !["completed", "cancelled", "archived"].includes(project.status);
}

function formatDashboardCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizePipelineStatus(status: string) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");
  if (normalized.includes("propuesta")) {
    return "propuesta_enviada";
  }
  if (normalized.includes("negoci")) {
    return "en_negociacion";
  }
  if (normalized.includes("calific")) {
    return "calificado";
  }
  return normalized;
}

function isResolvedPipelineStatus(status: string) {
  const normalized = normalizePipelineStatus(status);
  return ["cerrado", "ganado", "perdido", "lost", "won"].includes(normalized);
}

function matchesAnyStage(status: string, candidates: string[]) {
  const normalized = normalizePipelineStatus(status);
  return candidates.some((candidate) =>
    normalized.includes(candidate.toLowerCase()),
  );
}

function getPipelineStageLabel(status: string) {
  switch (normalizePipelineStatus(status)) {
    case "nuevo":
      return "Nuevo";
    case "contactado":
      return "Contactado";
    case "calificado":
      return "Calificado";
    case "propuesta_enviada":
      return "Propuesta";
    case "en_negociacion":
      return "Negociación";
    default:
      return status.replace(/_/g, " ");
  }
}

function getEventStyles(type: string) {
  switch (type) {
    case "proposal":
      return { icon: Activity, bg: "bg-blue-500/20", color: "text-blue-400" };
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
    case "migration":
      return {
        icon: Kanban,
        bg: "bg-cyan-500/20",
        color: "text-cyan-400",
      };
    default:
      return {
        icon: Activity,
        bg: "bg-neutral-800",
        color: "text-neutral-400",
      };
  }
}
