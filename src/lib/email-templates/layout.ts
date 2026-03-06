export const layout = (content: string, locale: string) => `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Noctra Studio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="100%" maxWidth="600" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; background-color: #0a0a0a;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; border-bottom: 1px solid #1f1f1f; background-color: #0a0a0a;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 20px; color: #ffffff; line-height: 1;">
                      ◆
                    </span>
                  </td>
                  <td style="vertical-align: middle; padding-left: 10px; border-left: 1px solid #1f1f1f; margin-left: 10px;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.2em; color: #ffffff; text-transform: uppercase; text-decoration: none;">
                      NOCTRA
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px 64px; color: #ffffff;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; border-top: 1px solid #1f1f1f;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #ffffff; text-transform: uppercase;">
                      ◆ NOCTRA STUDIO
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #666666; margin-top: 4px;">
                      Querétaro, México
                    </div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; color: #333333; margin-top: 20px;">
                      ${locale === "es" 
                        ? "Este correo fue enviado porque completaste nuestro formulario de contacto en noctra.studio" 
                        : "This email was sent because you filled out the contact form at noctra.studio"}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
