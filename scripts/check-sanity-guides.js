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

async function checkGuides() {
  try {
    const guides = await client.fetch('*[_type == "migrationGuide"] { platform, slug, tier }');
    console.log('Existing Migration Guides:');
    console.log(JSON.stringify(guides, null, 2));
  } catch (error) {
    console.error('Error fetching guides:', error);
  }
}

checkGuides();
