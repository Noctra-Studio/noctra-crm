import {
  H1,
  H2,
  H3,
  P,
  List,
  ListItem,
  Warning,
  InlineCode,
  Danger,
} from "../DocsContentRenderer";

export default function ConfigurationDoc() {
  return (
    <div className="animate-in fade-in duration-300">
      <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500 mb-2 block">
        Configuración
      </span>
      <H1>Ajustes de Plataforma y Seguridad</H1>
      <P>
        La confidencialidad y auditabilidad de los datos en Noctra Forge son
        críticas, no opcionales. Aquí accedes a la gestión de tu propia cuenta.
      </P>

      <H2>Manejo de Sesiones (Session Management)</H2>
      <P>
        Bajo los lineamientos de Enterprise Compliance, tu sesión en{" "}
        <InlineCode>/*</InlineCode>
        posee un sistema estricto de expiración para evitar ventanas perdidas:
      </P>
      <List>
        <ListItem>
          <strong>Inactividad Táctica:</strong> Tras 28 minutos de nula
          respuesta del ratón/teclado, se lanzará un Modal de alerta sonoro. Si
          no se acciona "Mantenerse Loggeado" en el minuto 30, serás forzado a
          salir al login cortando todos los JWT local cookies.
        </ListItem>
        <ListItem>
          <strong>Absolute Session TTL:</strong> Por máxima seguridad, ninguna
          sesión puede exceder las 8 horas contínuas. Pasadas las 8h del login
          original, un cierre de sesión forzoso cortará tu acceso, requiriendo
          un relogin íntegro aunque hayas estado tecleando en el segundo -1.
        </ListItem>
      </List>

      <H2>Autenticación Multi-Factor (2FA / TOTP)</H2>
      <P>
        Se requiere que los perfiles Administradores echen a andar la
        Autenticación de Dos Pasos (Time-Based One-Time Passwords).
      </P>
      <H3>Cómo activarlo</H3>
      <List>
        <ListItem>
          Desde tu Dashboard, haz clic en tu Avatar superior derecho y
          selecciona <strong>Configuración</strong>.
        </ListItem>
        <ListItem>
          Viaja a la pestaña <strong>Seguridad</strong>.
        </ListItem>
        <ListItem>
          Escanea el Código QR que aparece usando Google Authenticator o Authy.
        </ListItem>
        <ListItem>
          Valida el primer código (6-dígitos temporal) de la App en el Forge
          para emparejar criptográficamente el Vault de Supabase Auth con tu
          dispositivo celular.
        </ListItem>
      </List>

      <Warning>
        Noctra Forge utiliza "Identity Assurances". En caso de detectarse un
        riesgo e intentar ejecutar RLS policies restrictivas, el sistema puede
        bloquear peticiones al servidor si no detecta el Assurarance de
        Autenticación AMBAS capas.
      </Warning>

      <Danger>
        Si un dispositivo con 2FA registrado se pierde, se requiere una
        re-intervención nivel administrador global directo sobre el motor
        Supabase para resetear el flag MFA del usuario.
      </Danger>
    </div>
  );
}
