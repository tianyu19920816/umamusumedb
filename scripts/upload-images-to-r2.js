/**
 * Upload images to Cloudflare R2 storage
 * This script uploads character and support card images to R2
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'YOUR_ACCOUNT_ID';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'YOUR_SECRET_KEY';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'umamusume';

// R2 public URL (after enabling public access)
const R2_PUBLIC_URL = `https://pub-${R2_ACCOUNT_ID}.r2.dev`;

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Image configurations
const imageConfig = {
  characters: {
    localPath: path.join(__dirname, '../public/images/characters'),
    r2Path: 'characters/',
    defaultImage: 'https://via.placeholder.com/300x400/ff6b9d/ffffff?text=Character',
  },
  supportCards: {
    localPath: path.join(__dirname, '../public/images/support-cards'),
    r2Path: 'support-cards/',
    defaultImage: 'https://via.placeholder.com/300x400/c66bbc/ffffff?text=Support+Card',
  },
  skills: {
    localPath: path.join(__dirname, '../public/images/skills'),
    r2Path: 'skills/',
    defaultImage: 'https://via.placeholder.com/64x64/ffc107/ffffff?text=Skill',
  },
};

/**
 * Upload a single file to R2
 */
async function uploadFile(filePath, key) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const contentType = getContentType(filePath);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
      // Enable public access
      ACL: 'public-read',
    });

    await s3Client.send(command);
    console.log(`✅ Uploaded: ${key}`);
    return `${R2_PUBLIC_URL}/${R2_BUCKET_NAME}/${key}`;
  } catch (error) {
    console.error(`❌ Failed to upload ${key}:`, error.message);
    return null;
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Upload all images in a directory
 */
async function uploadDirectory(type) {
  const config = imageConfig[type];
  const uploadedUrls = {};

  // Check if local directory exists
  if (!fs.existsSync(config.localPath)) {
    console.log(`📁 Creating directory: ${config.localPath}`);
    fs.mkdirSync(config.localPath, { recursive: true });
    return uploadedUrls;
  }

  // Get all files in directory
  const files = fs.readdirSync(config.localPath);
  
  console.log(`📤 Uploading ${files.length} ${type} images...`);

  for (const file of files) {
    if (file.startsWith('.')) continue; // Skip hidden files
    
    const filePath = path.join(config.localPath, file);
    const key = config.r2Path + file;
    
    const url = await uploadFile(filePath, key);
    if (url) {
      // Extract ID from filename (e.g., special_week.jpg -> special_week)
      const id = path.basename(file, path.extname(file));
      uploadedUrls[id] = url;
    }
  }

  return uploadedUrls;
}

/**
 * Update database with R2 image URLs
 */
async function updateDatabase(imageUrls) {
  const dbPath = path.join(__dirname, '../database/umamusumedb.db');
  
  if (!fs.existsSync(dbPath)) {
    console.log('⚠️  Database not found, skipping URL updates');
    return;
  }

  try {
    const Database = (await import('better-sqlite3')).default;
    const db = new Database(dbPath);

    // Update character images
    if (imageUrls.characters) {
      const updateCharacter = db.prepare(`
        UPDATE characters 
        SET image_url = ? 
        WHERE id = ?
      `);

      for (const [id, url] of Object.entries(imageUrls.characters)) {
        updateCharacter.run(url, id);
        console.log(`📝 Updated character ${id} image URL`);
      }
    }

    // Update support card images
    if (imageUrls.supportCards) {
      const updateCard = db.prepare(`
        UPDATE support_cards 
        SET image_url = ? 
        WHERE id = ?
      `);

      for (const [id, url] of Object.entries(imageUrls.supportCards)) {
        updateCard.run(url, id);
        console.log(`📝 Updated support card ${id} image URL`);
      }
    }

    db.close();
    console.log('✅ Database updated with R2 URLs');
  } catch (error) {
    console.error('❌ Failed to update database:', error.message);
  }
}

/**
 * Generate image URL mapping file
 */
function generateUrlMapping(imageUrls) {
  const mappingPath = path.join(__dirname, '../src/lib/image-urls.json');
  
  const mapping = {
    characters: imageUrls.characters || {},
    supportCards: imageUrls.supportCards || {},
    skills: imageUrls.skills || {},
    defaults: {
      character: imageConfig.characters.defaultImage,
      supportCard: imageConfig.supportCards.defaultImage,
      skill: imageConfig.skills.defaultImage,
    },
    r2BaseUrl: `${R2_PUBLIC_URL}/${R2_BUCKET_NAME}`,
  };

  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log('📝 Created image URL mapping file');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting R2 image upload...\n');

  // Check for required environment variables
  if (R2_ACCOUNT_ID === 'YOUR_ACCOUNT_ID') {
    console.error('❌ Please set R2 environment variables:');
    console.error('   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
    console.error('\nYou can set them in .env file or as environment variables');
    process.exit(1);
  }

  const allUrls = {};

  // Upload each type of image
  for (const type of Object.keys(imageConfig)) {
    console.log(`\n📂 Processing ${type}...`);
    allUrls[type] = await uploadDirectory(type);
  }

  // Generate URL mapping file
  generateUrlMapping(allUrls);

  // Update database with new URLs
  await updateDatabase(allUrls);

  // Re-export JSON data with new URLs
  console.log('\n🔄 Re-exporting JSON data...');
  const { execSync } = await import('child_process');
  execSync('node scripts/export-to-json.js', { stdio: 'inherit' });

  console.log('\n✅ R2 image upload complete!');
  console.log('📌 Remember to rebuild the site: npm run build');
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export { uploadFile, uploadDirectory, generateUrlMapping };