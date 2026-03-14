"use server";

import { revalidatePath } from "next/cache";
import { getWorkspace } from "@/lib/workspace";
import { revalidatePublicProjectContent } from "@/lib/public-site-revalidate";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient as createServerClient } from "@/utils/supabase/server";
import {
  buildProjectSlug,
  createProjectRecord,
  type Project,
  type ProjectServiceType,
  type ProjectStatus,
} from "@/lib/projects";
import { recordWorkspaceActivity } from "@/lib/activity";

type ProjectActionResult = {
  success: boolean;
  error?: string;
  warning?: string;
};

type CreateProjectActionResult =
  | {
      success: true;
      project: Project;
      warning?: string;
    }
  | {
      success: false;
      error: string;
    };

export async function createProjectAction(data: {
  name: string;
  slug?: string;
  industry?: string;
  status?: ProjectStatus;
  start_date?: string;
  launch_date?: string;
  service_type?: ProjectServiceType;
  client_name?: string;
  client_email?: string;
  client_company?: string;
  lead_id?: string;
  contract_id?: string;
  client_id?: string;
}): Promise<CreateProjectActionResult> {
  const ctx = await getWorkspace();

  if (!ctx) {
    return { success: false, error: "Unauthorized" };
  }

  const name = data.name.trim();
  const slug = buildProjectSlug(data.slug?.trim() || name);

  if (!name) {
    return { success: false, error: "Project name is required" };
  }

  if (!slug) {
    return { success: false, error: "Project slug is required" };
  }

  const supabase = await createServerClient();

  try {
    const project = await createProjectRecord(supabase, {
      workspaceId: ctx.workspaceId,
      name,
      slug,
      industry: data.industry,
      status: data.status,
      start_date: data.start_date,
      launch_date: data.launch_date,
      service_type: data.service_type,
      client_name: data.client_name,
      client_email: data.client_email,
      client_company: data.client_company,
      lead_id: data.lead_id,
      contract_id: data.contract_id,
      client_id: data.client_id,
    });

    await recordWorkspaceActivity(supabase, {
      workspaceId: ctx.workspaceId,
      entityType: "project",
      entityId: project.id,
      eventType: "project.created",
      title: "Proyecto creado",
      description: `${project.name} ya está listo para planificación.`,
      metadata: {
        projectName: project.name,
        serviceType: project.service_type || "",
      },
    });

    revalidatePath("/[locale]/projects", "page");
    revalidatePath("/[locale]/clients", "page");

    const publicRevalidation = await revalidatePublicProjectContent(project.slug);

    if (!publicRevalidation.ok) {
      return {
        success: true,
        project,
        warning: publicRevalidation.error,
      };
    }

    return {
      success: true,
      project,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

export async function revalidatePublicProjectContentAction(
  slug?: string | null,
): Promise<ProjectActionResult> {
  const ctx = await getWorkspace();

  if (!ctx) {
    return { success: false, error: "Unauthorized" };
  }

  if (!["owner", "admin"].includes(ctx.role)) {
    return { success: false, error: "Forbidden" };
  }

  const result = await revalidatePublicProjectContent(slug);

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  return { success: true };
}

export async function deleteProjectAction(
  projectId: string,
): Promise<ProjectActionResult> {
  const ctx = await getWorkspace();

  if (!ctx) {
    return { success: false, error: "Unauthorized" };
  }

  if (!["owner", "admin"].includes(ctx.role)) {
    return { success: false, error: "Forbidden" };
  }

  const supabaseAdmin = createAdminClient();
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("id, slug, workspace_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return { success: false, error: "Project not found" };
  }

  if (project.workspace_id !== ctx.workspaceId) {
    return { success: false, error: "Forbidden" };
  }

  const { error: deleteError } = await supabaseAdmin
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("workspace_id", ctx.workspaceId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidatePath("/[locale]/projects", "page");
  revalidatePath("/[locale]", "page");

  const publicRevalidation = await revalidatePublicProjectContent(project.slug);

  if (!publicRevalidation.ok) {
    return {
      success: true,
      warning: publicRevalidation.error,
    };
  }

  return { success: true };
}
