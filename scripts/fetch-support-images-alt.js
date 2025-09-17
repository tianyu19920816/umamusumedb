import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import fetch from 'node-fetch';
import sharp from 'sharp';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const db = new Database(path.join(__dirname, '..', 'database', 'umamusume.db'));

// R2 configuration
const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

// Generate high-quality gradient placeholders for support cards
async function generateSupportCardPlaceholder(cardName, rarity) {
  const colors = {
    ssr: { 
      gradient: ['#FFD700', '#FFA500'], // Gold to Orange
      border: '#FFD700',
      text: '#FFFFFF'
    },
    sr: { 
      gradient: ['#C0C0C0', '#808080'], // Silver
      border: '#C0C0C0',
      text: '#FFFFFF'
    },
    r: { 
      gradient: ['#CD7F32', '#8B4513'], // Bronze
      border: '#CD7F32',
      text: '#FFFFFF'
    }
  };
  
  const color = colors[rarity] || colors.ssr;
  const shortName = cardName.split('[')[0].trim();
  const subtitle = cardName.match(/\[(.*?)\]/)?.[1] || '';
  
  const svg = `
    <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.gradient[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.gradient[1]};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Card background -->
      <rect width="300" height="400" fill="url(#bg)" rx="15" ry="15"/>
      
      <!-- Border -->
      <rect x="10" y="10" width="280" height="380" fill="none" 
            stroke="${color.border}" stroke-width="3" rx="10" ry="10" opacity="0.8"/>
      
      <!-- Inner frame -->
      <rect x="20" y="20" width="260" height="360" fill="rgba(255,255,255,0.1)" rx="8" ry="8"/>
      
      <!-- Rarity badge -->
      <rect x="230" y="30" width="50" height="25" fill="${color.border}" rx="12" ry="12" filter="url(#shadow)"/>
      <text x="255" y="47" text-anchor="middle" font-family="Arial Black, sans-serif" 
            font-size="14" fill="${color.text}" font-weight="bold">
        ${rarity.toUpperCase()}
      </text>
      
      <!-- Character silhouette placeholder -->
      <circle cx="150" cy="160" r="60" fill="rgba(255,255,255,0.2)"/>
      <path d="M 150 120 Q 120 140 120 180 Q 120 220 150 220 Q 180 220 180 180 Q 180 140 150 120" 
            fill="rgba(255,255,255,0.3)"/>
      
      <!-- Card name -->
      <text x="150" y="280" text-anchor="middle" font-family="Arial, sans-serif" 
            font-size="20" fill="${color.text}" font-weight="bold" filter="url(#shadow)">
        ${shortName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
      
      <!-- Subtitle -->
      <text x="150" y="305" text-anchor="middle" font-family="Arial, sans-serif" 
            font-size="14" fill="${color.text}" opacity="0.9">
        ${subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
      
      <!-- Effect icons -->
      <g transform="translate(40, 330)">
        <circle cx="0" cy="0" r="15" fill="rgba(255,255,255,0.2)"/>
        <text x="0" y="5" text-anchor="middle" font-size="18" fill="${color.text}">⚡</text>
      </g>
      <g transform="translate(90, 330)">
        <circle cx="0" cy="0" r="15" fill="rgba(255,255,255,0.2)"/>
        <text x="0" y="5" text-anchor="middle" font-size="18" fill="${color.text}">💪</text>
      </g>
      <g transform="translate(140, 330)">
        <circle cx="0" cy="0" r="15" fill="rgba(255,255,255,0.2)"/>
        <text x="0" y="5" text-anchor="middle" font-size="18" fill="${color.text}">🎯</text>
      </g>
      <g transform="translate(190, 330)">
        <circle cx="0" cy="0" r="15" fill="rgba(255,255,255,0.2)"/>
        <text x="0" y="5" text-anchor="middle" font-size="18" fill="${color.text}">✨</text>
      </g>
      <g transform="translate(240, 330)">
        <circle cx="0" cy="0" r="15" fill="rgba(255,255,255,0.2)"/>
        <text x="0" y="5" text-anchor="middle" font-size="18" fill="${color.text}">🏃</text>
      </g>
      
      <!-- Decorative elements -->
      <circle cx="30" cy="30" r="3" fill="${color.text}" opacity="0.5"/>
      <circle cx="270" cy="30" r="3" fill="${color.text}" opacity="0.5"/>
      <circle cx="30" cy="370" r="3" fill="${color.text}" opacity="0.5"/>
      <circle cx="270" cy="370" r="3" fill="${color.text}" opacity="0.5"/>
    </svg>
  `;
  
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

async function uploadToR2(buffer, key) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/png'
    });
    
    await R2.send(command);
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.log(`❌ Failed to upload ${key}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🎴 Creating enhanced support card placeholders...\n');
  
  const cards = db.prepare('SELECT id, name_en FROM support_cards').all();
  const updateStmt = db.prepare('UPDATE support_cards SET image_url = ? WHERE id = ?');
  
  let successCount = 0;
  
  for (const card of cards) {
    try {
      // Determine rarity from ID
      let rarity = 'ssr';
      if (card.id.includes('_sr')) rarity = 'sr';
      else if (card.id.includes('_r')) rarity = 'r';
      
      console.log(`🎨 Creating ${rarity.toUpperCase()} card: ${card.name_en}`);
      
      // Generate placeholder
      const buffer = await generateSupportCardPlaceholder(card.name_en, rarity);
      
      // Upload to R2
      const key = `support-cards/${card.id}.png`;
      const publicUrl = await uploadToR2(buffer, key);
      
      if (publicUrl) {
        updateStmt.run(publicUrl, card.id);
        console.log(`✅ ${card.name_en}: Created and uploaded`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Failed processing ${card.name_en}: ${error.message}`);
    }
  }
  
  console.log(`\n✨ Support cards complete: ${successCount}/${cards.length} processed`);
  
  console.log('\n📊 Exporting updated data to JSON...');
  const { execSync } = await import('child_process');
  execSync('node scripts/export-to-json.js', { stdio: 'inherit' });
  
  console.log('\n✅ All done! Support card images created and uploaded.');
  db.close();
}

main().catch(console.error);