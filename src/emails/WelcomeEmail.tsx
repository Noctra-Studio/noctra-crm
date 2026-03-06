import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
  Font,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name?: string;
  lang?: "en" | "es";
}

export const WelcomeEmail = ({ name, lang = "en" }: WelcomeEmailProps) => {
  const greetingName = name || (lang === "es" ? "Viajero" : "Traveller");

  const content = {
    en: {
      subject: "Noctra / Protocol Initiated",
      headline: `Protocol Initiated, ${greetingName}.`,
      body1:
        "We have received your signal. Our studio is active and accepting select architectural inquiries for 2026.",
      body2:
        "Have a project that requires senior engineering talent? We specialize in high-performance digital infrastructure. Let's talk.",
      button: "INITIATE COMMS",
      ctaUrl: "mailto:hello@noctra.studio?subject=Project%20Inquiry",
      footer: `© ${new Date().getFullYear()} Noctra Studio. All rights reserved.`,
    },
    es: {
      subject: "Noctra / Protocolo Iniciado",
      headline: `Protocolo Iniciado, ${greetingName}.`,
      body1:
        "Hemos recibido tu señal. Nuestro estudio está activo y aceptando consultas de arquitectura selectas para 2026.",
      body2:
        "¿Tienes un proyecto que requiere talento de ingeniería senior? Nos especializamos en infraestructura digital de alto rendimiento. Hablemos.",
      button: "INICIAR COMUNICACIÓN",
      ctaUrl: "mailto:hello@noctra.studio?subject=Consulta%20de%20Proyecto",
      footer: `© ${new Date().getFullYear()} Noctra Studio. Todos los derechos reservados.`,
    },
  };

  const t = content[lang] || content.en;

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxK.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{t.headline}</Preview>

      {/* Immutable Dark Mode: Force Black Background */}
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#000000",
          fontFamily: "Roboto, Verdana, sans-serif",
        }}>
        {/* Table Wrapper Hack - Forces background on Gmail/Outlook */}
        <table
          width="100%"
          border={0}
          cellSpacing={0}
          cellPadding={0}
          role="presentation"
          style={{ backgroundColor: "#000000" }}>
          <tr>
            <td align="center" style={{ padding: "40px 20px" }}>
              {/* Card Container */}
              <Container
                style={{
                  maxWidth: "480px",
                  width: "100%",
                  backgroundColor: "#050505",
                  borderRadius: "24px",
                  padding: "40px",
                  border: "1px solid #222222",
                }}>
                {/* White Logo - Immutable */}
                <div style={{ marginBottom: "32px" }}>
                  <Img
                    src="https://noctra.studio/static/noctra-logo-white.png"
                    alt="Noctra Studio"
                    width="auto"
                    height="32"
                    style={{ display: "block" }}
                  />
                </div>

                {/* Headline - White Text */}
                <Heading
                  style={{
                    color: "#ffffff",
                    fontSize: "32px",
                    fontWeight: "bold",
                    margin: "0 0 24px 0",
                    letterSpacing: "-0.025em",
                  }}>
                  {t.headline}
                </Heading>

                {/* Body Text - Light Gray */}
                <Text
                  style={{
                    color: "#a1a1aa",
                    fontSize: "15px",
                    lineHeight: "24px",
                    margin: "0 0 24px 0",
                  }}>
                  {t.body1}
                </Text>

                <Text
                  style={{
                    color: "#a1a1aa",
                    fontSize: "15px",
                    lineHeight: "24px",
                    margin: "0 0 32px 0",
                  }}>
                  {t.body2}
                </Text>

                {/* CTA Button - White on Black */}
                <div style={{ marginBottom: "40px" }}>
                  <Button
                    href={t.ctaUrl}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      padding: "14px 28px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      textDecoration: "none",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderRadius: "9999px",
                      display: "inline-block",
                    }}>
                    {t.button}
                  </Button>
                </div>

                {/* Footer */}
                <div
                  style={{
                    borderTop: "1px solid #222222",
                    paddingTop: "24px",
                  }}>
                  <Text
                    style={{
                      color: "#52525b",
                      fontSize: "11px",
                      margin: "0",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                    {t.footer}
                  </Text>
                </div>
              </Container>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
