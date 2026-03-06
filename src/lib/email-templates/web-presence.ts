import { layout } from "./layout";

export const webPresenceTemplate = {
  es: {
    subject: "Tu nueva presencia digital - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        WEB PRESENCE
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hola ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Gracias por contactarnos sobre tu proyecto de <strong>Presencia Web</strong>.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        En Noctra no solo diseñamos sitios bonitos; construimos activos digitales que cargan en menos de 1.5s y convierten visitas en clientes.
      </div>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Me gustaría conocer más sobre tu visión. ¿Podemos agendar una breve llamada esta semana?
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              Agendar mi sesión
            </a>
          </td>
        </tr>
      </table>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #666666; margin-top: 32px;">
        — Manuel, Noctra Studio
      </div>
    `, "es")
  },
  en: {
    subject: "Your new digital presence - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        WEB PRESENCE
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hey ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Thanks for reaching out about your <strong>Web Presence</strong> project.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        At Noctra, we don't just design pretty sites; we build digital assets that load in under 1.5s and turn visitors into customers.
      </div>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        I'd love to learn more about your vision. Can we hop on a quick call this week?
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              Schedule my session
            </a>
          </td>
        </tr>
      </table>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #666666; margin-top: 32px;">
        — Manuel, Noctra Studio
      </div>
    `, "en")
  }
};
