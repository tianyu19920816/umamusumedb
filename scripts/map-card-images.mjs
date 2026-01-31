/**
 * Map Support Card Images to Character Images
 * 
 * This script maps support card image URLs to corresponding character images
 * by matching character names. Since support cards feature characters,
 * we can use the character's image as a fallback.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'public', 'data');

// Load data files
const characters = JSON.parse(await readFile(resolve(dataDir, 'characters.json'), 'utf-8'));
const supportCards = JSON.parse(await readFile(resolve(dataDir, 'supportCards.json'), 'utf-8'));

// Create character name to image URL mapping
// Extract base character name (without costume/variant suffix)
const characterImageMap = new Map();

characters.forEach(char => {
  // Extract base name (e.g., "Kitasan Black" from "Kitasan Black (Road to the Top)")
  const baseNameEn = char.name_en.replace(/\s*\([^)]+\)\s*$/, '').toLowerCase().trim();
  const baseNameJp = char.name_jp?.replace(/（[^）]+）$/, '').trim();
  
  // Store mapping (prefer first occurrence which is usually the base character)
  if (!characterImageMap.has(baseNameEn)) {
    characterImageMap.set(baseNameEn, char.image_url);
  }
  if (baseNameJp && !characterImageMap.has(baseNameJp)) {
    characterImageMap.set(baseNameJp, char.image_url);
  }
});

console.log(`Loaded ${characters.length} characters, created ${characterImageMap.size} name mappings`);

// Manual mappings for common variations
const manualMappings = {
  'kitasan black': 'kitasan_black',
  'super creek': 'super_creek',
  'fine motion': 'fine_motion',
  'admire vega': 'admire_vega',
  'sakura chiyono o': 'sakura_chiyono_o',
  'daiwa scarlet': 'daiwa_scarlet',
  'symboli rudolf': 'symboli_rudolf',
  'tokai teio': 'tokai_teio',
  'mejiro mcqueen': 'mejiro_mcqueen',
  'oguri cap': 'oguri_cap',
  'gold ship': 'gold_ship',
  'rice shower': 'rice_shower',
  'vodka': 'vodka',
  'special week': 'special_week',
  'silence suzuka': 'silence_suzuka',
  'taiki shuttle': 'taiki_shuttle',
  'grass wonder': 'grass_wonder',
  'el condor pasa': 'el_condor_pasa',
  'narita brian': 'narita_brian',
  'air groove': 'air_groove',
  'seiun sky': 'seiun_sky',
  'king halo': 'king_halo',
  'haru urara': 'haru_urara',
  'mayano top gun': 'mayano_top_gun',
  'mihono bourbon': 'mihono_bourbon',
  'biwa hayahide': 'biwa_hayahide',
  'narita taishin': 'narita_taishin',
  'winning ticket': 'winning_ticket',
  'eishin flash': 'eishin_flash',
  'matikanetannhauser': 'matikanetannhauser',
  'smart falcon': 'smart_falcon',
  'zenno rob roy': 'zenno_rob_roy',
  'sweep tosho': 'sweep_tosho',
  'agnes tachyon': 'agnes_tachyon',
  'manhattan cafe': 'manhattan_cafe',
  'tosen jordan': 'tosen_jordan',
  'mr cb': 'mr_cb',
  'meisho doto': 'meisho_doto',
  'ines fujin': 'ines_fujin',
  'yukino bijin': 'yukino_bijin',
  'nishino flower': 'nishino_flower',
  'tamamo cross': 'tamamo_cross',
  'sakura bakushin o': 'sakura_bakushin_o',
  'air shakur': 'air_shakur'
};

// Update support card image URLs
let updatedCount = 0;
let notFoundCount = 0;

supportCards.forEach(card => {
  // Extract character name from support card name
  // Format: "Character Name [Costume/Title]" or "Character Name (Variant)"
  let cardCharName = card.name_en
    .replace(/\s*\[[^\]]+\]\s*$/, '')  // Remove [Title]
    .replace(/\s*\([^)]+\)\s*$/, '')   // Remove (Variant)
    .toLowerCase()
    .trim();
  
  // Try to find matching character image
  let matchedImageUrl = null;
  
  // Try direct match
  if (characterImageMap.has(cardCharName)) {
    matchedImageUrl = characterImageMap.get(cardCharName);
  }
  
  // Try manual mapping
  if (!matchedImageUrl && manualMappings[cardCharName]) {
    const charId = manualMappings[cardCharName];
    const matchingChar = characters.find(c => c.id.startsWith(charId));
    if (matchingChar) {
      matchedImageUrl = matchingChar.image_url;
    }
  }
  
  // Try partial match
  if (!matchedImageUrl) {
    for (const [name, url] of characterImageMap) {
      if (cardCharName.includes(name) || name.includes(cardCharName)) {
        matchedImageUrl = url;
        break;
      }
    }
  }
  
  if (matchedImageUrl) {
    // Update the support card's image URL to use character image
    // We'll create a derived URL that indicates it's a card using character's image
    card.character_image_url = matchedImageUrl;
    updatedCount++;
    console.log(`✓ Mapped: "${card.name_en}" → character image`);
  } else {
    notFoundCount++;
    console.log(`✗ No match: "${card.name_en}" (searched: "${cardCharName}")`);
  }
});

// Save updated support cards
await writeFile(
  resolve(dataDir, 'supportCards.json'),
  JSON.stringify(supportCards, null, 2),
  'utf-8'
);

console.log('\n--- Summary ---');
console.log(`Total support cards: ${supportCards.length}`);
console.log(`Mapped to character images: ${updatedCount}`);
console.log(`No match found: ${notFoundCount}`);
console.log('\nSupport cards updated with character_image_url field.');
console.log('Components should now use card.character_image_url as fallback when card.image_url is unavailable.');




