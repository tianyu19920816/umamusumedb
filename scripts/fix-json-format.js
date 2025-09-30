const fs = require('fs');
const path = require('path');

// Read characters.json
const charactersPath = path.join(__dirname, '../public/data/characters.json');
const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));

console.log(`Processing ${characters.length} characters...`);

// Fix string objects to actual objects
const fixedCharacters = characters.map(char => {
  const fixed = { ...char };

  // Parse string JSON fields
  if (typeof char.initial_stats === 'string') {
    fixed.initial_stats = JSON.parse(char.initial_stats);
  }

  if (typeof char.max_stats === 'string') {
    fixed.max_stats = JSON.parse(char.max_stats);
  }

  if (typeof char.growth_rates === 'string') {
    const rates = JSON.parse(char.growth_rates);
    // Convert percentage strings to numbers
    fixed.growth_rates = Object.keys(rates).reduce((acc, key) => {
      const value = rates[key];
      acc[key] = typeof value === 'string' ? parseInt(value) : value;
      return acc;
    }, {});
  }

  if (typeof char.aptitudes === 'string') {
    fixed.aptitudes = JSON.parse(char.aptitudes);
  }

  if (typeof char.unique_skill === 'string') {
    fixed.unique_skill = JSON.parse(char.unique_skill);
  }

  if (typeof char.awakening_skills === 'string') {
    fixed.awakening_skills = JSON.parse(char.awakening_skills);
  }

  return fixed;
});

// Write fixed data
fs.writeFileSync(
  charactersPath,
  JSON.stringify(fixedCharacters, null, 2),
  'utf8'
);

console.log('✅ Characters JSON format fixed!');
console.log(`   - Converted string objects to actual objects`);
console.log(`   - Converted growth rate percentages to numbers`);
console.log(`   - Fixed ${fixedCharacters.length} character entries`);