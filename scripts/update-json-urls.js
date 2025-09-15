import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the R2 URLs mapping
const urlMappingPath = path.join(__dirname, 'r2-urls.json');
if (!fs.existsSync(urlMappingPath)) {
  console.error('❌ r2-urls.json not found. Please run upload-to-r2.js first.');
  process.exit(1);
}

const urlMapping = JSON.parse(fs.readFileSync(urlMappingPath, 'utf-8'));

// Update characters.json
const charactersPath = path.join(__dirname, '..', 'public', 'data', 'characters.json');
if (fs.existsSync(charactersPath)) {
  console.log('📝 Updating characters.json...');
  const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
  
  characters.forEach(character => {
    const characterKey = character.name_en.toLowerCase().replace(/\s+/g, '_');
    if (urlMapping.characters[characterKey]) {
      character.image_url = urlMapping.characters[characterKey];
      console.log(`✅ Updated ${character.name_en}: ${character.image_url}`);
    }
  });
  
  fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));
  console.log('✅ Characters updated!\n');
}

// Update support-cards.json
const cardsPath = path.join(__dirname, '..', 'public', 'data', 'support-cards.json');
if (fs.existsSync(cardsPath)) {
  console.log('📝 Updating support-cards.json...');
  const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
  
  cards.forEach(card => {
    // Generate the card key based on the card name and rarity
    const cardName = card.name_en.toLowerCase()
      .replace(/[\[\]]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    
    // Try different key patterns
    const possibleKeys = [
      `${cardName}_${card.rarity.toLowerCase()}`,
      cardName.split('_')[0] + '_' + card.rarity.toLowerCase(),
      // For specific known mappings
      card.name_en.includes('Kitasan Black') ? 'kitasan_black_ssr' :
      card.name_en.includes('Sakura Bakushin') && card.rarity === 'SSR' ? 'sakura_bakushin_o_ssr' :
      card.name_en.includes('Twin Turbo') ? 'twin_turbo_ssr' :
      card.name_en.includes('Super Creek') ? 'super_creek_ssr' :
      card.name_en.includes('Mejiro McQueen') && card.rarity === 'SSR' ? 'mejiro_mcqueen_ssr' :
      card.name_en.includes('Yayoi Akikawa') ? 'yayoi_akikawa_ssr' :
      card.name_en.includes('Oguri Cap') && card.rarity === 'SSR' ? 'oguri_cap_ssr' :
      card.name_en.includes('Gold City') ? 'gold_city_ssr' :
      card.name_en.includes('Fine Motion') ? 'fine_motion_ssr' :
      card.name_en.includes('Mejiro Dober') ? 'mejiro_dober_ssr' :
      card.name_en.includes('Mr. CB') ? 'mr_cb_ssr' :
      card.name_en.includes('Vodka') && card.rarity === 'SR' ? 'vodka_sr' :
      card.name_en.includes('Special Week') && card.rarity === 'SR' ? 'special_week_sr' :
      card.name_en.includes('Gold Ship') && card.rarity === 'SR' ? 'gold_ship_sr' :
      card.name_en.includes('Haru Urara') && card.rarity === 'R' ? 'haru_urara_r' :
      card.name_en.includes('Nice Nature') && card.rarity === 'R' ? 'nice_nature_r' :
      card.name_en.includes('King Halo') && card.rarity === 'R' ? 'king_halo_r' :
      null
    ];
    
    for (const key of possibleKeys) {
      if (key && urlMapping.supportCards[key]) {
        card.image_url = urlMapping.supportCards[key];
        console.log(`✅ Updated ${card.name_en}: ${card.image_url}`);
        break;
      }
    }
  });
  
  fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2));
  console.log('✅ Support cards updated!\n');
}

console.log('🎉 All JSON files updated with R2 URLs!');
console.log('📦 Next step: Run npm run build to rebuild the site');