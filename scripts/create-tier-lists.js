import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/umamusume.db');
const db = new Database(dbPath);

console.log('📊 Creating tier list data...');

// Tier list data based on community consensus
const tierListData = [
  // Overall Character Tier List
  { item_type: 'character', item_id: 'silence_suzuka', category: 'overall', tier: 'SS', votes: 250 },
  { item_type: 'character', item_id: 'gold_ship', category: 'overall', tier: 'SS', votes: 240 },
  { item_type: 'character', item_id: 'symboli_rudolf', category: 'overall', tier: 'S', votes: 220 },
  { item_type: 'character', item_id: 'tokai_teio', category: 'overall', tier: 'S', votes: 210 },
  { item_type: 'character', item_id: 'special_week', category: 'overall', tier: 'S', votes: 200 },
  { item_type: 'character', item_id: 'mejiro_mcqueen', category: 'overall', tier: 'S', votes: 195 },
  { item_type: 'character', item_id: 'daiwa_scarlet', category: 'overall', tier: 'S', votes: 190 },
  { item_type: 'character', item_id: 'vodka', category: 'overall', tier: 'S', votes: 185 },
  { item_type: 'character', item_id: 'oguri_cap', category: 'overall', tier: 'A', votes: 170 },
  { item_type: 'character', item_id: 'el_condor_pasa', category: 'overall', tier: 'A', votes: 165 },
  { item_type: 'character', item_id: 'grass_wonder', category: 'overall', tier: 'A', votes: 160 },
  { item_type: 'character', item_id: 'maruzensky', category: 'overall', tier: 'A', votes: 155 },
  { item_type: 'character', item_id: 'fuji_kiseki', category: 'overall', tier: 'B', votes: 140 },
  { item_type: 'character', item_id: 'sakura_bakushin_o', category: 'overall', tier: 'B', votes: 130 },
  { item_type: 'character', item_id: 'nice_nature', category: 'overall', tier: 'B', votes: 120 },
  { item_type: 'character', item_id: 'king_halo', category: 'overall', tier: 'C', votes: 100 },
  { item_type: 'character', item_id: 'haru_urara', category: 'overall', tier: 'C', votes: 90 },

  // Speed Character Tier List
  { item_type: 'character', item_id: 'silence_suzuka', category: 'speed', tier: 'SS', votes: 300 },
  { item_type: 'character', item_id: 'maruzensky', category: 'speed', tier: 'SS', votes: 280 },
  { item_type: 'character', item_id: 'sakura_bakushin_o', category: 'speed', tier: 'S', votes: 250 },
  { item_type: 'character', item_id: 'fuji_kiseki', category: 'speed', tier: 'S', votes: 230 },
  { item_type: 'character', item_id: 'daiwa_scarlet', category: 'speed', tier: 'S', votes: 220 },
  { item_type: 'character', item_id: 'special_week', category: 'speed', tier: 'A', votes: 180 },

  // Stamina Character Tier List
  { item_type: 'character', item_id: 'mejiro_mcqueen', category: 'stamina', tier: 'SS', votes: 290 },
  { item_type: 'character', item_id: 'symboli_rudolf', category: 'stamina', tier: 'SS', votes: 270 },
  { item_type: 'character', item_id: 'gold_ship', category: 'stamina', tier: 'S', votes: 250 },
  { item_type: 'character', item_id: 'grass_wonder', category: 'stamina', tier: 'S', votes: 230 },
  { item_type: 'character', item_id: 'tokai_teio', category: 'stamina', tier: 'S', votes: 220 },

  // Power Character Tier List
  { item_type: 'character', item_id: 'oguri_cap', category: 'power', tier: 'SS', votes: 280 },
  { item_type: 'character', item_id: 'gold_ship', category: 'power', tier: 'SS', votes: 270 },
  { item_type: 'character', item_id: 'vodka', category: 'power', tier: 'S', votes: 250 },
  { item_type: 'character', item_id: 'el_condor_pasa', category: 'power', tier: 'S', votes: 230 },

  // Support Card Overall Tier List
  { item_type: 'support_card', item_id: 'kitasan_black_ssr', category: 'overall', tier: 'SS', votes: 350 },
  { item_type: 'support_card', item_id: 'fine_motion_ssr', category: 'overall', tier: 'SS', votes: 320 },
  { item_type: 'support_card', item_id: 'super_creek_ssr', category: 'overall', tier: 'SS', votes: 310 },
  { item_type: 'support_card', item_id: 'mejiro_dober_ssr', category: 'overall', tier: 'S', votes: 280 },
  { item_type: 'support_card', item_id: 'sakura_bakushin_o_ssr', category: 'overall', tier: 'S', votes: 270 },
  { item_type: 'support_card', item_id: 'twin_turbo_ssr', category: 'overall', tier: 'S', votes: 260 },
  { item_type: 'support_card', item_id: 'mejiro_mcqueen_ssr', category: 'overall', tier: 'S', votes: 250 },
  { item_type: 'support_card', item_id: 'yayoi_akikawa_ssr', category: 'overall', tier: 'A', votes: 220 },
  { item_type: 'support_card', item_id: 'oguri_cap_ssr', category: 'overall', tier: 'A', votes: 210 },
  { item_type: 'support_card', item_id: 'gold_city_ssr', category: 'overall', tier: 'A', votes: 200 },
  { item_type: 'support_card', item_id: 'mr_cb_ssr', category: 'overall', tier: 'A', votes: 190 },
  { item_type: 'support_card', item_id: 'vodka_sr', category: 'overall', tier: 'B', votes: 150 },
  { item_type: 'support_card', item_id: 'special_week_sr', category: 'overall', tier: 'B', votes: 140 },
  { item_type: 'support_card', item_id: 'gold_ship_sr', category: 'overall', tier: 'B', votes: 130 },
  { item_type: 'support_card', item_id: 'haru_urara_r', category: 'overall', tier: 'C', votes: 80 },
  { item_type: 'support_card', item_id: 'nice_nature_r', category: 'overall', tier: 'C', votes: 70 },
  { item_type: 'support_card', item_id: 'king_halo_r', category: 'overall', tier: 'C', votes: 60 },

  // Speed Support Card Tier List
  { item_type: 'support_card', item_id: 'kitasan_black_ssr', category: 'speed', tier: 'SS', votes: 400 },
  { item_type: 'support_card', item_id: 'sakura_bakushin_o_ssr', category: 'speed', tier: 'SS', votes: 380 },
  { item_type: 'support_card', item_id: 'twin_turbo_ssr', category: 'speed', tier: 'S', votes: 340 },
  { item_type: 'support_card', item_id: 'special_week_sr', category: 'speed', tier: 'B', votes: 200 },
  { item_type: 'support_card', item_id: 'king_halo_r', category: 'speed', tier: 'C', votes: 100 },

  // Stamina Support Card Tier List
  { item_type: 'support_card', item_id: 'super_creek_ssr', category: 'stamina', tier: 'SS', votes: 390 },
  { item_type: 'support_card', item_id: 'mejiro_mcqueen_ssr', category: 'stamina', tier: 'SS', votes: 370 },
  { item_type: 'support_card', item_id: 'gold_ship_sr', category: 'stamina', tier: 'B', votes: 180 },

  // Power Support Card Tier List
  { item_type: 'support_card', item_id: 'yayoi_akikawa_ssr', category: 'power', tier: 'SS', votes: 360 },
  { item_type: 'support_card', item_id: 'oguri_cap_ssr', category: 'power', tier: 'S', votes: 320 },
  { item_type: 'support_card', item_id: 'vodka_sr', category: 'power', tier: 'B', votes: 190 },

  // Wisdom Support Card Tier List
  { item_type: 'support_card', item_id: 'fine_motion_ssr', category: 'wisdom', tier: 'SS', votes: 380 },
  { item_type: 'support_card', item_id: 'mejiro_dober_ssr', category: 'wisdom', tier: 'SS', votes: 360 },
  { item_type: 'support_card', item_id: 'nice_nature_r', category: 'wisdom', tier: 'C', votes: 90 },

  // Friend Support Card Tier List
  { item_type: 'support_card', item_id: 'mr_cb_ssr', category: 'friend', tier: 'SS', votes: 350 },

  // Guts Support Card Tier List
  { item_type: 'support_card', item_id: 'gold_city_ssr', category: 'guts', tier: 'S', votes: 300 },
  { item_type: 'support_card', item_id: 'haru_urara_r', category: 'guts', tier: 'C', votes: 80 }
];

// Insert tier list data
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO tier_lists 
  (item_type, item_id, category, tier, votes) 
  VALUES (?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((items) => {
  for (const item of items) {
    insertStmt.run(
      item.item_type,
      item.item_id,
      item.category,
      item.tier,
      item.votes
    );
  }
});

try {
  insertMany(tierListData);
  console.log(`✅ Inserted ${tierListData.length} tier list entries`);
  
  // Verify insertion
  const count = db.prepare('SELECT COUNT(*) as count FROM tier_lists').get();
  console.log(`📊 Total tier list entries: ${count.count}`);
  
  // Show breakdown by category
  const categoryBreakdown = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM tier_lists 
    GROUP BY category 
    ORDER BY count DESC
  `).all();
  
  console.log('\n📋 Tier list entries by category:');
  categoryBreakdown.forEach(c => {
    console.log(`  - ${c.category}: ${c.count} entries`);
  });
  
  // Show top rated items
  const topRated = db.prepare(`
    SELECT t.*, 
           CASE 
             WHEN t.item_type = 'character' THEN c.name_en
             WHEN t.item_type = 'support_card' THEN s.name_en
           END as item_name
    FROM tier_lists t
    LEFT JOIN characters c ON t.item_type = 'character' AND t.item_id = c.id
    LEFT JOIN support_cards s ON t.item_type = 'support_card' AND t.item_id = s.id
    WHERE t.category = 'overall'
    ORDER BY t.votes DESC
    LIMIT 5
  `).all();
  
  console.log('\n🏆 Top rated items (overall):');
  topRated.forEach(item => {
    console.log(`  - ${item.item_name} (${item.tier}): ${item.votes} votes`);
  });
  
} catch (error) {
  console.error('❌ Error creating tier lists:', error);
} finally {
  db.close();
}

console.log('\n✨ Tier list creation complete!');