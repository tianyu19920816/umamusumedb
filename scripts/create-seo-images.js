import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create OG Image (1200x630)
async function createOGImage() {
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Pattern overlay -->
      <g opacity="0.1">
        ${Array.from({ length: 20 }, (_, i) => `
          <circle cx="${60 + i * 120}" cy="${50 + (i % 2) * 100}" r="40" fill="white"/>
        `).join('')}
      </g>
      
      <!-- Main content -->
      <g transform="translate(600, 315)">
        <!-- Logo area -->
        <circle cx="0" cy="-120" r="60" fill="white" opacity="0.2"/>
        <text x="0" y="-105" text-anchor="middle" font-family="Arial Black, sans-serif" 
              font-size="48" fill="white" font-weight="bold">UM</text>
        
        <!-- Title -->
        <text x="0" y="0" text-anchor="middle" font-family="Arial Black, sans-serif" 
              font-size="72" fill="white" font-weight="bold">UmamusumeDB</text>
        
        <!-- Subtitle -->
        <text x="0" y="50" text-anchor="middle" font-family="Arial, sans-serif" 
              font-size="28" fill="white" opacity="0.9">
          Comprehensive Uma Musume Pretty Derby Database
        </text>
        
        <!-- Features -->
        <text x="0" y="120" text-anchor="middle" font-family="Arial, sans-serif" 
              font-size="24" fill="white" opacity="0.8">
          Characters • Support Cards • Tier Lists • Training Tools
        </text>
      </g>
      
      <!-- Decorative elements -->
      <circle cx="100" cy="100" r="3" fill="white" opacity="0.5"/>
      <circle cx="1100" cy="100" r="3" fill="white" opacity="0.5"/>
      <circle cx="100" cy="530" r="3" fill="white" opacity="0.5"/>
      <circle cx="1100" cy="530" r="3" fill="white" opacity="0.5"/>
    </svg>
  `;
  
  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
  
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'og-image.png'), buffer);
  console.log('✅ Created og-image.png');
}

// Create Favicon (512x512 for scaling)
async function createFavicon() {
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="favicon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="512" height="512" fill="url(#favicon-bg)" rx="100" ry="100"/>
      
      <!-- Text -->
      <text x="256" y="320" text-anchor="middle" font-family="Arial Black, sans-serif" 
            font-size="200" fill="white" font-weight="bold">UM</text>
    </svg>
  `;
  
  const buffer = await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toBuffer();
  
  // Create multiple sizes
  const sizes = [16, 32, 96, 192, 512];
  
  for (const size of sizes) {
    const resized = await sharp(buffer)
      .resize(size, size)
      .png()
      .toBuffer();
    
    if (size === 32) {
      fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.png'), resized);
      fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), resized);
    }
    
    fs.writeFileSync(path.join(__dirname, '..', 'public', `favicon-${size}x${size}.png`), resized);
    console.log(`✅ Created favicon-${size}x${size}.png`);
  }
}

// Create Apple Touch Icon
async function createAppleTouchIcon() {
  const svg = `
    <svg width="180" height="180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="apple-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="180" height="180" fill="url(#apple-bg)" rx="40" ry="40"/>
      
      <!-- Text -->
      <text x="90" y="120" text-anchor="middle" font-family="Arial Black, sans-serif" 
            font-size="72" fill="white" font-weight="bold">UM</text>
    </svg>
  `;
  
  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
  
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'), buffer);
  console.log('✅ Created apple-touch-icon.png');
}

async function main() {
  console.log('🎨 Creating SEO images...\n');
  
  await createOGImage();
  await createFavicon();
  await createAppleTouchIcon();
  
  console.log('\n✨ All SEO images created successfully!');
}

main().catch(console.error);