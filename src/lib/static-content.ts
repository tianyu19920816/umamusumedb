// Import JSON data directly for static builds
import charactersData from '../../public/data/characters.json';
import supportCardsData from '../../public/data/support-cards.json';
import tierListsData from '../../public/data/tierLists.json';
import skillsData from '../../public/data/skills.json';

// Process character data
export const characters = charactersData.map((char: any) => ({
  ...char,
  initial_stats: typeof char.initial_stats === 'string' ? JSON.parse(char.initial_stats) : char.initial_stats,
  max_stats: typeof char.max_stats === 'string' ? JSON.parse(char.max_stats) : char.max_stats,
  growth_rates: typeof char.growth_rates === 'string' ? JSON.parse(char.growth_rates) : char.growth_rates,
  aptitudes: typeof char.aptitudes === 'string' ? JSON.parse(char.aptitudes) : char.aptitudes,
  unique_skill: typeof char.unique_skill === 'string' && char.unique_skill !== 'null' ? JSON.parse(char.unique_skill) : char.unique_skill,
  awakening_skills: typeof char.awakening_skills === 'string' ? JSON.parse(char.awakening_skills) : char.awakening_skills,
  // Keep attributes for backward compatibility
  attributes: typeof char.initial_stats === 'string' ? JSON.parse(char.initial_stats) : char.initial_stats,
  skills: typeof char.awakening_skills === 'string' ? JSON.parse(char.awakening_skills) : char.awakening_skills
}));

// Process support card data
export const supportCards = supportCardsData.map((card: any) => ({
  ...card,
  effects: typeof card.effects === 'string' ? JSON.parse(card.effects) : card.effects,
  skills: typeof card.skills === 'string' ? JSON.parse(card.skills) : card.skills,
  events: typeof card.events === 'string' ? JSON.parse(card.events) : card.events
}));

// Export tier lists
export const tierLists = tierListsData;

// Export skills
export const skills = skillsData;

// Helper functions
export function getCharacterById(id: string) {
  return characters.find((char: any) => char.id === id) || null;
}

export function getSupportCardById(id: string) {
  return supportCards.find((card: any) => card.id === id) || null;
}

export function getTierListByCategory(category: string) {
  return tierLists.filter((item: any) => item.category === category);
}

export function getSkillById(id: string) {
  return skills.find((skill: any) => skill.id === id) || null;
}