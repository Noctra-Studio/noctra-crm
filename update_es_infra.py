import json
import os

filepath = "/Users/manu/Documents/1.Projects/Noctra-studio/website/noctra-studio/messages/es.json"

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

infra_comparison = {
    "title": "Inversión transparente",
    "subtitle": "Configura tu infraestructura actual y mira lo que realmente estás pagando frente a Noctra Studio.",
    "industry_labels": {
        "select": "PASO 1: SELECCIONA TU INDUSTRIA",
        "medical": { "label": "Profesional Médico", "sub": "Clínicas, consultorios y especialistas", "icon": "Stethoscope" },
        "legal": { "label": "Servicios Legales", "sub": "Despachos de abogados y notarios", "icon": "Briefcase" },
        "retail": { "label": "Comercio / Retail", "sub": "Tiendas físicas y e-commerce", "icon": "ShoppingBag" },
        "manufacturing": { "label": "Manufactura / Pyme", "sub": "Talleres, fábricas y logística", "icon": "Hammer" },
        "b2b": { "label": "Servicios B2B", "sub": "Agencias, consultoras y software", "icon": "Building2" },
        "hospitality": { "label": "Hospitalidad / Real Estate", "sub": "Hoteles, airbnb y rentas", "icon": "Hotel" },
        "other": { "label": "Otra Industria", "sub": "Proyectos personalizados", "icon": "LayoutGrid" }
    },
    "categories": {
        "medical": [
            {
                "id": "med_web",
                "label": "🌐 Web y Presencia",
                "options": [
                    { "id": "med_agency", "label": "Sitio WordPress con agencia", "min": 85000, "max": 125000, "info": "Setup $15k + Mantenimiento $35k/año × 2" },
                    { "id": "med_template", "label": "Template (Wix/Square)", "min": 12000, "max": 24000, "info": "$500 - $1,000 MXN mensuales" }
                ]
            },
            {
                "id": "med_booking",
                "label": "📅 Agendamiento y CRM",
                "options": [
                    { "id": "doctoralia", "label": "Doctoralia (Premium)", "min": 35000, "max": 65000, "info": "Suscripción + Comisiones por paciente" },
                    { "id": "calendly", "label": "Calendly + CRM Simple", "min": 8000, "max": 15000, "info": "Suscripciones anuales" }
                ]
            }
        ],
        "legal": [
            {
                "id": "leg_web",
                "label": "🌐 Web y Reputación",
                "options": [
                    { "id": "leg_agency", "label": "Web Corporativa con Agencia", "min": 120000, "max": 180000, "info": "Branding + SEO Semestral" },
                    { "id": "leg_wp", "label": "WordPress básico", "min": 15000, "max": 35000, "info": "Hosting + Licencia Elementor" }
                ]
            },
            {
                "id": "leg_crm",
                "label": "📁 Gestión de Casos",
                "options": [
                    { "id": "clio", "label": "Clio / Software Legal", "min": 45000, "max": 80000, "info": "Costo por usuario/año" },
                    { "id": "drive_manual", "label": "Google Drive (Manual)", "min": 5000, "max": 10000, "info": "Google Workspace + Tiempo manual" }
                ]
            }
        ],
        "retail": [
            {
                "id": "ret_ecommerce",
                "label": "🛒 E-commerce",
                "options": [
                    { "id": "shopify", "label": "Shopify + Apps", "min": 45000, "max": 95000, "info": "Suscripción + Comisiones + Apps" },
                    { "id": "woo", "label": "WooCommerce", "min": 35000, "max": 75000, "info": "Mantenimiento técnico recurrente" }
                ]
            }
        ],
        "manufacturing": [
            {
                "id": "man_ops",
                "label": "⚙️ Operaciones",
                "options": [
                    { "id": "erp_basic", "label": "ERP Básico / Inventarios", "min": 95000, "max": 250000, "info": "Implementación + Licencias" },
                    { "id": "excel_manual", "label": "Hojas de Cálculo / Manual", "min": 25000, "max": 65000, "info": "Costo de errores y tiempo perdido" }
                ]
            }
        ],
        "b2b": [
            {
                "id": "b2b_marketing",
                "label": "🚀 Marketing Digital",
                "options": [
                    { "id": "b2b_agency", "label": "Agencia de Marketing / SEO", "min": 240000, "max": 600000, "info": "$10k - $25k mensuales x 24 meses" },
                    { "id": "hubspot", "label": "HubSpot (Marketing Hub)", "min": 120000, "max": 350000, "info": "Tier Pro / Enterprise" }
                ]
            }
        ],
        "hospitality": [
            {
                "id": "hosp_distribution",
                "label": "🏨 Distribución",
                "options": [
                    { "id": "hosp_booking", "label": "Booking.com (Comisiones)", "min": 150000, "max": 500000, "info": "15-20% de cada reserva" },
                    { "id": "hosp_airbnb", "label": "Airbnb (Comisiones)", "min": 80000, "max": 300000, "info": "Comisión variable por gestión" }
                ]
            }
        ],
        "other": [
            {
                "id": "other_stack",
                "label": "🛠️ Stack General",
                "options": [
                    { "id": "various_saas", "label": "Varios SaaS Fragmentados", "min": 45000, "max": 120000, "info": "Suma de múltiples suscripciones" }
                ]
            }
        ],
        "universal": [
            {
                "id": "uni_marketing",
                "label": "📣 Marketing y CRM",
                "options": [
                    { "id": "email_mkt_agency", "label": "Mailing + CRM administrado", "min": 35000, "max": 75000, "info": "Mailchimp Pro + Fee mensual" },
                    { "id": "fb_ads_admin", "label": "Gestión de Pautas (Fee)", "min": 60000, "max": 150000, "info": "Administración de campañas (no incluye adspend)" }
                ]
            },
            {
                "id": "uni_hosting",
                "label": "☁️ Cloud y Soporte",
                "options": [
                    { "id": "secure_hosting", "label": "Hosting Premium + SSL", "min": 15000, "max": 35000, "info": "WPEngine / AWS Administrado" },
                    { "id": "support_hourly", "label": "Soporte Técnico x Hora", "min": 12000, "max": 30000, "info": "Bolsa de horas para ajustes" }
                ]
            }
        ]
    },
    "columns": {
        "current": {
            "title": "Tu configuración actual",
            "empty_state": "Selecciona lo que usas actualmente para comparar costos.",
            "total_label": "Costo Total Estimado (2 años)",
            "hidden_costs_title": "Costos Ocultos y Riesgos",
            "hidden_costs_items": [
                "Tiempo perdido gestionando proveedores",
                "Riesgos de seguridad y hacks en WordPress",
                "Incompatibilidad entre plugins",
                "Falta de soporte proactivo",
                "Crecimiento limitado por infraestructura"
            ]
        },
        "noctra": {
            "title": "Con Noctra Studio",
            "badge": "RECOMENDADO",
            "total_label": "Inversión Única (2 años)",
            "included_items": [
                "Sitio Web Ultra-Rápido (Next.js)",
                "Infraestructura Cloud Hosting",
                "CRM y Automatización Integrada",
                "Soporte Concierge 24/7",
                "Actualizaciones de Seguridad",
                "Licencia Enterprise",
                "Consultoría en Crecimiento",
                "SEO Técnico Nativo"
            ],
            "zero_hidden_title": "Beneficios Exclusivos Noctra",
            "zero_hidden_items": [
                "Costo fijo sin sorpresas",
                "Escalabilidad infinita",
                "Propiedad total de tus activos",
                "Un solo punto de contacto",
                "Diseño premium de clase mundial"
            ]
        }
    },
    "savings_card": {
        "title": "TUS AHORROS POTENCIALES",
        "roi_label": "ROI ESTIMADO",
        "enough_to_items": [
            "Equivale a una nueva oficina física",
            "Suficiente para renovar todo tu equipo",
            "Equivale a 12 meses de tu nómina admin",
            "Suficiente para tu expansión nacional",
            "Un viaje de incentivo para todo tu equipo"
        ]
    },
    "breakdown": {
        "cta_open": "Ver desglose detallado ▼",
        "cta_close": "Cerrar desglose ▲",
        "title": "DESGLOSE FINANCIERO ESTIMADO (2 AÑOS)",
        "year_1": "Año 1 (Setup + Mant.)",
        "year_2": "Año 2 (Continuidad)",
        "grand_total": "TOTAL ACUMULADO",
        "extra_considerations": "Consideraciones Extras",
        "extra_items": [
            "Inflación estimada del 5% anual",
            "Costos de oportunidad no calculados",
            "Fees de implementación inicial"
        ]
    },
    "methodology": {
        "title": "Metodología del Cálculo",
        "summary": "Nuestros cálculos se basan en datos de mercado promedio recolectados de agencias, freelancers y proveedores de software SaaS en México (2024-2025).",
        "sections": [
            {
                "title": "FUENTES DE DATOS",
                "items": [
                    "Promedios de cotizaciones de agencias boutique en CDMX/MTY/GDL.",
                    "Precios públicos de plataformas SaaS (Shopify, Doctoralia, Hubspot, etc).",
                    "Entrevistas con tomadores de decisiones en más de 50 empresas medianas."
                ]
            },
            {
                "title": "SUPUESTOS CLAVE",
                "items": [
                    "Los costos de Noctra incluyen el setup y mantenimiento preventivo por 24 meses.",
                    "Las opciones de 'Agencia' incluyen un fee mensual de gestión moderado.",
                    "No se incluyen costos de anuncios (AdSpend), solo de gestión."
                ]
            }
        ],
        "currency": "Todos los valores están expresados en MXN para facilitar la comparación en el mercado local.",
        "variations": "Los costos pueden variar significativamente dependiendo de la complejidad específica del proyecto.",
        "commitment": "Noctra se compromete a la transparencia; si tienes una cotización formal que contradiga estos datos, contáctanos.",
        "last_updated": "Última actualización: Febrero 2025"
    },
    "warnings": {
        "high_spend": "⚠️ Estás gastando más de 5 veces lo necesario. Considera consolidar con una solución todo-en-uno.",
        "doctoralia": "⚠️ Las comisiones de Doctoralia pueden comerse hasta el 20% de tu margen. Un motor de reservas propio es vital.",
        "hospitality_ota": "⚠️ Depender 100% de OTAs (Booking/Airbnb) es ceder tu rentabilidad. El canal directo con Noctra ahorra miles."
    }
}

data["Pricing"]["infrastructure_comparison"] = infra_comparison

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully updated es.json")
