// Import JSON data directly for static builds
import charactersData from '../../public/data/characters.json';
import supportCardsData from '../../public/data/supportCards.json';
import tierListsData from '../../public/data/tierLists.json';
import skillsData from '../../public/data/skills.json';

// Process character data
export const characters = charactersData.map((char: any) => ({
  ...char,
  attributes: typeof char.attributes === 'string' ? JSON.parse(char.attributes) : char.attributes,
  skills: typeof char.skills === 'string' ? JSON.parse(char.skills) : char.skills,
  growth_rates: typeof char.growth_rates === 'string' ? JSON.parse(char.growth_rates) : char.growth_rates,
  aptitudes: typeof char.aptitudes === 'string' ? JSON.parse(char.aptitudes) : char.aptitudes
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