"use server";

import { createClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function completeOnboardingAction(data: {
  logoUrl?: string;
  primaryColor?: string;
  folioPrefix?: string;
  currency?: string;
}) {
  const supabase = await createClient();
  const ctx = await getWorkspace();
  const { data: userData } = await supabase.auth.getUser();

  if (!ctx) {
    console.error(`[completeOnboardingAction] No active workspace for user: ${userData?.user?.id || 'Unknown'}`);
    throw new Error("No active workspace found. Please contact support.");
  }

  if (!userData?.user) {
    throw new Error("Not authenticated");
  }

  // 1. Update the workspace settings
  const { error: workspaceError } = await supabase
    .from("workspaces")
    .update({
      logo_url: data.logoUrl || null,
      primary_color: data.primaryColor || null,
      folio_prefix: data.folioPrefix || "NOC-",
      currency: data.currency || "USD",
    })
    .eq("id", ctx.workspaceId);

  if (workspaceError) {
    console.error("Error updating workspace:", workspaceError);
    throw new Error("Failed to update workspace settings");
  }

  // 2. Update user metadata to mark onboarding as completed
  const { error: authError } = await supabase.auth.updateUser({
    data: { onboarding_completed: true },
  });

  if (authError) {
    console.error("Error updating user auth metadata:", authError);
    throw new Error("Failed to mark onboarding as complete");
  }

  // Ensure layouts re-fetch the user metadata
  revalidatePath("/forge", "layout");
  return { success: true };
}
