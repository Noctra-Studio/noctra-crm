const fs = require('fs');
const https = require('https');
const path = require('path');

// Simple .env parser since we might not have dotenv installed or configured for this script
const envPath = path.join(__dirname, '.env.local');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
      if (key === 'GOOGLE_GENERATIVE_AI_API_KEY') {
        process.env.GOOGLE_GENERATIVE_AI_API_KEY = value;
      }
    }
  }
} catch (e) {
  console.error('Error reading .env.local:', e.message);
}

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error('GOOGLE_GENERATIVE_AI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('Testing API Key: ' + apiKey.substring(0, 5) + '...');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.error('API Error:', JSON.stringify(json.error, null, 2));
      } else {
        console.log('Available Models:');
        if (json.models) {
            json.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log('No models found (unexpected response format). Response:', data);
        }
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
