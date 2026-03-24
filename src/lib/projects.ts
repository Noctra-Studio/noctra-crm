import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { populateProjectTasks } from "@/lib/populate-tasks";
import {
  buildProjectSlug,
  type ProjectServiceType,
  type ProjectStatus,
} from "@/lib/project-core";
export {
  buildProjectSlug,
  PROJECT_SERVICE_TYPE_VALUES,
  PROJECT_STATUS_VALUES,
  type ProjectServiceType,
  type ProjectStatus,
} from "@/lib/project-core";

export type Project = {
  id: string;
  workspace_id?: string;
  slug: string;
  name: string;
  tagline: string;
  industry: string;
  status: ProjectStatus;
  launch_date: string;
  case_study_enabled: boolean;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  metrics: { label: string; value: string; delta?: string }[];
  gallery: { url: string; caption: string }[];
  has_ai_form: boolean;
  form_description: string | null;
  sort_order: number;
  visible: boolean;
  published_to_site: boolean;
  start_date: string | null;
  deadline: string | null;
  internal_notes: string | null;
  budget: number;
  hourly_rate: number;
  total_hours: number;
  total_expenses: number;
  service_type?: ProjectServiceType;
  report_token?: string;
  updated_at?: string;
  client_name?: string | null;
  client_email?: string | null;
  client_company?: string | null;
  lead_id?: string | null;
  contract_id?: string | null;
  client_id?: string | null;
  report_config?: {
    custom_message: string;
    include_tasks: boolean;
    include_deliverables: boolean;
  };
  report_generated_at?: string;
};

export type CreateProjectInput = {
  workspaceId: string;
  name: string;
  slug?: string;
  industry?: string | null;
  status?: ProjectStatus;
  start_date?: string | null;
  launch_date?: string | null;
  service_type?: ProjectServiceType;
  sort_order?: number;
  visible?: boolean;
  published_to_site?: boolean;
  client_name?: string | null;
  client_email?: string | null;
  client_company?: string | null;
  client_id?: string | null;
  lead_id?: string | null;
  contract_id?: string | null;
};

export async function createProjectRecord(
  supabase: SupabaseClient,
  input: CreateProjectInput,
) {
  const slug = input.slug?.trim() || buildProjectSlug(input.name);
  const status = input.status ?? "discovery";
  const serviceType = input.service_type ?? "web_presence";

  const { data: lastProject } = await supabase
    .from("projects")
    .select("sort_order")
    .eq("workspace_id", input.workspaceId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder =
    input.sort_order ??
    (typeof lastProject?.sort_order === "number" ? lastProject.sort_order + 10 : 10);

  const projectPayload = {
    workspace_id: input.workspaceId,
    client_id: input.client_id ?? null,
    name: input.name.trim(),
    slug,
    industry: input.industry?.trim() || "",
    status,
    start_date: input.start_date || null,
    launch_date: input.launch_date || null,
    sort_order: sortOrder,
    visible: input.visible ?? true,
    published_to_site: input.published_to_site ?? false,
    has_ai_form: false,
    case_study_enabled: false,
    metrics: [],
    gallery: [],
    budget: 0,
    hourly_rate: 800,
    total_hours: 0,
    total_expenses: 0,
    service_type: serviceType,
    client_name: input.client_name?.trim() || null,
    client_email: input.client_email?.trim() || null,
    client_company: input.client_company?.trim() || null,
    lead_id: input.lead_id ?? null,
    contract_id: input.contract_id ?? null,
  };

  const { data: project, error } = await supabase
    .from("projects")
    .insert(projectPayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await populateProjectTasks(supabase, project.id, serviceType);
  await supabase
    .from("project_status_history")
    .insert({ project_id: project.id, status });

  return project as Project;
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published_to_site", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published_to_site", true)
    .single();

  if (error) return null;
  return data as Project;
}
