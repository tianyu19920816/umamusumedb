import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection helper
export function getDatabase() {
  const dbPath = path.join(__dirname, '../../data/umamusume.db');
  return new Database(dbPath, { readonly: true });
}

// Character queries
export function getAllCharacters() {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      SELECT id, name_en, name_jp, rarity, attributes, skills, growth_rates, aptitudes, image_url
      FROM characters
      ORDER BY rarity DESC, name_en ASC
    `);
    const results = stmt.all();
    return results.map(char => ({
      ...char,
      attributes: JSON.parse(char.attributes || '{}'),
      skills: JSON.parse(char.skills || '[]'),
      growth_rates: JSON.parse(char.growth_rates || '{}'),
      aptitudes: JSON.parse(char.aptitudes || '{}')
    }));
  } finally {
    db.close();
  }
}

export function getCharacterById(id: string) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      SELECT * FROM characters WHERE id = ?
    `);
    const result = stmt.get(id);
    if (!result) return null;
    
    return {
      ...result,
      attributes: JSON.parse(result.attributes || '{}'),
      skills: JSON.parse(result.skills || '[]'),
      growth_rates: JSON.parse(result.growth_rates || '{}'),
      aptitudes: JSON.parse(result.aptitudes || '{}')
    };
  } finally {
    db.close();
  }
}

// Support card queries
export function getAllSupportCards() {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      SELECT id, name_en, name_jp, type, rarity, effects, skills, events, image_url
      FROM support_cards
      ORDER BY 
        CASE rarity 
          WHEN 'SSR' THEN 1 
          WHEN 'SR' THEN 2 
          WHEN 'R' THEN 3 
        END, name_en ASC
    `);
    const results = stmt.all();
    return results.map(card => ({
      ...card,
      effects: JSON.parse(card.effects || '{}'),
      skills: JSON.parse(card.skills || '[]'),
      events: JSON.parse(card.events || '[]')
    }));
  } finally {
    db.close();
  }
}

export function getSupportCardById(id: string) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      SELECT * FROM support_cards WHERE id = ?
    `);
    const result = stmt.get(id);
    if (!result) return null;
    
    return {
      ...result,
      effects: JSON.parse(result.effects || '{}'),
      skills: JSON.parse(result.skills || '[]'),
      events: JSON.parse(result.events || '[]')
    };
  } finally {
    db.close();
  }
}

// Skill queries
export function getAllSkills() {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      SELECT * FROM skills
      ORDER BY name_en ASC
    `);
    return stmt.all();
  } finally {
    db.close();
  }
}

export function getSkillById(id: string) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      SELECT * FROM skills WHERE id = ?
    `);
    return stmt.get(id);
  } finally {
    db.close();
  }
}

// Tier list queries
export function getTierListByCategory(category: string) {
  const db = getDatabase();
  try {
    const stmt = db.prepare(`
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
      WHERE t.category = ?
      ORDER BY 
        CASE t.tier 
          WHEN 'SS' THEN 1 
          WHEN 'S' THEN 2 
          WHEN 'A' THEN 3 
          WHEN 'B' THEN 4 
          WHEN 'C' THEN 5 
        END, t.votes DESC
    `);
    return stmt.all(category);
  } finally {
    db.close();
  }
}