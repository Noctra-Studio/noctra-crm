try {
  const ai = require('ai');
  console.log('ai exports:', Object.keys(ai));
} catch (e) {
  console.log('ai not found:', e.message);
}

try {
  const aiReact = require('ai/react');
  console.log('ai/react exports:', Object.keys(aiReact));
} catch (e) {
  console.log('ai/react not found:', e.message);
}
