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
  const [characters, supportCards, skills] = await Promise.all([
    loadJson('characters.json'),
    loadJson('supportCards.json'),
    loadJson('skills.json')
  ]);

  const pages = [
    { name_en: 'Characters', name_ja: 'キャラクター', type: 'page', url: '/characters/' },
    { name_en: 'Support Cards', name_ja: 'サポートカード', type: 'page', url: '/cards/' },
    { name_en: 'Skills', name_ja: 'スキル', type: 'page', url: '/skills/' },
    { name_en: 'Tier List', name_ja: 'ティアリスト', type: 'page', url: '/tier-list/' },
    { name_en: 'Tools', name_ja: 'ツール', type: 'page', url: '/tools/' },
    { name_en: 'Guides', name_ja: 'ガイド', type: 'page', url: '/guides/' }
  ];

  const tools = [
    { name_en: 'Factor Calculator', name_ja: '因子計算', type: 'tool', url: '/tools/factor-calculator/' },
    { name_en: 'Training Calculator', name_ja: '育成計算', type: 'tool', url: '/tools/training-calculator/' },
    { name_en: 'Support Deck Builder', name_ja: 'デッキビルダー', type: 'tool', url: '/tools/support-deck/' },
    { name_en: 'Training Goals', name_ja: '目標管理', type: 'tool', url: '/tools/training-goals/' },
    { name_en: 'Skill Builder', name_ja: 'スキルビルダー', type: 'tool', url: '/tools/skill-builder/' }
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

  const skillEntries = skills.map((s) => ({
    id: s.id,
    name_en: s.name_en,
    name_ja: s.name_jp,
    type: 'skill',
    rarity: s.rarity,
    skillType: s.skill_type
  }));

  const payload = {
    generatedAt: new Date().toISOString(),
    pages,
    tools,
    characters: characterEntries,
    cards: cardEntries,
    skills: skillEntries
  };

  await writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(
    `[generate-search-data] Wrote ${characterEntries.length} characters, ${cardEntries.length} support cards, and ${skillEntries.length} skills to ${outputPath}`
  );
}

buildSearchData().catch((error) => {
  console.error('[generate-search-data] Failed to generate search data', error);
  process.exitCode = 1;
});
