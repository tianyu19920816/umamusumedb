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

// More comprehensive image sources from Game8 and other trusted sites
const MISSING_CHARACTER_IMAGES = {
  // Characters that were missing from previous attempt
  'oguri_cap_starlight': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_155.png',
  'narita_taishin_nevertheless': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_156.png',
  'agnes_tachyon_tachnology': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_154.png',
  'seiun_sky_reeling': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_157.png',
  'curren_chan': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_48.png',
  'smart_falcon': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_47.png',
  
  // Missing newer characters - using alternative sources
  'hishi_akebono_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_69.png',
  'matikane_fukukitaru_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_68.png',
  'yukino_bijin_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_70.png',
  'mr_cb_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_67.png',
  'gold_city_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_66.png',
  'seeking_the_pearl_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_71.png',
  'yaeno_muteki_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_72.png',
  'nakayama_festa_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_73.png',
  
  // Latest additions from 2024-2025
  'daring_tact_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_96.png',
  'chrono_genesis_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_97.png',
  'almond_eye_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_98.png',
  'contrail_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_99.png',
  'efforia_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_100.png',
  'gran_alegria_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_101.png',
  'loves_only_you_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_102.png'
};

// Alternative support card image sources (using card IDs from GameWith)
const SUPPORT_CARD_ALTERNATIVE = {
  'kitasan_black_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10082.png',
  'super_creek_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10145.png', 
  'fine_motion_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10146.png',
  'admire_vega_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10147.png',
  'sakura_chiyono_o_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10061.png',
  'daiwa_scarlet_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10117.png',
  'symboli_rudolf_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10074.png',
  'tokai_teio_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10092.png',
  'mejiro_mcqueen_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10051.png',
  'rice_shower_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10098.png',
  'gold_ship_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10073.png',
  'silence_suzuka_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10050.png',
  'special_week_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10049.png',
  'taiki_shuttle_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10087.png',
  'narita_brian_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10085.png',
  'mihono_bourbon_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10088.png',
  'air_groove_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10089.png',
  'grass_wonder_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10076.png',
  'el_condor_pasa_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10075.png',
  'manhattan_cafe_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10099.png',
  'twin_turbo_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10103.png',
  'nice_nature_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_20094.png',
  'king_halo_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_20082.png',
  'sweep_tosho_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_20107.png',
  'haru_urara_r': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_30081.png'
};

async function downloadImage(url, id, retryCount = 3) {
  for (let i = 0; i < retryCount; i++) {
    try {
      console.log(`📥 Attempt ${i + 1}: Downloading ${id}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://gamewith.jp/'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const buffer = await response.buffer();
      
      // Verify it's actually an image
      const metadata = await sharp(buffer).metadata();
      if (metadata.width && metadata.height) {
        console.log(`✅ Valid image: ${metadata.width}x${metadata.height}`);
        return buffer;
      }
      throw new Error('Invalid image data');
    } catch (error) {
      console.log(`⚠️ Attempt ${i + 1} failed: ${error.message}`);
      if (i < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  return null;
}

async function processImage(buffer, type = 'character') {
  try {
    if (type === 'character') {
      return await sharp(buffer)
        .resize(400, 600, { 
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
    } else {
      return await sharp(buffer)
        .resize(300, 400, { 
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
    }
  } catch (error) {
    console.log(`❌ Error processing image: ${error.message}`);
    return null;
  }
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

async function processMissingCharacters() {
  console.log('🎮 Processing missing character images...\n');
  
  const characters = db.prepare(`
    SELECT id, name_en, image_url 
    FROM characters 
    WHERE image_url LIKE '%/characters/%.png' 
    AND name_en IN (
      'Oguri Cap (Starlight Beat)', 'Narita Taishin (Nevertheless)', 
      'Agnes Tachyon (Tach-nology)', 'Seiun Sky (Reeling in the Big One)',
      'Curren Chan', 'Smart Falcon', 'Hishi Akebono', 'Matikane Fukukitaru',
      'Yukino Bijin', 'Mr. C.B.', 'Gold City', 'Seeking the Pearl',
      'Yaeno Muteki', 'Nakayama Festa', 'Daring Tact', 'Chrono Genesis',
      'Almond Eye', 'Contrail', 'Efforia', 'Gran Alegria', 'Loves Only You'
    )
  `).all();
  
  const updateStmt = db.prepare('UPDATE characters SET image_url = ? WHERE id = ?');
  
  let successCount = 0;
  for (const character of characters) {
    const imageUrl = MISSING_CHARACTER_IMAGES[character.id];
    if (imageUrl) {
      const buffer = await downloadImage(imageUrl, character.id);
      if (buffer) {
        const processed = await processImage(buffer, 'character');
        if (processed) {
          const key = `characters/${character.id}.png`;
          const publicUrl = await uploadToR2(processed, key);
          if (publicUrl) {
            updateStmt.run(publicUrl, character.id);
            console.log(`✅ ${character.name_en}: Updated with real image`);
            successCount++;
          }
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n✨ Characters: ${successCount}/${characters.length} updated`);
}

async function processSupportCards() {
  console.log('\n🎴 Processing support card images...\n');
  
  const cards = db.prepare('SELECT id, name_en FROM support_cards').all();
  const updateStmt = db.prepare('UPDATE support_cards SET image_url = ? WHERE id = ?');
  
  let successCount = 0;
  for (const card of cards) {
    const imageUrl = SUPPORT_CARD_ALTERNATIVE[card.id];
    if (imageUrl) {
      const buffer = await downloadImage(imageUrl, card.id);
      if (buffer) {
        const processed = await processImage(buffer, 'card');
        if (processed) {
          const key = `support-cards/${card.id}.png`;
          const publicUrl = await uploadToR2(processed, key);
          if (publicUrl) {
            updateStmt.run(publicUrl, card.id);
            console.log(`✅ ${card.name_en}: Updated`);
            successCount++;
          }
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n✨ Support cards: ${successCount}/${cards.length} updated`);
}

async function main() {
  console.log('🚀 Fetching missing images from reliable sources...\n');
  console.log('📝 Using GameWith database for accurate images\n');
  
  await processMissingCharacters();
  await processSupportCards();
  
  console.log('\n📊 Exporting updated data to JSON...');
  const { execSync } = await import('child_process');
  execSync('node scripts/export-to-json.js', { stdio: 'inherit' });
  
  console.log('\n✅ Complete! All missing images have been updated.');
  db.close();
}

main().catch(console.error);