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

function convertTable(rows) {
  return {
    _type: 'table',
    rows: rows.map(row => ({
      _type: 'row',
      cells: row
    }))
  };
}

async function seedTier2() {
  // 1. Ensure Excel/Google Sheets exists
  const excelSlug = 'excel-sheets';
  let excelGuide = await client.fetch('*[_type == "migrationGuide" && slug.current == $slug][0]', { slug: excelSlug });
  
  if (!excelGuide) {
    console.log('Creating Microsoft Excel / Google Sheets guide...');
    excelGuide = await client.create({
      _type: 'migrationGuide',
      platform: 'Microsoft Excel / Google Sheets',
      slug: { _type: 'slug', current: excelSlug },
      tier: 'tier2',
      difficulty: 'easy',
      estimatedTime: '15-30 minutos',
      lastUpdated: new Date().toISOString().split('T')[0],
      prerequisites: [
        'Tu base de datos CRM actual en formato de hoja de cálculo',
        'Acceso de administrador en Noctra CRM'
      ],
      supportedEntities: ['contacts', 'companies', 'deals', 'activities', 'tags']
    });
  }

  // 2. Data for all Tier 2 guides
  const tier2Data = [
    {
      slug: 'universal-csv',
      exportSteps: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Usa esta opción si tu CRM no está en la lista o si exportas los datos manualmente desde cualquier fuente.' }],
          style: 'normal'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Guía general para importaciones manuales', marks: ['strong'] }],
          style: 'h2'
        },
        convertTable([
          ['Formato', 'Extensión', 'Límite de tamaño', 'Notas'],
          ['CSV (separado por comas)', '.csv', '50 MB', 'Preferido para tablas grandes'],
          ['Excel', '.xlsx', '50 MB', 'Soporta múltiples hojas'],
          ['JSON', '.json', '20 MB', 'Para migraciones técnicas']
        ]),
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Reglas de formato universal', marks: ['strong'] }],
          style: 'h3'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Encoding: Todos los archivos deben estar en UTF-8.' }],
          style: 'normal'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Fechas: Usa siempre el formato YYYY-MM-DD (ej: 2024-03-15).' }],
          style: 'normal'
        },
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Fórmulas de limpieza de datos en Excel/Sheets', marks: ['strong'] }],
          style: 'h3'
        },
        {
          _type: 'codeBlock',
          language: 'excel',
          code: '=TRIM(A2)              \' Eliminar espacios\n=TEXT(A2,"YYYY-MM-DD") \' Formatear fechas'
        }
      ],
      prepareFileSteps: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Campos de la plantilla de Contactos', marks: ['strong'] }],
          style: 'h3'
        },
        convertTable([
          ['Columna', 'Tipo', 'Obligatorio', 'Formato', 'Ejemplo'],
          ['nombre', 'Texto', '✅ Sí', 'Texto libre', 'María García'],
          ['email', 'Email', '✅ Sí', 'email válido', 'maria@empresa.com']
        ])
      ]
    },
    {
      slug: 'monday',
      exportSteps: [
        { _type: 'block', children: [{ _type: 'span', text: '1. Menú (⋯) → Export → Export to Excel/CSV' }], style: 'normal' }
      ],
      prepareFileSteps: [
        convertTable([
          ['Columna en Monday', 'Campo en Noctra'],
          ['Name / Nombre', 'nombre'],
          ['Status / Estado', 'etapa']
        ])
      ]
    },
    {
      slug: 'notion',
      exportSteps: [
        { _type: 'block', children: [{ _type: 'span', text: '1. Menú (⋯) → Export → CSV' }], style: 'normal' }
      ]
    },
    {
      slug: 'airtable',
      exportSteps: [
        { _type: 'block', children: [{ _type: 'span', text: '1. Menú (⋯) → Download CSV' }], style: 'normal' }
      ]
    },
    {
      slug: 'excel-sheets',
      exportSteps: [
        { _type: 'block', children: [{ _type: 'span', text: '1. Archivo → Guardar como → CSV UTF-8' }], style: 'normal' }
      ]
    },
    {
      slug: 'act-crm',
      exportSteps: [
        { _type: 'block', children: [{ _type: 'span', text: '1. File → Export to Text File' }], style: 'normal' }
      ]
    },
    {
      slug: 'sugarcrm',
      exportSteps: [
        { _type: 'block', children: [{ _type: 'span', text: '1. Seleccionar registros → Export' }], style: 'normal' }
      ]
    },
    {
      slug: 'capsule',
      exportSteps: [
        { _type: 'block', children: [{ _type: 'span', text: '1. Settings → Export Data' }], style: 'normal' }
      ]
    },
    {
      slug: 'close',
      exportSteps: [
        { _type: 'block', children: [{ _type: 'span', text: '1. Settings → Export Data' }], style: 'normal' }
      ]
    },
    {
      slug: 'streak',
      exportSteps: [
        { _type: 'block', children: [{ _type: 'span', text: '1. Pipeline (⋯) → Export to CSV' }], style: 'normal' }
      ]
    }
  ];

  for (const data of tier2Data) {
    try {
      const guide = await client.fetch('*[_type == "migrationGuide" && slug.current == $slug][0]', { slug: data.slug });
      
      if (!guide) {
        console.log(`Guide for slug ${data.slug} not found, skipping.`);
        continue;
      }

      console.log(`Seeding data for ${data.slug}...`);
      
      const updateData = {};
      if (data.exportSteps) updateData.exportSteps = data.exportSteps;
      if (data.prepareFileSteps) updateData.prepareFileSteps = data.prepareFileSteps;
      if (data.commonErrors) {
        updateData.commonErrors = data.commonErrors.map(err => ({
          _type: 'errorEntry',
          _key: Math.random().toString(36).substr(2, 9),
          ...err
        }));
      }

      await client.patch(guide._id).set(updateData).commit();
      console.log(`Successfully seeded ${data.slug}`);
    } catch (error) {
      console.error(`Error seeding ${data.slug}:`, error);
    }
  }
}

seedTier2();
