import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Character images from GamePress (publicly available)
const characterImages = {
  'special_week': 'https://gamepress.gg/sites/default/files/2022-02/Special%20Week.png',
  'silence_suzuka': 'https://gamepress.gg/sites/default/files/2022-02/Silence%20Suzuka.png',
  'tokai_teio': 'https://gamepress.gg/sites/default/files/2022-02/Tokai%20Teio.png',
  'mejiro_mcqueen': 'https://gamepress.gg/sites/default/files/2022-02/Mejiro%20McQueen.png',
  'gold_ship': 'https://gamepress.gg/sites/default/files/2022-02/Gold%20Ship.png',
  'vodka': 'https://gamepress.gg/sites/default/files/2022-02/Vodka.png',
  'daiwa_scarlet': 'https://gamepress.gg/sites/default/files/2022-02/Daiwa%20Scarlet.png',
  'grass_wonder': 'https://gamepress.gg/sites/default/files/2022-02/Grass%20Wonder.png',
  'el_condor_pasa': 'https://gamepress.gg/sites/default/files/2022-02/El%20Condor%20Pasa.png',
  'oguri_cap': 'https://gamepress.gg/sites/default/files/2022-02/Oguri%20Cap.png',
  'symboli_rudolf': 'https://gamepress.gg/sites/default/files/2022-02/Symboli%20Rudolf.png',
  'maruzensky': 'https://gamepress.gg/sites/default/files/2022-02/Maruzensky.png',
  'fuji_kiseki': 'https://gamepress.gg/sites/default/files/2022-02/Fuji%20Kiseki.png',
  'sakura_bakushin_o': 'https://gamepress.gg/sites/default/files/2022-02/Sakura%20Bakushin%20O.png',
  'haru_urara': 'https://gamepress.gg/sites/default/files/2022-02/Haru%20Urara.png',
  'nice_nature': 'https://gamepress.gg/sites/default/files/2022-02/Nice%20Nature.png',
  'king_halo': 'https://gamepress.gg/sites/default/files/2022-02/King%20Halo.png'
};

// Support card images (using GamePress patterns)
const supportCardImages = {
  'kitasan_black_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BThe%20Miracle%20Begins%5D%20Kitasan%20Black.png',
  'sakura_bakushin_o_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BRoad%20of%20the%20Flowers%5D%20Sakura%20Bakushin%20O.png',
  'twin_turbo_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BTurbo%20Engine%20Full%20Drive%5D%20Twin%20Turbo.png',
  'super_creek_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BCreek%20of%20the%20Super%5D%20Super%20Creek.png',
  'mejiro_mcqueen_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BElegance%20Line%5D%20Mejiro%20McQueen.png',
  'yayoi_akikawa_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BSuper%20Special%20Dreamers%21%5D%20Special%20Week_0.png',
  'oguri_cap_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BPale%20Blue%20Dress%5D%20Oguri%20Cap.png',
  'gold_city_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BCity%20of%20Gold%5D%20Gold%20City.png',
  'fine_motion_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BFirst%20in%20Flight%5D%20Fine%20Motion.png',
  'mejiro_dober_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BDetermined%20Sprinter%5D%20Mejiro%20Dober.png',
  'mr_cb_ssr': 'https://gamepress.gg/sites/default/files/2022-02/%5BMr.%20CB%5D%20Mr.%20CB.png',
  'vodka_sr': 'https://gamepress.gg/sites/default/files/2022-02/%5BPushing%20Forward%5D%20Vodka.png',
  'special_week_sr': 'https://gamepress.gg/sites/default/files/2022-02/%5BWelcome%20to%20Tracen%20Academy%21%5D%20Hachimi%20Souji.png',
  'gold_ship_sr': 'https://gamepress.gg/sites/default/files/2022-02/%5BMake%20up%20Vampire%21%5D%20Gold%20Ship.png',
  'haru_urara_r': 'https://gamepress.gg/sites/default/files/2022-02/%5BUnyielding%20Spirit%5D%20Haru%20Urara.png',
  'nice_nature_r': 'https://gamepress.gg/sites/default/files/2022-02/%5BEffort%20is%20my%20Forte%5D%20Nice%20Nature.png',
  'king_halo_r': 'https://gamepress.gg/sites/default/files/2022-02/%5BRoyalty%20Etiquette%5D%20King%20Halo.png'
};

// Read and update characters.json
const charactersPath = path.join(__dirname, '..', 'public', 'data', 'characters.json');
const characters = JSON.parse(fs.readFileSync(charactersPath, 'utf8'));

console.log('Updating character images...\n');
characters.forEach(character => {
  if (characterImages[character.id]) {
    character.image_url = characterImages[character.id];
    console.log(`✅ Updated ${character.name_en} with image`);
  }
});

fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));
console.log('\n✨ Characters updated!');

// Read and update supportCards.json
const cardsPath = path.join(__dirname, '..', 'public', 'data', 'supportCards.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

console.log('\nUpdating support card images...\n');
cards.forEach(card => {
  if (supportCardImages[card.id]) {
    card.image_url = supportCardImages[card.id];
    console.log(`✅ Updated ${card.name_en} with image`);
  }
});

fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2));
console.log('\n✨ Support cards updated!');

console.log('\n🎉 All images have been added to the JSON files!');