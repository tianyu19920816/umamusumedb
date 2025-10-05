import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // Open database
  const db = new Database(path.join(__dirname, '../umamusume.db'), { readonly: true });

  // Get all characters
  const characters = db.prepare(`
    SELECT id, name_en, name_ja, rarity
    FROM characters
    ORDER BY name_en
  `).all();

  // Get all support cards
  const supportCards = db.prepare(`
    SELECT id, name_en, name_ja, rarity, type
    FROM support_cards
    ORDER BY name_en
  `).all();

  db.close();

  // Build search index
  const searchData = {
    pages: [
      { name_en: "Characters", type: "page", url: "/characters/" },
      { name_en: "Support Cards", type: "page", url: "/cards/" },
      { name_en: "Tier List", type: "page", url: "/tier-list/" },
      { name_en: "Tools", type: "page", url: "/tools/" }
    ],
    tools: [
      { name_en: "Factor Calculator", type: "tool", url: "/tools/factor-calculator/" },
      { name_en: "Training Calculator", type: "tool", url: "/tools/training-calculator/" },
      { name_en: "Support Deck Builder", type: "tool", url: "/tools/support-deck/" },
      { name_en: "Training Goals", type: "tool", url: "/tools/training-goals/" },
      { name_en: "Skill Builder", type: "tool", url: "/tools/skill-builder/" }
    ],
    characters: characters.map(c => ({
      id: c.id,
      name_en: c.name_en,
      name_ja: c.name_ja,
      type: 'character',
      rarity: c.rarity
    })),
    cards: supportCards.map(c => ({
      id: c.id,
      name_en: c.name_en,
      name_ja: c.name_ja,
      type: 'card',
      rarity: c.rarity,
      cardType: c.type
    }))
  };

  // Write to public directory
  const outputPath = path.join(__dirname, '../public/search-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(searchData, null, 2));

  console.log(`✅ Generated search data with ${characters.length} characters and ${supportCards.length} cards`);
  console.log(`📝 Written to: ${outputPath}`);
} catch (error) {
  console.error('❌ Error generating search data:', error);
  process.exit(1);
}
