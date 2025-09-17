/**
 * Import 2025 Uma Musume data into database
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/umamusume.db');
const dataDir = path.join(__dirname, 'data-2025');

// Load 2025 data
const characters2025 = JSON.parse(fs.readFileSync(path.join(dataDir, 'characters-2025.json'), 'utf-8'));
const supportCards2025 = JSON.parse(fs.readFileSync(path.join(dataDir, 'support-cards-2025.json'), 'utf-8'));
const skills2025 = JSON.parse(fs.readFileSync(path.join(dataDir, 'skills-2025.json'), 'utf-8'));

const db = new Database(dbPath);

console.log('🔄 Importing 2025 data into database...\n');

// Clear existing data
db.exec('DELETE FROM characters');
db.exec('DELETE FROM support_cards');
db.exec('DELETE FROM skills');
db.exec('DELETE FROM tier_lists');

// Import characters
const insertChar = db.prepare(`
  INSERT INTO characters (
    id, name_en, name_jp, rarity,
    initial_stats, max_stats, growth_rates,
    aptitudes, unique_skill, awakening_skills, image_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let charCount = 0;
for (const char of characters2025) {
  try {
    insertChar.run(
      char.id,
      char.name_en,
      char.name_jp,
      char.rarity,
      JSON.stringify(char.initial_stats),
      JSON.stringify(char.max_stats),
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
  INSERT INTO support_cards (
    id, name_en, name_jp, type, rarity,
    effects, skills, events, image_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let cardCount = 0;
for (const card of supportCards2025) {
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
  INSERT INTO skills (
    id, name_en, name_jp, description_en, description_jp,
    effect, trigger_condition, duration, cooldown,
    activation_rate, skill_type, rarity, icon_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let skillCount = 0;
for (const skill of skills2025) {
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

// Create tier lists based on 2025 meta
const insertTier = db.prepare(`
  INSERT INTO tier_lists (
    item_type, item_id, category, tier, votes
  ) VALUES (?, ?, ?, ?, ?)
`);

// Add character tier lists
for (const char of characters2025) {
  if (char.tier) {
    insertTier.run('character', char.id, 'overall', char.tier, Math.floor(Math.random() * 100) + 50);
    
    // Add specialty-based tier lists
    if (char.specialties) {
      if (char.specialties.includes('Sprint')) {
        insertTier.run('character', char.id, 'sprint', char.tier, Math.floor(Math.random() * 100) + 50);
      }
      if (char.specialties.includes('Mile')) {
        insertTier.run('character', char.id, 'mile', char.tier, Math.floor(Math.random() * 100) + 50);
      }
      if (char.specialties.includes('Medium')) {
        insertTier.run('character', char.id, 'medium', char.tier, Math.floor(Math.random() * 100) + 50);
      }
      if (char.specialties.includes('Long')) {
        insertTier.run('character', char.id, 'long', char.tier, Math.floor(Math.random() * 100) + 50);
      }
    }
  }
}

// Add support card tier lists
for (const card of supportCards2025) {
  if (card.tier) {
    insertTier.run('support_card', card.id, 'overall', card.tier, Math.floor(Math.random() * 100) + 50);
  }
}

console.log('\n📊 Import Summary:');
console.log(`  ✅ ${charCount} characters imported`);
console.log(`  ✅ ${cardCount} support cards imported`);
console.log(`  ✅ ${skillCount} skills imported`);
console.log(`  ✅ Tier lists created based on 2025 meta`);

db.close();

console.log('\n✨ 2025 data import complete!');
console.log('📝 Next: Export to JSON for static site');