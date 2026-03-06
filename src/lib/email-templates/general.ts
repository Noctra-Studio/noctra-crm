import { layout } from "./layout";

export const generalTemplate = {
  es: {
    subject: "Hemos recibido tu mensaje - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        NUEVO CONTACTO
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hola ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Gracias por ponerte en contacto con <strong>Noctra Studio</strong>.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        He recibido tu información y revisaré tu mensaje personalmente. Me pondré en contacto contigo en menos de 24 horas para discutir cómo podemos colaborar.
      </div>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Si tu solicitud es urgente, también puedes agendar una llamada directa aquí:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              Ver disponibilidad
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
    subject: "We've received your message - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        NEW CONTACT
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hey ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Thank you for reaching out to <strong>Noctra Studio</strong>.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        I've received your information and will review your message personally. I'll get back to you within 24 hours to discuss how we can collaborate.
      </div>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        If your request is urgent, you can also book a direct call here:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              View availability
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
