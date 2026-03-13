"use server";

import { revalidatePath } from "next/cache";
import { getWorkspace } from "@/lib/workspace";
import { revalidatePublicProjectContent } from "@/lib/public-site-revalidate";
import { createAdminClient } from "@/utils/supabase/admin";

type ProjectActionResult = {
  success: boolean;
  error?: string;
  warning?: string;
};

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
