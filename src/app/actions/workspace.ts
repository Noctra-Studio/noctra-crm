"use server";

import { createClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function updateWorkspaceAction(data: {
  name: string;
  logo_url: string;
  email: string;
  website_url: string;
  primary_color: string;
  subdomain?: string;
  custom_domain?: string;
}) {
  const supabase = await createClient();
  const ctx = await getWorkspace();

  if (!ctx) throw new Error("Unauthorized");

  // Backend Validation for Soft Wall
  const isFree = ctx.workspace.tier === "free";
  const updates: any = {
    name: data.name,
    logo_url: data.logo_url || null,
    email: data.email || null,
    website_url: data.website_url || null,
    primary_color: data.primary_color,
  };

  // Only allow domain updates if not on free tier
  if (!isFree) {
    if (data.subdomain !== undefined) updates.subdomain = data.subdomain || null;
    if (data.custom_domain !== undefined) updates.custom_domain = data.custom_domain || null;
  }

  const { error } = await supabase
    .from("workspaces")
    .update(updates)
    .eq("id", ctx.workspaceId);

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

export async function updateWorkspaceConfigAction(data: {
  serviceTypes: string[];
  pipelineStages: string[];
}) {
  const supabase = await createClient();
  const ctx = await getWorkspace();

  if (!ctx) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("workspace_config")
    .upsert({
      workspace_id: ctx.workspaceId,
      service_types: data.serviceTypes,
      pipeline_stages: data.pipelineStages,
      updated_at: new Date().toISOString()
    }, {
      onConflict: "workspace_id",
    });

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}
