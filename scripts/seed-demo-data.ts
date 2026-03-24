// @ts-nocheck
/**
 * Noctra CRM — 12-Month Demo Data Seed
 *
 * Generates a coherent, realistic dataset for the demo environment:
 *   ~120 leads, ~50 proposals, ~25 contracts, ~20 projects, ~500 activities
 *
 * Usage:
 *   npx tsx scripts/seed-demo-data.ts [workspace-id]
 *
 * Environment:
 *   DEMO_WORKSPACE_ID  — override workspace (optional)
 *   Reads .env.local for Supabase credentials.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as crypto from "crypto";

dotenv.config({ path: ".env.local" });

// ─── Config ──────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const WORKSPACE_ID =
  process.env.DEMO_WORKSPACE_ID ||
  process.argv[2] ||
  "596024fa-0855-45b7-b1bd-00e43ccb9dfa";

const NOW = new Date();

// ─── Static Data ─────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Carlos","María","Roberto","Ana","Fernando","Laura","Alejandro","Sofía",
  "Miguel","Daniela","Jorge","Valentina","Ricardo","Gabriela","Andrés",
  "Isabella","Pablo","Camila","Eduardo","Regina","Sebastián","Mariana",
  "Diego","Andrea","Arturo","Patricia","Javier","Lucía","Omar","Claudia",
  "Raúl","Diana","Héctor","Montserrat","Francisco","Natalia","Luis","Fernanda",
  "Enrique","Alejandra","Emilio","Renata","Iván","Carolina","Marco","Paulina",
];

const LAST_NAMES = [
  "García","Rodríguez","Martínez","López","Hernández","González","Pérez",
  "Sánchez","Ramírez","Torres","Flores","Rivera","Morales","Castillo",
  "Ortiz","Gutiérrez","Mendoza","Delgado","Vega","Ríos","Contreras",
  "Reyes","Cruz","Aguilar","Salazar","Vargas","Paredes","Estrada",
  "Navarro","Cervantes","Ibarra","Montes",
];

const COMPANIES: { name: string; industry: string }[] = [
  { name: "Café Orgánico Oaxaca", industry: "Gastronomía" },
  { name: "Clínica Dental Sonríe", industry: "Salud" },
  { name: "Inmobiliaria Cenit", industry: "Inmobiliaria" },
  { name: "Escuela de Inglés GlobalSpeak", industry: "Educación" },
  { name: "Farmacia San Rafael", industry: "Salud" },
  { name: "Restaurante La Parrilla", industry: "Gastronomía" },
  { name: "Consultora Nexus LATAM", industry: "Servicios Profesionales" },
  { name: "Arquitectura Vanguardia", industry: "Construcción" },
  { name: "Centro Fitness Iron", industry: "Fitness" },
  { name: "Taquería Los Compadres", industry: "Gastronomía" },
  { name: "Estudio Legal Lex", industry: "Legal" },
  { name: "AutoParts Express", industry: "Automotriz" },
  { name: "Óptica Visión Clara", industry: "Salud" },
  { name: "Hotel Boutique Mazatlán", industry: "Turismo" },
  { name: "Tienda Naturista Vida Sana", industry: "Retail" },
  { name: "Cervecería Artesanal Lupulus", industry: "Gastronomía" },
  { name: "Marketplace MiTiendaMX", industry: "Comercio Electrónico" },
  { name: "Agencia Creativa Pixelworks", industry: "Tecnología" },
  { name: "Constructora Altamira", industry: "Construcción" },
  { name: "Spa Serenidad", industry: "Belleza y Bienestar" },
  { name: "Escuela de Cocina ChefMX", industry: "Educación" },
  { name: "Florería Primavera", industry: "Retail" },
  { name: "Veterinaria PetCare", industry: "Salud" },
  { name: "Muebles Artesanales MX", industry: "Manufactura" },
  { name: "Distribuidora El Potosí", industry: "Logística" },
  { name: "Textiles del Bajío", industry: "Manufactura" },
  { name: "Joyería Plata y Oro", industry: "Retail" },
  { name: "Panadería La Especial", industry: "Gastronomía" },
  { name: "Imprenta Digital PrintMax", industry: "Tecnología" },
  { name: "Academia de Danza Ritmo", industry: "Educación" },
  { name: "Despacho Contable Cifras", industry: "Servicios Profesionales" },
  { name: "Agencia de Viajes Exploramex", industry: "Turismo" },
  { name: "Laboratorio Clínico BioLab", industry: "Salud" },
  { name: "Ferretería El Tornillo", industry: "Retail" },
  { name: "Taller Mecánico ProFix", industry: "Automotriz" },
  { name: "Consultorio Pediátrico KidsCare", industry: "Salud" },
  { name: "Coworking Espacios Creativos", industry: "Tecnología" },
  { name: "Grupo Azteca Digital", industry: "Tecnología" },
  { name: "Logística RápidoMX", industry: "Logística" },
  { name: "Galería de Arte Contemporáneo", industry: "Cultura" },
];

const SERVICE_TYPES = ["web_presence", "ecommerce", "custom_system"] as const;

const SERVICE_CONFIG: Record<string, { basePrice: number; weeks: number; label: string }> = {
  web_presence:  { basePrice: 20000, weeks: 5, label: "Presencia Web" },
  ecommerce:     { basePrice: 35000, weeks: 7, label: "E-Commerce" },
  custom_system: { basePrice: 50000, weeks: 12, label: "Sistema Personalizado" },
};

const PIPELINE_STATUSES = [
  "nuevo","contactado","propuesta_enviada","en_negociacion","cerrado","perdido",
] as const;

const SOURCE_CTAS = [
  "iniciar-proyecto","agendar-llamada","quiero-empezar","contratar",
  "cotizar","mas-informacion","ver-precios","contactar",
  "newsletter","blog-cta","footer-form","manual_crm","website","linkedin-ad",
];

const LOST_REASONS = [
  "Presupuesto insuficiente",
  "Decidieron trabajar con otra agencia",
  "Proyecto cancelado internamente",
  "Sin respuesta después de múltiples intentos",
  "Timeline no compatible",
  "Cambio de prioridades del negocio",
  "No requieren los servicios actualmente",
  "Eligieron una solución más económica",
];

const MESSAGES_LONG = [
  "Hola, estamos buscando una agencia que nos ayude a rediseñar completamente nuestra presencia web. Actualmente nuestro sitio tiene más de 5 años y no refleja la calidad de nuestros servicios. Necesitamos algo moderno, rápido y optimizado para móviles. También nos interesa integrar un sistema de citas en línea.",
  "Buen día, somos una empresa en crecimiento y necesitamos digitalizar nuestros procesos de venta. Actualmente todo lo manejamos en hojas de cálculo y se ha vuelto insostenible. Buscamos un sistema personalizado que incluya gestión de clientes, seguimiento de pedidos y reportes automáticos. ¿Podrían agendar una llamada?",
  "Me recomendaron su agencia por un colega. Tenemos un e-commerce en Shopify pero queremos migrar a algo propio para tener más control sobre la experiencia del cliente. Manejamos aproximadamente 200 productos y necesitamos integración con MercadoPago y servicios de paquetería nacionales. El proyecto es urgente.",
  "Estamos lanzando una nueva marca de productos orgánicos y necesitamos todo el ecosistema digital: sitio web, tienda en línea, SEO y estrategia de contenido. Tenemos un presupuesto definido y queremos empezar lo antes posible. Nos gustaría ver ejemplos de proyectos similares que hayan realizado.",
  "Necesitamos desarrollar una plataforma interna para gestionar nuestras operaciones de logística. Actualmente coordinamos entregas por WhatsApp y correo, lo cual genera muchos errores. El sistema debe incluir tracking en tiempo real, asignación de rutas y panel de administración.",
];

const MESSAGES_MEDIUM = [
  "Hola, nos interesa un sitio web profesional para nuestro despacho. Queremos que refleje seriedad y confianza. ¿Podrían enviarnos información de sus servicios y precios?",
  "Buscamos rediseñar nuestra tienda en línea. El diseño actual no convierte bien y los clientes se quejan de la experiencia de compra en móviles.",
  "Necesitamos un sistema para agendar citas de nuestros pacientes en línea. Algo sencillo pero profesional que se integre con Google Calendar.",
  "Queremos crear una landing page para nuestra nueva campaña de marketing digital. Necesitamos que esté lista en 2 semanas máximo.",
  "Me gustaría cotizar un sitio web para mi restaurante con menú digital, reservaciones en línea y galería de fotos de nuestros platillos.",
];

const MESSAGES_SHORT = [
  "Me interesa cotizar un sitio web para mi negocio.",
  "Necesitamos una tienda en línea. ¿Cuáles son sus precios?",
  "Quiero información sobre sus servicios de desarrollo web.",
  "Busco una agencia para rediseñar mi página. ¿Están disponibles?",
  "Nos recomendaron con ustedes. Necesitamos un e-commerce.",
];

const MESSAGES_MINIMAL = [
  "Información por favor",
  "Cotización de sitio web",
  "Necesito ayuda con mi página",
  "¿Tienen disponibilidad?",
];

const ACTIVITY_CONTENTS = {
  note: [
    "Cliente mencionó que tiene urgencia para lanzar antes de fin de mes.",
    "Competidor también está cotizando. Considerar ajustar pricing.",
    "Requiere facturación a nombre de persona moral.",
    "El cliente tiene un presupuesto limitado pero está muy interesado.",
    "Mencionó que necesita el proyecto para una fecha específica de campaña.",
    "Buen fit con nuestro perfil de clientes ideales.",
    "Necesita aprobación de su socio antes de proceder.",
    "Interesado en plan de pagos a 3 meses.",
    "Solicitó referencias de proyectos similares.",
    "Tiene dominio y hosting actuales que necesitan migración.",
  ],
  call: [
    "Llamada de descubrimiento completada. El cliente tiene claro el alcance del proyecto.",
    "Llamada de seguimiento. Interesado pero necesita más tiempo para decidir.",
    "Llamada para aclarar requerimientos técnicos y definir stack.",
    "Llamada breve para confirmar recepción de la propuesta.",
    "Llamada para negociar términos de pago y timeline.",
    "Se discutieron las prioridades del proyecto y los entregables clave.",
  ],
  email: [
    "Se envió información detallada sobre servicios y precios.",
    "Se compartió portafolio con proyectos similares al que necesitan.",
    "Se confirmó recepción de brief y materiales del cliente.",
    "Se envió la propuesta formal con desglose de costos.",
    "Se reenvió propuesta actualizada con ajustes solicitados.",
    "Correo de seguimiento enviado. Sin respuesta aún.",
  ],
  meeting: [
    "Reunión por Zoom para revisión de alcance y expectativas.",
    "Presentación de propuesta en videollamada con el equipo del cliente.",
    "Sesión de discovery con stakeholders principales.",
    "Reunión para definir identidad visual y referencias de diseño.",
    "Kick-off meeting del proyecto. Se definieron canales de comunicación.",
  ],
};

const PROPOSAL_ITEMS: Record<string, { name: string; description: string; category: string; unit_price: number }[]> = {
  web_presence: [
    { name: "Diseño UI/UX", description: "Diseño de interfaz y experiencia de usuario responsive", category: "Diseño", unit_price: 6000 },
    { name: "Desarrollo Frontend", description: "Maquetación con Next.js y deploy optimizado", category: "Desarrollo", unit_price: 8000 },
    { name: "Contenido y Copywriting", description: "Redacción de textos persuasivos y optimización SEO", category: "Contenido", unit_price: 3000 },
    { name: "Configuración de Hosting", description: "Setup de servidor, dominio y certificado SSL", category: "Infraestructura", unit_price: 2000 },
    { name: "SEO Técnico", description: "Optimización de velocidad, metadatos y estructura", category: "Marketing", unit_price: 2500 },
  ],
  ecommerce: [
    { name: "Diseño de Tienda Online", description: "Diseño de homepage, catálogo, producto y checkout", category: "Diseño", unit_price: 10000 },
    { name: "Integración de Pagos", description: "Configuración de Stripe y MercadoPago", category: "Desarrollo", unit_price: 8000 },
    { name: "Catálogo de Productos", description: "Carga, categorización y optimización del catálogo", category: "Contenido", unit_price: 5000 },
    { name: "Gestión de Envíos", description: "Integración con servicios de paquetería nacionales", category: "Logística", unit_price: 7000 },
    { name: "Analytics de E-commerce", description: "Google Analytics y seguimiento de conversiones", category: "Marketing", unit_price: 3000 },
  ],
  custom_system: [
    { name: "Arquitectura y Diseño de BD", description: "Diseño de base de datos, APIs y diagramas de flujo", category: "Backend", unit_price: 15000 },
    { name: "Desarrollo Backend", description: "API REST, autenticación y lógica de negocio", category: "Backend", unit_price: 18000 },
    { name: "Desarrollo Frontend", description: "Interfaz web del sistema con dashboard", category: "Frontend", unit_price: 12000 },
    { name: "QA y Pruebas", description: "Testing funcional, de integración y de carga", category: "QA", unit_price: 5000 },
    { name: "Deploy e Infraestructura", description: "Configuración de servidores y CI/CD", category: "Infraestructura", unit_price: 4000 },
  ],
};

const TASK_TEMPLATES: Record<string, { phase: string; tasks: string[] }[]> = {
  web_presence: [
    { phase: "Discovery", tasks: ["Brief inicial completado", "Accesos recibidos (hosting, dominio, analytics)", "Moodboard aprobado por el cliente"] },
    { phase: "Diseño", tasks: ["Wireframes aprobados", "Diseño desktop aprobado", "Diseño mobile aprobado", "Assets y recursos recibidos"] },
    { phase: "Desarrollo", tasks: ["Ambiente de desarrollo configurado", "Homepage desarrollada", "Páginas internas desarrolladas", "Formularios de contacto funcionando", "SEO técnico implementado", "Google Analytics configurado", "Optimización de velocidad aplicada"] },
    { phase: "Lanzamiento", tasks: ["QA en múltiples dispositivos", "QA cross-browser", "Velocidad verificada en PageSpeed", "DNS configurado y propagado", "SSL activo y funcionando", "Redirecciones configuradas", "Entrega y presentación al cliente"] },
    { phase: "Post-lanzamiento", tasks: ["Capacitación al cliente", "Documentación entregada", "Período de soporte iniciado (30 días)", "Google Search Console configurado"] },
  ],
  ecommerce: [
    { phase: "Discovery", tasks: ["Catálogo de productos recibido", "Pasarela de pago definida", "Política de envíos y devoluciones definida", "Accesos a plataformas recibidos"] },
    { phase: "Diseño", tasks: ["Diseño de homepage aprobado", "Diseño de página de producto aprobado", "Diseño de carrito y checkout aprobado", "Diseño mobile aprobado"] },
    { phase: "Desarrollo", tasks: ["Catálogo de productos cargado", "Pasarela de pago integrada y probada", "Flujo de checkout completo funcionando", "Emails transaccionales configurados", "Gestión de inventario configurada", "Cálculo de envíos configurado", "SEO de productos implementado"] },
    { phase: "Lanzamiento", tasks: ["Prueba de compra end-to-end completada", "QA en mobile y desktop", "SSL y seguridad verificados", "DNS y dominio configurados", "Entrega al cliente"] },
    { phase: "Post-lanzamiento", tasks: ["Capacitación en gestión de productos", "Capacitación en gestión de pedidos", "Analytics de ecommerce configurado", "Período de soporte iniciado"] },
  ],
  custom_system: [
    { phase: "Discovery", tasks: ["Requerimientos funcionales documentados", "Arquitectura técnica definida", "Base de datos diseñada", "Wireframes de flujos principales aprobados"] },
    { phase: "Desarrollo — Backend", tasks: ["Base de datos creada y migrada", "Autenticación implementada", "APIs principales desarrolladas", "Pruebas de integración completadas"] },
    { phase: "Desarrollo — Frontend", tasks: ["UI de módulos principales desarrollada", "Integración con APIs completada", "Manejo de errores implementado", "Responsive design aplicado"] },
    { phase: "QA y Lanzamiento", tasks: ["Pruebas funcionales completadas", "Pruebas de carga realizadas", "Seguridad auditada", "Deploy a producción", "Entrega y capacitación"] },
    { phase: "Post-lanzamiento", tasks: ["Monitoreo configurado", "Backups automáticos configurados", "Documentación técnica entregada", "Período de soporte iniciado"] },
  ],
};

const CONTRACT_CLAUSES = [
  { id: "scope", name: "Alcance del Proyecto", text: "El presente contrato cubre exclusivamente los servicios y entregables descritos en la propuesta adjunta.", included: true },
  { id: "payment", name: "Términos de Pago", text: "El pago se realizará conforme a los términos especificados: 50% al inicio y 50% al entregar.", included: true },
  { id: "timeline", name: "Plazo de Entrega", text: "El plazo estimado de entrega es el especificado en la propuesta, sujeto a la disponibilidad oportuna de materiales por parte del cliente.", included: true },
  { id: "ip", name: "Propiedad Intelectual", text: "Una vez completado el pago total, todos los derechos de propiedad intelectual del trabajo entregado se transfieren al cliente.", included: true },
  { id: "confidentiality", name: "Confidencialidad", text: "Ambas partes se comprometen a mantener confidencial toda información sensible compartida durante el proyecto.", included: true },
  { id: "cancellation", name: "Cancelación", text: "En caso de cancelación, se facturará el trabajo realizado hasta la fecha de cancelación.", included: true },
];

// ─── Utility Functions ───────────────────────────────────────────────────────

function uuid(): string {
  return crypto.randomUUID();
}

function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[] | T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Weighted toward recent dates (exponent > 1 biases toward end of range). */
function weightedDate(monthsAgo: number): Date {
  const start = new Date(NOW);
  start.setMonth(start.getMonth() - monthsAgo);
  const range = NOW.getTime() - start.getTime();
  const r = Math.pow(Math.random(), 1.6);
  return new Date(start.getTime() + range * r);
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3600_000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400_000);
}

function toISO(date: Date): string {
  return date.toISOString();
}

function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function varyPrice(base: number): number {
  const factor = 0.8 + Math.random() * 0.4; // 80% to 120%
  return Math.round((base * factor) / 100) * 100;
}

function generateEmail(first: string, last: string, company: string): string {
  const f = slugify(first).replace(/-/g, "");
  const l = slugify(last).replace(/-/g, "");
  const domain = slugify(company).slice(0, 20);
  return `${f}.${l}@${domain}.com.mx`;
}

function generatePhone(): string {
  const area = pick(["55", "33", "81", "56", "22", "44", "99"]);
  const n1 = String(randInt(1000, 9999));
  const n2 = String(randInt(1000, 9999));
  return `+52 ${area} ${n1} ${n2}`;
}

// ─── Lead Scoring (replicated from src/lib/lead-scoring.ts) ──────────────────

const HIGH_INTENT_CTAS = ["iniciar-proyecto","agendar-llamada","quiero-empezar","contratar"];
const MEDIUM_INTENT_CTAS = ["cotizar","mas-informacion","ver-precios","contactar"];

interface ScoreBreakdown {
  serviceIntent: number;
  messageQuality: number;
  dataCompleteness: number;
  sourceCta: number;
  responseTime: number;
  score: number;
  label: "HOT" | "WARM" | "COOL" | "COLD";
}

function calculateLeadScore(
  lead: { service_type?: string | null; message?: string | null; phone?: string | null; company?: string | null; source_cta?: string | null; created_at?: string; pipeline_status?: string },
  contactedAt?: Date | null,
): ScoreBreakdown {
  let score = 0;
  const b: any = {};

  const serviceScores: Record<string, number> = { custom_system: 30, ecommerce: 25, web_presence: 20, discovery_call: 15, general: 10 };
  b.serviceIntent = serviceScores[lead.service_type ?? ""] ?? 10;
  score += b.serviceIntent;

  const msgLen = lead.message?.length ?? 0;
  if (msgLen > 200) b.messageQuality = 20;
  else if (msgLen > 100) b.messageQuality = 10;
  else if (msgLen > 50) b.messageQuality = 5;
  else b.messageQuality = 0;
  score += b.messageQuality;

  let contact = 0;
  if (lead.phone?.trim()) contact += 10;
  if (lead.company?.trim()) contact += 10;
  b.dataCompleteness = contact;
  score += contact;

  const ctaLower = (lead.source_cta ?? "").toLowerCase();
  if (HIGH_INTENT_CTAS.some((c) => ctaLower.includes(c))) b.sourceCta = 15;
  else if (MEDIUM_INTENT_CTAS.some((c) => ctaLower.includes(c))) b.sourceCta = 10;
  else if (ctaLower) b.sourceCta = 5;
  else b.sourceCta = 0;
  score += b.sourceCta;

  if (contactedAt && lead.created_at && lead.pipeline_status !== "nuevo") {
    const created = new Date(lead.created_at);
    const diffH = (contactedAt.getTime() - created.getTime()) / 3600_000;
    if (diffH <= 1) b.responseTime = 15;
    else if (diffH <= 24) b.responseTime = 10;
    else if (diffH <= 48) b.responseTime = 5;
    else b.responseTime = 0;
  } else {
    b.responseTime = 0;
  }
  score += b.responseTime;

  let label: ScoreBreakdown["label"];
  if (score >= 80) label = "HOT";
  else if (score >= 60) label = "WARM";
  else if (score >= 40) label = "COOL";
  else label = "COLD";

  return { ...b, score, label };
}

// ─── Batch Insert Helper ─────────────────────────────────────────────────────

async function batchInsert(table: string, rows: any[], batchSize = 40) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      console.error(`  ✗ Error inserting into ${table} (batch ${Math.floor(i / batchSize) + 1}):`, error.message);
      throw error;
    }
  }
}

// ─── Generators ──────────────────────────────────────────────────────────────

interface LeadRow {
  id: string;
  workspace_id: string;
  request_id: string;
  name: string;
  email: string;
  phone: string | null;
  service_interest: string;
  message: string | null;
  intent: string | null;
  pipeline_status: string;
  estimated_value: number | null;
  next_action: string | null;
  next_action_date: string | null;
  closed_at: string | null;
  lost_reason: string | null;
  source_cta: string;
  source_page: string | null;
  lead_score: number;
  lead_score_breakdown: any;
  locale: string;
  created_at: string;
  _company: { name: string; industry: string };
  _serviceType: string;
  _contactedAt: Date | null;
}

function generateLeads(): LeadRow[] {
  const leads: LeadRow[] = [];
  const usedEmails = new Set<string>();

  // Build distribution: pipeline_status → count
  const distribution: { status: string; count: number }[] = [
    { status: "cerrado", count: 35 },
    { status: "perdido", count: 22 },
    { status: "contactado", count: 18 },
    { status: "nuevo", count: 15 },
    { status: "propuesta_enviada", count: 12 },
    { status: "en_negociacion", count: 8 },
  ];

  let leadIndex = 0;

  for (const { status, count } of distribution) {
    for (let i = 0; i < count; i++) {
      const id = uuid();
      const firstName = pick(FIRST_NAMES);
      const lastName1 = pick(LAST_NAMES);
      const lastName2 = pick(LAST_NAMES);
      const fullName = `${firstName} ${lastName1} ${lastName2}`;
      const company = pick(COMPANIES);
      const serviceType = pick(SERVICE_TYPES);

      let email = generateEmail(firstName, lastName1, company.name);
      while (usedEmails.has(email)) {
        email = generateEmail(firstName, pick(LAST_NAMES), company.name);
      }
      usedEmails.add(email);

      const hasPhone = Math.random() > 0.2;
      const phone = hasPhone ? generatePhone() : null;

      // Date distribution: stale leads are old, nuevo are recent
      let createdAt: Date;
      if (status === "nuevo") {
        // Last 2 weeks for new leads
        createdAt = addDays(NOW, -randInt(0, 14));
      } else if (status === "cerrado" || status === "perdido") {
        // Spread across 12 months with recent bias
        createdAt = weightedDate(12);
      } else {
        // Active pipeline — last 3 months mostly
        createdAt = weightedDate(4);
      }

      // Some contactado leads are deliberately stale (old, no activity)
      if (status === "contactado" && i < 5) {
        createdAt = addDays(NOW, -randInt(30, 120));
      }

      const sourceCta = pick(SOURCE_CTAS);

      // Message — vary length for scoring variety
      let message: string | null;
      const msgRoll = Math.random();
      if (msgRoll < 0.25) message = pick(MESSAGES_LONG);
      else if (msgRoll < 0.55) message = pick(MESSAGES_MEDIUM);
      else if (msgRoll < 0.8) message = pick(MESSAGES_SHORT);
      else if (msgRoll < 0.92) message = pick(MESSAGES_MINIMAL);
      else message = null;

      // contacted_at for non-nuevo leads
      let contactedAt: Date | null = null;
      if (status !== "nuevo") {
        const responseHours = Math.random() < 0.4 ? randFloat(0.5, 1) : Math.random() < 0.7 ? randFloat(1, 24) : randFloat(24, 72);
        contactedAt = addHours(createdAt, responseHours);
      }

      const closedAt = status === "cerrado" ? toISO(addDays(createdAt, randInt(14, 60))) : null;
      const lostReason = status === "perdido" ? pick(LOST_REASONS) : null;

      const estimatedValue = varyPrice(SERVICE_CONFIG[serviceType].basePrice);

      // Next action for active pipeline leads
      let nextAction: string | null = null;
      let nextActionDate: string | null = null;
      if (["contactado", "propuesta_enviada", "en_negociacion"].includes(status)) {
        const actions = ["Enviar propuesta", "Llamada de seguimiento", "Agendar reunión", "Enviar brief actualizado", "Revisar con el equipo"];
        nextAction = pick(actions);
        // Some overdue, some upcoming
        const daysOffset = Math.random() < 0.3 ? -randInt(1, 10) : randInt(1, 7);
        nextActionDate = toISO(addDays(NOW, daysOffset));
      }

      // Score (company is used for scoring but not stored on contact_submissions)
      const { score, ...breakdown } = calculateLeadScore(
        {
          service_type: serviceType,
          message,
          phone,
          company: company.name,
          source_cta: sourceCta,
          created_at: toISO(createdAt),
          pipeline_status: status,
        },
        contactedAt,
      );

      leadIndex++;

      leads.push({
        id,
        workspace_id: WORKSPACE_ID,
        request_id: `NOC-${String(leadIndex).padStart(4, "0")}`,
        name: fullName,
        email,
        phone,
        service_interest: serviceType,
        message,
        intent: serviceType,
        pipeline_status: status,
        estimated_value: estimatedValue,
        next_action: nextAction,
        next_action_date: nextActionDate,
        closed_at: closedAt,
        lost_reason: lostReason,
        source_cta: sourceCta,
        source_page: pick(["/", "/servicios", "/contacto", "/precios", null]),
        lead_score: score,
        lead_score_breakdown: { ...breakdown, score, label: breakdown.label ?? (score >= 80 ? "HOT" : score >= 60 ? "WARM" : score >= 40 ? "COOL" : "COLD") },
        locale: Math.random() > 0.1 ? "es" : "en",
        created_at: toISO(createdAt),
        // Internal references (not inserted to DB)
        _company: company,
        _serviceType: serviceType,
        _contactedAt: contactedAt,
      });
    }
  }

  return leads;
}

interface LeadActivityRow {
  id: string;
  lead_id: string;
  type: string;
  content: string;
  created_at: string;
}

function generateLeadActivities(leads: LeadRow[]): LeadActivityRow[] {
  const activities: LeadActivityRow[] = [];

  for (const lead of leads) {
    const created = new Date(lead.created_at);

    // 1. Initial note on creation
    activities.push({
      id: uuid(),
      lead_id: lead.id,
      type: "note",
      content: lead.source_cta === "manual_crm"
        ? "Lead creado manualmente desde el CRM."
        : "Lead recibido vía formulario web.",
      created_at: toISO(addHours(created, 0.1)),
    });

    if (lead.pipeline_status === "nuevo") continue;

    // 2. Status change to contactado
    const contactedDate = lead._contactedAt || addHours(created, randFloat(1, 48));
    activities.push({
      id: uuid(),
      lead_id: lead.id,
      type: "status_change",
      content: "Status changed from nuevo to contactado",
      created_at: toISO(contactedDate),
    });

    // Contact activity (call or email)
    const contactType = Math.random() > 0.5 ? "call" : "email";
    activities.push({
      id: uuid(),
      lead_id: lead.id,
      type: contactType,
      content: pick(ACTIVITY_CONTENTS[contactType]),
      created_at: toISO(addHours(contactedDate, randFloat(0.1, 2))),
    });

    if (lead.pipeline_status === "contactado") {
      // Maybe one more note for active contactado leads
      if (Math.random() > 0.5) {
        activities.push({
          id: uuid(),
          lead_id: lead.id,
          type: "note",
          content: pick(ACTIVITY_CONTENTS.note),
          created_at: toISO(addDays(contactedDate, randInt(1, 5))),
        });
      }
      continue;
    }

    // 3. Status change to propuesta_enviada (for pipeline stages beyond contactado)
    const propDate = addDays(contactedDate, randInt(3, 10));
    activities.push({
      id: uuid(),
      lead_id: lead.id,
      type: "status_change",
      content: "Status changed from contactado to propuesta_enviada",
      created_at: toISO(propDate),
    });

    // Meeting before proposal
    if (Math.random() > 0.3) {
      activities.push({
        id: uuid(),
        lead_id: lead.id,
        type: "meeting",
        content: pick(ACTIVITY_CONTENTS.meeting),
        created_at: toISO(addDays(contactedDate, randInt(1, 5))),
      });
    }

    if (lead.pipeline_status === "propuesta_enviada") continue;

    // 4. Status change to en_negociacion
    const negoDate = addDays(propDate, randInt(3, 10));
    activities.push({
      id: uuid(),
      lead_id: lead.id,
      type: "status_change",
      content: "Status changed from propuesta_enviada to en_negociacion",
      created_at: toISO(negoDate),
    });

    // Follow-up during negotiation
    activities.push({
      id: uuid(),
      lead_id: lead.id,
      type: pick(["call", "email"]),
      content: pick([...ACTIVITY_CONTENTS.call, ...ACTIVITY_CONTENTS.email]),
      created_at: toISO(addDays(negoDate, randInt(1, 5))),
    });

    if (lead.pipeline_status === "en_negociacion") continue;

    // 5. Final status change (cerrado or perdido)
    const finalDate = addDays(negoDate, randInt(3, 15));
    activities.push({
      id: uuid(),
      lead_id: lead.id,
      type: "status_change",
      content: lead.pipeline_status === "cerrado"
        ? "Status changed from en_negociacion to cerrado"
        : `Status changed from en_negociacion to perdido. Reason: ${lead.lost_reason}`,
      created_at: toISO(finalDate),
    });

    if (lead.pipeline_status === "cerrado") {
      activities.push({
        id: uuid(),
        lead_id: lead.id,
        type: "note",
        content: "Proyecto cerrado exitosamente. Se procede a generar propuesta formal.",
        created_at: toISO(addHours(finalDate, 1)),
      });
    }
  }

  return activities;
}

interface ProposalRow {
  id: string;
  workspace_id: string;
  lead_id: string;
  title: string;
  description: string | null;
  status: string;
  valid_until: string | null;
  currency: string;
  subtotal: number;
  discount_type: string;
  discount_value: number;
  tax_percentage: number;
  total: number;
  payment_terms: string | null;
  estimated_duration: string | null;
  public_uuid: string;
  client_token: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  _serviceType: string;
  _leadCreatedAt: string;
}

interface ProposalItemRow {
  id: string;
  proposal_id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  category: string | null;
  sort_order: number;
  created_at: string;
}

function generateProposals(leads: LeadRow[]): { proposals: ProposalRow[]; items: ProposalItemRow[] } {
  const proposals: ProposalRow[] = [];
  const items: ProposalItemRow[] = [];

  // Select leads that got proposals
  const cerradoLeads = leads.filter((l) => l.pipeline_status === "cerrado");
  const propEnviadaLeads = leads.filter((l) => l.pipeline_status === "propuesta_enviada");
  const negoLeads = leads.filter((l) => l.pipeline_status === "en_negociacion");

  // Status assignment
  const proposalLeads: { lead: LeadRow; proposalStatus: string }[] = [
    ...cerradoLeads.map((l) => ({ lead: l, proposalStatus: "accepted" })),
    ...propEnviadaLeads.slice(0, 5).map((l) => ({ lead: l, proposalStatus: "viewed" })),
    ...propEnviadaLeads.slice(5, 10).map((l) => ({ lead: l, proposalStatus: "sent" })),
    ...propEnviadaLeads.slice(10).map((l) => ({ lead: l, proposalStatus: "draft" })),
    ...negoLeads.slice(0, 5).map((l) => ({ lead: l, proposalStatus: "viewed" })),
    ...negoLeads.slice(5).map((l) => ({ lead: l, proposalStatus: "sent" })),
  ];

  // Add a couple rejected from perdido leads that got proposals
  const perdidoWithProposal = leads.filter((l) => l.pipeline_status === "perdido").slice(0, 2);
  for (const l of perdidoWithProposal) {
    proposalLeads.push({ lead: l, proposalStatus: "rejected" });
  }

  for (const { lead, proposalStatus } of proposalLeads) {
    const proposalId = uuid();
    const serviceType = lead._serviceType;
    const config = SERVICE_CONFIG[serviceType];

    const leadCreated = new Date(lead.created_at);
    const propCreated = addDays(leadCreated, randInt(2, 14));

    // Generate items for this proposal
    const templateItems = PROPOSAL_ITEMS[serviceType] || PROPOSAL_ITEMS.web_presence;
    const selectedItems = pickN(templateItems, randInt(2, Math.min(4, templateItems.length)));

    let subtotal = 0;
    const propItems: ProposalItemRow[] = selectedItems.map((item, idx) => {
      const price = varyPrice(item.unit_price);
      subtotal += price;
      return {
        id: uuid(),
        proposal_id: proposalId,
        name: item.name,
        description: item.description,
        quantity: 1,
        unit_price: price,
        category: item.category,
        sort_order: idx,
        created_at: toISO(propCreated),
      };
    });

    const discountType = Math.random() > 0.7 ? "fixed" : "percentage";
    const discountValue = Math.random() > 0.5 ? (discountType === "percentage" ? randInt(5, 15) : randInt(1000, 5000)) : 0;
    const taxPercentage = 16;

    const discount = discountType === "percentage" ? subtotal * (discountValue / 100) : discountValue;
    const afterDiscount = subtotal - discount;
    const total = Math.round(afterDiscount * (1 + taxPercentage / 100));

    // Timeline dates
    const sentAt = proposalStatus !== "draft" ? addDays(propCreated, randInt(1, 5)) : null;
    const viewedAt = sentAt && ["viewed", "accepted", "rejected"].includes(proposalStatus)
      ? addHours(sentAt, randFloat(1, 120))
      : null;
    const acceptedAt = viewedAt && proposalStatus === "accepted"
      ? addDays(viewedAt, randInt(1, 10))
      : null;
    const rejectedAt = viewedAt && proposalStatus === "rejected"
      ? addDays(viewedAt, randInt(3, 15))
      : null;

    const validUntil = addDays(propCreated, 30);

    const paymentTerms = pick([
      "50% anticipo, 50% al entregar",
      "30% inicio, 40% avance, 30% entrega",
      "100% al inicio",
      "Pago mensual durante el proyecto",
    ]);

    proposals.push({
      id: proposalId,
      workspace_id: WORKSPACE_ID,
      lead_id: lead.id,
      title: `Propuesta - ${config.label}`,
      description: `Propuesta de ${config.label.toLowerCase()} para ${lead._company.name || lead.name}.`,
      status: proposalStatus,
      valid_until: toISO(validUntil),
      currency: "MXN",
      subtotal: 0, // Trigger will recalculate
      discount_type: discountType,
      discount_value: discountValue,
      tax_percentage: taxPercentage,
      total: 0, // Trigger will recalculate
      payment_terms: paymentTerms,
      estimated_duration: `${config.weeks} semanas`,
      public_uuid: uuid(),
      client_token: uuid(),
      sent_at: sentAt ? toISO(sentAt) : null,
      viewed_at: viewedAt ? toISO(viewedAt) : null,
      accepted_at: acceptedAt ? toISO(acceptedAt) : null,
      rejected_at: rejectedAt ? toISO(rejectedAt) : null,
      created_at: toISO(propCreated),
      updated_at: toISO(acceptedAt || rejectedAt || viewedAt || sentAt || propCreated),
      _serviceType: serviceType,
      _leadCreatedAt: lead.created_at,
    });

    items.push(...propItems);
  }

  return { proposals, items };
}

interface ContractRow {
  id: string;
  workspace_id: string;
  contract_number: string;
  proposal_id: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  total_price: number;
  payment_terms: string | null;
  start_date: string | null;
  estimated_weeks: number;
  service_type: string;
  items: any[];
  clauses: any[];
  status: string;
  client_token: string;
  noctra_signed: boolean;
  noctra_signed_at: string | null;
  signed_by_client: boolean;
  client_signed: boolean;
  client_signed_at: string | null;
  created_at: string;
  updated_at: string;
}

function generateContracts(
  proposals: ProposalRow[],
  leads: LeadRow[],
): ContractRow[] {
  const contracts: ContractRow[] = [];
  const acceptedProposals = proposals.filter((p) => p.status === "accepted");
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  // 25 contracts from 35 accepted proposals
  const proposalsForContracts = acceptedProposals.slice(0, 25);

  // Distribute signing dates for revenue trend
  // Sort by proposal accepted_at ascending to assign contracts chronologically
  proposalsForContracts.sort((a, b) => new Date(a.accepted_at!).getTime() - new Date(b.accepted_at!).getTime());

  for (let i = 0; i < proposalsForContracts.length; i++) {
    const proposal = proposalsForContracts[i];
    const lead = leadMap.get(proposal.lead_id);
    if (!lead) continue;

    const id = uuid();
    const config = SERVICE_CONFIG[proposal._serviceType];

    const acceptedDate = new Date(proposal.accepted_at!);
    const contractCreated = addDays(acceptedDate, randInt(1, 3));

    // Status distribution: first 20 signed, then 3 sent, 2 draft
    let status: string;
    let signedByClient = false;
    let noctraSigned = false;
    let clientSignedAt: Date | null = null;
    let noctraSignedAt: Date | null = null;

    if (i < 20) {
      status = "signed";
      signedByClient = true;
      noctraSigned = true;
      noctraSignedAt = addDays(contractCreated, randInt(0, 2));
      clientSignedAt = addDays(noctraSignedAt, randInt(0, 5));
    } else if (i < 23) {
      status = "sent";
    } else {
      status = "draft";
    }

    const startDate = clientSignedAt ? addDays(clientSignedAt, randInt(3, 14)) : null;

    // Get proposal total (approximate since trigger will set it)
    // Use estimated value from the lead as a reasonable proxy
    const totalPrice = lead.estimated_value || config.basePrice;

    // Build items from proposal items
    const propItems = []; // We don't have proposal items here, build from template
    const templateItems = PROPOSAL_ITEMS[proposal._serviceType] || PROPOSAL_ITEMS.web_presence;
    const contractItems = templateItems.slice(0, 3).map((item) => ({
      name: item.name,
      description: item.description,
    }));

    contracts.push({
      id,
      workspace_id: WORKSPACE_ID,
      contract_number: `NOC-C-${String(i + 1).padStart(4, "0")}`,
      proposal_id: proposal.id,
      client_name: lead.name,
      client_email: lead.email,
      client_company: lead._company.name,
      total_price: totalPrice,
      payment_terms: proposal.payment_terms,
      start_date: startDate ? toISO(startDate) : null,
      estimated_weeks: config.weeks,
      service_type: proposal._serviceType,
      items: contractItems,
      clauses: CONTRACT_CLAUSES,
      status,
      client_token: uuid(),
      noctra_signed: noctraSigned,
      noctra_signed_at: noctraSignedAt ? toISO(noctraSignedAt) : null,
      signed_by_client: signedByClient,
      client_signed: signedByClient,
      client_signed_at: clientSignedAt ? toISO(clientSignedAt) : null,
      created_at: toISO(contractCreated),
      updated_at: toISO(clientSignedAt || noctraSignedAt || contractCreated),
    });
  }

  return contracts;
}

interface ProjectRow {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  industry: string;
  status: string;
  start_date: string | null;
  launch_date: string | null;
  budget: number;
  hourly_rate: number;
  total_hours: number;
  total_expenses: number;
  client_name: string | null;
  client_email: string | null;
  client_company: string | null;
  lead_id: string | null;
  contract_id: string | null;
  report_token: string;
  sort_order: number;
  visible: boolean;
  published_to_site: boolean;
  has_ai_form: boolean;
  case_study_enabled: boolean;
  metrics: any[];
  gallery: any[];
  created_at: string;
  updated_at: string;
  _serviceType: string;
}

function generateProjects(
  contracts: ContractRow[],
  leads: LeadRow[],
): ProjectRow[] {
  const projects: ProjectRow[] = [];
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  // Only signed contracts get projects
  const signedContracts = contracts.filter((c) => c.status === "signed");

  // Sort by start_date to assign statuses chronologically
  signedContracts.sort((a, b) => new Date(a.start_date || a.created_at).getTime() - new Date(b.start_date || b.created_at).getTime());

  // Status distribution: oldest → completed, newest → discovery
  const statusAssignments: string[] = [];
  // 8 completed, 3 launch, 4 development, 3 design, 2 discovery = 20
  for (let i = 0; i < 8; i++) statusAssignments.push("completed");
  for (let i = 0; i < 3; i++) statusAssignments.push("launch");
  for (let i = 0; i < 4; i++) statusAssignments.push("development");
  for (let i = 0; i < 3; i++) statusAssignments.push("design");
  for (let i = 0; i < 2; i++) statusAssignments.push("discovery");

  for (let i = 0; i < signedContracts.length; i++) {
    const contract = signedContracts[i];
    if (i >= statusAssignments.length) break;

    const status = statusAssignments[i];
    const lead = leads.find((l) => l.email === contract.client_email);
    const company = lead?._company;

    const projectName = `${contract.client_company || contract.client_name} — ${SERVICE_CONFIG[contract.service_type || "web_presence"]?.label || "Proyecto"}`;

    const startDate = contract.start_date ? new Date(contract.start_date) : new Date(contract.created_at);
    const config = SERVICE_CONFIG[contract.service_type || "web_presence"];
    const launchDate = status === "completed" || status === "launch"
      ? addDays(startDate, config.weeks * 7 + randInt(-5, 10))
      : null;

    const totalHours = status === "completed" ? randInt(80, 200) : status === "launch" ? randInt(60, 150) : 0;
    const totalExpenses = status === "completed" ? randInt(2000, 8000) : 0;

    const baseSlug = slugify(projectName).slice(0, 70);
    const uniqueSlug = `${baseSlug}-${String(i + 1).padStart(2, "0")}`;

    projects.push({
      id: uuid(),
      workspace_id: WORKSPACE_ID,
      name: projectName,
      slug: uniqueSlug,
      industry: company?.industry || "Tecnología",
      status,
      start_date: toISO(startDate),
      launch_date: launchDate ? toISO(launchDate) : null,
      budget: contract.total_price,
      hourly_rate: 800,
      total_hours: totalHours,
      total_expenses: totalExpenses,
      client_name: contract.client_name,
      client_email: contract.client_email,
      client_company: contract.client_company,
      lead_id: lead?.id || null,
      contract_id: contract.id,
      report_token: uuid(),
      sort_order: (i + 1) * 10,
      visible: true,
      published_to_site:
        uniqueSlug.includes("dyma") || uniqueSlug.includes("woodax"),
      has_ai_form: false,
      case_study_enabled: status === "completed" && i < 3,
      metrics: status === "completed" && i < 3
        ? [
            { label: "Tráfico web", value: `+${randInt(40, 200)}%`, delta: `+${randInt(40, 200)}%` },
            { label: "Leads generados", value: String(randInt(15, 80)), delta: `+${randInt(20, 60)}%` },
            { label: "Tiempo de carga", value: `${(randFloat(0.8, 1.5)).toFixed(1)}s`, delta: `-${randInt(30, 60)}%` },
          ]
        : [],
      gallery: [],
      created_at: toISO(startDate),
      updated_at: toISO(launchDate || addDays(startDate, randInt(1, 30))),
      _serviceType: contract.service_type || "web_presence",
    });
  }

  return projects;
}

interface ProjectTaskRow {
  id: string;
  project_id: string;
  workspace_id: string;
  phase: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
}

function generateProjectTasks(projects: ProjectRow[]): ProjectTaskRow[] {
  const tasks: ProjectTaskRow[] = [];

  for (const project of projects) {
    const template = TASK_TEMPLATES[project._serviceType] || TASK_TEMPLATES.web_presence;
    const startDate = new Date(project.start_date || project.created_at);

    // Determine how many phases are completed based on project status
    const allPhases = template.map((p) => p.phase);
    let completedPhaseCount: number;
    switch (project.status) {
      case "completed": completedPhaseCount = allPhases.length; break;
      case "launch": completedPhaseCount = allPhases.length - 1; break;
      case "development": completedPhaseCount = 2; break; // Discovery + Diseño
      case "design": completedPhaseCount = 1; break; // Discovery only
      case "discovery": completedPhaseCount = 0; break;
      default: completedPhaseCount = 0;
    }

    let sortIdx = 0;
    for (let phaseIdx = 0; phaseIdx < template.length; phaseIdx++) {
      const phase = template[phaseIdx];
      const isPhaseComplete = phaseIdx < completedPhaseCount;

      // For the current active phase, complete some tasks randomly
      const isActivePhase = phaseIdx === completedPhaseCount;

      for (let taskIdx = 0; taskIdx < phase.tasks.length; taskIdx++) {
        let completed = false;
        let completedAt: string | null = null;

        if (isPhaseComplete) {
          completed = true;
          const daysIntoProject = ((phaseIdx + 1) / template.length) * (SERVICE_CONFIG[project._serviceType]?.weeks || 5) * 7;
          completedAt = toISO(addDays(startDate, Math.round(daysIntoProject) + randInt(-3, 3)));
        } else if (isActivePhase && taskIdx < Math.floor(phase.tasks.length * 0.4)) {
          // Complete ~40% of tasks in the active phase
          completed = true;
          const daysIntoProject = ((phaseIdx + 0.5) / template.length) * (SERVICE_CONFIG[project._serviceType]?.weeks || 5) * 7;
          completedAt = toISO(addDays(startDate, Math.round(daysIntoProject)));
        }

        tasks.push({
          id: uuid(),
          project_id: project.id,
          workspace_id: WORKSPACE_ID,
          phase: phase.phase,
          title: phase.tasks[taskIdx],
          completed,
          completed_at: completedAt,
          sort_order: phaseIdx * 100 + taskIdx,
        });
        sortIdx++;
      }
    }
  }

  return tasks;
}

interface ActivityEventRow {
  id: string;
  workspace_id: string;
  actor_user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  event_type: string;
  title: string;
  description: string | null;
  metadata: any;
  created_at: string;
}

function generateActivityEvents(
  leads: LeadRow[],
  proposals: ProposalRow[],
  contracts: ContractRow[],
  projects: ProjectRow[],
): ActivityEventRow[] {
  const events: ActivityEventRow[] = [];

  // Lead events
  for (const lead of leads) {
    events.push({
      id: uuid(),
      workspace_id: WORKSPACE_ID,
      actor_user_id: null,
      entity_type: "lead",
      entity_id: lead.id,
      event_type: "lead.created",
      title: "Lead creado",
      description: `${lead.name} se agregó al pipeline.`,
      metadata: { leadName: lead.name, requestId: lead.request_id, serviceInterest: lead.service_interest },
      created_at: lead.created_at,
    });

    // Stage changes for leads beyond nuevo
    if (lead.pipeline_status !== "nuevo" && lead._contactedAt) {
      events.push({
        id: uuid(),
        workspace_id: WORKSPACE_ID,
        actor_user_id: null,
        entity_type: "lead",
        entity_id: lead.id,
        event_type: "lead.stage_changed",
        title: "Lead movido de etapa",
        description: `${lead.name} pasó de nuevo a contactado.`,
        metadata: { leadName: lead.name, previousStatus: "nuevo", nextStatus: "contactado" },
        created_at: toISO(lead._contactedAt),
      });
    }

    if (["propuesta_enviada", "en_negociacion", "cerrado", "perdido"].includes(lead.pipeline_status)) {
      const propDate = toISO(addDays(lead._contactedAt || new Date(lead.created_at), randInt(3, 10)));
      events.push({
        id: uuid(),
        workspace_id: WORKSPACE_ID,
        actor_user_id: null,
        entity_type: "lead",
        entity_id: lead.id,
        event_type: "lead.stage_changed",
        title: "Lead movido de etapa",
        description: `${lead.name} pasó a propuesta enviada.`,
        metadata: { leadName: lead.name, previousStatus: "contactado", nextStatus: "propuesta_enviada" },
        created_at: propDate,
      });
    }

    if (lead.pipeline_status === "cerrado" && lead.closed_at) {
      events.push({
        id: uuid(),
        workspace_id: WORKSPACE_ID,
        actor_user_id: null,
        entity_type: "lead",
        entity_id: lead.id,
        event_type: "lead.stage_changed",
        title: "Lead cerrado",
        description: `${lead.name} se cerró exitosamente.`,
        metadata: { leadName: lead.name, previousStatus: "en_negociacion", nextStatus: "cerrado" },
        created_at: lead.closed_at,
      });
    }
  }

  // Proposal events
  for (const proposal of proposals) {
    events.push({
      id: uuid(),
      workspace_id: WORKSPACE_ID,
      actor_user_id: null,
      entity_type: "proposal",
      entity_id: proposal.id,
      event_type: "proposal.created",
      title: "Propuesta creada",
      description: `Se creó ${proposal.title}.`,
      metadata: { leadId: proposal.lead_id, total: proposal.total },
      created_at: proposal.created_at,
    });

    if (proposal.viewed_at) {
      events.push({
        id: uuid(),
        workspace_id: WORKSPACE_ID,
        actor_user_id: null,
        entity_type: "proposal",
        entity_id: proposal.id,
        event_type: "proposal.viewed",
        title: "Propuesta visualizada",
        description: `El cliente abrió ${proposal.title}.`,
        metadata: {},
        created_at: proposal.viewed_at,
      });
    }

    if (proposal.accepted_at) {
      events.push({
        id: uuid(),
        workspace_id: WORKSPACE_ID,
        actor_user_id: null,
        entity_type: "proposal",
        entity_id: proposal.id,
        event_type: "proposal.accepted",
        title: "Propuesta aprobada",
        description: `El cliente aceptó ${proposal.title}.`,
        metadata: {},
        created_at: proposal.accepted_at,
      });
    }
  }

  // Contract events
  for (const contract of contracts) {
    events.push({
      id: uuid(),
      workspace_id: WORKSPACE_ID,
      actor_user_id: null,
      entity_type: "contract",
      entity_id: contract.id,
      event_type: "contract.created",
      title: "Contrato creado",
      description: `Se generó contrato para ${contract.client_name}.`,
      metadata: { clientName: contract.client_name, total: contract.total_price },
      created_at: contract.created_at,
    });

    if (contract.client_signed_at) {
      events.push({
        id: uuid(),
        workspace_id: WORKSPACE_ID,
        actor_user_id: null,
        entity_type: "contract",
        entity_id: contract.id,
        event_type: "contract.signed",
        title: "Contrato firmado",
        description: `${contract.client_name} firmó el contrato.`,
        metadata: { clientName: contract.client_name },
        created_at: contract.client_signed_at,
      });
    }
  }

  // Project events
  for (const project of projects) {
    events.push({
      id: uuid(),
      workspace_id: WORKSPACE_ID,
      actor_user_id: null,
      entity_type: "project",
      entity_id: project.id,
      event_type: "project.created",
      title: "Proyecto creado",
      description: `Se inició el proyecto ${project.name}.`,
      metadata: { projectName: project.name, serviceType: project._serviceType },
      created_at: project.created_at,
    });

    // Status progression events for projects past discovery
    const statusOrder = ["discovery", "design", "development", "launch", "completed"];
    const currentIdx = statusOrder.indexOf(project.status);
    const startDate = new Date(project.start_date || project.created_at);
    const config = SERVICE_CONFIG[project._serviceType] || SERVICE_CONFIG.web_presence;

    for (let si = 1; si <= currentIdx; si++) {
      const progressDate = addDays(startDate, Math.round((si / statusOrder.length) * config.weeks * 7));
      events.push({
        id: uuid(),
        workspace_id: WORKSPACE_ID,
        actor_user_id: null,
        entity_type: "project",
        entity_id: project.id,
        event_type: "project.status_changed",
        title: "Proyecto actualizado",
        description: `${project.name} pasó a fase de ${statusOrder[si]}.`,
        metadata: { previousStatus: statusOrder[si - 1], nextStatus: statusOrder[si] },
        created_at: toISO(progressDate),
      });
    }
  }

  return events;
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

async function cleanup() {
  console.log("[seed] Cleaning existing data...");

  // 1. Activity events
  const { count: evtCount } = await supabase
    .from("workspace_activity_events")
    .delete({ count: "exact" })
    .eq("workspace_id", WORKSPACE_ID);
  console.log(`  Deleted ${evtCount ?? 0} activity events`);

  // 2. Get project IDs to delete child rows
  const { data: projectIds } = await supabase
    .from("projects")
    .select("id")
    .eq("workspace_id", WORKSPACE_ID);
  const pIds = (projectIds || []).map((p) => p.id);

  if (pIds.length > 0) {
    await supabase.from("project_tasks").delete().in("project_id", pIds);
    await supabase.from("project_status_history").delete().in("project_id", pIds);
    console.log(`  Deleted tasks & status history for ${pIds.length} projects`);
  }

  // 3. Projects
  const { count: projCount } = await supabase
    .from("projects")
    .delete({ count: "exact" })
    .eq("workspace_id", WORKSPACE_ID);
  console.log(`  Deleted ${projCount ?? 0} projects`);

  // 4. Contracts
  const { count: contrCount } = await supabase
    .from("contracts")
    .delete({ count: "exact" })
    .eq("workspace_id", WORKSPACE_ID);
  console.log(`  Deleted ${contrCount ?? 0} contracts`);

  // 5. Get proposal IDs to delete items
  const { data: proposalIds } = await supabase
    .from("proposals")
    .select("id")
    .eq("workspace_id", WORKSPACE_ID);
  const prIds = (proposalIds || []).map((p) => p.id);

  if (prIds.length > 0) {
    await supabase.from("proposal_items").delete().in("proposal_id", prIds);
    await supabase.from("proposal_activities").delete().in("proposal_id", prIds);
    console.log(`  Deleted items & activities for ${prIds.length} proposals`);
  }

  // 6. Proposals
  const { count: propCount } = await supabase
    .from("proposals")
    .delete({ count: "exact" })
    .eq("workspace_id", WORKSPACE_ID);
  console.log(`  Deleted ${propCount ?? 0} proposals`);

  // 7. Lead activities — no workspace_id column, delete via lead IDs
  const { data: leadIds } = await supabase
    .from("contact_submissions")
    .select("id")
    .eq("workspace_id", WORKSPACE_ID);
  const lIds = (leadIds || []).map((l) => l.id);

  if (lIds.length > 0) {
    // Delete in batches (Supabase .in() has limits)
    for (let i = 0; i < lIds.length; i += 50) {
      await supabase.from("lead_activities").delete().in("lead_id", lIds.slice(i, i + 50));
    }
    console.log(`  Deleted lead activities for ${lIds.length} leads`);
  }

  // 8. Leads
  const { count: leadCount } = await supabase
    .from("contact_submissions")
    .delete({ count: "exact" })
    .eq("workspace_id", WORKSPACE_ID);
  console.log(`  Deleted ${leadCount ?? 0} leads`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const start = Date.now();

  console.log(`\n[seed] Noctra CRM Demo Data Seed`);
  console.log(`[seed] Workspace: ${WORKSPACE_ID}`);
  console.log(`[seed] Date anchor: ${NOW.toISOString().slice(0, 10)}\n`);

  // Cleanup
  await cleanup();

  // Generate
  console.log("\n[seed] Generating data...");

  const leads = generateLeads();
  const statusCounts = leads.reduce((acc, l) => {
    acc[l.pipeline_status] = (acc[l.pipeline_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(`  Leads: ${leads.length} (${Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(", ")})`);

  const leadActivities = generateLeadActivities(leads);
  console.log(`  Lead activities: ${leadActivities.length}`);

  const { proposals, items } = generateProposals(leads);
  const propStatusCounts = proposals.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(`  Proposals: ${proposals.length} (${Object.entries(propStatusCounts).map(([k, v]) => `${k}: ${v}`).join(", ")})`);
  console.log(`  Proposal items: ${items.length}`);

  const contracts = generateContracts(proposals, leads);
  const contractStatusCounts = contracts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(`  Contracts: ${contracts.length} (${Object.entries(contractStatusCounts).map(([k, v]) => `${k}: ${v}`).join(", ")})`);

  const projects = generateProjects(contracts, leads);
  const projStatusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(`  Projects: ${projects.length} (${Object.entries(projStatusCounts).map(([k, v]) => `${k}: ${v}`).join(", ")})`);

  const projectTasks = generateProjectTasks(projects);
  console.log(`  Project tasks: ${projectTasks.length}`);

  const activityEvents = generateActivityEvents(leads, proposals, contracts, projects);
  console.log(`  Activity events: ${activityEvents.length}`);

  // Insert
  console.log("\n[seed] Inserting data...");

  // Strip internal fields before inserting
  const leadsForInsert = leads.map(({ _company, _serviceType, _contactedAt, ...rest }) => rest);
  await batchInsert("contact_submissions", leadsForInsert);
  console.log(`  ✓ contact_submissions: ${leads.length}`);

  await batchInsert("lead_activities", leadActivities);
  console.log(`  ✓ lead_activities: ${leadActivities.length}`);

  const proposalsForInsert = proposals.map(({ _serviceType, _leadCreatedAt, ...rest }) => rest);
  await batchInsert("proposals", proposalsForInsert);
  console.log(`  ✓ proposals: ${proposals.length}`);

  await batchInsert("proposal_items", items);
  console.log(`  ✓ proposal_items: ${items.length}`);

  await batchInsert("contracts", contracts);
  console.log(`  ✓ contracts: ${contracts.length}`);

  const projectsForInsert = projects.map(({ _serviceType, ...rest }) => rest);
  await batchInsert("projects", projectsForInsert);
  console.log(`  ✓ projects: ${projects.length}`);

  await batchInsert("project_tasks", projectTasks);
  console.log(`  ✓ project_tasks: ${projectTasks.length}`);

  // Insert project_status_history for each project
  const statusHistory = projects.map((p) => ({
    id: uuid(),
    project_id: p.id,
    status: p.status,
    changed_at: p.created_at,
  }));
  await batchInsert("project_status_history", statusHistory);
  console.log(`  ✓ project_status_history: ${statusHistory.length}`);

  await batchInsert("workspace_activity_events", activityEvents);
  console.log(`  ✓ workspace_activity_events: ${activityEvents.length}`);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n[seed] ✓ Demo data seeded successfully in ${elapsed}s\n`);

  // Summary
  const totalRecords = leads.length + leadActivities.length + proposals.length + items.length + contracts.length + projects.length + projectTasks.length + statusHistory.length + activityEvents.length;
  console.log(`[seed] Total records: ${totalRecords}`);
  console.log(`[seed] Run 'npx tsx scripts/seed-demo-data.ts' to reseed.\n`);
}

main().catch((err) => {
  console.error("\n[seed] ✗ Fatal error:", err);
  process.exit(1);
});
