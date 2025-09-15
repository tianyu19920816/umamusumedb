import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/umamusume.db');
const db = new Database(dbPath);

console.log('🎴 Starting support card data collection...');

// Comprehensive support card data
const supportCardData = [
  // SSR Speed Cards
  { id: 'kitasan_black_ssr', name_en: 'Kitasan Black', name_jp: 'キタサンブラック', 
    type: 'speed', rarity: 'SSR',
    effects: { speed_bonus: 10, friendship_bonus: 35, training_bonus: 15, motivation_bonus: 5, skill_pt_bonus: 35 },
    skills: ['Arc Maestro', 'Speedster', 'Concentration', 'Quick Feet', 'Leading Edge'],
    events: ['Training Together', 'Race Strategy Discussion', 'Special Training']
  },
  { id: 'sakura_bakushin_o_ssr', name_en: '[Make up in summer!] Sakura Bakushin O', name_jp: '[夏はウマドル！]サクラバクシンオー',
    type: 'speed', rarity: 'SSR',
    effects: { speed_bonus: 12, power_bonus: 3, training_bonus: 10, skill_pt_bonus: 30, race_bonus: 5 },
    skills: ['Sprint Gear', 'Quick Start', 'Speed Burst', 'Acceleration', 'Sprint Turbo'],
    events: ['Beach Training', 'Summer Festival', 'Speed Challenge']
  },
  { id: 'twin_turbo_ssr', name_en: '[Turbo Engine Full Drive] Twin Turbo', name_jp: '[ターボエンジン全開！]ツインターボ',
    type: 'speed', rarity: 'SSR',
    effects: { speed_bonus: 15, training_bonus: 5, friendship_bonus: 30, hint_level_bonus: 2, skill_pt_bonus: 25 },
    skills: ['Escape Artist', 'Speedster', 'Leading Pride', 'Position Keep', 'Quick Escape'],
    events: ['Turbo Training', 'Engine Check', 'Full Speed Ahead']
  },
  
  // SSR Stamina Cards
  { id: 'super_creek_ssr', name_en: '[Unmatched Uncrowned] Super Creek', name_jp: '[一粒の安らぎ]スーパークリーク',
    type: 'stamina', rarity: 'SSR',
    effects: { stamina_bonus: 12, friendship_bonus: 32, motivation_bonus: 5, recovery_bonus: 10, skill_pt_bonus: 30 },
    skills: ['Circle Recovery', 'Pacer', 'Stamina Keep', 'Recovery', 'Long Runner'],
    events: ['Relaxation Time', 'Stamina Building', 'Mental Training']
  },
  { id: 'mejiro_mcqueen_ssr', name_en: '[The Embodiment of Elegance] Mejiro McQueen', name_jp: '[エレガンス・ライン]メジロマックイーン',
    type: 'stamina', rarity: 'SSR',
    effects: { stamina_bonus: 10, wisdom_bonus: 5, friendship_bonus: 35, skill_pt_bonus: 35, training_bonus: 10 },
    skills: ['Stamina Eater', 'Long Distance Master', 'Pride of Mejiro', 'Endurance', 'Nutrition Management'],
    events: ['Tea Time', 'Elegant Training', 'Family Pride']
  },
  
  // SSR Power Cards
  { id: 'yayoi_akikawa_ssr', name_en: '[Beyond the Azure Sky] Yayoi Akikawa', name_jp: '[パッションチャンピオーナ！]ヤエノムテキ',
    type: 'power', rarity: 'SSR',
    effects: { power_bonus: 15, guts_bonus: 3, training_bonus: 15, friendship_bonus: 25, skill_pt_bonus: 30 },
    skills: ['Power Charge', 'Muscle Training', 'Strong Impact', 'Power Break', 'Fighting Spirit'],
    events: ['Weight Training', 'Power Building', 'Strength Test']
  },
  { id: 'oguri_cap_ssr', name_en: '[Road of the Hungry Horse] Oguri Cap', name_jp: '[レッツ・アナボリック！]オグリキャップ',
    type: 'power', rarity: 'SSR',
    effects: { power_bonus: 12, stamina_bonus: 5, training_bonus: 10, race_bonus: 10, skill_pt_bonus: 35 },
    skills: ['Gray Monster', 'Power Break', 'Strong Heart', 'Late Charge', 'All-out'],
    events: ['Eating Contest', 'Power Training', 'Food Festival']
  },
  
  // SSR Guts Cards
  { id: 'gold_city_ssr', name_en: '[City of Gold] Gold City', name_jp: '[千紫万紅にまぎれぬ一凛]グラスワンダー',
    type: 'guts', rarity: 'SSR',
    effects: { guts_bonus: 12, power_bonus: 5, friendship_bonus: 30, skill_pt_bonus: 35, training_bonus: 10 },
    skills: ['Never Give Up', 'Determination', 'Fighting Spirit', 'Mental Strength', 'Guts Up'],
    events: ['Mental Training', 'Courage Building', 'Will Power Test']
  },
  
  // SSR Wisdom Cards
  { id: 'fine_motion_ssr', name_en: '[A Moment of Passion] Fine Motion', name_jp: '[感謝を指先まで込めて]ファインモーション',
    type: 'wisdom', rarity: 'SSR',
    effects: { wisdom_bonus: 12, speed_bonus: 3, skill_pt_bonus: 40, friendship_bonus: 25, hint_level_bonus: 3 },
    skills: ['Practice Partner', 'Wisdom Eye', 'Analysis', 'Strategy Planning', 'Race Reading'],
    events: ['Strategy Meeting', 'Data Analysis', 'Race Planning']
  },
  { id: 'mejiro_dober_ssr', name_en: '[Striving Stoically] Mejiro Dober', name_jp: '[徹底管理主義]メジロドーベル',
    type: 'wisdom', rarity: 'SSR',
    effects: { wisdom_bonus: 15, training_bonus: 10, skill_pt_bonus: 35, motivation_bonus: 5, friendship_bonus: 20 },
    skills: ['Perfect Planning', 'Strategic Mind', 'Calculation', 'Efficiency Expert', 'Data Driven'],
    events: ['Planning Session', 'Schedule Management', 'Optimization Training']
  },
  
  // SSR Friend Cards
  { id: 'mr_cb_ssr', name_en: '[Shared Happiness] Mr. C.B.', name_jp: '[共に歩む幸せ]ミスターシービー',
    type: 'friend', rarity: 'SSR',
    effects: { all_stats_bonus: 5, friendship_bonus: 40, motivation_bonus: 10, skill_pt_bonus: 30, training_bonus: 10 },
    skills: ['Friendship Power', 'Team Spirit', 'Mutual Support', 'Bonds of Trust', 'Together'],
    events: ['Team Building', 'Friendship Training', 'Bond Strengthening']
  },
  
  // SR Cards Examples
  { id: 'vodka_sr', name_en: 'Vodka', name_jp: 'ウオッカ', 
    type: 'power', rarity: 'SR',
    effects: { power_bonus: 8, stamina_bonus: 4, training_bonus: 5, skill_pt_bonus: 20 },
    skills: ['Power Charge', 'Strong Heart', 'Rivalry', 'Determination'],
    events: ['Rivalry Training', 'Competition']
  },
  { id: 'special_week_sr', name_en: '[Tracen Academy] Special Week', name_jp: '[トレセン学園]スペシャルウィーク',
    type: 'speed', rarity: 'SR',
    effects: { speed_bonus: 8, power_bonus: 3, friendship_bonus: 20, skill_pt_bonus: 25 },
    skills: ['Eating Machine', 'Sprint Turbo', 'Quick Recovery'],
    events: ['Lunch Time', 'Academy Life']
  },
  { id: 'gold_ship_sr', name_en: '[Unpredictable] Gold Ship', name_jp: '[波乱注意砲！]ゴールドシップ',
    type: 'stamina', rarity: 'SR',
    effects: { stamina_bonus: 9, guts_bonus: 3, training_bonus: 8, skill_pt_bonus: 20 },
    skills: ['Unpredictable', 'Stamina Keep', 'Wild Intuition'],
    events: ['Chaos Training', 'Random Event']
  },
  
  // R Cards Examples
  { id: 'haru_urara_r', name_en: 'Haru Urara', name_jp: 'ハルウララ',
    type: 'guts', rarity: 'R',
    effects: { guts_bonus: 6, stamina_bonus: 2, friendship_bonus: 15, skill_pt_bonus: 10 },
    skills: ['Never Give Up', 'Persistence'],
    events: ['Cheerful Training']
  },
  { id: 'nice_nature_r', name_en: 'Nice Nature', name_jp: 'ナイスネイチャ',
    type: 'wisdom', rarity: 'R',
    effects: { wisdom_bonus: 6, speed_bonus: 2, skill_pt_bonus: 15, training_bonus: 3 },
    skills: ['Bronze Collector', 'Steady Pace'],
    events: ['Third Place Training']
  },
  { id: 'king_halo_r', name_en: 'King Halo', name_jp: 'キングヘイロー',
    type: 'speed', rarity: 'R',
    effects: { speed_bonus: 5, power_bonus: 3, skill_pt_bonus: 10, friendship_bonus: 10 },
    skills: ['Short Temper', 'Speed Up'],
    events: ['Mood Training']
  }
];

// Insert support cards into database
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO support_cards 
  (id, name_en, name_jp, type, rarity, effects, skills, events, image_url) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((cards) => {
  for (const card of cards) {
    insertStmt.run(
      card.id,
      card.name_en,
      card.name_jp,
      card.type,
      card.rarity,
      JSON.stringify(card.effects),
      JSON.stringify(card.skills),
      JSON.stringify(card.events || []),
      `/images/support_cards/${card.id}.png`
    );
  }
});

try {
  insertMany(supportCardData);
  console.log(`✅ Inserted ${supportCardData.length} support cards into database`);
  
  // Verify insertion
  const count = db.prepare('SELECT COUNT(*) as count FROM support_cards').get();
  console.log(`📊 Total support cards in database: ${count.count}`);
  
  // Show breakdown by rarity
  const rarityBreakdown = db.prepare(`
    SELECT rarity, COUNT(*) as count 
    FROM support_cards 
    GROUP BY rarity 
    ORDER BY CASE rarity 
      WHEN 'SSR' THEN 1 
      WHEN 'SR' THEN 2 
      WHEN 'R' THEN 3 
    END
  `).all();
  
  console.log('\n📋 Support cards by rarity:');
  rarityBreakdown.forEach(r => {
    console.log(`  - ${r.rarity}: ${r.count} cards`);
  });
  
  // Show breakdown by type
  const typeBreakdown = db.prepare(`
    SELECT type, COUNT(*) as count 
    FROM support_cards 
    GROUP BY type 
    ORDER BY count DESC
  `).all();
  
  console.log('\n📋 Support cards by type:');
  typeBreakdown.forEach(t => {
    console.log(`  - ${t.type}: ${t.count} cards`);
  });
  
} catch (error) {
  console.error('❌ Error inserting support cards:', error);
} finally {
  db.close();
}

console.log('\n✨ Support card collection complete!');