import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// R2 URLs for support cards
const supportCardUrls = {
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
if (fs.existsSync(cardsPath)) {
  console.log('📝 Updating supportCards.json...');
  const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
  
  // Create mapping based on card names
  const cardMapping = {
    "[The Miracle Begins] Kitasan Black": "kitasan_black_ssr",
    "[Road of the Flowers] Sakura Bakushin O": "sakura_bakushin_o_ssr",
    "[Turbo Engine Full Drive] Twin Turbo": "twin_turbo_ssr",
    "[Creek of the Super] Super Creek": "super_creek_ssr",
    "[Elegance Line] Mejiro McQueen": "mejiro_mcqueen_ssr",
    "[Super Special Dreamers!] Special Week": "yayoi_akikawa_ssr",
    "[Pale Blue Dress] Oguri Cap": "oguri_cap_ssr",
    "[City of Gold] Gold City": "gold_city_ssr",
    "[First in Flight] Fine Motion": "fine_motion_ssr",
    "[Determined Sprinter] Mejiro Dober": "mejiro_dober_ssr",
    "[Mr. CB] Mr. CB": "mr_cb_ssr",
    "[Pushing Forward] Vodka": "vodka_sr",
    "[Welcome to Tracen Academy!] Hachimi Souji": "special_week_sr",
    "[Make up Vampire!] Gold Ship": "gold_ship_sr",
    "[Unyielding Spirit] Haru Urara": "haru_urara_r",
    "[Effort is my Forte] Nice Nature": "nice_nature_r",
    "[Royalty Etiquette] King Halo": "king_halo_r"
  };
  
  cards.forEach(card => {
    const cardKey = cardMapping[card.name_en];
    if (cardKey && supportCardUrls[cardKey]) {
      card.image_url = supportCardUrls[cardKey];
      console.log(`✅ Updated ${card.name_en}: ${card.image_url}`);
    }
  });
  
  fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2));
  console.log('✅ Support cards updated!\n');
} else {
  console.log('❌ supportCards.json not found');
}

console.log('🎉 Support cards updated with R2 URLs!');
console.log('📦 Next step: Run npm run build to rebuild the site');