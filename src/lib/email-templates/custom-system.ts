import { layout } from "./layout";

export const customSystemTemplate = {
  es: {
    subject: "Optimicemos tus operaciones con IA - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        CUSTOM SYSTEMS & IA
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hola ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Gracias por tu interés en nuestros <strong>Sistemas a Medida e IA</strong>.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        Entiendo que buscas optimizar procesos u operacionalizar inteligencia artificial en tu flujo de trabajo. Esta es nuestra especialidad: transformar problemas complejos en soluciones técnicas elegantes y eficientes.
      </div>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Para darte una propuesta aterrizada, necesito entender los cuellos de botella de tu operación.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              Agendar Sesión Técnica
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
    subject: "Optimizing your operations with AI - Noctra Studio",
    html: (name: string) => layout(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; letter-spacing: 0.15em; color: #666666; margin-bottom: 16px; text-transform: uppercase;">
        CUSTOM SYSTEMS & IA
      </div>
      <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 24px 0;">
        Hey ${name.split(' ')[0]}
      </h1>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        Thanks for your interest in our <strong>Custom Systems & AI</strong> solutions.
      </p>
      <div style="background: #111111; border-left: 3px solid #22c55e; padding: 16px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #ededed; font-style: italic; margin-bottom: 24px;">
        I understand you're looking to optimize processes or integrate artificial intelligence into your workflow. This is our specialty: transforming complex problems into elegant, efficient technical solutions.
      </div>
      <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.7; color: #ededed; margin-bottom: 24px;">
        To give you a precise proposal, I need to understand your current operational bottlenecks.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 24px 0 32px;">
            <a href="https://calendly.com/noctra-studio/30min"
               style="display: inline-block; background-color: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 0;">
              Book Technical Session
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
