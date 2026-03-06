const fs = require('fs');
const file = 'src/app/[locale]/admin/projects/AdminProjectsClient.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(file, content);
