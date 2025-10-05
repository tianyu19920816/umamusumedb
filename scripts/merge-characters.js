import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read existing characters
const existingCharacters = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/data/characters.json'), 'utf-8')
);

// Read new characters
const newCharacters = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../new_characters_data.json'), 'utf-8')
);

// Get existing IDs
const existingIds = new Set(existingCharacters.map(c => c.id));

// Filter out duplicates and add new characters
const uniqueNewCharacters = newCharacters.filter(c => !existingIds.has(c.id));

console.log(`现有角色数量: ${existingCharacters.length}`);
console.log(`新收集角色数量: ${newCharacters.length}`);
console.log(`去重后新增角色: ${uniqueNewCharacters.length}`);

// Merge
const mergedCharacters = [...existingCharacters, ...uniqueNewCharacters];

// Sort by ID
mergedCharacters.sort((a, b) => a.id.localeCompare(b.id));

// Write back
fs.writeFileSync(
  path.join(__dirname, '../public/data/characters.json'),
  JSON.stringify(mergedCharacters, null, 2),
  'utf-8'
);

console.log(`\n✅ 合并完成！总角色数: ${mergedCharacters.length}`);
console.log(`\n新增角色列表:`);
uniqueNewCharacters.forEach((c, i) => {
  console.log(`${i + 1}. ${c.name_en} (${c.name_jp})`);
});
