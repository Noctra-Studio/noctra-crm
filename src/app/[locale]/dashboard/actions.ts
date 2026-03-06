"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function approveDeliverable(deliverableId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("deliverables")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", deliverableId);

  if (error) throw new Error(error.message);

  revalidatePath("/[locale]/dashboard", "page");
}

export async function createTicket(
  projectId: string,
  deliverableId: string,
  title: string,
  description: string
) {
  const supabase = await createClient();

  // 1. Update deliverable status
  const { error: updateError } = await supabase
    .from("deliverables")
    .update({ status: "changes_requested" })
    .eq("id", deliverableId);

  if (updateError) throw new Error(updateError.message);

  // 2. Create ticket
  const { data, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      project_id: projectId,
      deliverable_id: deliverableId,
      title,
      description,
      priority: "medium",
      // assignee_id will be handled by default or trigger if needed, 
      // but schema says nullable, so we can leave it or set it if we knew the admin ID.
      // For now, we'll leave it null or let the DB handle it.
    })
    .select()
    .single();

  if (ticketError) throw new Error(ticketError.message);

  revalidatePath("/[locale]/dashboard", "page");
  return data;
}

export async function getDashboardData(locale: string = "en") {
  const supabase = await createClient();

  // 1. Get Current User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // 2. Fetch Profile & Active Project
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profile not found");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, total_budget")
    .eq("client_id", user.id)
    .eq("status", "active") // Only get the active project
    .single();

  if (!project) return null; // Handle no project state

  // 3. Fetch all related data in parallel (Fast)
  const [services, teamStatus, deliverable] = await Promise.all([
    supabase.from("project_services").select("*").eq("project_id", project.id),
    supabase
      .from("team_status")
      .select("*")
      .eq("project_id", project.id)
      .single(),
    supabase
      .from("deliverables")
      .select("*")
      .eq("project_id", project.id)
      .eq("status", "pending_review")
      .single(),
  ]);

  return {
    profile,
    project,
    services: services.data || [],
    activeWorker: teamStatus.data,
    deliverable: deliverable.data,
  };
}
