import { layout } from "./layout";

export const discoveryTemplate = {
  es: {
    subject: "Agendemos tu llamada de descubrimiento - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        DISCOVERY CALL
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hola ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Gracias por tu interés en trabajar con nosotros. He recibido tu solicitud para una <strong>Llamada de Descubrimiento</strong>.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        En esta sesión de 20 minutos revisaremos tus objetivos, los desafíos actuales de tu proyecto y cómo Noctra puede ayudarte a escalar.
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              Agendar Llamada
            </a>
          </td>
        </tr>
      </table>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Si tienes alguna pregunta previa, simplemente responde a este correo.
      </p>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #666666; margin-top: 32px;">
        — Manuel, Noctra Studio
      </div>
    `, "es")
  },
  en: {
    subject: "Let's schedule your discovery call - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        DISCOVERY CALL
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hey ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Thanks for your interest in working with us. I've received your request for a <strong>Discovery Call</strong>.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        In this 20-minute session, we'll review your goals, current project challenges, and how Noctra can help you scale.
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              Book a Call
            </a>
          </td>
        </tr>
      </table>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        If you have any questions beforehand, just reply to this email.
      </p>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #666666; margin-top: 32px;">
        — Manuel, Noctra Studio
      </div>
    `, "en")
  }
};
