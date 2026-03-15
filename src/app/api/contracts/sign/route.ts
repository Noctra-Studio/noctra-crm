import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";
import { recordWorkspaceActivity } from "@/lib/activity";
import { createProjectRecord } from "@/lib/projects";
import { onProjectCreated } from "@/app/actions/crm-automations";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, signed_name, signature_data, signature_hash } = body;

    const supabase = createAdminClient();

    // 1. Fetch contract and validate
    const { data: contract, error: fetchError } = await supabase
      .from("contracts")
      .select(`
        *,
        proposal:proposals(*)
      `)
      .eq("client_token", token)
      .single();

    if (fetchError || !contract) {
      return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 });
    }

    if (contract.signed_by_client) {
      return NextResponse.json({ error: "Este contrato ya ha sido firmado" }, { status: 400 });
    }

    // 2. Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // 3. Update contract with signature data and status 'signed'
    const { error: updateError } = await supabase
      .from("contracts")
      .update({
        signed_by_client: true,
        client_signed_at: new Date().toISOString(),
        client_signed_name: signed_name,
        client_signature_data: signature_data,
        client_signature_ip: ip,
        client_signature_hash: signature_hash,
        status: "signed",
      })
      .eq("id", contract.id);

    if (updateError) throw updateError;

    // 4. Update linked proposal accepted_at if exists
    if (contract.proposal_id) {
      await supabase
        .from("proposals")
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", contract.proposal_id);
    }

    // 5. Auto-create project in projects table
    // First, try to find a profile for this client email to get client_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", contract.client_email)
      .single();

    if (profile) {
      const projectName = `${contract.client_name} — ${contract.service_type || 'Nuevo Proyecto'}`;
      try {
        const newProject = await createProjectRecord(supabase, {
          workspaceId: contract.workspace_id,
          client_id: profile.id,
          contract_id: contract.id,
          lead_id: contract.proposal?.lead_id || null,
          name: projectName,
          service_type: contract.service_type || "web_presence",
          client_name: contract.client_name,
          client_email: contract.client_email,
          client_company: contract.client_company,
        });

        // Trigger Workflow Automation: Add Default Deliverables
        try {
          await onProjectCreated(newProject.id, contract.workspace_id);
        } catch (e) {
          console.error("Workflow Automation Error (Project -> Deliverables):", e);
        }

        await recordWorkspaceActivity(supabase, {
          workspaceId: contract.workspace_id,
          entityType: "project",
          entityId: newProject.id,
          eventType: "project.created",
          title: "Proyecto creado",
          description: `${projectName} se abrió automáticamente al firmar el contrato.`,
          metadata: {
            contractId: contract.id,
            clientName: contract.client_name || "",
          },
        });
      } catch (projectError) {
        console.error("Failed to auto-create project from signed contract:", projectError);
      }
    } else {
      console.warn(`No profile found for ${contract.client_email}. Skipping project creation.`);
    }

    // 6. Update pipeline lead to 'cerrado'
    // We can find the lead via the proposal if it's linked
    if (contract.proposal?.lead_id) {
      await supabase
        .from("contact_submissions")
        .update({ pipeline_status: 'cerrado' })
        .eq("id", contract.proposal.lead_id);
    }

    await recordWorkspaceActivity(supabase, {
      workspaceId: contract.workspace_id,
      entityType: "contract",
      entityId: contract.id,
      eventType: "contract.signed",
      title: "Contrato firmado",
      description: `${signed_name} firmó ${contract.contract_number || "el contrato"}.`,
      metadata: {
        contractNumber: contract.contract_number || "",
        proposalId: contract.proposal_id || null,
        signedName: signed_name,
      },
    });

    // 7. Trigger Notifications (Resend)
    // Email to Client
    await resend.emails.send({
      from: "Noctra Studio <notificaciones@noctra.studio>",
      to: [contract.client_email],
      subject: `Contrato Ejecutado: ${contract.contract_number}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <h1 style="text-transform: uppercase; font-style: italic; letter-spacing: -1px;">Noctra<span style="color: #10b981;">.</span></h1>
          <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${signed_name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">Confirmamos que el contrato <strong>${contract.contract_number}</strong> ha sido firmado electrónicamente de manera exitosa.</p>
          <p style="font-size: 16px; line-height: 1.6;">Hemos registrado formalmente el inicio de tu proyecto. Nuestro equipo se pondrá en contacto contigo en breve para los siguientes pasos operativos.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 4px; margin: 30px 0;">
            <p style="margin: 0; font-size: 12px; font-family: monospace; color: #666;">Audit Hash: ${signature_hash}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; font-family: monospace; color: #666;">Folio: ${contract.contract_number}</p>
          </div>

          <p style="font-size: 14px; color: #888; font-style: italic;">Gracias por confiar en Noctra Studio para llevar tu visión digital al siguiente nivel.</p>
        </div>
      `,
    });

    // Email to Manu
    await resend.emails.send({
      from: "Noctra Studio <notificaciones@noctra.studio>",
      to: ["manu@noctra.studio"],
      subject: `🔥 CONTRATO FIRMADO: ${contract.client_name}`,
      html: `
        <div style="font-family: sans-serif; color: #111;">
          <h2 style="text-transform: uppercase; letter-spacing: 2px;">Nuevo Proyecto Confirmado</h2>
          <hr style="border: none; border-top: 4px solid #111; margin: 20px 0;" />
          <p><strong>Cliente:</strong> ${contract.client_name}</p>
          <p><strong>Empresa:</strong> ${contract.client_company || '—'}</p>
          <p><strong>Inversión:</strong> $${contract.total_price?.toLocaleString('es-MX')} MXN</p>
          <p><strong>Contrato:</strong> ${contract.contract_number}</p>
          <p><strong>IP de Firma:</strong> ${ip}</p>
          <br />
          <a href="https://noctra.studio/contracts" style="display: inline-block; padding: 12px 24px; background: #111; color: white; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Gestionar en Forge</a>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contract Sign API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
