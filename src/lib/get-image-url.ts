import imageUrls from './image-urls.json';

/**
 * Get image URL for a character
 */
export function getCharacterImageUrl(characterId: string): string {
  return imageUrls.characters[characterId] || imageUrls.defaults.character;
}

/**
 * Get image URL for a support card
 */
export function getSupportCardImageUrl(cardId: string): string {
  return imageUrls.supportCards[cardId] || imageUrls.defaults.supportCard;
}

/**
 * Get image URL for a skill
 */
export function getSkillImageUrl(skillId: string): string {
  return imageUrls.skills[skillId] || imageUrls.defaults.skill;
}

/**
 * Get R2 base URL
 */
export function getR2BaseUrl(): string {
  return imageUrls.r2BaseUrl;
}

/**
 * Build full R2 URL for a path
 */
export function buildR2Url(path: string): string {
  return `${imageUrls.r2BaseUrl}/${path}`;
}