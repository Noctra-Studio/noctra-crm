const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-02-16',
  token: process.env.SANITY_API_TOKEN,
});

const guidesData = [
  {
    platform: 'HubSpot',
    slug: 'hubspot',
    mappingTable: [
      ['Entidad en HubSpot', 'Se importa como en Noctra'],
      ['Contactos', 'Contactos'],
      ['Empresas', 'Empresas'],
      ['Negocios (Deals)', 'Oportunidades'],
      ['Tareas y notas', 'Actividades'],
      ['Listas estáticas', 'Segmentos'],
      ['Propietarios', 'Responsables (se asignan al usuario importador si no hay coincidencia)']
    ]
  },
  {
    platform: 'Zoho CRM',
    slug: 'zoho',
    mappingTable: [
      ['Módulo en Zoho CRM', 'Se importa como en Noctra'],
      ['Contactos', 'Contactos'],
      ['Cuentas', 'Empresas'],
      ['Leads', 'Contactos (con etiqueta "Lead")'],
      ['Tratos', 'Oportunidades'],
      ['Tareas', 'Actividades (tipo: Tarea)'],
      ['Llamadas', 'Actividades (tipo: Llamada)'],
      ['Reuniones', 'Actividades (tipo: Reunión)'],
      ['Notas', 'Actividades (tipo: Nota)']
    ]
  },
  {
    platform: 'Pipedrive',
    slug: 'pipedrive',
    mappingTable: [
      ['Entidad en Pipedrive', 'Se importa como en Noctra'],
      ['Personas', 'Contactos'],
      ['Organizaciones', 'Empresas'],
      ['Negocios (Deals)', 'Oportunidades'],
      ['Actividades', 'Actividades'],
      ['Notas', 'Actividades (tipo: Nota)'],
      ['Pipelines y etapas', 'Pipelines (se replican exactamente)'],
      ['Usuarios propietarios', 'Se asigna al usuario importador si no hay coincidencia']
    ]
  },
  {
    platform: 'Odoo',
    slug: 'odoo',
    mappingTable: [
      ['Modelo técnico de Odoo', 'Entidad en Odoo', 'Se importa como en Noctra'],
      ['res.partner (is_company=False)', 'Contactos individuales', 'Contactos'],
      ['res.partner (is_company=True)', 'Empresas', 'Empresas'],
      ['crm.lead (type=lead)', 'Leads', 'Contactos (con etiqueta "Lead")'],
      ['crm.lead (type=opportunity)', 'Oportunidades', 'Oportunidades'],
      ['mail.activity', 'Actividades', 'Actividades'],
      ['crm.tag', 'Etiquetas de CRM', 'Etiquetas'],
      ['crm.stage', 'Etapas del pipeline', 'Etapas del pipeline']
    ]
  },
  {
    platform: 'Salesforce',
    slug: 'salesforce',
    mappingTable: [
      ['Objeto en Salesforce', 'Se importa como en Noctra'],
      ['Contact', 'Contactos'],
      ['Account', 'Empresas'],
      ['Lead', 'Contactos (con etiqueta "Lead")'],
      ['Opportunity', 'Oportunidades'],
      ['Task', 'Actividades (tipo: Tarea)'],
      ['Event', 'Actividades (tipo: Reunión)'],
      ['Note', 'Actividades (tipo: Nota)'],
      ['OpportunityStage', 'Etapas de pipeline']
    ]
  },
  {
    platform: 'Freshsales',
    slug: 'freshsales',
    mappingTable: [
      ['Entidad en Freshsales', 'Se importa como en Noctra'],
      ['Contacts', 'Contactos'],
      ['Accounts', 'Empresas'],
      ['Deals', 'Oportunidades'],
      ['Tasks', 'Actividades (tipo: Tarea)'],
      ['Appointments', 'Actividades (tipo: Reunión)'],
      ['Notes', 'Actividades (tipo: Nota)'],
      ['Sales activities', 'Actividades']
    ]
  },
  {
    platform: 'Bitrix24',
    slug: 'bitrix24',
    mappingTable: [
      ['Entidad en Bitrix24', 'Se importa como en Noctra'],
      ['CONTACT', 'Contactos'],
      ['COMPANY', 'Empresas'],
      ['LEAD', 'Contactos (con etiqueta "Lead")'],
      ['DEAL', 'Oportunidades'],
      ['ACTIVITY (llamadas, emails)', 'Actividades'],
      ['TASK', 'Actividades (tipo: Tarea)'],
      ['STAGE', 'Etapas de pipeline']
    ]
  }
];

function convertTable(rows) {
  return {
    _type: 'table',
    rows: rows.map(row => ({
      _type: 'row',
      cells: row
    }))
  };
}

async function seed() {
  for (const data of guidesData) {
    try {
      const guide = await client.fetch('*[_type == "migrationGuide" && platform == $platform][0]', { platform: data.platform });
      
      if (!guide) {
        console.log(`Guide for ${data.platform} not found, skipping seeding for this platform.`);
        continue;
      }

      console.log(`Seeding data for ${data.platform}...`);

      const table = convertTable(data.mappingTable);
      
      const patch = client.patch(guide._id).set({
        prepareFileSteps: [
          {
            _type: 'block',
            children: [{ _type: 'span', text: data.platform === 'Odoo' ? 'Odoo organiza los datos en modelos técnicos. Estos son los que Noctra CRM accede:' : 'Una vez conectado, verás un selector con todas las entidades disponibles:' }],
            style: 'normal'
          },
          table
        ]
      });

      // Special handling for Tip/Note if provided in user request for Section 2
      if (data.platform === 'HubSpot') {
        patch.append('prepareFileSteps', [{
          _type: 'block',
          children: [{ _type: 'span', text: 'Recomendamos empezar con Contactos y Empresas para verificar que todo funciona correctamente antes de importar Deals.' }],
          style: 'normal'
        }]);
      } else if (data.platform === 'Zoho CRM') {
        patch.append('prepareFileSteps', [{
          _type: 'calloutBox',
          type: 'tip',
          content: 'Zoho diferencia entre "Contactos" (personas asociadas a una cuenta) y "Leads" (prospectos sin cuenta asignada). Noctra CRM importa ambos como Contactos, diferenciándolos con una etiqueta.'
        }]);
      }

      await patch.commit();
      console.log(`Successfully seeded ${data.platform}`);
    } catch (error) {
      console.error(`Error seeding ${data.platform}:`, error);
    }
  }
}

seed();
