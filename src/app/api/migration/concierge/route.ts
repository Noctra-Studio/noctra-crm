import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resend } from "@/lib/resend";
import { getWorkspace } from "@/lib/workspace";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Auth Check
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Workspace Check
    const workspace = await getWorkspace();
    if (!workspace) {
      return NextResponse.json(
        { error: "no_workspace" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const { comment, fileName, fileContent } = body;

    // Send Admin Notification via Resend
    const adminResult = await resend.emails.send({
      from: `Noctra Concierge <hello@noctra.studio>`,
      to: ["hola@noctra.studio"], // Support team email
      replyTo: userData.user.email,
      subject: `Nueva Solicitud de Migración: ${workspace.workspace.name}`,
      html: `
        <h1>Solicitud de Concierge Data Migration</h1>
        <p><strong>Workspace:</strong> ${workspace.workspace.name} (ID: ${workspace.workspaceId})</p>
        <p><strong>Email del Cliente:</strong> ${userData.user.email}</p>
        <p><strong>Nombre del Archivo:</strong> ${fileName}</p>
        <p><strong>Instrucciones/Comentarios adicionales:</strong></p>
        <blockquote style="border-left: 4px solid #10b981; padding-left: 1rem; color: #4b5563;">
          ${comment || "Sin comentarios."}
        </blockquote>
      `,
      attachments: fileContent ? [
        {
          filename: fileName,
          content: fileContent.split("base64,")[1] || fileContent,
        }
      ] : undefined,
    });

    if (adminResult.error) {
       console.error("Concierge Resend Error:", adminResult.error);
       throw new Error("Failed to send concierge email");
    }

    return NextResponse.json(
      { success: true },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error("Concierge Migration Error:", error);
    return NextResponse.json(
      { error: "internal_error", details: error.message },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
