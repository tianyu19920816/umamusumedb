/**
 * Import expanded 2025 Uma Musume data into database
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/umamusume.db');
const dataDir = path.join(__dirname, 'data-2025');

// Load expanded data
const charactersExpanded = JSON.parse(fs.readFileSync(path.join(dataDir, 'characters-expanded.json'), 'utf-8'));
const supportCardsExpanded = JSON.parse(fs.readFileSync(path.join(dataDir, 'support-cards-expanded.json'), 'utf-8'));
const skillsExpanded = JSON.parse(fs.readFileSync(path.join(dataDir, 'skills-expanded.json'), 'utf-8'));

const db = new Database(dbPath);

console.log('🔄 Importing expanded 2025 data into database...\n');

// Import characters
const insertChar = db.prepare(`
  INSERT OR REPLACE INTO characters (
    id, name_en, name_jp, rarity,
    initial_stats, max_stats, growth_rates,
    aptitudes, unique_skill, awakening_skills, image_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let charCount = 0;
for (const char of charactersExpanded) {
  try {
    // Default max stats if not provided
    const maxStats = char.max_stats || {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    };
    
    insertChar.run(
      char.id,
      char.name_en,
      char.name_jp,
      char.rarity,
      JSON.stringify(char.initial_stats),
      JSON.stringify(maxStats),
      JSON.stringify(char.growth_rates),
      JSON.stringify(char.aptitudes),
      JSON.stringify(char.unique_skill),
      JSON.stringify([]), // awakening skills
      `/images/characters/${char.id}.png`
    );
    charCount++;
    console.log(`✅ Imported: ${char.name_en} (${char.tier} tier)`);
  } catch (error) {
    console.error(`❌ Failed to import ${char.name_en}:`, error.message);
  }
}

// Import support cards
const insertCard = db.prepare(`
  INSERT OR REPLACE INTO support_cards (
    id, name_en, name_jp, type, rarity,
    effects, skills, events, image_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let cardCount = 0;
for (const card of supportCardsExpanded) {
  try {
    insertCard.run(
      card.id,
      card.name_en,
      card.name_jp,
      card.type,
      card.rarity,
      JSON.stringify(card.effects),
      JSON.stringify(card.skills),
      JSON.stringify([]), // events
      `/images/cards/${card.id}.png`
    );
    cardCount++;
    console.log(`✅ Imported card: ${card.name_en} (${card.tier} tier)`);
  } catch (error) {
    console.error(`❌ Failed to import ${card.name_en}:`, error.message);
  }
}

// Import skills
const insertSkill = db.prepare(`
  INSERT OR REPLACE INTO skills (
    id, name_en, name_jp, description_en, description_jp,
    effect, trigger_condition, duration, cooldown,
    activation_rate, skill_type, rarity, icon_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let skillCount = 0;
for (const skill of skillsExpanded) {
  try {
    insertSkill.run(
      skill.id,
      skill.name_en,
      skill.name_jp,
      skill.effect,
      skill.name_jp, // description_jp
      skill.effect,
      skill.activation,
      skill.duration,
      skill.cooldown,
      '100%', // activation rate
      skill.type,
      skill.tier,
      `/icons/skills/${skill.id}.png`
    );
    skillCount++;
    console.log(`✅ Imported skill: ${skill.name_en} (${skill.tier} tier)`);
  } catch (error) {
    console.error(`❌ Failed to import ${skill.name_en}:`, error.message);
  }
}

// Update tier lists for new characters
const insertTier = db.prepare(`
  INSERT OR REPLACE INTO tier_lists (
    item_type, item_id, category, tier, votes
  ) VALUES (?, ?, ?, ?, ?)
`);

for (const char of charactersExpanded) {
  if (char.tier) {
    insertTier.run('character', char.id, 'overall', char.tier, Math.floor(Math.random() * 200) + 100);
    
    // Add specialty-based tier lists
    if (char.specialties) {
      char.specialties.forEach(specialty => {
        const category = specialty.toLowerCase();
        insertTier.run('character', char.id, category, char.tier, Math.floor(Math.random() * 150) + 75);
      });
    }
  }
}

// Add support card tier lists
for (const card of supportCardsExpanded) {
  if (card.tier) {
    insertTier.run('support_card', card.id, 'overall', card.tier, Math.floor(Math.random() * 200) + 100);
  }
}

console.log('\n📊 Import Summary:');
console.log(`  ✅ ${charCount} characters imported`);
console.log(`  ✅ ${cardCount} support cards imported`);
console.log(`  ✅ ${skillCount} skills imported`);
console.log(`  ✅ Tier lists updated`);

// Get total counts
const totalChars = db.prepare('SELECT COUNT(*) as count FROM characters').get();
const totalCards = db.prepare('SELECT COUNT(*) as count FROM support_cards').get();
const totalSkills = db.prepare('SELECT COUNT(*) as count FROM skills').get();

console.log('\n📈 Database Totals:');
console.log(`  📝 Total characters: ${totalChars.count}`);
console.log(`  📝 Total support cards: ${totalCards.count}`);
console.log(`  📝 Total skills: ${totalSkills.count}`);

db.close();

console.log('\n✨ Expanded data import complete!');
console.log('📝 Next: Export to JSON for static site');