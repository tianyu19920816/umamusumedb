import Database from 'better-sqlite3';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/umamusume.db');
const db = new Database(dbPath);

console.log('🐎 Starting character data collection...');

// Complete character data with all known characters
const characterData = [
  // 3-star characters
  { id: 'special_week', name_en: 'Special Week', name_jp: 'スペシャルウィーク', rarity: 3, 
    attributes: { speed: 100, stamina: 90, power: 85, guts: 95, wisdom: 80 },
    skills: ['Eating Machine', 'Victory Equation', 'Sprint Turbo', 'Front Runner'],
    growth_rates: { speed: 10, stamina: 0, power: 10, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'G', sprint: 'F', mile: 'A', medium: 'A', long: 'B', escape: 'C', lead: 'A', between: 'B', chase: 'C' }
  },
  { id: 'silence_suzuka', name_en: 'Silence Suzuka', name_jp: 'サイレンススズカ', rarity: 3,
    attributes: { speed: 115, stamina: 85, power: 75, guts: 70, wisdom: 85 },
    skills: ['Escape Artist', 'Concentration', 'Leading Pride', 'Speedster'],
    growth_rates: { speed: 20, stamina: 0, power: 0, guts: 0, wisdom: 10 },
    aptitudes: { turf: 'A', dirt: 'E', sprint: 'E', mile: 'A', medium: 'A', long: 'B', escape: 'A', lead: 'C', between: 'E', chase: 'D' }
  },
  { id: 'tokai_teio', name_en: 'Tokai Teio', name_jp: 'トウカイテイオー', rarity: 3,
    attributes: { speed: 95, stamina: 95, power: 90, guts: 85, wisdom: 85 },
    skills: ['Miracle Run', 'Victory Aura', 'Emperor Step', 'Never Give Up'],
    growth_rates: { speed: 10, stamina: 10, power: 0, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'C', sprint: 'E', mile: 'C', medium: 'A', long: 'A', escape: 'C', lead: 'A', between: 'B', chase: 'C' }
  },
  { id: 'mejiro_mcqueen', name_en: 'Mejiro McQueen', name_jp: 'メジロマックイーン', rarity: 3,
    attributes: { speed: 85, stamina: 110, power: 95, guts: 80, wisdom: 80 },
    skills: ['Long Distance Runner', 'Pride of Mejiro', 'Stamina Eater', 'Endurance'],
    growth_rates: { speed: 0, stamina: 20, power: 10, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'E', sprint: 'G', mile: 'E', medium: 'A', long: 'A', escape: 'E', lead: 'E', between: 'A', chase: 'A' }
  },
  { id: 'gold_ship', name_en: 'Gold Ship', name_jp: 'ゴールドシップ', rarity: 3,
    attributes: { speed: 90, stamina: 100, power: 100, guts: 75, wisdom: 85 },
    skills: ['Unpredictable', 'Golden Spirit', 'Wild Intuition', 'Stamina Keep'],
    growth_rates: { speed: 0, stamina: 10, power: 10, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'C', sprint: 'F', mile: 'C', medium: 'A', long: 'A', escape: 'F', lead: 'E', between: 'C', chase: 'A' }
  },
  { id: 'vodka', name_en: 'Vodka', name_jp: 'ウオッカ', rarity: 3,
    attributes: { speed: 95, stamina: 85, power: 100, guts: 90, wisdom: 80 },
    skills: ['Fierce Rivalry', 'Power Charge', 'Strong Heart', 'Determination'],
    growth_rates: { speed: 10, stamina: 0, power: 10, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'C', sprint: 'E', mile: 'A', medium: 'A', long: 'B', escape: 'E', lead: 'E', between: 'A', chase: 'B' }
  },
  { id: 'daiwa_scarlet', name_en: 'Daiwa Scarlet', name_jp: 'ダイワスカーレット', rarity: 3,
    attributes: { speed: 100, stamina: 85, power: 95, guts: 85, wisdom: 85 },
    skills: ['Scarlet Acceleration', 'Front Runner', 'Speed Star', 'Concentration'],
    growth_rates: { speed: 10, stamina: 0, power: 10, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'D', sprint: 'E', mile: 'A', medium: 'A', long: 'B', escape: 'B', lead: 'A', between: 'B', chase: 'E' }
  },
  { id: 'grass_wonder', name_en: 'Grass Wonder', name_jp: 'グラスワンダー', rarity: 3,
    attributes: { speed: 90, stamina: 95, power: 90, guts: 85, wisdom: 90 },
    skills: ['Wonder Charge', 'Recovery', 'All-rounder', 'Focus'],
    growth_rates: { speed: 0, stamina: 10, power: 10, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'F', sprint: 'G', mile: 'B', medium: 'A', long: 'A', escape: 'G', lead: 'F', between: 'A', chase: 'A' }
  },
  { id: 'el_condor_pasa', name_en: 'El Condor Pasa', name_jp: 'エルコンドルパサー', rarity: 3,
    attributes: { speed: 95, stamina: 85, power: 95, guts: 85, wisdom: 85 },
    skills: ['Condor Flight', 'Speed Machine', 'Dirt Master', 'Acceleration'],
    growth_rates: { speed: 10, stamina: 0, power: 10, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'B', dirt: 'A', sprint: 'F', mile: 'A', medium: 'A', long: 'C', escape: 'C', lead: 'A', between: 'C', chase: 'E' }
  },
  { id: 'oguri_cap', name_en: 'Oguri Cap', name_jp: 'オグリキャップ', rarity: 3,
    attributes: { speed: 90, stamina: 90, power: 100, guts: 95, wisdom: 75 },
    skills: ['Gray Monster', 'Late Charge', 'Power Break', 'Fighting Spirit'],
    growth_rates: { speed: 0, stamina: 0, power: 20, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'A', sprint: 'E', mile: 'A', medium: 'A', long: 'B', escape: 'F', lead: 'E', between: 'B', chase: 'A' }
  },
  { id: 'symboli_rudolf', name_en: 'Symboli Rudolf', name_jp: 'シンボリルドルフ', rarity: 3,
    attributes: { speed: 90, stamina: 100, power: 90, guts: 85, wisdom: 85 },
    skills: ['Emperor Authority', 'Stamina Master', 'Leading Edge', 'Precision'],
    growth_rates: { speed: 0, stamina: 15, power: 5, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'F', sprint: 'F', mile: 'C', medium: 'A', long: 'A', escape: 'C', lead: 'A', between: 'B', chase: 'C' }
  },
  { id: 'maruzensky', name_en: 'Maruzensky', name_jp: 'マルゼンスキー', rarity: 3,
    attributes: { speed: 110, stamina: 75, power: 85, guts: 80, wisdom: 80 },
    skills: ['Super Car', 'Speed Limit Break', 'Quick Start', 'Speedster'],
    growth_rates: { speed: 20, stamina: 0, power: 0, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'B', sprint: 'E', mile: 'A', medium: 'A', long: 'E', escape: 'A', lead: 'C', between: 'E', chase: 'G' }
  },
  { id: 'fuji_kiseki', name_en: 'Fuji Kiseki', name_jp: 'フジキセキ', rarity: 3,
    attributes: { speed: 105, stamina: 75, power: 90, guts: 85, wisdom: 80 },
    skills: ['Miracle Sprint', 'Speed Burst', 'Quick Feet', 'Concentration'],
    growth_rates: { speed: 15, stamina: 0, power: 5, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'F', sprint: 'B', mile: 'A', medium: 'B', long: 'G', escape: 'E', lead: 'A', between: 'C', chase: 'E' }
  },
  
  // 2-star characters
  { id: 'sakura_bakushin_o', name_en: 'Sakura Bakushin O', name_jp: 'サクラバクシンオー', rarity: 2,
    attributes: { speed: 110, stamina: 65, power: 80, guts: 75, wisdom: 75 },
    skills: ['Bakushin Sprint', 'Sprint Specialist', 'Quick Dash', 'Acceleration'],
    growth_rates: { speed: 20, stamina: 0, power: 0, guts: 0, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'E', sprint: 'A', mile: 'C', medium: 'F', long: 'G', escape: 'C', lead: 'A', between: 'E', chase: 'G' }
  },
  { id: 'haru_urara', name_en: 'Haru Urara', name_jp: 'ハルウララ', rarity: 1,
    attributes: { speed: 75, stamina: 75, power: 75, guts: 90, wisdom: 75 },
    skills: ['Never Give Up', 'Persistence', 'Crowd Favorite', 'Fighting Spirit'],
    growth_rates: { speed: 0, stamina: 0, power: 0, guts: 15, wisdom: 5 },
    aptitudes: { turf: 'G', dirt: 'A', sprint: 'A', mile: 'B', medium: 'G', long: 'G', escape: 'D', lead: 'C', between: 'A', chase: 'C' }
  },
  { id: 'nice_nature', name_en: 'Nice Nature', name_jp: 'ナイスネイチャ', rarity: 2,
    attributes: { speed: 80, stamina: 90, power: 80, guts: 85, wisdom: 85 },
    skills: ['Bronze Collector', 'Third Place Expert', 'Steady Pace', 'Endurance'],
    growth_rates: { speed: 0, stamina: 10, power: 0, guts: 10, wisdom: 0 },
    aptitudes: { turf: 'A', dirt: 'E', sprint: 'G', mile: 'E', medium: 'A', long: 'A', escape: 'G', lead: 'E', between: 'A', chase: 'A' }
  },
  { id: 'king_halo', name_en: 'King Halo', name_jp: 'キングヘイロー', rarity: 2,
    attributes: { speed: 90, stamina: 80, power: 85, guts: 80, wisdom: 80 },
    skills: ['Short Temper', 'Speed Up', 'Focus', 'Quick Recovery'],
    growth_rates: { speed: 10, stamina: 0, power: 5, guts: 0, wisdom: 5 },
    aptitudes: { turf: 'A', dirt: 'C', sprint: 'C', mile: 'A', medium: 'A', long: 'C', escape: 'E', lead: 'C', between: 'A', chase: 'B' }
  }
];

// Insert characters into database
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO characters 
  (id, name_en, name_jp, rarity, attributes, skills, growth_rates, aptitudes, image_url) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((characters) => {
  for (const char of characters) {
    insertStmt.run(
      char.id,
      char.name_en,
      char.name_jp,
      char.rarity,
      JSON.stringify(char.attributes),
      JSON.stringify(char.skills),
      JSON.stringify(char.growth_rates || {}),
      JSON.stringify(char.aptitudes || {}),
      `/images/characters/${char.id}.png`
    );
  }
});

try {
  insertMany(characterData);
  console.log(`✅ Inserted ${characterData.length} characters into database`);
  
  // Verify insertion
  const count = db.prepare('SELECT COUNT(*) as count FROM characters').get();
  console.log(`📊 Total characters in database: ${count.count}`);
  
  // Show sample
  const sample = db.prepare('SELECT name_en, rarity FROM characters ORDER BY rarity DESC, name_en LIMIT 5').all();
  console.log('\n📋 Sample characters:');
  sample.forEach(char => {
    console.log(`  - ${char.name_en} (${char.rarity}★)`);
  });
  
} catch (error) {
  console.error('❌ Error inserting characters:', error);
} finally {
  db.close();
}

console.log('\n✨ Character collection complete!');