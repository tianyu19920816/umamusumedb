import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/umamusume.db');
const db = new Database(dbPath);

console.log('📦 Exporting database to JSON...');

try {
  // Export all data
  const data = {
    characters: db.prepare('SELECT * FROM characters').all(),
    supportCards: db.prepare('SELECT * FROM support_cards').all(),
    skills: db.prepare('SELECT * FROM skills').all(),
    tierLists: db.prepare(`
      SELECT t.*, 
             CASE 
               WHEN t.item_type = 'character' THEN c.name_en
               WHEN t.item_type = 'support_card' THEN s.name_en
             END as item_name,
             CASE 
               WHEN t.item_type = 'character' THEN c.name_jp
               WHEN t.item_type = 'support_card' THEN s.name_jp
             END as item_name_jp,
             CASE 
               WHEN t.item_type = 'character' THEN c.rarity
               WHEN t.item_type = 'support_card' THEN s.rarity
             END as item_rarity,
             CASE 
               WHEN t.item_type = 'character' THEN c.image_url
               WHEN t.item_type = 'support_card' THEN s.image_url
             END as item_image
      FROM tier_lists t
      LEFT JOIN characters c ON t.item_type = 'character' AND t.item_id = c.id
      LEFT JOIN support_cards s ON t.item_type = 'support_card' AND t.item_id = s.id
    `).all()
  };

  // Create public data directory
  const dataDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write full database
  fs.writeFileSync(
    path.join(dataDir, 'database.json'),
    JSON.stringify(data, null, 2)
  );

  // Write individual files for better performance
  Object.entries(data).forEach(([key, value]) => {
    fs.writeFileSync(
      path.join(dataDir, `${key}.json`),
      JSON.stringify(value, null, 2)
    );
  });

  console.log('✅ Exported data to public/data/');
  console.log(`  - Characters: ${data.characters.length}`);
  console.log(`  - Support Cards: ${data.supportCards.length}`);
  console.log(`  - Skills: ${data.skills.length}`);
  console.log(`  - Tier Lists: ${data.tierLists.length}`);
  
} catch (error) {
  console.error('❌ Error exporting data:', error);
} finally {
  db.close();
}

console.log('\n✨ Export complete!');