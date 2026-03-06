const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  content = content.replace(/text-neutral-600/g, 'text-neutral-400');
  content = content.replace(/text-neutral-500/g, 'text-neutral-300');
  
  if (content !== original) {
    fs.writeFileSync(f, content);
    changed++;
  }
});

console.log('Fixed contrast classes in files:', changed);
