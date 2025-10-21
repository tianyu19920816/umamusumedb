/**
 * Update image URLs in database from R2 default domain to custom domain
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const DB_PATH = join(__dirname, '../database/umamusume.db');

// URL mapping
const OLD_DOMAIN = 'https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev';
const NEW_DOMAIN = 'https://img.umamusumedb.com';

async function updateImageUrls() {
  console.log('🔄 Updating image URLs in database...\n');

  const db = new Database(DB_PATH);

  try {
    // Start transaction
    db.prepare('BEGIN TRANSACTION').run();

    // Update characters table
    console.log('📝 Updating characters table...');
    const updateCharacters = db.prepare(`
      UPDATE characters
      SET image_url = REPLACE(image_url, ?, ?)
      WHERE image_url LIKE ?
    `);

    const charactersResult = updateCharacters.run(OLD_DOMAIN, NEW_DOMAIN, `${OLD_DOMAIN}%`);
    console.log(`   ✓ Updated ${charactersResult.changes} character image URLs`);

    // Update support_cards table
    console.log('📝 Updating support_cards table...');
    const updateSupportCards = db.prepare(`
      UPDATE support_cards
      SET image_url = REPLACE(image_url, ?, ?)
      WHERE image_url LIKE ?
    `);

    const cardsResult = updateSupportCards.run(OLD_DOMAIN, NEW_DOMAIN, `${OLD_DOMAIN}%`);
    console.log(`   ✓ Updated ${cardsResult.changes} support card image URLs`);

    // Update skills table (if has image_url)
    console.log('📝 Checking skills table...');
    const skillsColumns = db.prepare("PRAGMA table_info(skills)").all();
    const hasImageUrl = skillsColumns.some(col => col.name === 'image_url');

    if (hasImageUrl) {
      const updateSkills = db.prepare(`
        UPDATE skills
        SET image_url = REPLACE(image_url, ?, ?)
        WHERE image_url LIKE ?
      `);

      const skillsResult = updateSkills.run(OLD_DOMAIN, NEW_DOMAIN, `${OLD_DOMAIN}%`);
      console.log(`   ✓ Updated ${skillsResult.changes} skill image URLs`);
    } else {
      console.log('   ⊘ Skills table does not have image_url column');
    }

    // Commit transaction
    db.prepare('COMMIT').run();

    console.log('\n✅ Database image URLs updated successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Old domain: ${OLD_DOMAIN}`);
    console.log(`   New domain: ${NEW_DOMAIN}`);

    // Verify the changes
    console.log('\n🔍 Verifying changes...');

    const sampleCharacter = db.prepare(`
      SELECT id, name_en, image_url
      FROM characters
      WHERE image_url IS NOT NULL
      LIMIT 1
    `).get();

    if (sampleCharacter) {
      console.log(`   Sample character: ${sampleCharacter.name_en}`);
      console.log(`   Image URL: ${sampleCharacter.image_url}`);
    }

    const sampleCard = db.prepare(`
      SELECT id, name_en, image_url
      FROM support_cards
      WHERE image_url IS NOT NULL
      LIMIT 1
    `).get();

    if (sampleCard) {
      console.log(`   Sample card: ${sampleCard.name_en}`);
      console.log(`   Image URL: ${sampleCard.image_url}`);
    }

  } catch (error) {
    // Rollback on error
    db.prepare('ROLLBACK').run();
    console.error('❌ Error updating image URLs:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run the update
updateImageUrls().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
