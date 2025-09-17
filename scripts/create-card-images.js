import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
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

// Character mapping for support cards
const CHARACTER_MAPPING = {
  'kitasan_black_ssr': { name: 'Kitasan Black', color: '#8B4513' },
  'super_creek_ssr': { name: 'Super Creek', color: '#4169E1' },
  'fine_motion_ssr': { name: 'Fine Motion', color: '#FF69B4' },
  'admire_vega_ssr': { name: 'Admire Vega', color: '#9932CC' },
  'sakura_chiyono_o_ssr': { name: 'Sakura Chiyono O', color: '#FFB6C1' },
  'daiwa_scarlet_ssr': { name: 'Daiwa Scarlet', color: '#DC143C' },
  'symboli_rudolf_ssr': { name: 'Symboli Rudolf', color: '#4B0082' },
  'tokai_teio_ssr': { name: 'Tokai Teio', color: '#FF4500' },
  'mejiro_mcqueen_ssr': { name: 'Mejiro McQueen', color: '#6B8E23' },
  'rice_shower_ssr': { name: 'Rice Shower', color: '#6495ED' },
  'gold_ship_ssr': { name: 'Gold Ship', color: '#FFD700' },
  'silence_suzuka_ssr': { name: 'Silence Suzuka', color: '#FF8C00' },
  'special_week_ssr': { name: 'Special Week', color: '#FF1493' },
  'taiki_shuttle_ssr': { name: 'Taiki Shuttle', color: '#00CED1' },
  'narita_brian_ssr': { name: 'Narita Brian', color: '#2F4F4F' },
  'mihono_bourbon_ssr': { name: 'Mihono Bourbon', color: '#8B008B' },
  'air_groove_ssr': { name: 'Air Groove', color: '#FF6347' },
  'grass_wonder_ssr': { name: 'Grass Wonder', color: '#32CD32' },
  'el_condor_pasa_ssr': { name: 'El Condor Pasa', color: '#D2691E' },
  'manhattan_cafe_ssr': { name: 'Manhattan Cafe', color: '#800000' },
  'twin_turbo_ssr': { name: 'Twin Turbo', color: '#00BFFF' },
  'nice_nature_sr': { name: 'Nice Nature', color: '#DDA0DD' },
  'king_halo_sr': { name: 'King Halo', color: '#FFB347' },
  'sweep_tosho_sr': { name: 'Sweep Tosho', color: '#98FB98' },
  'haru_urara_r': { name: 'Haru Urara', color: '#FFA07A' }
};

// Generate a proper card image
async function generateCardImage(cardId, cardName, rarity) {
  const character = CHARACTER_MAPPING[cardId] || { name: cardName.split('[')[0].trim(), color: '#888888' };
  const subtitle = cardName.match(/\[(.*?)\]/)?.[1] || '';
  
  const rarityColors = {
    ssr: { bg: '#FFD700', frame: '#FFA500', badge: '#FF6347' },
    sr: { bg: '#C0C0C0', frame: '#A9A9A9', badge: '#778899' },
    r: { bg: '#CD853F', frame: '#A0522D', badge: '#8B4513' }
  };
  
  const colors = rarityColors[rarity] || rarityColors.ssr;
  
  const svg = `
    <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F5F5F5;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="frameBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.frame};stop-opacity:1" />
        </linearGradient>
        <filter id="drop-shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="1" dy="1" result="offsetblur"/>
          <feFlood flood-color="#000000" flood-opacity="0.3"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="${colors.frame}" opacity="0.2"/>
        </pattern>
      </defs>
      
      <!-- Card base -->
      <rect width="300" height="400" fill="url(#cardBg)" rx="12" ry="12"/>
      
      <!-- Frame -->
      <rect x="8" y="8" width="284" height="384" fill="none" 
            stroke="url(#frameBg)" stroke-width="6" rx="10" ry="10"/>
      
      <!-- Inner pattern -->
      <rect x="15" y="15" width="270" height="370" fill="url(#pattern)" rx="8" ry="8"/>
      
      <!-- Character portrait area -->
      <rect x="25" y="25" width="250" height="200" fill="#FFFFFF" rx="8" ry="8" filter="url(#drop-shadow)"/>
      <rect x="30" y="30" width="240" height="190" fill="${character.color}" opacity="0.15" rx="6" ry="6"/>
      
      <!-- Character silhouette -->
      <g transform="translate(150, 125)">
        <ellipse cx="0" cy="-20" rx="45" ry="55" fill="${character.color}" opacity="0.3"/>
        <circle cx="0" cy="15" r="35" fill="${character.color}" opacity="0.25"/>
        <path d="M -30 15 Q -35 25 -30 40 L 30 40 Q 35 25 30 15 Z" 
              fill="${character.color}" opacity="0.2"/>
      </g>
      
      <!-- Rarity badge -->
      <g transform="translate(250, 45)">
        <rect x="-35" y="-15" width="60" height="28" fill="${colors.badge}" rx="14" ry="14" filter="url(#drop-shadow)"/>
        <text x="-5" y="2" text-anchor="middle" font-family="Arial Black, sans-serif" 
              font-size="16" fill="#FFFFFF" font-weight="bold">
          ${rarity.toUpperCase()}
        </text>
      </g>
      
      <!-- Card name section -->
      <rect x="25" y="235" width="250" height="60" fill="#FFFFFF" rx="6" ry="6" filter="url(#drop-shadow)"/>
      <text x="150" y="260" text-anchor="middle" font-family="Arial, sans-serif" 
            font-size="18" fill="#333333" font-weight="bold">
        ${character.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
      <text x="150" y="282" text-anchor="middle" font-family="Arial, sans-serif" 
            font-size="13" fill="#666666">
        ${subtitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
      
      <!-- Stats section -->
      <rect x="25" y="305" width="250" height="70" fill="rgba(255,255,255,0.9)" rx="6" ry="6" filter="url(#drop-shadow)"/>
      
      <!-- Stat icons -->
      <g transform="translate(50, 340)">
        <circle cx="0" cy="0" r="18" fill="${colors.frame}" opacity="0.3"/>
        <text x="0" y="5" text-anchor="middle" font-size="20" fill="#333">💪</text>
      </g>
      
      <g transform="translate(100, 340)">
        <circle cx="0" cy="0" r="18" fill="${colors.frame}" opacity="0.3"/>
        <text x="0" y="5" text-anchor="middle" font-size="20" fill="#333">⚡</text>
      </g>
      
      <g transform="translate(150, 340)">
        <circle cx="0" cy="0" r="18" fill="${colors.frame}" opacity="0.3"/>
        <text x="0" y="5" text-anchor="middle" font-size="20" fill="#333">❤️</text>
      </g>
      
      <g transform="translate(200, 340)">
        <circle cx="0" cy="0" r="18" fill="${colors.frame}" opacity="0.3"/>
        <text x="0" y="5" text-anchor="middle" font-size="20" fill="#333">🎯</text>
      </g>
      
      <g transform="translate(250, 340)">
        <circle cx="0" cy="0" r="18" fill="${colors.frame}" opacity="0.3"/>
        <text x="0" y="5" text-anchor="middle" font-size="20" fill="#333">✨</text>
      </g>
      
      <!-- Decorative elements -->
      <circle cx="35" cy="35" r="2" fill="${colors.bg}" opacity="0.6"/>
      <circle cx="265" cy="35" r="2" fill="${colors.bg}" opacity="0.6"/>
      <circle cx="35" cy="365" r="2" fill="${colors.bg}" opacity="0.6"/>
      <circle cx="265" cy="365" r="2" fill="${colors.bg}" opacity="0.6"/>
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
  console.log('🎨 Creating proper support card images...\n');
  
  const cards = db.prepare('SELECT id, name_en FROM support_cards').all();
  const updateStmt = db.prepare('UPDATE support_cards SET image_url = ? WHERE id = ?');
  
  let successCount = 0;
  
  for (const card of cards) {
    try {
      // Determine rarity from ID
      let rarity = 'ssr';
      if (card.id.includes('_sr')) rarity = 'sr';
      else if (card.id.includes('_r')) rarity = 'r';
      
      console.log(`📸 Creating ${rarity.toUpperCase()} card: ${card.name_en}`);
      
      // Generate card image
      const buffer = await generateCardImage(card.id, card.name_en, rarity);
      
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