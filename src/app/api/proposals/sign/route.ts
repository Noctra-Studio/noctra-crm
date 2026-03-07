import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, signed_name, signature_data, signature_hash } = body;

    const supabase = createAdminClient();

    // 1. Fetch proposal and validate
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("*, lead:contact_submissions(*)")
      .eq("client_token", token)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.signed) {
      return NextResponse.json({ error: "Proposal already signed" }, { status: 400 });
    }

    // Check expiration
    if (proposal.valid_until && new Date(proposal.valid_until) < new Date()) {
      return NextResponse.json({ error: "Proposal expired" }, { status: 400 });
    }

    // 2. Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";

    // 3. Update proposal with signature data
    const { error: updateError } = await supabase
      .from("proposals")
      .update({
        signed: true,
        signed_at: new Date().toISOString(),
        signed_name: signed_name,
        signature_data: signature_data,
        signature_ip: ip,
        signature_hash: signature_hash,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", proposal.id);

    if (updateError) throw updateError;

    // 4. Update lead status in pipeline if applicable
    if (proposal.lead_id) {
       await supabase
         .from("contact_submissions")
         .update({ pipeline_status: 'cerrado' })
         .eq("id", proposal.lead_id);
    }

    // 5. Trigger Notifications (Resend)
    // Email to Client
    await resend.emails.send({
      from: "Noctra Studio <notificaciones@noctra.studio>",
      to: [proposal.lead.email],
      subject: `Propuesta Aceptada: ${proposal.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="text-transform: uppercase; font-style: italic;">Noctra<span style="color: #10b981;">.</span></h1>
          <p>Hola <strong>${signed_name}</strong>,</p>
          <p>Es un gusto confirmar que hemos recibido tu firma electrónica para la propuesta <strong>${proposal.proposal_number}</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Siguientes pasos:</strong></p>
          <ul>
            <li>Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas para coordinar la sesión de inicio (Kickoff).</li>
            <li>Recibirás una factura por el anticipo acordado (${proposal.subtotal * 0.5} MXN).</li>
          </ul>
          <p style="color: #666; font-size: 12px; font-style: italic;">Audit Hash: ${signature_hash}</p>
        </div>
      `,
    });

    // Email to Manu
    await resend.emails.send({
      from: "Noctra Studio <notificaciones@noctra.studio>",
      to: ["manu@noctra.studio"],
      subject: `✨ Propuesta ACEPTADA: ${proposal.lead.name}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>HAY TRATO.</h2>
          <p><strong>Cliente:</strong> ${proposal.lead.name}</p>
          <p><strong>Total:</strong> $${proposal.total?.toLocaleString('es-MX')} MXN</p>
          <p><strong>Propuesta:</strong> ${proposal.proposal_number}</p>
          <p><strong>IP de Firma:</strong> ${ip}</p>
          <a href="https://noctra.studio/proposals" style="display: inline-block; padding: 10px 20px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver en Forge</a>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sign API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
