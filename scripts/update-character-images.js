import Database from 'better-sqlite3';
const db = new Database('database.db');

// Map of character IDs to their Fandom wiki image URLs
// These are from the official Fandom wiki and are publicly available
const characterImages = {
  'special_week': 'https://static.wikia.nocookie.net/umamusume/images/f/f6/Special_Week_%28Main%29.png',
  'silence_suzuka': 'https://static.wikia.nocookie.net/umamusume/images/8/8f/Silence_Suzuka_%28Main%29.png',
  'tokai_teio': 'https://static.wikia.nocookie.net/umamusume/images/1/1e/Tokai_Teio_%28Main%29.png',
  'mejiro_mcqueen': 'https://static.wikia.nocookie.net/umamusume/images/9/9f/Mejiro_McQueen_%28Main%29.png',
  'gold_ship': 'https://static.wikia.nocookie.net/umamusume/images/8/8d/Gold_Ship_%28Main%29.png',
  'vodka': 'https://static.wikia.nocookie.net/umamusume/images/d/d7/Vodka_%28Main%29.png',
  'daiwa_scarlet': 'https://static.wikia.nocookie.net/umamusume/images/7/76/Daiwa_Scarlet_%28Main%29.png',
  'grass_wonder': 'https://static.wikia.nocookie.net/umamusume/images/a/a9/Grass_Wonder_%28Main%29.png',
  'el_condor_pasa': 'https://static.wikia.nocookie.net/umamusume/images/4/4e/El_Condor_Pasa_%28Main%29.png',
  'oguri_cap': 'https://static.wikia.nocookie.net/umamusume/images/3/36/Oguri_Cap_%28Main%29.png',
  'symboli_rudolf': 'https://static.wikia.nocookie.net/umamusume/images/4/45/Symboli_Rudolf_%28Main%29.png',
  'maruzensky': 'https://static.wikia.nocookie.net/umamusume/images/4/46/Maruzensky_%28Main%29.png',
  'fuji_kiseki': 'https://static.wikia.nocookie.net/umamusume/images/1/11/Fuji_Kiseki_%28Main%29.png',
  'sakura_bakushin_o': 'https://static.wikia.nocookie.net/umamusume/images/b/b5/Sakura_Bakushin_O_%28Main%29.png',
  'haru_urara': 'https://static.wikia.nocookie.net/umamusume/images/a/af/Haru_Urara_%28Main%29.png',
  'nice_nature': 'https://static.wikia.nocookie.net/umamusume/images/4/4f/Nice_Nature_%28Main%29.png',
  'king_halo': 'https://static.wikia.nocookie.net/umamusume/images/3/37/King_Halo_%28Main%29.png'
};

// Alternative CDN URLs (GamePress)
const alternativeImages = {
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

// Update characters with image URLs
const updateStmt = db.prepare(`
  UPDATE characters 
  SET image_url = ? 
  WHERE id = ?
`);

console.log('Updating character images...\n');

// Use alternative images as they're more reliable
for (const [id, imageUrl] of Object.entries(alternativeImages)) {
  try {
    const result = updateStmt.run(imageUrl, id);
    if (result.changes > 0) {
      console.log(`✅ Updated ${id} with image URL`);
    } else {
      console.log(`⚠️ Character ${id} not found in database`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${id}:`, error.message);
  }
}

console.log('\n✨ Character images update complete!');

db.close();