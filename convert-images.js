const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public/images');
const imagesToConvert = ['ai.jpg', 'architecture.jpg', 'identity.jpg', 'seo.jpg'];

async function convert() {
  for (const file of imagesToConvert) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file.replace('.jpg', '.webp'));
    
    if (fs.existsSync(inputPath)) {
      console.log(`Converting ${file} to webp...`);
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Converted ${file} to ${path.basename(outputPath)}`);
    } else {
      console.warn(`File not found: ${inputPath}`);
    }
  }
}

convert().catch(console.error);
