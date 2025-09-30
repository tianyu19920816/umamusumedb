import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read skills.json
const skillsPath = path.join(__dirname, '../public/data/skills.json');
const skills = JSON.parse(fs.readFileSync(skillsPath, 'utf8'));

console.log(`Updating ${skills.length} skills...`);

// Update skill activation rates based on Wit system
// Based on GameWith data:
// - 300 Wit = ~70% activation
// - 400-500 Wit = ~80% activation
// - 600+ Wit = ~80-90% activation
// - 1200 Wit (max) = ~90% activation

const updatedSkills = skills.map(skill => {
  const updated = { ...skill };

  // Update activation_rate based on skill type and rarity
  if (skill.skill_type === 'unique' && skill.rarity === 'SS') {
    updated.activation_rate = '100%'; // Gold skills always activate
  } else if (skill.skill_type === 'unique' && skill.rarity === 'S') {
    updated.activation_rate = '100%'; // Character unique skills
  } else if (skill.skill_type === 'common' && skill.rarity === 'S') {
    updated.activation_rate = '85-90%'; // High tier common skills
  } else if (skill.skill_type === 'common' && skill.rarity === 'A') {
    updated.activation_rate = '75-85%'; // Mid tier common skills
  } else if (skill.skill_type === 'common' && skill.rarity === 'B') {
    updated.activation_rate = '70-80%'; // Lower tier common skills
  } else if (skill.skill_type === 'training') {
    updated.activation_rate = '100%'; // Training skills always work
  } else {
    updated.activation_rate = '70-80%'; // Default
  }

  // Add wit_dependency note
  updated.wit_dependency = skill.skill_type !== 'unique' && skill.skill_type !== 'training'
    ? 'Activation rate improves with Wit stat (300+ recommended)'
    : 'Not affected by Wit stat';

  // Update description to be more specific
  if (skill.effect.includes('m/s')) {
    // Convert m/s to more general speed terminology
    updated.effect = skill.effect.replace(/\+(\d+\.\d+) m\/s/, 'Speed +++');
  }

  return updated;
});

// Write updated data
fs.writeFileSync(
  skillsPath,
  JSON.stringify(updatedSkills, null, 2),
  'utf8'
);

console.log('✅ Skills data updated!');
console.log(`   - Updated activation rates based on skill type and rarity`);
console.log(`   - Added Wit dependency information`);
console.log(`   - Updated ${updatedSkills.length} skill entries`);