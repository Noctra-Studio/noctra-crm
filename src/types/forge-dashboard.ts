import type { RevenueForecast } from "@/app/actions/metrics";
import type { DashboardWidgetState } from "@/lib/dashboard/preferences";
import type { ActivityFeedItem } from "@/lib/activity";

export interface WorkspaceDashboardLead {
  id: string;
  name: string;
  request_id?: string | null;
  pipeline_status: string;
  estimated_value?: number | null;
  created_at: string;
  next_action_date?: string | null;
  next_action_notes?: string | null;
  closed_at?: string | null;
}

export interface WorkspaceDashboardProposal {
  id: string;
  title?: string | null;
  status: string;
  total?: number | null;
  updated_at: string;
  created_at: string;
}

export interface WorkspaceDashboardContract {
  id: string;
  client_name?: string | null;
  status: string;
  total_price?: number | null;
  created_at: string;
}

export interface WorkspaceDashboardProject {
  id: string;
  name?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}

export interface WorkspaceDashboardData {
  locale: string;
  leads: WorkspaceDashboardLead[];
  proposals: WorkspaceDashboardProposal[];
  contracts: WorkspaceDashboardContract[];
  projects: WorkspaceDashboardProject[];
  activityFeed: ActivityFeedItem[];
  forecast: RevenueForecast;
  isTrial: boolean;
  canUseCentralBrain: boolean;
  widgetPreferences: DashboardWidgetState[];
  currency: string;
  pipelineStages: string[];
}
