"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ReportConfig = {
  custom_message: string;
  include_tasks: boolean;
  include_deliverables: boolean;
};

export async function generateReportAction(projectId: string, config: ReportConfig) {
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .update({
      report_config: config,
      report_generated_at: new Date().toISOString()
    })
    .eq("id", projectId)
    .select("report_token")
    .single();

  if (error) throw error;

  revalidatePath("/projects");
  return { 
    token: project.report_token,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://noctra.studio'}/client/report/${project.report_token}`
  };
}

export async function getReportByTokenAction(token: string) {
  const supabase = createAdminClient();

  // Fetch project basic info with workspace info
  const { data: project, error: pError } = await supabase
    .from("projects")
    .select("*, workspace:workspaces(*)")
    .eq("report_token", token)
    .single();

  if (pError || !project) return null;

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  // Fetch deliverables
  const { data: deliverables } = await supabase
    .from("project_deliverables")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  return {
    project,
    tasks: tasks || [],
    deliverables: deliverables || []
  };
}

export async function sendReportEmailAction(projectId: string, clientEmail: string, reportUrl: string) {
  const supabase = await createClient();
  
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  if (!project) return { success: false, error: "Project not found" };

  try {
    await resend.emails.send({
      from: "Noctra Studio <manu@noctra.studio>",
      to: [clientEmail],
      subject: `Reporte de Avance: ${project.name}`,
      text: `Hola,\n\nTe compartimos el reporte de avance actualizado de tu proyecto "${project.name}".\n\nPuedes verlo y descargarlo en el siguiente enlace:\n${reportUrl}\n\nQuedamos a tu disposición por cualquier duda.\n\nSaludos,\nEl equipo de Noctra Studio`,
    });

    return { success: true };
  } catch (err) {
    console.error("Error sending report email:", err);
    return { success: false, error: err };
  }
}
