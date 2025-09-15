import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/umamusume.db');
const db = new Database(dbPath);

console.log('⚡ Starting skill data collection...');

// Comprehensive skill data
const skillData = [
  // Speed Skills
  { id: 'speedster', name_en: 'Speedster', name_jp: 'スピードスター',
    description_en: 'Slightly increases speed', description_jp: 'わずかに速度が上がる',
    effect: 'Speed +60', activation: 'passive', icon_url: '/icons/skills/speed.png' },
  
  { id: 'escape_artist', name_en: 'Escape Artist', name_jp: '逃げのコツ',
    description_en: 'Improves escape strategy effectiveness', description_jp: '逃げ戦法の効果が上がる',
    effect: 'Speed +40 when leading', activation: 'conditional', icon_url: '/icons/skills/escape.png' },
  
  { id: 'arc_maestro', name_en: 'Arc Maestro', name_jp: 'アークマエストロ',
    description_en: 'Master of the final corner', description_jp: '最終コーナーのマスター',
    effect: 'Acceleration +100% on final corner', activation: 'conditional', icon_url: '/icons/skills/arc.png' },
  
  { id: 'sprint_turbo', name_en: 'Sprint Turbo', name_jp: 'スプリントターボ',
    description_en: 'Explosive speed in short races', description_jp: '短距離レースで爆発的な速度',
    effect: 'Speed +60 in races under 1400m', activation: 'conditional', icon_url: '/icons/skills/sprint.png' },
  
  { id: 'leading_pride', name_en: 'Leading Pride', name_jp: 'リーディングプライド',
    description_en: 'Pride in leading the race', description_jp: 'レースをリードする誇り',
    effect: 'Speed +40, Stamina +20 when in lead', activation: 'conditional', icon_url: '/icons/skills/lead.png' },
  
  // Stamina Skills
  { id: 'stamina_keep', name_en: 'Stamina Keep', name_jp: 'スタミナキープ',
    description_en: 'Preserves stamina efficiently', description_jp: 'スタミナを効率的に保つ',
    effect: 'Stamina consumption -15%', activation: 'passive', icon_url: '/icons/skills/stamina.png' },
  
  { id: 'circle_recovery', name_en: 'Circle Recovery', name_jp: '円弧のマエストロ',
    description_en: 'Recovers stamina on curves', description_jp: 'カーブでスタミナ回復',
    effect: 'Stamina recovery +30 on curves', activation: 'conditional', icon_url: '/icons/skills/recovery.png' },
  
  { id: 'long_distance_runner', name_en: 'Long Distance Runner', name_jp: '長距離走者',
    description_en: 'Excel in long distance races', description_jp: '長距離レースで優れる',
    effect: 'Stamina +80 in races over 2400m', activation: 'conditional', icon_url: '/icons/skills/long.png' },
  
  { id: 'pacer', name_en: 'Pacer', name_jp: 'ペースアップ',
    description_en: 'Maintains steady pace', description_jp: '安定したペースを維持',
    effect: 'Stamina consumption -10%, Speed +20', activation: 'passive', icon_url: '/icons/skills/pace.png' },
  
  // Power Skills
  { id: 'power_charge', name_en: 'Power Charge', name_jp: 'パワーチャージ',
    description_en: 'Charges up power', description_jp: 'パワーをチャージ',
    effect: 'Power +60', activation: 'passive', icon_url: '/icons/skills/power.png' },
  
  { id: 'strong_heart', name_en: 'Strong Heart', name_jp: '強い心',
    description_en: 'Strong mental fortitude', description_jp: '強い精神力',
    effect: 'Power +40, Guts +20', activation: 'passive', icon_url: '/icons/skills/heart.png' },
  
  { id: 'late_charge', name_en: 'Late Charge', name_jp: '追い込み',
    description_en: 'Powerful final sprint', description_jp: '強力な最終スプリント',
    effect: 'Power +80 in final stretch', activation: 'conditional', icon_url: '/icons/skills/charge.png' },
  
  // Guts Skills
  { id: 'never_give_up', name_en: 'Never Give Up', name_jp: '諦めない心',
    description_en: 'Never surrender spirit', description_jp: '決して諦めない精神',
    effect: 'Guts +60, Speed +20 when behind', activation: 'conditional', icon_url: '/icons/skills/guts.png' },
  
  { id: 'determination', name_en: 'Determination', name_jp: '決意',
    description_en: 'Strong determination', description_jp: '強い決意',
    effect: 'Guts +40', activation: 'passive', icon_url: '/icons/skills/determination.png' },
  
  { id: 'fighting_spirit', name_en: 'Fighting Spirit', name_jp: '闘志',
    description_en: 'Burning fighting spirit', description_jp: '燃える闘志',
    effect: 'All stats +20 when stamina < 30%', activation: 'conditional', icon_url: '/icons/skills/fight.png' },
  
  // Wisdom Skills
  { id: 'concentration', name_en: 'Concentration', name_jp: '集中力',
    description_en: 'Maintains focus during race', description_jp: 'レース中の集中力を維持',
    effect: 'Reduces debuff chance by 30%', activation: 'passive', icon_url: '/icons/skills/focus.png' },
  
  { id: 'wisdom_eye', name_en: 'Wisdom Eye', name_jp: '洞察力',
    description_en: 'See through race tactics', description_jp: 'レース戦術を見抜く',
    effect: 'Wisdom +60', activation: 'passive', icon_url: '/icons/skills/wisdom.png' },
  
  { id: 'analysis', name_en: 'Analysis', name_jp: '分析',
    description_en: 'Analyze race conditions', description_jp: 'レース状況を分析',
    effect: 'Skill activation rate +20%', activation: 'passive', icon_url: '/icons/skills/analysis.png' },
  
  { id: 'practice_partner', name_en: 'Practice Partner', name_jp: '練習パートナー',
    description_en: 'Good practice companion', description_jp: '良い練習仲間',
    effect: 'Training efficiency +15%', activation: 'training', icon_url: '/icons/skills/partner.png' },
  
  // Unique Skills
  { id: 'eating_machine', name_en: 'Eating Machine', name_jp: '食いしん坊',
    description_en: 'Special Week\'s unique skill', description_jp: 'スペシャルウィークの固有スキル',
    effect: 'Stamina +100, Power +40', activation: 'unique', icon_url: '/icons/skills/unique.png' },
  
  { id: 'miracle_run', name_en: 'Miracle Run', name_jp: 'ミラクルラン',
    description_en: 'Tokai Teio\'s unique skill', description_jp: 'トウカイテイオーの固有スキル',
    effect: 'All stats +40 in comeback races', activation: 'unique', icon_url: '/icons/skills/unique.png' },
  
  { id: 'golden_spirit', name_en: 'Golden Spirit', name_jp: 'ゴールデンスピリット',
    description_en: 'Gold Ship\'s unique skill', description_jp: 'ゴールドシップの固有スキル',
    effect: 'Random stat boost +20-100', activation: 'unique', icon_url: '/icons/skills/unique.png' },
  
  { id: 'unpredictable', name_en: 'Unpredictable', name_jp: '予測不能',
    description_en: 'Gold Ship\'s chaotic nature', description_jp: 'ゴールドシップの混沌とした性質',
    effect: 'Random effect each race', activation: 'unique', icon_url: '/icons/skills/unique.png' },
  
  // Recovery Skills
  { id: 'recovery', name_en: 'Recovery', name_jp: '回復',
    description_en: 'Recovers stamina', description_jp: 'スタミナを回復',
    effect: 'Stamina recovery +40', activation: 'conditional', icon_url: '/icons/skills/recovery.png' },
  
  { id: 'quick_recovery', name_en: 'Quick Recovery', name_jp: 'クイックリカバリー',
    description_en: 'Fast stamina recovery', description_jp: '素早いスタミナ回復',
    effect: 'Stamina recovery rate +25%', activation: 'passive', icon_url: '/icons/skills/recovery.png' },
  
  // Position Skills
  { id: 'position_keep', name_en: 'Position Keep', name_jp: 'ポジションキープ',
    description_en: 'Maintains position', description_jp: 'ポジションを維持',
    effect: 'Position loss resistance +30%', activation: 'passive', icon_url: '/icons/skills/position.png' },
  
  { id: 'front_runner', name_en: 'Front Runner', name_jp: '先行',
    description_en: 'Excel at leading position', description_jp: '先頭位置で優れる',
    effect: 'Speed +40 when in top 3', activation: 'conditional', icon_url: '/icons/skills/front.png' },
  
  // Acceleration Skills
  { id: 'acceleration', name_en: 'Acceleration', name_jp: '加速',
    description_en: 'Increases acceleration', description_jp: '加速力を上げる',
    effect: 'Acceleration +30%', activation: 'passive', icon_url: '/icons/skills/accel.png' },
  
  { id: 'quick_start', name_en: 'Quick Start', name_jp: 'クイックスタート',
    description_en: 'Fast race start', description_jp: '素早いレーススタート',
    effect: 'Start dash +50%', activation: 'start', icon_url: '/icons/skills/start.png' },
  
  // Debuff Resistance
  { id: 'cool_down', name_en: 'Cool Down', name_jp: 'クールダウン',
    description_en: 'Reduces pressure effects', description_jp: 'プレッシャー効果を軽減',
    effect: 'Debuff resistance +40%', activation: 'passive', icon_url: '/icons/skills/cool.png' }
];

// Insert skills into database
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO skills 
  (id, name_en, name_jp, description_en, description_jp, effect, activation, icon_url) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((skills) => {
  for (const skill of skills) {
    insertStmt.run(
      skill.id,
      skill.name_en,
      skill.name_jp,
      skill.description_en,
      skill.description_jp || '',
      skill.effect,
      skill.activation,
      skill.icon_url
    );
  }
});

try {
  insertMany(skillData);
  console.log(`✅ Inserted ${skillData.length} skills into database`);
  
  // Verify insertion
  const count = db.prepare('SELECT COUNT(*) as count FROM skills').get();
  console.log(`📊 Total skills in database: ${count.count}`);
  
  // Show breakdown by activation type
  const activationBreakdown = db.prepare(`
    SELECT activation, COUNT(*) as count 
    FROM skills 
    GROUP BY activation 
    ORDER BY count DESC
  `).all();
  
  console.log('\n📋 Skills by activation type:');
  activationBreakdown.forEach(a => {
    console.log(`  - ${a.activation}: ${a.count} skills`);
  });
  
  // Show sample skills
  const sample = db.prepare('SELECT name_en, effect FROM skills ORDER BY RANDOM() LIMIT 5').all();
  console.log('\n📋 Sample skills:');
  sample.forEach(skill => {
    console.log(`  - ${skill.name_en}: ${skill.effect}`);
  });
  
} catch (error) {
  console.error('❌ Error inserting skills:', error);
} finally {
  db.close();
}

console.log('\n✨ Skill collection complete!');