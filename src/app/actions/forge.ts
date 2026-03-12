"use server";

import { createClient } from "@/utils/supabase/server";
import { resend } from "@/lib/resend";

export async function submitWaitlist(formData: {
  email: string;
  agencyName?: string;
  locale?: string;
}) {
  const supabase = await createClient();
  const { email, agencyName, locale = "es" } = formData;

  // 1. Insert into Supabase
  const { error: dbError } = await supabase
    .from("forge_early_access")
    .insert([
      { 
        email, 
        agency_name: agencyName || null,
        locale 
      }
    ]);

  if (dbError) {
    if (dbError.code === "23505") {
      return { error: "duplicate_email" };
    }
    throw dbError;
  }

  // 2. Send Personalized Email to User
  try {
    const isEn = locale === "en";
    const subject = isEn 
      ? "You are on the Noctra CRM waitlist"
      : "Ya estás en la lista de espera de Noctra CRM";

    const html = isEn 
      ? `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">You're on the waitlist</h1>
          <p>Hello,</p>
          <p>Thanks for your interest in <strong>Noctra CRM</strong>. We have received your waitlist request.</p>
          <p>We are currently building the product toward a planned launch window in late 2026 to early 2027.</p>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>We will share product milestones and launch updates with you.</li>
            <li>You will be among the first to know when Noctra CRM is ready to open publicly.</li>
          </ul>
          <p>Best regards,<br/>The Noctra Studio Team</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">Ya estás en la lista de espera</h1>
          <p>Hola,</p>
          <p>Gracias por tu interés en <strong>Noctra CRM</strong>. Ya recibimos tu solicitud para la lista de espera.</p>
          <p>Estamos construyendo el producto con una ventana estimada de lanzamiento entre finales de 2026 e inicios de 2027.</p>
          <p><strong>¿Qué sigue?</strong></p>
          <ul>
            <li>Te compartiremos hitos del producto y actualizaciones de lanzamiento.</li>
            <li>Serás de las primeras personas en enterarte cuando Noctra CRM abra oficialmente.</li>
          </ul>
          <p>Saludos,<br/>El equipo de Noctra Studio</p>
        </div>
      `;

    await resend.emails.send({
      from: "Noctra Studio <hello@noctra.studio>",
      to: [email],
      subject,
      html,
    });

    // 3. Notify Agency (Internal Lead Alert)
    await resend.emails.send({
      from: "Noctra Forge <system@noctra.studio>",
      to: ["hello@noctra.studio"],
      subject: `New Noctra CRM Waitlist Lead: ${agencyName || 'Individual'} (${email})`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Noctra CRM Waitlist Lead</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Organization:</strong> ${agencyName || 'N/A'}</p>
          <p><strong>Locale:</strong> ${locale}</p>
          <p><strong>Status:</strong> Waitlist</p>
        </div>
      `,
    });

  } catch (emailError) {
    console.error("Error sending waitlist email:", emailError);
    // We don't throw here to avoid failing the whole request if email fails but DB succeeded
  }

  return { success: true };
}
