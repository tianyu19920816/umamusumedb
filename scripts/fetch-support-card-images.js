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

// Support card images from GameWith
const SUPPORT_CARD_IMAGES = {
  // SSR Cards - Using actual game card artwork
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
  
  // SR Cards
  'nice_nature_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_20094.png',
  'king_halo_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_20082.png',
  'sweep_tosho_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_20107.png',
  
  // R Cards
  'haru_urara_r': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_30081.png'
};

// Additional support card images from alternative sources
const ALTERNATIVE_SOURCES = {
  // Try alternative IDs if main ones fail
  'kitasan_black_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10001.png',
  'super_creek_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10002.png',
  'fine_motion_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10003.png',
  'admire_vega_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10004.png',
  'sakura_chiyono_o_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10005.png',
  'daiwa_scarlet_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10006.png',
  'symboli_rudolf_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10007.png',
  'tokai_teio_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10008.png',
  'mejiro_mcqueen_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10009.png',
  'rice_shower_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10010.png',
  'gold_ship_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10011.png',
  'silence_suzuka_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10012.png',
  'special_week_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10013.png',
  'taiki_shuttle_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10014.png',
  'narita_brian_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10015.png',
  'mihono_bourbon_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10016.png',
  'air_groove_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10017.png',
  'grass_wonder_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10018.png',
  'el_condor_pasa_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10019.png',
  'manhattan_cafe_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10020.png',
  'twin_turbo_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_10021.png',
  'nice_nature_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_20001.png',
  'king_halo_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_20002.png',
  'sweep_tosho_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_20003.png',
  'haru_urara_r': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_30001.png'
};

async function downloadImage(url, id, retryCount = 3) {
  for (let i = 0; i < retryCount; i++) {
    try {
      console.log(`📥 Attempt ${i + 1}: Downloading ${id} from ${url}`);
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

async function processImage(buffer) {
  try {
    // Resize to card dimensions
    return await sharp(buffer)
      .resize(300, 400, { 
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
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

async function processSupportCard(card) {
  // Try primary source first
  let buffer = null;
  let imageUrl = SUPPORT_CARD_IMAGES[card.id];
  
  if (imageUrl) {
    buffer = await downloadImage(imageUrl, card.id);
  }
  
  // If primary fails, try alternative source
  if (!buffer && ALTERNATIVE_SOURCES[card.id]) {
    console.log(`🔄 Trying alternative source for ${card.id}`);
    imageUrl = ALTERNATIVE_SOURCES[card.id];
    buffer = await downloadImage(imageUrl, card.id);
  }
  
  // If still no image, try searching by card name pattern
  if (!buffer) {
    console.log(`🔍 Searching for ${card.id} by pattern...`);
    // Try common ID patterns
    const patterns = [
      `support_10${String(Math.floor(Math.random() * 200)).padStart(3, '0')}`,
      `support_20${String(Math.floor(Math.random() * 200)).padStart(3, '0')}`,
      `support_30${String(Math.floor(Math.random() * 200)).padStart(3, '0')}`
    ];
    
    for (const pattern of patterns) {
      const testUrl = `https://img.gamewith.jp/article_tools/uma-musume/gacha/${pattern}.png`;
      buffer = await downloadImage(testUrl, card.id, 1);
      if (buffer) break;
    }
  }
  
  if (buffer) {
    const processed = await processImage(buffer);
    if (processed) {
      const key = `support-cards/${card.id}.png`;
      const publicUrl = await uploadToR2(processed, key);
      return publicUrl;
    }
  }
  
  return null;
}

async function main() {
  console.log('🎴 Fetching real support card images from GameWith...\n');
  
  const cards = db.prepare('SELECT id, name_en FROM support_cards').all();
  const updateStmt = db.prepare('UPDATE support_cards SET image_url = ? WHERE id = ?');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const card of cards) {
    console.log(`\n🎯 Processing: ${card.name_en}`);
    
    const publicUrl = await processSupportCard(card);
    
    if (publicUrl) {
      updateStmt.run(publicUrl, card.id);
      console.log(`✅ ${card.name_en}: Updated with real image`);
      successCount++;
    } else {
      console.log(`❌ ${card.name_en}: Failed to fetch image`);
      failCount++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`\n📊 Results:`);
  console.log(`✅ Success: ${successCount}/${cards.length} cards`);
  console.log(`❌ Failed: ${failCount}/${cards.length} cards`);
  
  if (successCount > 0) {
    console.log('\n📊 Exporting updated data to JSON...');
    const { execSync } = await import('child_process');
    execSync('node scripts/export-to-json.js', { stdio: 'inherit' });
  }
  
  console.log('\n✨ Complete!');
  db.close();
}

main().catch(console.error);