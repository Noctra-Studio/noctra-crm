
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Testing Supabase Connectivity...');
  console.log('URL:', url);
  console.log('Key defined:', !!key);

  if (!url || !key) {
    console.error('Missing Supabase environment variables.');
    return;
  }

  const supabase = createClient(url, key);

  try {
    const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase error:', error.message);
    } else {
      console.log('Supabase connection successful! Found projects:', data);
    }
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

testSupabase();
