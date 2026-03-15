export const DASHBOARD_WIDGET_KEYS = [
  "leads_this_month",
  "active_proposals",
  "projects_in_progress",
  "revenue_forecast",
  "ai_insights",
  "recent_activity",
  "metrics",
  "pipeline_snapshot",
] as const;

export type DashboardWidgetKey = (typeof DASHBOARD_WIDGET_KEYS)[number];

export const DASHBOARD_SIZE_VARIANTS = [
  "compact",
  "default",
  "expanded",
] as const;

export type DashboardSizeVariant = (typeof DASHBOARD_SIZE_VARIANTS)[number];

export const DASHBOARD_METRICS_TIMEFRAMES = ["7d", "30d", "90d"] as const;
export type DashboardMetricsTimeframe =
  (typeof DASHBOARD_METRICS_TIMEFRAMES)[number];

export const DASHBOARD_PIPELINE_FILTERS = ["all", "early", "closing"] as const;
export type DashboardPipelineFilter =
  (typeof DASHBOARD_PIPELINE_FILTERS)[number];

export const DASHBOARD_ACTIVITY_FILTERS = [
  "all",
  "lead",
  "proposal",
  "project",
  "contract",
  "migration",
] as const;
export type DashboardActivityFilter =
  (typeof DASHBOARD_ACTIVITY_FILTERS)[number];

export const DASHBOARD_ACTIVITY_SORTS = ["newest", "oldest"] as const;
export type DashboardActivitySort = (typeof DASHBOARD_ACTIVITY_SORTS)[number];

export type DashboardPresetKey =
  | "sales"
  | "operations"
  | "founder"
  | "agency"
  | "developer";

export interface DashboardWidgetPreferencesMap {
  leads_this_month: Record<string, never>;
  active_proposals: Record<string, never>;
  projects_in_progress: Record<string, never>;
  revenue_forecast: Record<string, never>;
  ai_insights: Record<string, never>;
  recent_activity: {
    type: DashboardActivityFilter;
    sort: DashboardActivitySort;
  };
  metrics: {
    timeframe: DashboardMetricsTimeframe;
  };
  pipeline_snapshot: {
    filter: DashboardPipelineFilter;
  };
}

export type DashboardWidgetPreferences<K extends DashboardWidgetKey> =
  DashboardWidgetPreferencesMap[K];

export interface DashboardWidgetDefinition {
  key: DashboardWidgetKey;
  label: string;
  description: string;
  defaultVisible: boolean;
  defaultSize: DashboardSizeVariant;
  supportedSizes: readonly DashboardSizeVariant[];
  defaultPreferences: DashboardWidgetPreferencesMap[DashboardWidgetKey];
}

export interface DashboardWidgetState {
  widgetKey: DashboardWidgetKey;
  visible: boolean;
  orderIndex: number;
  sizeVariant: DashboardSizeVariant;
  preferences: DashboardWidgetPreferencesMap[DashboardWidgetKey];
}

export interface DashboardPreferenceRow {
  widget_key: string;
  visible: boolean | null;
  order_index: number | null;
  size_variant: string | null;
  filters: unknown;
}

type DashboardPresetEntry = Omit<DashboardWidgetState, "orderIndex">;

export const DASHBOARD_WIDGET_DEFINITIONS: readonly DashboardWidgetDefinition[] =
  [
    {
      key: "leads_this_month",
      label: "Leads this month",
      description: "New leads plus month-over-month movement.",
      defaultVisible: true,
      defaultSize: "default",
      supportedSizes: ["compact", "default", "expanded"],
      defaultPreferences: {},
    },
    {
      key: "active_proposals",
      label: "Active proposals",
      description: "Tracked proposals that are still in play.",
      defaultVisible: true,
      defaultSize: "default",
      supportedSizes: ["compact", "default", "expanded"],
      defaultPreferences: {},
    },
    {
      key: "projects_in_progress",
      label: "Projects in progress",
      description: "Active project load with quick detail access.",
      defaultVisible: true,
      defaultSize: "default",
      supportedSizes: ["compact", "default", "expanded"],
      defaultPreferences: {},
    },
    {
      key: "revenue_forecast",
      label: "Revenue forecast",
      description: "Weighted revenue view from contracts, proposals, and leads.",
      defaultVisible: true,
      defaultSize: "default",
      supportedSizes: ["default", "expanded"],
      defaultPreferences: {},
    },
    {
      key: "ai_insights",
      label: "AI insights",
      description: "Central Brain guidance for the current workspace state.",
      defaultVisible: true,
      defaultSize: "default",
      supportedSizes: ["default", "expanded"],
      defaultPreferences: {},
    },
    {
      key: "recent_activity",
      label: "Recent activity",
      description: "Recent operational activity across the workspace.",
      defaultVisible: true,
      defaultSize: "default",
      supportedSizes: ["default", "expanded"],
      defaultPreferences: {
        type: "all",
        sort: "newest",
      },
    },
    {
      key: "metrics",
      label: "Metrics",
      description: "Pipeline health across a selected time horizon.",
      defaultVisible: true,
      defaultSize: "default",
      supportedSizes: ["default", "expanded"],
      defaultPreferences: {
        timeframe: "30d",
      },
    },
    {
      key: "pipeline_snapshot",
      label: "Pipeline snapshot",
      description: "Stage-by-stage visibility without arbitrary placement.",
      defaultVisible: true,
      defaultSize: "expanded",
      supportedSizes: ["default", "expanded"],
      defaultPreferences: {
        filter: "all",
      },
    },
  ];

export const DASHBOARD_WIDGET_MAP = Object.fromEntries(
  DASHBOARD_WIDGET_DEFINITIONS.map((definition) => [
    definition.key,
    definition,
  ]),
) as Record<DashboardWidgetKey, DashboardWidgetDefinition>;

export const PRODUCT_DEFAULT_PRESET: DashboardPresetKey = "founder";

export const DASHBOARD_PRESETS: Record<
  DashboardPresetKey,
  {
    label: string;
    description: string;
    widgets: readonly DashboardPresetEntry[];
  }
> = {
  founder: {
    label: "Founder",
    description: "Balanced view across sales velocity, execution, and cash flow.",
    widgets: [
      {
        widgetKey: "leads_this_month",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "active_proposals",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "projects_in_progress",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "revenue_forecast",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "ai_insights",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "recent_activity",
        visible: true,
        sizeVariant: "default",
        preferences: {
          type: "all",
          sort: "newest",
        },
      },
      {
        widgetKey: "metrics",
        visible: true,
        sizeVariant: "default",
        preferences: {
          timeframe: "30d",
        },
      },
      {
        widgetKey: "pipeline_snapshot",
        visible: true,
        sizeVariant: "expanded",
        preferences: {
          filter: "all",
        },
      },
    ],
  },
  sales: {
    label: "Sales",
    description: "Prioritizes pipeline, lead flow, and proposal momentum.",
    widgets: [
      {
        widgetKey: "leads_this_month",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "active_proposals",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "revenue_forecast",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "metrics",
        visible: true,
        sizeVariant: "default",
        preferences: {
          timeframe: "30d",
        },
      },
      {
        widgetKey: "pipeline_snapshot",
        visible: true,
        sizeVariant: "expanded",
        preferences: {
          filter: "all",
        },
      },
      {
        widgetKey: "recent_activity",
        visible: true,
        sizeVariant: "default",
        preferences: {
          type: "lead",
          sort: "newest",
        },
      },
      {
        widgetKey: "ai_insights",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "projects_in_progress",
        visible: false,
        sizeVariant: "default",
        preferences: {},
      },
    ],
  },
  operations: {
    label: "Operations",
    description: "Focuses on active delivery, activity flow, and AI summaries.",
    widgets: [
      {
        widgetKey: "projects_in_progress",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "metrics",
        visible: true,
        sizeVariant: "default",
        preferences: {
          timeframe: "90d",
        },
      },
      {
        widgetKey: "recent_activity",
        visible: true,
        sizeVariant: "expanded",
        preferences: {
          type: "project",
          sort: "newest",
        },
      },
      {
        widgetKey: "pipeline_snapshot",
        visible: true,
        sizeVariant: "default",
        preferences: {
          filter: "closing",
        },
      },
      {
        widgetKey: "ai_insights",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "revenue_forecast",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "active_proposals",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "leads_this_month",
        visible: false,
        sizeVariant: "compact",
        preferences: {},
      },
    ],
  },
  agency: {
    label: "Agency",
    description: "Balances demand generation, delivery load, and client visibility.",
    widgets: [
      {
        widgetKey: "revenue_forecast",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "projects_in_progress",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "active_proposals",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "leads_this_month",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "recent_activity",
        visible: true,
        sizeVariant: "default",
        preferences: {
          type: "all",
          sort: "newest",
        },
      },
      {
        widgetKey: "metrics",
        visible: true,
        sizeVariant: "default",
        preferences: {
          timeframe: "30d",
        },
      },
      {
        widgetKey: "pipeline_snapshot",
        visible: true,
        sizeVariant: "expanded",
        preferences: {
          filter: "all",
        },
      },
      {
        widgetKey: "ai_insights",
        visible: false,
        sizeVariant: "default",
        preferences: {},
      },
    ],
  },
  developer: {
    label: "Developer",
    description: "Emphasizes execution context, recent changes, and AI support.",
    widgets: [
      {
        widgetKey: "projects_in_progress",
        visible: true,
        sizeVariant: "expanded",
        preferences: {},
      },
      {
        widgetKey: "recent_activity",
        visible: true,
        sizeVariant: "expanded",
        preferences: {
          type: "project",
          sort: "newest",
        },
      },
      {
        widgetKey: "ai_insights",
        visible: true,
        sizeVariant: "expanded",
        preferences: {},
      },
      {
        widgetKey: "metrics",
        visible: true,
        sizeVariant: "default",
        preferences: {
          timeframe: "7d",
        },
      },
      {
        widgetKey: "pipeline_snapshot",
        visible: true,
        sizeVariant: "default",
        preferences: {
          filter: "closing",
        },
      },
      {
        widgetKey: "active_proposals",
        visible: true,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "revenue_forecast",
        visible: false,
        sizeVariant: "default",
        preferences: {},
      },
      {
        widgetKey: "leads_this_month",
        visible: false,
        sizeVariant: "compact",
        preferences: {},
      },
    ],
  },
};

export function getPresetWidgetState(
  presetKey: DashboardPresetKey = PRODUCT_DEFAULT_PRESET,
): DashboardWidgetState[] {
  return DASHBOARD_PRESETS[presetKey].widgets.map((entry, index) => ({
    widgetKey: entry.widgetKey,
    visible: entry.visible,
    orderIndex: index,
    sizeVariant: sanitizeSizeVariant(entry.widgetKey, entry.sizeVariant),
    preferences: sanitizeWidgetPreferences(entry.widgetKey, entry.preferences),
  }));
}

export function getDefaultWidgetState(widgetKey: DashboardWidgetKey) {
  const definition = DASHBOARD_WIDGET_MAP[widgetKey];
  return {
    widgetKey,
    visible: definition.defaultVisible,
    orderIndex: DASHBOARD_WIDGET_KEYS.indexOf(widgetKey),
    sizeVariant: definition.defaultSize,
    preferences: definition.defaultPreferences,
  } satisfies DashboardWidgetState;
}

export function sanitizeSizeVariant(
  widgetKey: DashboardWidgetKey,
  sizeVariant: string | null | undefined,
): DashboardSizeVariant {
  const definition = DASHBOARD_WIDGET_MAP[widgetKey];
  if (
    sizeVariant &&
    definition.supportedSizes.includes(sizeVariant as DashboardSizeVariant)
  ) {
    return sizeVariant as DashboardSizeVariant;
  }
  return definition.defaultSize;
}

export function sanitizeWidgetPreferences<K extends DashboardWidgetKey>(
  widgetKey: K,
  preferences: unknown,
): DashboardWidgetPreferences<K> {
  const definition = DASHBOARD_WIDGET_MAP[widgetKey];

  switch (widgetKey) {
    case "metrics": {
      const timeframe = asObject(preferences)?.timeframe;
      return {
        timeframe: DASHBOARD_METRICS_TIMEFRAMES.includes(
          timeframe as DashboardMetricsTimeframe,
        )
          ? (timeframe as DashboardMetricsTimeframe)
          : "30d",
      } as DashboardWidgetPreferences<K>;
    }
    case "pipeline_snapshot": {
      const filter = asObject(preferences)?.filter;
      return {
        filter: DASHBOARD_PIPELINE_FILTERS.includes(
          filter as DashboardPipelineFilter,
        )
          ? (filter as DashboardPipelineFilter)
          : "all",
      } as DashboardWidgetPreferences<K>;
    }
    case "recent_activity": {
      const raw = asObject(preferences);
      return {
        type: DASHBOARD_ACTIVITY_FILTERS.includes(
          raw?.type as DashboardActivityFilter,
        )
          ? (raw?.type as DashboardActivityFilter)
          : "all",
        sort: DASHBOARD_ACTIVITY_SORTS.includes(
          raw?.sort as DashboardActivitySort,
        )
          ? (raw?.sort as DashboardActivitySort)
          : "newest",
      } as DashboardWidgetPreferences<K>;
    }
    default:
      return definition.defaultPreferences as DashboardWidgetPreferences<K>;
  }
}

export function mergeDashboardPreferenceRows(
  rows: DashboardPreferenceRow[] | null | undefined,
): DashboardWidgetState[] {
  const rowMap = new Map(
    (rows ?? []).map((row) => [row.widget_key, row] as const),
  );

  return DASHBOARD_WIDGET_KEYS.map((widgetKey, index) => {
    const row = rowMap.get(widgetKey);
    if (!row) {
      return getDefaultWidgetState(widgetKey);
    }

    return {
      widgetKey,
      visible:
        typeof row.visible === "boolean"
          ? row.visible
          : DASHBOARD_WIDGET_MAP[widgetKey].defaultVisible,
      orderIndex:
        typeof row.order_index === "number" ? row.order_index : index,
      sizeVariant: sanitizeSizeVariant(widgetKey, row.size_variant),
      preferences: sanitizeWidgetPreferences(widgetKey, row.filters),
    } satisfies DashboardWidgetState;
  }).sort((left, right) => {
    if (left.orderIndex !== right.orderIndex) {
      return left.orderIndex - right.orderIndex;
    }
    return (
      DASHBOARD_WIDGET_KEYS.indexOf(left.widgetKey) -
      DASHBOARD_WIDGET_KEYS.indexOf(right.widgetKey)
    );
  });
}

export function normalizeDashboardWidgetState(
  widgets: DashboardWidgetState[],
): DashboardWidgetState[] {
  const seen = new Set<DashboardWidgetKey>();
  const normalized = widgets
    .filter((widget): widget is DashboardWidgetState =>
      DASHBOARD_WIDGET_KEYS.includes(widget.widgetKey),
    )
    .map((widget, index) => {
      seen.add(widget.widgetKey);
      return {
        widgetKey: widget.widgetKey,
        visible: widget.visible,
        orderIndex: index,
        sizeVariant: sanitizeSizeVariant(widget.widgetKey, widget.sizeVariant),
        preferences: sanitizeWidgetPreferences(
          widget.widgetKey,
          widget.preferences,
        ),
      } satisfies DashboardWidgetState;
    });

  DASHBOARD_WIDGET_KEYS.forEach((widgetKey) => {
    if (!seen.has(widgetKey)) {
      normalized.push({
        ...getDefaultWidgetState(widgetKey),
        orderIndex: normalized.length,
      });
    }
  });

  return normalized;
}

function asObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}
