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

// Character image URLs from public wikis (these are promotional/wiki images)
const CHARACTER_IMAGE_URLS = {
  'special_week_2025': 'https://static.wikia.nocookie.net/umamusume/images/4/43/Special_Week_icon.png',
  'silence_suzuka_2025': 'https://static.wikia.nocookie.net/umamusume/images/2/21/Silence_Suzuka_icon.png',
  'tokai_teio_2025': 'https://static.wikia.nocookie.net/umamusume/images/5/5e/Tokai_Teio_icon.png',
  'gold_ship_2025': 'https://static.wikia.nocookie.net/umamusume/images/8/89/Gold_Ship_icon.png',
  'mejiro_mcqueen_2025': 'https://static.wikia.nocookie.net/umamusume/images/6/6e/Mejiro_McQueen_icon.png',
  'vodka_2025': 'https://static.wikia.nocookie.net/umamusume/images/d/dc/Vodka_icon.png',
  'daiwa_scarlet_2025': 'https://static.wikia.nocookie.net/umamusume/images/a/ad/Daiwa_Scarlet_icon.png',
  'grass_wonder_2025': 'https://static.wikia.nocookie.net/umamusume/images/8/82/Grass_Wonder_icon.png',
  'el_condor_pasa_2025': 'https://static.wikia.nocookie.net/umamusume/images/e/e2/El_Condor_Pasa_icon.png',
  'symboli_rudolf_2025': 'https://static.wikia.nocookie.net/umamusume/images/3/3e/Symboli_Rudolf_icon.png',
  'rice_shower_2025': 'https://static.wikia.nocookie.net/umamusume/images/c/c0/Rice_Shower_icon.png',
  'manhattan_cafe_2025': 'https://static.wikia.nocookie.net/umamusume/images/4/49/Manhattan_Cafe_icon.png',
  'mihono_bourbon_2025': 'https://static.wikia.nocookie.net/umamusume/images/8/87/Mihono_Bourbon_icon.png',
  'biwa_hayahide_2025': 'https://static.wikia.nocookie.net/umamusume/images/5/55/Biwa_Hayahide_icon.png',
  'narita_brian_2025': 'https://static.wikia.nocookie.net/umamusume/images/8/8c/Narita_Brian_icon.png',
  'taiki_shuttle_2025': 'https://static.wikia.nocookie.net/umamusume/images/3/3f/Taiki_Shuttle_icon.png',
  'oguri_cap_original': 'https://static.wikia.nocookie.net/umamusume/images/9/9e/Oguri_Cap_icon.png',
  'tamamo_cross_2025': 'https://static.wikia.nocookie.net/umamusume/images/0/00/Tamamo_Cross_icon.png',
  'winning_ticket_2025': 'https://static.wikia.nocookie.net/umamusume/images/f/f8/Winning_Ticket_icon.png',
  'nice_nature_2025': 'https://static.wikia.nocookie.net/umamusume/images/8/87/Nice_Nature_icon.png',
  'twin_turbo_2025': 'https://static.wikia.nocookie.net/umamusume/images/6/69/Twin_Turbo_icon.png',
  'king_halo_2025': 'https://static.wikia.nocookie.net/umamusume/images/2/2e/King_Halo_icon.png',
  'air_groove_2025': 'https://static.wikia.nocookie.net/umamusume/images/8/80/Air_Groove_icon.png',
  'mayano_topgun_2025': 'https://static.wikia.nocookie.net/umamusume/images/3/36/Mayano_Top_Gun_icon.png',
  'kitasan_black_2025': 'https://static.wikia.nocookie.net/umamusume/images/6/61/Kitasan_Black_icon.png',
  'satono_diamond_2025': 'https://static.wikia.nocookie.net/umamusume/images/a/a2/Satono_Diamond_icon.png',
  'zenno_rob_roy_2025': 'https://static.wikia.nocookie.net/umamusume/images/7/7f/Zenno_Rob_Roy_icon.png',
  'ikuno_dictus_2025': 'https://static.wikia.nocookie.net/umamusume/images/e/ed/Ikuno_Dictus_icon.png',
  'mejiro_dober_2025': 'https://static.wikia.nocookie.net/umamusume/images/5/52/Mejiro_Dober_icon.png',
  'agnes_digital_2025': 'https://static.wikia.nocookie.net/umamusume/images/c/ca/Agnes_Digital_icon.png',
  'haru_urara_2025': 'https://static.wikia.nocookie.net/umamusume/images/b/b1/Haru_Urara_icon.png',
  'sakura_bakushin_o': 'https://static.wikia.nocookie.net/umamusume/images/c/cf/Sakura_Bakushin_O_icon.png',
  'curren_chan_2025': 'https://static.wikia.nocookie.net/umamusume/images/b/b2/Curren_Chan_icon.png',
  'eishin_flash_2025': 'https://static.wikia.nocookie.net/umamusume/images/a/ac/Eishin_Flash_icon.png',
  'smart_falcon_2025': 'https://static.wikia.nocookie.net/umamusume/images/d/db/Smart_Falcon_icon.png',
  'sweep_tosho_2025': 'https://static.wikia.nocookie.net/umamusume/images/0/01/Sweep_Tosho_icon.png',
  'admire_vega_2025': 'https://static.wikia.nocookie.net/umamusume/images/d/d4/Admire_Vega_icon.png',
  'inari_one_2025': 'https://static.wikia.nocookie.net/umamusume/images/6/65/Inari_One_icon.png',
  'kawakami_princess_2025': 'https://static.wikia.nocookie.net/umamusume/images/7/79/Kawakami_Princess_icon.png',
  'gold_city_2025': 'https://static.wikia.nocookie.net/umamusume/images/a/a5/Gold_City_icon.png',
  'matikane_fukukitaru_2025': 'https://static.wikia.nocookie.net/umamusume/images/2/27/Matikane_Fukukitaru_icon.png',
  'mr_cb_2025': 'https://static.wikia.nocookie.net/umamusume/images/1/17/Mr._C.B._icon.png',
  'yaeno_muteki_2025': 'https://static.wikia.nocookie.net/umamusume/images/f/f4/Yaeno_Muteki_icon.png',
  'nakayama_festa_2025': 'https://static.wikia.nocookie.net/umamusume/images/7/76/Nakayama_Festa_icon.png',
  'seeking_the_pearl_2025': 'https://static.wikia.nocookie.net/umamusume/images/b/bd/Seeking_the_Pearl_icon.png',
  'hishi_akebono_2025': 'https://static.wikia.nocookie.net/umamusume/images/f/fc/Hishi_Akebono_icon.png',
  'yukino_bijin_2025': 'https://static.wikia.nocookie.net/umamusume/images/d/d2/Yukino_Bijin_icon.png'
};

// Alternative image source (GameWith)
const GAMEWITH_URLS = {
  'special_week_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_3.png',
  'silence_suzuka_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_1.png',
  'tokai_teio_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_2.png',
  'gold_ship_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_7.png',
  'mejiro_mcqueen_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_5.png',
  'vodka_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_11.png',
  'daiwa_scarlet_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_10.png',
  'grass_wonder_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_8.png',
  'el_condor_pasa_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_9.png',
  'symboli_rudolf_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_4.png',
  'rice_shower_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_29.png',
  'manhattan_cafe_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_39.png',
  'mihono_bourbon_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_25.png',
  'biwa_hayahide_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_24.png',
  'narita_brian_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_17.png',
  'taiki_shuttle_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_19.png',
  'oguri_cap_original': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_6.png',
  'tamamo_cross_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_34.png',
  'winning_ticket_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_30.png',
  'nice_nature_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_35.png',
  'twin_turbo_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_44.png',
  'king_halo_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_14.png',
  'air_groove_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_26.png',
  'mayano_topgun_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_27.png',
  'kitasan_black_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_54.png',
  'satono_diamond_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_56.png',
  'zenno_rob_roy_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_58.png',
  'ikuno_dictus_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_52.png',
  'mejiro_dober_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_41.png',
  'agnes_digital_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_32.png',
  'haru_urara_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_13.png',
  'sakura_bakushin_o': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_16.png',
  'curren_chan_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_48.png',
  'eishin_flash_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_42.png',
  'smart_falcon_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_47.png',
  'sweep_tosho_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_51.png',
  'admire_vega_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_53.png',
  'inari_one_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_46.png',
  'kawakami_princess_2025': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/i_49.png'
};

// Support card images from GameWith
const SUPPORT_CARD_URLS = {
  'kitasan_black_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10082.png',
  'sakura_chiyono_o_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10061.png',
  'daiwa_scarlet_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10117.png',
  'symboli_rudolf_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10074.png',
  'tokai_teio_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10092.png',
  'mejiro_mcqueen_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10051.png',
  'rice_shower_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10098.png',
  'gold_ship_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10073.png',
  'silence_suzuka_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10050.png',
  'special_week_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10049.png',
  'taiki_shuttle_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10087.png',
  'narita_brian_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10085.png',
  'mihono_bourbon_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10088.png',
  'air_groove_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10089.png',
  'grass_wonder_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10076.png',
  'el_condor_pasa_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10075.png',
  'manhattan_cafe_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10099.png',
  'twin_turbo_ssr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_10103.png',
  'nice_nature_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_20094.png',
  'king_halo_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_20082.png',
  'sweep_tosho_sr': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_20107.png',
  'haru_urara_r': 'https://img.gamewith.jp/article_tools/uma-musume/gacha/support_thumb_30081.png'
};

async function downloadImage(url, id) {
  try {
    console.log(`📥 Downloading ${id} from ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const buffer = await response.buffer();
    
    // Process image with sharp (resize if needed)
    const processed = await sharp(buffer)
      .resize(400, 600, { fit: 'cover', position: 'top' })
      .png()
      .toBuffer();
    
    return processed;
  } catch (error) {
    console.log(`❌ Failed to download ${id}: ${error.message}`);
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

async function processCharacters() {
  console.log('🎮 Processing Uma Musume character images...\n');
  
  const characters = db.prepare('SELECT id, name_en FROM characters').all();
  const updateStmt = db.prepare('UPDATE characters SET image_url = ? WHERE id = ?');
  
  let successCount = 0;
  for (const character of characters) {
    let buffer = null;
    
    // Try GameWith first
    if (GAMEWITH_URLS[character.id]) {
      buffer = await downloadImage(GAMEWITH_URLS[character.id], character.id);
    }
    
    // Fallback to wiki images
    if (!buffer && CHARACTER_IMAGE_URLS[character.id]) {
      buffer = await downloadImage(CHARACTER_IMAGE_URLS[character.id], character.id);
    }
    
    if (buffer) {
      const key = `characters/${character.id}.png`;
      const publicUrl = await uploadToR2(buffer, key);
      
      if (publicUrl) {
        updateStmt.run(publicUrl, character.id);
        console.log(`✅ ${character.name_en}: Uploaded`);
        successCount++;
      }
    } else {
      console.log(`⚠️ ${character.name_en}: No image found, keeping placeholder`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✨ Characters: ${successCount}/${characters.length} updated with real images`);
}

async function processSupportCards() {
  console.log('\n🎴 Processing support card images...\n');
  
  const cards = db.prepare('SELECT id, name_en FROM support_cards').all();
  const updateStmt = db.prepare('UPDATE support_cards SET image_url = ? WHERE id = ?');
  
  let successCount = 0;
  for (const card of cards) {
    if (SUPPORT_CARD_URLS[card.id]) {
      const buffer = await downloadImage(SUPPORT_CARD_URLS[card.id], card.id);
      
      if (buffer) {
        // Process for support cards (smaller size)
        const processed = await sharp(buffer)
          .resize(300, 400, { fit: 'cover' })
          .png()
          .toBuffer();
        
        const key = `support-cards/${card.id}.png`;
        const publicUrl = await uploadToR2(processed, key);
        
        if (publicUrl) {
          updateStmt.run(publicUrl, card.id);
          console.log(`✅ ${card.name_en}: Uploaded`);
          successCount++;
        }
      }
    } else {
      console.log(`⚠️ ${card.name_en}: No image found, keeping placeholder`);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✨ Support cards: ${successCount}/${cards.length} updated with real images`);
}

async function main() {
  console.log('🚀 Starting real image collection and upload...\n');
  console.log('📝 Note: Using publicly available promotional images from GameWith and wikis\n');
  
  await processCharacters();
  await processSupportCards();
  
  console.log('\n📊 Exporting updated data to JSON...');
  const { execSync } = await import('child_process');
  execSync('node scripts/export-to-json.js', { stdio: 'inherit' });
  
  console.log('\n✅ Complete! Database updated with real images where available.');
  db.close();
}

main().catch(console.error);