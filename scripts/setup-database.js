import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create local database
const dbPath = path.join(__dirname, '../data/umamusume.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

console.log('📦 Setting up local SQLite database...');

// Read and execute schema
const schemaPath = path.join(__dirname, '../database/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Split by semicolons and execute each statement
const statements = schema
  .split(';')
  .filter(stmt => stmt.trim())
  .map(stmt => stmt.trim() + ';');

try {
  db.exec('BEGIN TRANSACTION');
  
  for (const statement of statements) {
    if (statement.trim()) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      db.exec(statement);
    }
  }
  
  db.exec('COMMIT');
  console.log('✅ Database schema created successfully!');
  
  // Load initial seed data if it exists
  const seedPath = path.join(__dirname, '../database/seeds/initial-data.sql');
  if (fs.existsSync(seedPath)) {
    console.log('🌱 Loading seed data...');
    const seedData = fs.readFileSync(seedPath, 'utf-8');
    const seedStatements = seedData
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim() + ';');
    
    db.exec('BEGIN TRANSACTION');
    for (const statement of seedStatements) {
      if (statement.trim() && !statement.includes('--')) {
        try {
          db.exec(statement);
        } catch (err) {
          console.warn(`Warning: ${err.message}`);
        }
      }
    }
    db.exec('COMMIT');
    console.log('✅ Seed data loaded!');
  }
  
  // Verify tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\n📊 Created tables:');
  tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`  - ${table.name}: ${count.count} rows`);
  });
  
} catch (error) {
  db.exec('ROLLBACK');
  console.error('❌ Error setting up database:', error);
  process.exit(1);
} finally {
  db.close();
}

console.log('\n✨ Database setup complete! Path:', dbPath);