import { layout } from "./layout";

export const welcomeTemplate = {
  es: {
    subject: "Bienvenido a Noctra Forge 🚀",
    html: (name: string, isEarlyAccess: boolean) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        BIENVENIDO A BORDO
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        ¡Hola ${name.split(' ')[0]}!
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Tu cuenta de <strong>Noctra Forge</strong> ha sido creada con éxito. Estamos emocionados de ayudarte a escalar tu agencia con nuestra infraestructura inteligente.
      </p>
      
      <div style="background: #111111; border-left: 3px solid #10b981; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; margin-bottom: 32px;">
        Recuerda que tienes <strong>14 días de prueba gratuita</strong> para explorar todas las herramientas.
        ${isEarlyAccess ? '<br><br><span style="color: #10b981; font-weight: bold;">🌟 ¡Felicidades! Aún calificas para el beneficio de Early Access (Precio vitalicio si te suscribes ahora).</span>' : ''}
      </div>

      <h3 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0;">
        Recursos para empezar:
      </h3>
      <ul style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #ededed; margin: 0 0 32px 0; padding-left: 20px;">
        <li style="margin-bottom: 12px;">
          <a href="https://noctra.studio/docs/migracion" style="color: #10b981; text-decoration: none;">Cómo crear tu primera propuesta →</a>
        </li>
        <li style="margin-bottom: 12px;">
          <a href="https://noctra.studio/docs" style="color: #10b981; text-decoration: none;">Explorar la documentación central →</a>
        </li>
      </ul>

      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 0 0 32px;">
            <a href="https://noctra.studio/forge"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
              Entrar a mi Dashboard
            </a>
          </td>
        </tr>
      </table>

      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #666666; margin-top: 32px; border-top: 1px solid #1f1f1f; pt: 32px;">
        Si tienes alguna duda, responde directamente a este correo.<br>
        — El equipo de Noctra Forge
      </div>
    `, "es")
  },
  en: {
    subject: "Welcome to Noctra Forge 🚀",
    html: (name: string, isEarlyAccess: boolean) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        WELCOME ABOARD
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hi ${name.split(' ')[0]}!
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Your <strong>Noctra Forge</strong> account has been successfully created. We're excited to help you scale your agency with our intelligent infrastructure.
      </p>
      
      <div style="background: #111111; border-left: 3px solid #10b981; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; margin-bottom: 32px;">
        Remember you have <strong>14 days of free trial</strong> to explore all our tools.
        ${isEarlyAccess ? '<br><br><span style="color: #10b981; font-weight: bold;">🌟 Congrats! You still qualify for the Early Access benefit (Lifetime pricing if you subscribe now).</span>' : ''}
      </div>

      <h3 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0;">
        Getting started resources:
      </h3>
      <ul style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #ededed; margin: 0 0 32px 0; padding-left: 20px;">
        <li style="margin-bottom: 12px;">
          <a href="https://noctra.studio/docs/migracion" style="color: #10b981; text-decoration: none;">How to create your first proposal →</a>
        </li>
        <li style="margin-bottom: 12px;">
          <a href="https://noctra.studio/docs" style="color: #10b981; text-decoration: none;">Explore our central documentation →</a>
        </li>
      </ul>

      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 0 0 32px;">
            <a href="https://noctra.studio/forge"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
              Enter my Dashboard
            </a>
          </td>
        </tr>
      </table>

      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #666666; margin-top: 32px; border-top: 1px solid #1f1f1f; pt: 32px;">
        If you have any questions, just reply to this email.<br>
        — The Noctra Forge Team
      </div>
    `, "en")
  }
};
