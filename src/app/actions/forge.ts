"use server";

import { createClient } from "@/utils/supabase/server";
import { resend } from "@/lib/resend";

export async function submitEarlyAccess(formData: {
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
      ? "Welcome to Noctra CRM Early Access List! 🚀" 
      : "¡Bienvenido a la lista de Early Access de Noctra CRM! 🚀";

    const html = isEn 
      ? `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">You're on the list!</h1>
          <p>Hello,</p>
          <p>Thanks for your interest in <strong>Noctra CRM (Forge)</strong>. We've received your request for early access.</p>
          <p>Our team is reviewing applications for the private beta. We're looking for agencies that want to help us shape the future of digital management.</p>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>We'll contact you within 48 hours to discuss your agency's needs.</li>
            <li>Early access members get founder pricing and a direct line to our dev team.</li>
          </ul>
          <p>Best regards,<br/>The Noctra Studio Team</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">¡Ya estás en la lista!</h1>
          <p>Hola,</p>
          <p>Gracias por tu interés en <strong>Noctra CRM (Forge)</strong>. Hemos recibido tu solicitud para el acceso anticipado.</p>
          <p>Nuestro equipo está revisando las aplicaciones para la beta privada. Buscamos agencias que quieran ayudarnos a moldear el futuro de la gestión digital.</p>
          <p><strong>¿Qué sigue?</strong></p>
          <ul>
            <li>Te contactaremos en las próximas 48 horas para discutir las necesidades de tu agencia.</li>
            <li>Los miembros con early access obtienen precio de fundador y línea directa con nuestro equipo de desarrollo.</li>
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
      subject: `New Early Access Lead: ${agencyName || 'Personal'} (${email})`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Forge CRM Lead</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Agency:</strong> ${agencyName || 'N/A'}</p>
          <p><strong>Locale:</strong> ${locale}</p>
          <p><strong>Status:</strong> Set as CRM potential</p>
        </div>
      `,
    });

  } catch (emailError) {
    console.error("Error sending Early Access email:", emailError);
    // We don't throw here to avoid failing the whole request if email fails but DB succeeded
  }

  return { success: true };
}
