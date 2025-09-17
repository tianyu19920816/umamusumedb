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

// Generate a placeholder image with text
async function generatePlaceholder(text, type = 'character', width = 400, height = 600) {
  const colors = {
    character: { bg: '#4F46E5', fg: '#FFFFFF' },
    card: { bg: '#EC4899', fg: '#FFFFFF' }
  };
  
  const color = colors[type] || colors.character;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color.bg}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="24" fill="${color.fg}">
        ${text}
      </text>
    </svg>
  `;
  
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

// Upload to R2
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

async function processCharacters() {
  console.log('📸 Generating and uploading character placeholder images...\n');
  
  const characters = db.prepare('SELECT id, name_en FROM characters').all();
  const updateStmt = db.prepare('UPDATE characters SET image_url = ? WHERE id = ?');
  
  let successCount = 0;
  for (const character of characters) {
    try {
      // Generate placeholder image
      const buffer = await generatePlaceholder(character.name_en, 'character');
      
      // Upload to R2
      const key = `characters/${character.id}.png`;
      const publicUrl = await uploadToR2(buffer, key);
      
      if (publicUrl) {
        // Update database
        updateStmt.run(publicUrl, character.id);
        console.log(`✅ ${character.name_en}: ${publicUrl}`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Failed processing ${character.name_en}: ${error.message}`);
    }
  }
  
  console.log(`\n✨ Characters complete: ${successCount}/${characters.length} processed`);
}

async function processSupportCards() {
  console.log('\n📸 Generating and uploading support card placeholder images...\n');
  
  const cards = db.prepare('SELECT id, name_en FROM support_cards').all();
  const updateStmt = db.prepare('UPDATE support_cards SET image_url = ? WHERE id = ?');
  
  let successCount = 0;
  for (const card of cards) {
    try {
      // Generate placeholder image
      const buffer = await generatePlaceholder(card.name_en, 'card', 300, 400);
      
      // Upload to R2
      const key = `support-cards/${card.id}.png`;
      const publicUrl = await uploadToR2(buffer, key);
      
      if (publicUrl) {
        // Update database
        updateStmt.run(publicUrl, card.id);
        console.log(`✅ ${card.name_en}: ${publicUrl}`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Failed processing ${card.name_en}: ${error.message}`);
    }
  }
  
  console.log(`\n✨ Support cards complete: ${successCount}/${cards.length} processed`);
}

async function main() {
  console.log('🚀 Starting placeholder image generation and upload to R2...\n');
  
  await processCharacters();
  await processSupportCards();
  
  console.log('\n📊 Exporting updated data to JSON...');
  
  // Export updated data to JSON
  const exportScript = path.join(__dirname, 'export-to-json.js');
  const { execSync } = await import('child_process');
  execSync(`node ${exportScript}`, { stdio: 'inherit' });
  
  console.log('\n✅ All done! Images uploaded and database updated.');
  db.close();
}

main().catch(console.error);