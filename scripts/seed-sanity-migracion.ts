// @ts-nocheck
// script para migrar los guías Tier 1 a Sanity
import { createClient } from "next-sanity";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Configure using your existing Sanity details
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "vov5cplv",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-02-22",
  token: process.env.SANITY_API_TOKEN, // Ensure this token is set in .env.local with write permissions
  useCdn: false,
});

const generateBlockText = (text: string) => ({
  _key: Math.random().toString(36).substring(7),
  _type: "block",
  style: "normal",
  children: [
    {
      _key: Math.random().toString(36).substring(7),
      _type: "span",
      marks: [],
      text: text,
    },
  ],
});

export const guidesData = [
  {
    _type: "migrationGuide",
    platform: "HubSpot",
    tier: "tier1",
    slug: { current: "hubspot" },
    platformColor: { hex: "#FF7A59" },
    lastUpdated: "2026-02-22",
    estimatedTime: "10-20 minutos",
    difficulty: "easy",
    supportedEntities: [
      "Contactos",
      "Empresas",
      "Oportunidades",
      "Actividades",
      "Listas",
      "Etiquetas",
    ],
    prerequisites: [
      "Cuenta activa en HubSpot (cualquier plan, incluyendo el gratuito)",
      "Permisos de administrador de cuenta, o permisos de 'Exportar datos'",
      "Ser administrador o super admin en Noctra CRM",
    ],
    exportSteps: [
      generateBlockText(
        "La migración desde HubSpot usa OAuth 2.0, por lo que no necesitas copiar ninguna API key."
      ),
      generateBlockText(
        "1. En Noctra CRM, ve a Ajustes → Migración → Nueva migración"
      ),
      generateBlockText(
        "2. Selecciona HubSpot de la lista de plataformas"
      ),
      generateBlockText(
        "3. Haz clic en 'Conectar con HubSpot'"
      ),
      generateBlockText(
        "4. Se abrirá una ventana de HubSpot pidiendo que inicies sesión y que autorices el acceso a Noctra CRM"
      ),
      generateBlockText(
        "5. Selecciona la cuenta de HubSpot correcta si tienes varias"
      ),
      generateBlockText(
        "6. Haz clic en 'Conectar aplicación'"
      ),
      generateBlockText(
        "7. Serás redirigido de vuelta a Noctra CRM con la conexión establecida"
      ),
      {
        _key: Math.random().toString(36).substring(7),
        _type: "calloutBox",
        type: "tip",
        content:
          "Si tu empresa usa múltiples portales de HubSpot, asegúrate de seleccionar el portal correcto en el paso 5. El nombre del portal aparece en la esquina superior izquierda de HubSpot.",
      },
    ],
    commonErrors: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Error de autorización OAuth",
        cause: "La sesión de HubSpot expiró durante el proceso",
        solution: "Desconecta y vuelve a conectar la cuenta",
        severity: "warning",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "No se encontraron contactos",
        cause: "El portal de HubSpot está vacío o seleccionaste el portal incorrecto",
        solution: "Verifica en HubSpot que hay datos en Contactos",
        severity: "warning",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Deal sin pipeline asignado",
        cause: "El deal en HubSpot está en un pipeline que no tiene equivalente en Noctra",
        solution: "El sistema creará el pipeline automáticamente con el mismo nombre",
        severity: "info",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Propietario no encontrado",
        cause: "El usuario asignado en HubSpot no tiene cuenta en Noctra CRM",
        solution: "Los registros se asignan al usuario que ejecuta la migración; puedes reasignar después",
        severity: "info",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Límite de rate alcanzado",
        cause: "HubSpot limita las llamadas API (por plan)",
        solution: "La migración pausará automáticamente y continuará en 60 segundos",
        severity: "warning",
      },
    ],
    integrityChecks: [
      generateBlockText("1. Conteo de registros: Compara el número de contactos en HubSpot con el conteo en Noctra CRM"),
      generateBlockText("2. Propiedades personalizadas: Verifica que se hayan importado como campos personalizados en Noctra"),
      generateBlockText("3. Asociaciones: Verifica que los contactos están correctamente asociados a sus empresas"),
      generateBlockText("4. Historial de actividades: Revisa que las notas y tareas aparecen en el timeline de los contactos"),
      {
        _key: Math.random().toString(36).substring(7),
        _type: "calloutBox",
        type: "warning",
        content: "Nota sobre el historial de emails: HubSpot no permite exportar los emails enviados desde Gmail/Outlook conectados vía la integración de inbox. Solo se migran las notas y tareas creadas directamente en HubSpot."
      }
    ],
    preImportChecklist: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Tienes permisos de administrador en HubSpot",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Has revisado cuántos contactos, empresas y deals tienes en HubSpot",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Tienes acceso de administrador en Noctra CRM",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Has creado un respaldo/exportación manual en HubSpot como medida de seguridad",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Sabes qué hacer con los duplicados (ignorar, sobrescribir o fusionar)",
        required: true,
      },
    ],
  },
  {
    _type: "migrationGuide",
    platform: "Zoho CRM",
    tier: "tier1",
    slug: { current: "zoho" },
    platformColor: { hex: "#116DB6" },
    lastUpdated: "2026-02-22",
    estimatedTime: "15-25 minutos",
    difficulty: "medium",
    supportedEntities: [
      "Contactos",
      "Empresas",
      "Leads",
      "Oportunidades",
      "Actividades",
      "Etiquetas",
    ],
    prerequisites: [
      "Cuenta activa en Zoho CRM (plan Estándar o superior para acceso a API)",
      "Permisos de Administrador de CRM",
      "Ser administrador o super admin en Noctra CRM",
    ],
    exportSteps: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "calloutBox",
        type: "warning",
        content: "El plan gratuito de Zoho CRM no incluye acceso completo a la API. Si estás en el plan gratuito, usa la opción de exportación CSV en su lugar."
      },
      generateBlockText("Zoho CRM usa OAuth 2.0:"),
      generateBlockText("1. En Noctra CRM, ve a Ajustes → Migración → Nueva migración"),
      generateBlockText("2. Selecciona Zoho CRM"),
      generateBlockText("3. Haz clic en 'Conectar con Zoho'"),
      generateBlockText("4. Selecciona tu región de Zoho (.com, .eu, .in, .com.au, .jp) - La mayoría de usuarios de LATAM usan .com"),
      generateBlockText("5. Inicia sesión con tu cuenta de Zoho"),
      generateBlockText("6. En la pantalla de permisos, acepta todos los permisos solicitados"),
      generateBlockText("7. Serás redirigido de vuelta a Noctra CRM"),
    ],
    commonErrors: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Acceso denegado — plan insuficiente",
        cause: "El plan gratuito de Zoho no permite acceso API completo",
        solution: "Actualiza tu plan de Zoho o usa exportación CSV",
        severity: "blocking",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Region mismatch",
        cause: "Seleccionaste la región incorrecta",
        solution: "Verifica en Zoho: la URL de tu CRM indica la región (ej. crm.zoho.eu)",
        severity: "warning",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Field not found: cf_campo_custom",
        cause: "Campo personalizado de Zoho con nombre técnico",
        solution: "En el mapeo de campos, busca el campo manualmente por su nombre visible",
        severity: "info",
      },
    ],
    integrityChecks: [
      generateBlockText("1. En Zoho CRM, ve a Informes → Módulo de Contactos para ver el conteo total"),
      generateBlockText("2. Compara con el número importado en Noctra CRM"),
      generateBlockText("3. Verifica que las cuentas (Empresas) se importaron correctamente y que los contactos están vinculados"),
      generateBlockText("4. Revisa 5-10 registros al azar comparando los datos en ambos sistemas"),
    ],
    preImportChecklist: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Tienes plan Estándar o superior en Zoho CRM (o usarás CSV)",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Sabes en qué región está tu cuenta de Zoho",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Tienes permisos de Administrador en Zoho CRM",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Has verificado el conteo actual de registros en cada módulo",
        required: true,
      },
    ],
  },
  {
    _type: "migrationGuide",
    platform: "Pipedrive",
    tier: "tier1",
    slug: { current: "pipedrive" },
    platformColor: { hex: "#22B573" },
    lastUpdated: "2026-02-22",
    estimatedTime: "10-15 minutos",
    difficulty: "easy",
    supportedEntities: [
      "Contactos",
      "Empresas",
      "Oportunidades",
      "Actividades",
      "Pipelines",
    ],
    prerequisites: [
      "Cuenta activa en Pipedrive (cualquier plan)",
      "Acceso de Administrador o acceso a API en la configuración de tu cuenta",
      "Ser administrador en Noctra CRM",
    ],
    exportSteps: [
      generateBlockText("Pipedrive usa API Key en lugar de OAuth:"),
      generateBlockText("1. En Pipedrive, ve a tu nombre de usuario (arriba a la derecha) → Configuración personal"),
      generateBlockText("2. Selecciona la pestaña API"),
      generateBlockText("3. Copia tu Token de API personal"),
      generateBlockText("4. En Noctra CRM, ve a Ajustes → Migración → Nueva migración"),
      generateBlockText("5. Selecciona Pipedrive"),
      generateBlockText("6. Pega tu API Key en el campo correspondiente"),
      generateBlockText("7. Haz clic en 'Verificar conexión'"),
    ],
    commonErrors: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Invalid API token",
        cause: "Token copiado incorrectamente o con espacios",
        solution: "Copia el token nuevamente sin espacios al inicio/final",
        severity: "blocking",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Deal sin persona asociada",
        cause: "Deals en Pipedrive que no tienen contacto vinculado",
        solution: "Se importan igual; puedes vincularlos después en Noctra",
        severity: "warning",
      },
    ],
    integrityChecks: [
      generateBlockText("1. En Pipedrive: Estadísticas → Resumen para ver el total de Personas, Organizaciones y Deals"),
      generateBlockText("2. Verifica en Noctra que los pipelines se replicaron con las mismas etapas y orden"),
      generateBlockText("3. Revisa que las notas adjuntas a deals aparecen en el timeline"),
    ],
    preImportChecklist: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Tienes acceso a la sección API en tu perfil de Pipedrive",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Has copiado correctamente el API Token",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Conoces cuántos deals activos y cerrados tienes (para verificar después)",
        required: true,
      },
    ],
  },
  {
    _type: "migrationGuide",
    platform: "Odoo",
    tier: "tier1",
    slug: { current: "odoo" },
    platformColor: { hex: "#714B67" },
    lastUpdated: "2026-02-22",
    estimatedTime: "20-45 minutos",
    difficulty: "advanced",
    supportedEntities: [
      "Contactos",
      "Oportunidades",
      "Actividades",
      "Etiquetas",
    ],
    prerequisites: [
      "Odoo 14, 15, 16 o 17 (online u on-premise)",
      "Acceso de usuario con permisos de Administrador o acceso técnico habilitado",
      "API Key de Odoo habilitada en tu cuenta",
      "Módulo de CRM instalado en Odoo (crm)",
      "Ser administrador en Noctra CRM",
    ],
    exportSteps: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "calloutBox",
        type: "warning",
        content: "Odoo es una plataforma altamente personalizable, lo que significa que cada instalación puede tener campos, módulos y configuraciones distintas. Esta guía cubre la instalación estándar de Odoo 16 y 17. Si tienes módulos personalizados, es posible que necesites ajustar el mapeo de campos manualmente."
      },
      generateBlockText("Paso 1: Activar el modo desarrollador"),
      generateBlockText("1. En Odoo, ve a Ajustes"),
      generateBlockText("2. Baja hasta la sección Desarrollador y haz clic en 'Activar el modo desarrollador' (La URL de tu navegador cambiará y aparecerá ?debug=1)"),
      generateBlockText("Paso 2: Obtener tu API Key"),
      generateBlockText("1. Ve a tu perfil de usuario (esquina superior derecha → tu nombre)"),
      generateBlockText("2. Selecciona 'Preferencias' > 'Seguridad de la cuenta' > 'Claves de API' > 'Nueva clave de API'"),
      generateBlockText("3. Dale un nombre y copia la clave inmediatamente (Odoo no la volverá a mostrar)"),
      generateBlockText("Paso 3: Obtener la URL base de tu Odoo"),
      generateBlockText("- SaaS: https://tuempresa.odoo.com"),
      generateBlockText("- On-premise: https://odoo.tuempresa.com"),
      generateBlockText("- Community: http://localhost:8069"),
      generateBlockText("Paso 4: Conectar en Noctra CRM"),
      generateBlockText("Ingresa la URL, Base de datos (sin /web en el url logueado), Usuario y el API Key."),
    ],
    commonErrors: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "xmlrpc.client.Fault: Access Denied",
        cause: "API Key incorrecta o usuario sin permisos",
        solution: "Verifica la API Key y que el usuario tiene rol de Administrador",
        severity: "blocking",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Database not found",
        cause: "Nombre de base de datos incorrecto",
        solution: "Ve a la pantalla de login de Odoo (/web/database/selector) para ver las bases disponibles",
        severity: "blocking",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Model 'crm.lead' not found",
        cause: "El módulo CRM de Odoo no está instalado",
        solution: "Instala el módulo CRM desde Aplicaciones de Odoo",
        severity: "blocking",
      },
    ],
    preImportChecklist: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Modo desarrollador activado en Odoo",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "API Key generada y copiada correctamente",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Módulo CRM instalado en Odoo",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Sabes el nombre exacto de tu base de datos de Odoo",
        required: true,
      },
    ],
  },
  {
    _type: "migrationGuide",
    platform: "Salesforce",
    tier: "tier1",
    slug: { current: "salesforce" },
    platformColor: { hex: "#00A1E0" },
    lastUpdated: "2026-02-22",
    estimatedTime: "30-60 minutos",
    difficulty: "advanced",
    supportedEntities: [
      "Contactos",
      "Empresas",
      "Oportunidades",
      "Actividades",
      "Pipelines",
      "Etiquetas"
    ],
    prerequisites: [
      "Cuenta de Salesforce (Professional, Enterprise o Unlimited — el plan Essentials tiene limitaciones de API)",
      "Permisos de Administrador del sistema, o perfil personalizado con acceso a API habilitado",
      "Dirección IP de Noctra CRM en la lista de IPs confiables (si tu org tiene restricciones de IP)",
    ],
    exportSteps: [
      generateBlockText("1. En Noctra CRM, ve a Ajustes → Migración → Nueva migración"),
      generateBlockText("2. Selecciona Salesforce"),
      generateBlockText("3. Elige tu entorno: Producción (login.salesforce.com) o Sandbox (test.salesforce.com)"),
      generateBlockText("4. Haz clic en 'Conectar con Salesforce'"),
      generateBlockText("5. Inicia sesión en Salesforce con tu usuario administrador"),
      generateBlockText("6. Autoriza el acceso de Noctra CRM"),
      generateBlockText("7. Si tu org tiene restricciones de IP, contacta a tu administrador para añadir las IPs de Noctra"),
    ],
    commonErrors: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "API is disabled for this organization",
        cause: "El plan Essentials no incluye API",
        solution: "Actualiza el plan o usa exportación CSV desde Data Loader",
        severity: "blocking",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "INVALID_SESSION_ID",
        cause: "La sesión OAuth expiró",
        solution: "Reconecta la cuenta desde el wizard",
        severity: "warning",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "IP Restricted",
        cause: "La IP de Noctra bloqueada por tu org",
        solution: "Pide al administrador de Salesforce que añada las IPs de Noctra a la lista confiable",
        severity: "blocking",
      },
    ],
    preImportChecklist: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Plan Professional o superior (con acceso a API)",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Usuario administrador disponible para el OAuth",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Sin restricciones de IP, o IPs de Noctra ya en lista blanca",
        required: true,
      },
    ],
  },
  {
    _type: "migrationGuide",
    platform: "Freshsales",
    tier: "tier1",
    slug: { current: "freshsales" },
    platformColor: { hex: "#12344D" },
    lastUpdated: "2026-02-22",
    estimatedTime: "10-20 minutos",
    difficulty: "easy",
    supportedEntities: [
      "Contactos",
      "Empresas",
      "Oportunidades",
      "Actividades",
    ],
    prerequisites: [
      "Cuenta activa en Freshsales (cualquier plan pagado)",
      "Permisos de Administrador",
      "Tu subdominio de Freshsales (ej. tuempresa.myfreshworks.com)",
    ],
    exportSteps: [
      generateBlockText("1. En Freshsales, haz clic en tu avatar (esquina superior derecha) → Configuración de perfil"),
      generateBlockText("2. Ve a la sección API Settings o Autenticación"),
      generateBlockText("3. Copia tu API Key"),
      generateBlockText("4. En Noctra CRM, ve a Ajustes → Migración → Nueva migración"),
      generateBlockText("5. Selecciona Freshsales"),
      generateBlockText("6. Ingresa tu subdominio y tu API Key"),
      generateBlockText("7. Haz clic en 'Verificar conexión'"),
    ],
    commonErrors: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "401 Unauthorized",
        cause: "API Key incorrecta o sin permisos",
        solution: "Regenera la API Key en tu perfil de Freshsales",
        severity: "blocking",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Domain not found",
        cause: "Subdominio incorrecto",
        solution: "Verifica la URL completa de tu Freshsales: tuempresa.myfreshworks.com",
        severity: "blocking",
      },
    ],
    preImportChecklist: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Tienes tu subdominio de Freshsales a la mano",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "API Key copiada correctamente",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Permisos de administrador activos",
        required: true,
      },
    ],
  },
  {
    _type: "migrationGuide",
    platform: "Bitrix24",
    tier: "tier1",
    slug: { current: "bitrix24" },
    platformColor: { hex: "#00AEEF" },
    lastUpdated: "2026-02-22",
    estimatedTime: "15-30 minutos",
    difficulty: "medium",
    supportedEntities: [
      "Contactos",
      "Empresas",
      "Oportunidades",
      "Actividades",
    ],
    prerequisites: [
      "Cuenta activa en Bitrix24 (cloud u on-premise)",
      "Permisos de Administrador",
      "Webhook de entrada configurado (ver instrucciones)",
    ],
    exportSteps: [
      generateBlockText("Bitrix24 no usa OAuth estándar para integraciones externas; usa Webhooks de entrada:"),
      generateBlockText("1. En Bitrix24, ve a Aplicaciones (en el menú lateral izquierdo)"),
      generateBlockText("2. Selecciona Webhooks → Agregar Webhook"),
      generateBlockText("3. Selecciona 'Webhook de entrada'"),
      generateBlockText("4. Nombre: 'Noctra CRM Migration'"),
      generateBlockText("5. En Derechos de acceso, habilita: CRM (contactos/deals) y user (información de usuarios)"),
      generateBlockText("6. Haz clic en 'Guardar'"),
      generateBlockText("7. Copia la URL del Webhook que aparece (contiene el token de acceso)"),
      generateBlockText("8. En Noctra CRM, ve a Ajustes → Migración → Nueva migración"),
      generateBlockText("9. Selecciona Bitrix24"),
      generateBlockText("10. Pega la URL del Webhook completa"),
    ],
    commonErrors: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Webhook URL inválida",
        cause: "URL copiada incorrectamente o webhook eliminado",
        solution: "Verifica en Bitrix24 que el webhook existe y copia la URL completa",
        severity: "blocking",
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "errorEntry",
        errorMessage: "Access denied to CRM",
        cause: "Permisos de CRM no habilitados en el webhook",
        solution: "Edita el webhook y activa los permisos de CRM",
        severity: "blocking",
      },
    ],
    preImportChecklist: [
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Webhook de entrada creado con permisos de CRM habilitados",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "URL del Webhook copiada completa (incluye el token)",
        required: true,
      },
      {
        _key: Math.random().toString(36).substring(7),
        _type: "checklistItem",
        label: "Si es on-premise, el servidor es accesible desde internet",
        required: true,
      },
    ],
  },
];

async function seedData() {
  console.log("Seeding Sanity dataset with Migration Docs...");

  try {
    const transaction = client.transaction();
    for (const guide of guidesData) {
      transaction.createOrReplace({
        _id: `migrationGuide-${guide.slug.current}`,
        ...guide,
      });
    }
    const result = await transaction.commit();
    console.log(`Successfully seeded ${result.documentIds.length} sanity documents!`);
  } catch (err) {
    console.error("Error seeding sanity records", err);
  }
}

seedData();
