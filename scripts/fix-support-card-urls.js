import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping of support card IDs to R2 URLs
const r2Urls = {
  "kitasan_black_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/kitasan_black_ssr.png",
  "sakura_bakushin_o_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/sakura_bakushin_o_ssr.png",
  "twin_turbo_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/twin_turbo_ssr.png",
  "super_creek_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/super_creek_ssr.png",
  "mejiro_mcqueen_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/mejiro_mcqueen_ssr.png",
  "yayoi_akikawa_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/yayoi_akikawa_ssr.png",
  "oguri_cap_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/oguri_cap_ssr.png",
  "gold_city_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/gold_city_ssr.png",
  "fine_motion_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/fine_motion_ssr.png",
  "mejiro_dober_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/mejiro_dober_ssr.png",
  "mr_cb_ssr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/mr_cb_ssr.png",
  "vodka_sr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/vodka_sr.png",
  "special_week_sr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/special_week_sr.png",
  "gold_ship_sr": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/gold_ship_sr.png",
  "haru_urara_r": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/haru_urara_r.png",
  "nice_nature_r": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/nice_nature_r.png",
  "king_halo_r": "https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/images/support-cards/king_halo_r.png"
};

// Update supportCards.json
const cardsPath = path.join(__dirname, '..', 'public', 'data', 'supportCards.json');
console.log('📝 Updating supportCards.json with R2 URLs...');

const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));

cards.forEach((card, index) => {
  // Get the card ID from the existing data
  const cardId = card.id;
  
  // Update with R2 URL if available
  if (r2Urls[cardId]) {
    const oldUrl = card.image_url;
    card.image_url = r2Urls[cardId];
    console.log(`✅ Updated ${card.name_en}: ${cardId}`);
    console.log(`   Old: ${oldUrl}`);
    console.log(`   New: ${card.image_url}`);
  } else {
    console.log(`❌ No R2 URL for: ${card.name_en} (${cardId})`);
  }
});

fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2));
console.log('\n✅ All support cards updated with R2 URLs!');
console.log('📦 Next step: Run npm run build to rebuild the site');