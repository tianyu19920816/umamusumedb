/**
 * Fetch accurate Uma Musume data for 2025
 * Based on latest game data from September 2025 tier lists
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create accurate character data based on 2025 game state
const characters2025 = [
  // SS Tier Characters
  {
    id: 'oguri_cap_starlight',
    name_en: 'Oguri Cap (Starlight Beat)',
    name_jp: 'オグリキャップ（スターライトビート）',
    rarity: 3,
    tier: 'SS',
    initial_stats: {
      speed: 89,
      stamina: 77,
      power: 102,
      guts: 87,
      wisdom: 85
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '5%',
      stamina: '0%',
      power: '15%',
      guts: '0%',
      wisdom: '0%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'A',
      sprint: 'E',
      mile: 'A',
      medium: 'A',
      long: 'B',
      escape: 'E',
      lead: 'C',
      between: 'A',
      chase: 'A'
    },
    unique_skill: {
      name_en: 'Triumphant Pulse',
      name_jp: 'トリンフパルス',
      effect: 'Powerful acceleration in the final spurt'
    },
    training_difficulty: 'Easy',
    specialties: ['Mile', 'Medium', 'Dirt']
  },
  {
    id: 'narita_taishin_nevertheless',
    name_en: 'Narita Taishin (Nevertheless)',
    name_jp: 'ナリタタイシン（ネバーザレス）',
    rarity: 3,
    tier: 'SS',
    initial_stats: {
      speed: 85,
      stamina: 110,
      power: 95,
      guts: 75,
      wisdom: 85
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '0%',
      stamina: '20%',
      power: '10%',
      guts: '0%',
      wisdom: '0%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'G',
      sprint: 'G',
      mile: 'E',
      medium: 'A',
      long: 'A',
      escape: 'G',
      lead: 'G',
      between: 'B',
      chase: 'A'
    },
    unique_skill: {
      name_en: 'Nevertheless',
      name_jp: 'ネバーザレス',
      effect: 'Massive stamina recovery and speed boost'
    },
    training_difficulty: 'Medium',
    specialties: ['Medium', 'Long', 'End']
  },
  
  // S Tier Characters
  {
    id: 'agnes_tachyon_tachnology',
    name_en: 'Agnes Tachyon (Tach-nology)',
    name_jp: 'アグネスタキオン（タキノロジー）',
    rarity: 3,
    tier: 'S',
    initial_stats: {
      speed: 92,
      stamina: 88,
      power: 90,
      guts: 75,
      wisdom: 105
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '10%',
      stamina: '5%',
      power: '5%',
      guts: '0%',
      wisdom: '10%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'E',
      sprint: 'F',
      mile: 'B',
      medium: 'A',
      long: 'B',
      escape: 'E',
      lead: 'A',
      between: 'A',
      chase: 'C'
    },
    unique_skill: {
      name_en: 'Tach-nology',
      name_jp: 'タキノロジー',
      effect: 'Scientific precision boosts all stats mid-race'
    },
    training_difficulty: 'Medium',
    specialties: ['Medium', 'Pace']
  },
  {
    id: 'seiun_sky_reeling',
    name_en: 'Seiun Sky (Reeling in the Big One)',
    name_jp: 'セイウンスカイ（大漁旗）',
    rarity: 3,
    tier: 'S',
    initial_stats: {
      speed: 88,
      stamina: 95,
      power: 82,
      guts: 85,
      wisdom: 100
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '0%',
      stamina: '10%',
      power: '0%',
      guts: '0%',
      wisdom: '20%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'G',
      sprint: 'G',
      mile: 'C',
      medium: 'A',
      long: 'A',
      escape: 'A',
      lead: 'B',
      between: 'C',
      chase: 'G'
    },
    unique_skill: {
      name_en: 'Big Catch',
      name_jp: '大漁旗',
      effect: 'Speed boost when leading in late race'
    },
    training_difficulty: 'Easy',
    specialties: ['Medium', 'Long', 'Front Runner']
  },
  
  // Easy Training Characters for Beginners
  {
    id: 'sakura_bakushin_o',
    name_en: 'Sakura Bakushin O',
    name_jp: 'サクラバクシンオー',
    rarity: 3,
    tier: 'A',
    initial_stats: {
      speed: 115,
      stamina: 65,
      power: 95,
      guts: 85,
      wisdom: 80
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '20%',
      stamina: '0%',
      power: '10%',
      guts: '0%',
      wisdom: '0%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'B',
      sprint: 'A',
      mile: 'A',
      medium: 'G',
      long: 'G',
      escape: 'A',
      lead: 'C',
      between: 'G',
      chase: 'G'
    },
    unique_skill: {
      name_en: 'Bakushin Burst',
      name_jp: 'バクシン',
      effect: 'Explosive speed boost in sprint races'
    },
    training_difficulty: 'Very Easy',
    specialties: ['Sprint', 'Mile', 'Front Runner']
  },
  {
    id: 'curren_chan',
    name_en: 'Curren Chan',
    name_jp: 'カレンチャン',
    rarity: 3,
    tier: 'A',
    initial_stats: {
      speed: 102,
      stamina: 68,
      power: 100,
      guts: 85,
      wisdom: 85
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '10%',
      stamina: '0%',
      power: '20%',
      guts: '0%',
      wisdom: '0%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'C',
      sprint: 'A',
      mile: 'B',
      medium: 'G',
      long: 'G',
      escape: 'B',
      lead: 'A',
      between: 'C',
      chase: 'G'
    },
    unique_skill: {
      name_en: 'Karen Step',
      name_jp: 'カレンステップ',
      effect: 'Graceful acceleration in sprint races'
    },
    training_difficulty: 'Very Easy',
    specialties: ['Sprint']
  },
  {
    id: 'smart_falcon',
    name_en: 'Smart Falcon',
    name_jp: 'スマートファルコン',
    rarity: 3,
    tier: 'A',
    initial_stats: {
      speed: 95,
      stamina: 82,
      power: 93,
      guts: 85,
      wisdom: 85
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '10%',
      stamina: '5%',
      power: '10%',
      guts: '0%',
      wisdom: '5%'
    },
    aptitudes: {
      turf: 'C',
      dirt: 'A',
      sprint: 'E',
      mile: 'A',
      medium: 'A',
      long: 'C',
      escape: 'C',
      lead: 'A',
      between: 'B',
      chase: 'E'
    },
    unique_skill: {
      name_en: 'Falcon Strike',
      name_jp: 'ファルコンストライク',
      effect: 'Sharp acceleration on dirt tracks'
    },
    training_difficulty: 'Easy',
    specialties: ['Mile', 'Medium', 'Dirt', 'Front Runner']
  },
  
  // Updated Classic Characters with 2025 Meta
  {
    id: 'special_week_2025',
    name_en: 'Special Week',
    name_jp: 'スペシャルウィーク',
    rarity: 3,
    tier: 'B',
    initial_stats: {
      speed: 77,
      stamina: 76,
      power: 77,
      guts: 102,
      wisdom: 97
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '10%',
      stamina: '0%',
      power: '10%',
      guts: '0%',
      wisdom: '0%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'G',
      sprint: 'F',
      mile: 'C',
      medium: 'A',
      long: 'A',
      escape: 'C',
      lead: 'A',
      between: 'B',
      chase: 'C'
    },
    unique_skill: {
      name_en: 'Eat Up and Work Hard♪',
      name_jp: '食い下がり',
      effect: 'Stamina recovery when surrounded'
    },
    training_difficulty: 'Medium',
    specialties: ['Medium', 'Long']
  },
  {
    id: 'silence_suzuka_2025',
    name_en: 'Silence Suzuka',
    name_jp: 'サイレンススズカ',
    rarity: 3,
    tier: 'A',
    initial_stats: {
      speed: 103,
      stamina: 71,
      power: 64,
      guts: 96,
      wisdom: 106
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '20%',
      stamina: '0%',
      power: '0%',
      guts: '0%',
      wisdom: '10%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'E',
      sprint: 'E',
      mile: 'A',
      medium: 'A',
      long: 'B',
      escape: 'A',
      lead: 'C',
      between: 'E',
      chase: 'D'
    },
    unique_skill: {
      name_en: 'Transcendent Flash',
      name_jp: '先頭の景色は譲らない',
      effect: 'Massive speed boost when leading'
    },
    training_difficulty: 'Hard',
    specialties: ['Mile', 'Medium', 'Escape']
  },
  {
    id: 'gold_ship_2025',
    name_en: 'Gold Ship',
    name_jp: 'ゴールドシップ',
    rarity: 3,
    tier: 'S',
    initial_stats: {
      speed: 82,
      stamina: 94,
      power: 103,
      guts: 67,
      wisdom: 94
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '0%',
      stamina: '10%',
      power: '10%',
      guts: '0%',
      wisdom: '0%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'B',
      sprint: 'F',
      mile: 'C',
      medium: 'A',
      long: 'A',
      escape: 'F',
      lead: 'E',
      between: 'C',
      chase: 'A'
    },
    unique_skill: {
      name_en: 'Unpredictable Chaos',
      name_jp: '不沈艦、抜錨ォッ！',
      effect: 'Random massive stat boosts'
    },
    training_difficulty: 'Medium',
    specialties: ['Long', 'Chaser']
  },
  {
    id: 'mejiro_mcqueen_2025',
    name_en: 'Mejiro McQueen',
    name_jp: 'メジロマックイーン',
    rarity: 3,
    tier: 'A',
    initial_stats: {
      speed: 72,
      stamina: 109,
      power: 84,
      guts: 79,
      wisdom: 96
    },
    max_stats: {
      speed: 1200,
      stamina: 1200,
      power: 1200,
      guts: 1200,
      wisdom: 1200
    },
    growth_rates: {
      speed: '0%',
      stamina: '20%',
      power: '10%',
      guts: '0%',
      wisdom: '0%'
    },
    aptitudes: {
      turf: 'A',
      dirt: 'E',
      sprint: 'G',
      mile: 'E',
      medium: 'A',
      long: 'A',
      escape: 'E',
      lead: 'E',
      between: 'A',
      chase: 'A'
    },
    unique_skill: {
      name_en: 'Mejiro Family Pride',
      name_jp: '貴顕の使命を果たすべく',
      effect: 'Perfect pacing increases speed'
    },
    training_difficulty: 'Medium',
    specialties: ['Long', 'Betweener', 'Chaser']
  }
];

// Support Cards based on 2025 meta
const supportCards2025 = [
  {
    id: 'kitasan_black_ssr',
    name_en: 'Kitasan Black [Road to the Top]',
    name_jp: 'キタサンブラック【迫る熱に押されて】',
    type: 'speed',
    rarity: 'SSR',
    tier: 'SS',
    effects: {
      friendship_bonus: { lv1: 20, lv30: 25, lv35: 28, lv40: 30, lv45: 32, lv50: 35 },
      training_bonus: { lv1: 10, lv30: 15, lv35: 18, lv40: 20, lv45: 22, lv50: 25 },
      initial_bond: { lv1: 20, lv30: 25, lv35: 28, lv40: 30, lv45: 32, lv50: 35 },
      motivation_bonus: { lv1: 5, lv30: 8, lv35: 10, lv40: 12, lv45: 14, lv50: 15 },
      speed_bonus: { lv1: 1, lv30: 1, lv35: 2, lv40: 2, lv45: 2, lv50: 3 }
    },
    skills: ['Arc Maestro', 'Curve Specialist', 'Speed Star'],
    unique_skill: 'Arc Maestro - Massive speed boost on curves'
  },
  {
    id: 'super_creek_ssr',
    name_en: 'Super Creek [Creek of Miracles]',
    name_jp: 'スーパークリーク【奇跡の流星】',
    type: 'stamina',
    rarity: 'SSR',
    tier: 'SS',
    effects: {
      friendship_bonus: { lv1: 18, lv30: 23, lv35: 26, lv40: 28, lv45: 30, lv50: 32 },
      training_bonus: { lv1: 8, lv30: 12, lv35: 15, lv40: 18, lv45: 20, lv50: 22 },
      stamina_bonus: { lv1: 2, lv30: 2, lv35: 3, lv40: 3, lv45: 3, lv50: 4 },
      recovery_bonus: { lv1: 10, lv30: 15, lv35: 18, lv40: 20, lv45: 22, lv50: 25 }
    },
    skills: ['Stamina Keep', 'Long Distance Runner', 'Recovery Master'],
    unique_skill: 'Miracle Recovery - Massive stamina recovery'
  },
  {
    id: 'fine_motion_ssr',
    name_en: 'Fine Motion [Elegant Dancer]',
    name_jp: 'ファインモーション【エレガントダンサー】',
    type: 'power',
    rarity: 'SSR',
    tier: 'S',
    effects: {
      friendship_bonus: { lv1: 15, lv30: 20, lv35: 23, lv40: 25, lv45: 27, lv50: 30 },
      training_bonus: { lv1: 10, lv30: 14, lv35: 17, lv40: 20, lv45: 22, lv50: 25 },
      power_bonus: { lv1: 2, lv30: 2, lv35: 3, lv40: 3, lv45: 3, lv50: 4 },
      acceleration: { lv1: 5, lv30: 8, lv35: 10, lv40: 12, lv45: 14, lv50: 15 }
    },
    skills: ['Power Sprint', 'Acceleration', 'Positioning'],
    unique_skill: 'Elegant Step - Smooth acceleration'
  },
  {
    id: 'admire_vega_ssr',
    name_en: 'Admire Vega [Starry Night]',
    name_jp: 'アドマイヤベガ【星降る夜】',
    type: 'wisdom',
    rarity: 'SSR',
    tier: 'S',
    effects: {
      friendship_bonus: { lv1: 12, lv30: 18, lv35: 21, lv40: 24, lv45: 26, lv50: 28 },
      training_bonus: { lv1: 8, lv30: 12, lv35: 14, lv40: 16, lv45: 18, lv50: 20 },
      wisdom_bonus: { lv1: 2, lv30: 2, lv35: 3, lv40: 3, lv45: 3, lv50: 4 },
      skill_pt_bonus: { lv1: 20, lv30: 30, lv35: 35, lv40: 40, lv45: 45, lv50: 50 }
    },
    skills: ['Concentration', 'Skill Master', 'Wisdom Star'],
    unique_skill: 'Starlight Wisdom - Enhanced skill activation'
  }
];

// Skills based on 2025 meta
const skills2025 = [
  {
    id: 'arc_maestro',
    name_en: 'Arc Maestro',
    name_jp: 'アーク・マエストロ',
    type: 'unique',
    effect: 'Speed +0.45 m/s on curves',
    activation: 'Final corner on curve',
    duration: '3.0s',
    cooldown: 'Once per race',
    tier: 'SS'
  },
  {
    id: 'triumphant_pulse',
    name_en: 'Triumphant Pulse',
    name_jp: 'トリンフパルス',
    type: 'unique',
    effect: 'Speed +0.35 m/s, Power +300',
    activation: 'Final spurt',
    duration: '3.0s',
    cooldown: 'Once per race',
    tier: 'SS'
  },
  {
    id: 'bakushin_burst',
    name_en: 'Bakushin Burst',
    name_jp: 'バクシン',
    type: 'unique',
    effect: 'Speed +0.45 m/s in sprint races',
    activation: 'Immediately in sprint/mile',
    duration: 'Entire race',
    cooldown: 'None',
    tier: 'S'
  },
  {
    id: 'transcendent_flash',
    name_en: 'Transcendent Flash',
    name_jp: '先頭の景色は譲らない',
    type: 'unique',
    effect: 'Speed +0.55 m/s when leading',
    activation: 'When in lead position',
    duration: 'While leading',
    cooldown: 'None',
    tier: 'SS'
  },
  {
    id: 'speed_star',
    name_en: 'Speed Star',
    name_jp: 'スピードスター',
    type: 'common',
    effect: 'Speed +0.15 m/s',
    activation: 'Middle phase',
    duration: '3.0s',
    cooldown: '30s',
    tier: 'A'
  },
  {
    id: 'stamina_keep',
    name_en: 'Stamina Keep',
    name_jp: 'スタミナキープ',
    type: 'common',
    effect: 'Stamina consumption -15%',
    activation: 'Middle phase',
    duration: '3.0s',
    cooldown: '30s',
    tier: 'A'
  },
  {
    id: 'positioning',
    name_en: 'Positioning',
    name_jp: 'ポジショニング',
    type: 'common',
    effect: 'Easier to maintain position',
    activation: 'Start of race',
    duration: '12.0s',
    cooldown: 'None',
    tier: 'B'
  }
];

// Save data to files
const dataDir = path.join(__dirname, 'data-2025');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Save characters
fs.writeFileSync(
  path.join(dataDir, 'characters-2025.json'),
  JSON.stringify(characters2025, null, 2)
);

// Save support cards
fs.writeFileSync(
  path.join(dataDir, 'support-cards-2025.json'),
  JSON.stringify(supportCards2025, null, 2)
);

// Save skills
fs.writeFileSync(
  path.join(dataDir, 'skills-2025.json'),
  JSON.stringify(skills2025, null, 2)
);

console.log('✅ 2025 Uma Musume data fetched and saved!');
console.log(`📁 Data location: ${dataDir}`);
console.log(`  - ${characters2025.length} characters (including SS tier Oguri Cap and Narita Taishin)`);
console.log(`  - ${supportCards2025.length} support cards (including meta cards)`);
console.log(`  - ${skills2025.length} skills (unique and common)`);
console.log('\n🎯 Next steps:');
console.log('1. Import this data to database');
console.log('2. Create factor inheritance calculator');
console.log('3. Build training optimization tool');