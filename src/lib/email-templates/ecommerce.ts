import { layout } from "./layout";

export const ecommerceTemplate = {
  es: {
    subject: "Escala tus ventas online - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        E-COMMERCE
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hola ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Recibí tu mensaje sobre tu interés en <strong>E-commerce</strong>.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        Para escalar una tienda online hoy en día, no basta con "estar en internet". Necesitas velocidad extrema, una experiencia de usuario sin fricciones y una arquitectura robusta.
      </div>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Me gustaría entender mejor tu modelo de negocio y el volumen que buscas manejar. Conversemos brevemente:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              Agendar Consultoría
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
    subject: "Scale your online sales - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        E-COMMERCE
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hey ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        I've received your message regarding your interest in <strong>E-commerce</strong>.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        To scale an online store today, simply "being online" isn't enough. You need extreme speed, a frictionless user experience, and a robust architecture.
      </div>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        I'd like to better understand your business model and the volume you're looking to handle. Let's have a quick chat:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              Book a Strategy Session
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
