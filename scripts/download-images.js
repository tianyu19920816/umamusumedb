import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Character images from UmaWiki (300px resolution)
const characterImages = {
  'special_week': 'https://umamusu.wiki/w/thumb.php?f=Special_Week_%28Icon%29.png&width=300',
  'silence_suzuka': 'https://umamusu.wiki/w/thumb.php?f=Silence_Suzuka_%28Icon%29.png&width=300',
  'tokai_teio': 'https://umamusu.wiki/w/thumb.php?f=Tokai_Teio_%28Icon%29.png&width=300',
  'mejiro_mcqueen': 'https://umamusu.wiki/w/thumb.php?f=Mejiro_McQueen_%28Icon%29.png&width=300',
  'gold_ship': 'https://umamusu.wiki/w/thumb.php?f=Gold_Ship_%28Icon%29.png&width=300',
  'vodka': 'https://umamusu.wiki/w/thumb.php?f=Vodka_%28Icon%29.png&width=300',
  'daiwa_scarlet': 'https://umamusu.wiki/w/thumb.php?f=Daiwa_Scarlet_%28Icon%29.png&width=300',
  'grass_wonder': 'https://umamusu.wiki/w/thumb.php?f=Grass_Wonder_%28Icon%29.png&width=300',
  'el_condor_pasa': 'https://umamusu.wiki/w/thumb.php?f=El_Condor_Pasa_%28Icon%29.png&width=300',
  'oguri_cap': 'https://umamusu.wiki/w/thumb.php?f=Oguri_Cap_%28Icon%29.png&width=300',
  'symboli_rudolf': 'https://umamusu.wiki/w/thumb.php?f=Symboli_Rudolf_%28Icon%29.png&width=300',
  'maruzensky': 'https://umamusu.wiki/w/thumb.php?f=Maruzensky_%28Icon%29.png&width=300',
  'fuji_kiseki': 'https://umamusu.wiki/w/thumb.php?f=Fuji_Kiseki_%28Icon%29.png&width=300',
  'sakura_bakushin_o': 'https://umamusu.wiki/w/thumb.php?f=Sakura_Bakushin_O_%28Icon%29.png&width=300',
  'haru_urara': 'https://umamusu.wiki/w/thumb.php?f=Haru_Urara_%28Icon%29.png&width=300',
  'nice_nature': 'https://umamusu.wiki/w/thumb.php?f=Nice_Nature_%28Icon%29.png&width=300',
  'king_halo': 'https://umamusu.wiki/w/thumb.php?f=King_Halo_%28Icon%29.png&width=300'
};

// Support card images from UmaWiki
const supportCardImages = {
  'kitasan_black_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30028_Card.png&width=200',
  'sakura_bakushin_o_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30025_Card.png&width=200',
  'twin_turbo_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30046_Card.png&width=200',
  'super_creek_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30022_Card.png&width=200',
  'mejiro_mcqueen_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30006_Card.png&width=200',
  'yayoi_akikawa_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30047_Card.png&width=200',
  'oguri_cap_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30008_Card.png&width=200',
  'gold_city_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30031_Card.png&width=200',
  'fine_motion_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30044_Card.png&width=200',
  'mejiro_dober_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30015_Card.png&width=200',
  'mr_cb_ssr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_30017_Card.png&width=200',
  'vodka_sr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_20002_Card.png&width=200',
  'special_week_sr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_20001_Card.png&width=200',
  'gold_ship_sr': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_20007_Card.png&width=200',
  'haru_urara_r': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_10056_Card.png&width=200',
  'nice_nature_r': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_10061_Card.png&width=200',
  'king_halo_r': 'https://umamusu.wiki/w/thumb.php?f=Support_Card_10063_Card.png&width=200'
};

// Create directories
const imagesDir = path.join(__dirname, '..', 'public', 'images');
const charactersDir = path.join(imagesDir, 'characters');
const cardsDir = path.join(imagesDir, 'support-cards');

if (!fs.existsSync(charactersDir)) {
  fs.mkdirSync(charactersDir, { recursive: true });
}
if (!fs.existsSync(cardsDir)) {
  fs.mkdirSync(cardsDir, { recursive: true });
}

// Function to download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Download all character images
console.log('📥 Downloading character images...\n');
for (const [id, url] of Object.entries(characterImages)) {
  const filename = `${id}.png`;
  const filepath = path.join(charactersDir, filename);
  
  try {
    await downloadImage(url, filepath);
    console.log(`✅ Downloaded ${filename}`);
  } catch (error) {
    console.log(`❌ Failed to download ${filename}: ${error.message}`);
  }
}

// Download all support card images
console.log('\n📥 Downloading support card images...\n');
for (const [id, url] of Object.entries(supportCardImages)) {
  const filename = `${id}.png`;
  const filepath = path.join(cardsDir, filename);
  
  try {
    await downloadImage(url, filepath);
    console.log(`✅ Downloaded ${filename}`);
  } catch (error) {
    console.log(`❌ Failed to download ${filename}: ${error.message}`);
  }
}

console.log('\n✨ Download complete! Images saved to public/images/');
console.log('📤 Next step: Upload these images to R2 storage');