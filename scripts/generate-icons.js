import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 192, name: 'icon-maskable-192x192.png', maskable: true },
  { size: 512, name: 'icon-maskable-512x512.png', maskable: true }
];

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);

    for (const { size, name, maskable } of sizes) {
      let svg = svgBuffer.toString();
      
      if (maskable) {
        // For maskable icons, we need to ensure the icon fills the entire safe zone
        // We'll modify the SVG to have a transparent background with the icon centered
        svg = svg.replace('fill="#6366f1"', 'fill="transparent"');
        svg = svg.replace('opacity="0.3"', '');
      }

      const resized = await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, name));

      console.log(`Generated ${name} (${size}x${size})`);
    }

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
