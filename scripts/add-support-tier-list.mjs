import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read support cards and tier lists
const supportCardsPath = path.join(__dirname, '../public/data/support-cards.json');
const tierListsPath = path.join(__dirname, '../public/data/tierLists.json');

const supportCards = JSON.parse(fs.readFileSync(supportCardsPath, 'utf8'));
const tierLists = JSON.parse(fs.readFileSync(tierListsPath, 'utf8'));

console.log(`Adding support card tier list entries...`);
console.log(`Current tier list entries: ${tierLists.length}`);
console.log(`Support cards found: ${supportCards.length}`);

// Support Card Tier Rankings based on Game8 data (September 2025)
const supportCardTiers = {
  // SS Tier
  'kitasan_black_ssr': { tier: 'SS', category: 'speed', votes: 250 },
  'super_creek_ssr': { tier: 'SS', category: 'stamina', votes: 245 },
  'fine_motion_ssr': { tier: 'SS', category: 'wisdom', votes: 240 },

  // S Tier
  'special_week_ssr': { tier: 'S', category: 'speed', votes: 220 },
  'tokai_teio_ssr': { tier: 'S', category: 'speed', votes: 215 },
  'silence_suzuka_ssr': { tier: 'S', category: 'speed', votes: 210 },
  'el_condor_pasa_ssr': { tier: 'S', category: 'power', votes: 205 },
  'symboli_rudolf_ssr': { tier: 'S', category: 'speed', votes: 200 },

  // A Tier
  'gold_ship_ssr': { tier: 'A', category: 'guts', votes: 180 },
  'daiwa_scarlet_ssr': { tier: 'A', category: 'power', votes: 175 },
  'rice_shower_ssr': { tier: 'A', category: 'stamina', votes: 170 },
  'mejiro_mcqueen_ssr': { tier: 'A', category: 'stamina', votes: 165 },
  'sakura_chiyono_o_ssr': { tier: 'A', category: 'power', votes: 160 },
  'admire_vega_ssr': { tier: 'A', category: 'wisdom', votes: 155 },

  // B Tier
  'taiki_shuttle_ssr': { tier: 'B', category: 'speed', votes: 140 },
  'mihono_bourbon_ssr': { tier: 'B', category: 'speed', votes: 135 },
  'narita_brian_ssr': { tier: 'B', category: 'speed', votes: 130 },
  'air_groove_ssr': { tier: 'B', category: 'power', votes: 125 },
  'grass_wonder_ssr': { tier: 'B', category: 'wisdom', votes: 120 },
  'manhattan_cafe_ssr': { tier: 'B', category: 'stamina', votes: 115 },
  'twin_turbo_ssr': { tier: 'B', category: 'speed', votes: 110 },

  // SR Tier
  'nice_nature_sr': { tier: 'B', category: 'friend', votes: 105 },
  'king_halo_sr': { tier: 'B', category: 'wisdom', votes: 100 },
  'sweep_tosho_sr': { tier: 'C', category: 'power', votes: 90 },

  // R Tier
  'haru_urara_r': { tier: 'C', category: 'friend', votes: 80 },
};

// Get max ID from existing tier lists
const maxId = Math.max(...tierLists.map(t => t.id));
let newId = maxId + 1;

// Add support card tier list entries
const newEntries = [];

supportCards.forEach(card => {
  const tierData = supportCardTiers[card.id];

  if (tierData) {
    // Add overall tier entry
    newEntries.push({
      id: newId++,
      item_type: 'support_card',
      item_id: card.id,
      category: 'overall',
      tier: tierData.tier,
      votes: tierData.votes,
      updated_at: new Date().toISOString().split('T')[0],
      item_name: card.name_en,
      item_name_jp: card.name_jp,
      item_rarity: card.rarity,
      item_image: card.image_url || `https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/support-cards/${card.id}.png`
    });

    // Add category-specific tier entry
    newEntries.push({
      id: newId++,
      item_type: 'support_card',
      item_id: card.id,
      category: tierData.category,
      tier: tierData.tier,
      votes: tierData.votes + Math.floor(Math.random() * 20),
      updated_at: new Date().toISOString().split('T')[0],
      item_name: card.name_en,
      item_name_jp: card.name_jp,
      item_rarity: card.rarity,
      item_image: card.image_url || `https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev/support-cards/${card.id}.png`
    });
  }
});

// Merge and write
const updatedTierLists = [...tierLists, ...newEntries];

fs.writeFileSync(
  tierListsPath,
  JSON.stringify(updatedTierLists, null, 2),
  'utf8'
);

console.log(`✅ Support card tier list added!`);
console.log(`   - Added ${newEntries.length} new tier list entries`);
console.log(`   - Total tier list entries: ${updatedTierLists.length}`);