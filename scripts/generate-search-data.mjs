import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDir = resolve(process.cwd());
const dataDir = resolve(rootDir, 'public', 'data');
const outputPath = resolve(rootDir, 'public', 'search-data.json');

async function loadJson(filename) {
  const filePath = resolve(dataDir, filename);
  const contents = await readFile(filePath, 'utf-8');
  return JSON.parse(contents);
}

async function buildSearchData() {
  const [characters, supportCards] = await Promise.all([
    loadJson('characters.json'),
    loadJson('support-cards.json')
  ]);

  const pages = [
    { name_en: 'Characters', type: 'page', url: '/characters/' },
    { name_en: 'Support Cards', type: 'page', url: '/cards/' },
    { name_en: 'Tier List', type: 'page', url: '/tier-list/' },
    { name_en: 'Tools', type: 'page', url: '/tools/' }
  ];

  const tools = [
    { name_en: 'Factor Calculator', type: 'tool', url: '/tools/factor-calculator/' },
    { name_en: 'Training Calculator', type: 'tool', url: '/tools/training-calculator/' },
    { name_en: 'Support Deck Builder', type: 'tool', url: '/tools/support-deck/' },
    { name_en: 'Training Goals', type: 'tool', url: '/tools/training-goals/' },
    { name_en: 'Skill Builder', type: 'tool', url: '/tools/skill-builder/' }
  ];

  const characterEntries = characters.map((c) => ({
    id: c.id,
    name_en: c.name_en,
    name_ja: c.name_jp,
    type: 'character',
    rarity: c.rarity
  }));

  const cardEntries = supportCards.map((c) => ({
    id: c.id,
    name_en: c.name_en,
    name_ja: c.name_jp,
    type: 'card',
    rarity: c.rarity,
    cardType: c.type
  }));

  const payload = {
    generatedAt: new Date().toISOString(),
    pages,
    tools,
    characters: characterEntries,
    cards: cardEntries
  };

  await writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(
    `[generate-search-data] Wrote ${characterEntries.length} characters and ${cardEntries.length} support cards to ${outputPath}`
  );
}

buildSearchData().catch((error) => {
  console.error('[generate-search-data] Failed to generate search data', error);
  process.exitCode = 1;
});
