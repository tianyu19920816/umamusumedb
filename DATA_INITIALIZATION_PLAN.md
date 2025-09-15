# UmamusumeDB 数据初始化方案

## 可立即执行的数据获取方案

基于研究，我设计了一个可以由我直接执行并完成初始化的方案，使用公开可访问的数据源。

## 1. 数据源组合

### 主要数据源
1. **umapyoi.net API** - 提供角色、服装、音乐等基础数据
2. **Game8/GameWith** - 爬取Tier List和攻略数据
3. **GitHub翻译项目** - 获取英文翻译数据
4. **社区Wiki** - 补充技能和支援卡数据

## 2. 初始化脚本架构

```javascript
// data-init.js - 数据初始化主脚本
const dataCollector = {
  // 1. 从umapyoi.net获取角色数据
  async fetchCharacters() {
    const characters = [];
    // 获取所有角色ID
    const response = await fetch('https://umapyoi.net/api/v1/outfit');
    const outfitIds = await response.json();
    
    // 批量获取角色详情
    for (const id of outfitIds) {
      const detail = await fetch(`https://umapyoi.net/api/v1/outfit/${id}`);
      characters.push(await detail.json());
    }
    return characters;
  },

  // 2. 爬取Game8的Tier List
  async fetchTierList() {
    // 使用puppeteer或playwright爬取
    const tierData = await scrapeGame8TierList();
    return tierData;
  },

  // 3. 从GitHub获取翻译数据
  async fetchTranslations() {
    const urls = [
      'https://raw.githubusercontent.com/UmaTL/hachimi-tl-en/main/translations.json',
      'https://raw.githubusercontent.com/FabulousCupcake/umamusume-db-translate/main/src/data/text_data.csv'
    ];
    
    const translations = {};
    for (const url of urls) {
      const data = await fetch(url).then(r => r.text());
      // 处理并合并翻译数据
    }
    return translations;
  },

  // 4. 生成静态JSON文件
  async generateStaticData() {
    const data = {
      characters: await this.fetchCharacters(),
      tierList: await this.fetchTierList(),
      translations: await this.fetchTranslations(),
      lastUpdated: new Date().toISOString()
    };
    
    // 保存到本地文件
    fs.writeFileSync('./data/initial-data.json', JSON.stringify(data));
    
    // 上传到R2
    await uploadToR2('initial-data.json', data);
    
    return data;
  }
};
```

## 3. 具体实施步骤

### 步骤1: 创建数据采集脚本
```bash
# 创建项目目录
mkdir -p data-collection
cd data-collection

# 初始化npm项目
npm init -y

# 安装必要依赖
npm install node-fetch cheerio playwright dotenv
```

### 步骤2: 角色数据采集
```javascript
// characters-collector.js
import fetch from 'node-fetch';
import fs from 'fs/promises';

async function collectCharacterData() {
  const characters = [];
  
  // 1. 基础角色列表（硬编码主要角色）
  const mainCharacters = [
    { id: 'special_week', name_en: 'Special Week', name_jp: 'スペシャルウィーク' },
    { id: 'silence_suzuka', name_en: 'Silence Suzuka', name_jp: 'サイレンススズカ' },
    { id: 'tokai_teio', name_en: 'Tokai Teio', name_jp: 'トウカイテイオー' },
    { id: 'vodka', name_en: 'Vodka', name_jp: 'ウオッカ' },
    { id: 'gold_ship', name_en: 'Gold Ship', name_jp: 'ゴールドシップ' },
    // ... 更多角色
  ];
  
  // 2. 从umapyoi API获取详细数据
  try {
    const response = await fetch('https://umapyoi.net/characters');
    // 解析HTML页面获取角色列表
    // 这里需要使用cheerio解析
  } catch (error) {
    console.log('使用备用数据');
    characters.push(...mainCharacters);
  }
  
  // 3. 保存数据
  await fs.writeFile(
    './data/characters.json',
    JSON.stringify(characters, null, 2)
  );
  
  return characters;
}
```

### 步骤3: 支援卡数据采集
```javascript
// support-cards-collector.js
async function collectSupportCards() {
  // 支援卡基础数据结构
  const supportCards = [
    {
      id: 'kitasan_black_ssr',
      name_en: 'Kitasan Black',
      name_jp: 'キタサンブラック',
      type: 'speed',
      rarity: 'SSR',
      effects: {
        speed_bonus: 10,
        friendship_bonus: 35,
        training_bonus: 15
      }
    },
    // ... 更多支援卡
  ];
  
  await fs.writeFile(
    './data/support-cards.json',
    JSON.stringify(supportCards, null, 2)
  );
  
  return supportCards;
}
```

### 步骤4: Tier List数据采集
```javascript
// tierlist-collector.js
import { chromium } from 'playwright';

async function collectTierList() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 访问Game8的Tier List页面
  await page.goto('https://game8.co/games/Umamusume-Pretty-Derby/archives/536352');
  
  // 提取Tier List数据
  const tierList = await page.evaluate(() => {
    const tiers = {};
    // 解析页面DOM获取数据
    // 这里需要根据实际页面结构调整
    document.querySelectorAll('.tier-section').forEach(section => {
      const tier = section.querySelector('.tier-label').textContent;
      const characters = Array.from(section.querySelectorAll('.character-name'))
        .map(el => el.textContent);
      tiers[tier] = characters;
    });
    return tiers;
  });
  
  await browser.close();
  
  await fs.writeFile(
    './data/tier-list.json',
    JSON.stringify(tierList, null, 2)
  );
  
  return tierList;
}
```

### 步骤5: 技能数据采集
```javascript
// skills-collector.js
async function collectSkills() {
  // 基础技能数据
  const skills = [
    {
      id: 'curve_maestro',
      name_en: 'Curve Maestro',
      name_jp: 'コーナー巧者',
      effect: 'Increases speed when cornering',
      activation: 'passive'
    },
    {
      id: 'escape_artist',
      name_en: 'Escape Artist',
      name_jp: '逃げのコツ',
      effect: 'Improves escape strategy effectiveness',
      activation: 'passive'
    },
    // ... 更多技能
  ];
  
  await fs.writeFile(
    './data/skills.json',
    JSON.stringify(skills, null, 2)
  );
  
  return skills;
}
```

### 步骤6: 整合所有数据
```javascript
// main-collector.js
import { collectCharacterData } from './characters-collector.js';
import { collectSupportCards } from './support-cards-collector.js';
import { collectTierList } from './tierlist-collector.js';
import { collectSkills } from './skills-collector.js';

async function initializeAllData() {
  console.log('开始数据初始化...');
  
  const results = await Promise.allSettled([
    collectCharacterData(),
    collectSupportCards(),
    collectTierList(),
    collectSkills()
  ]);
  
  // 合并所有数据
  const database = {
    characters: results[0].value || [],
    supportCards: results[1].value || [],
    tierList: results[2].value || {},
    skills: results[3].value || [],
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      sources: [
        'umapyoi.net',
        'game8.co',
        'community contributions'
      ]
    }
  };
  
  // 保存完整数据库
  await fs.writeFile(
    './data/complete-database.json',
    JSON.stringify(database, null, 2)
  );
  
  console.log('数据初始化完成！');
  return database;
}

// 执行初始化
initializeAllData();
```

## 4. Cloudflare D1 数据库初始化

```sql
-- schema.sql
-- 角色表
CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_jp TEXT NOT NULL,
    rarity INTEGER DEFAULT 3,
    attributes JSON,
    skills JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 支援卡表
CREATE TABLE IF NOT EXISTS support_cards (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_jp TEXT NOT NULL,
    type TEXT CHECK(type IN ('speed', 'stamina', 'power', 'guts', 'wisdom')),
    rarity TEXT CHECK(rarity IN ('R', 'SR', 'SSR')),
    effects JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tier List表
CREATE TABLE IF NOT EXISTS tier_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT CHECK(item_type IN ('character', 'support_card')),
    item_id TEXT NOT NULL,
    category TEXT NOT NULL,
    tier TEXT CHECK(tier IN ('SS', 'S', 'A', 'B', 'C')),
    votes INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- 技能表
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_jp TEXT NOT NULL,
    effect TEXT,
    activation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 5. 数据导入脚本

```javascript
// import-to-d1.js
import { readFile } from 'fs/promises';

async function importToD1(env) {
  const data = JSON.parse(
    await readFile('./data/complete-database.json', 'utf-8')
  );
  
  // 批量插入角色
  const characterInserts = data.characters.map(char => 
    env.DB.prepare(`
      INSERT INTO characters (id, name_en, name_jp, attributes, skills)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      char.id,
      char.name_en,
      char.name_jp,
      JSON.stringify(char.attributes || {}),
      JSON.stringify(char.skills || [])
    )
  );
  
  await env.DB.batch(characterInserts);
  
  // 批量插入支援卡
  const cardInserts = data.supportCards.map(card =>
    env.DB.prepare(`
      INSERT INTO support_cards (id, name_en, name_jp, type, rarity, effects)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      card.id,
      card.name_en,
      card.name_jp,
      card.type,
      card.rarity,
      JSON.stringify(card.effects || {})
    )
  );
  
  await env.DB.batch(cardInserts);
  
  console.log('数据导入D1完成！');
}
```

## 6. 执行计划

我可以立即执行以下步骤：

1. **创建项目结构和依赖** - 5分钟
2. **编写数据采集脚本** - 10分钟
3. **执行数据采集** - 15分钟
4. **生成静态JSON文件** - 5分钟
5. **创建D1数据库结构** - 5分钟
6. **导入数据到D1** - 10分钟

总计：约50分钟完成初始化

## 7. 数据更新策略

```javascript
// update-scheduler.js
// 使用GitHub Actions每日自动更新
name: 'Update Game Data'
on:
  schedule:
    - cron: '0 0 * * *' # 每天UTC 0点
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: node scripts/main-collector.js
      - run: npx wrangler d1 execute umamusumedb --file=./data/import.sql
```

## 8. 备用方案

如果某些数据源不可用，使用以下备用方案：

1. **静态数据文件** - 预先准备的JSON文件
2. **社区贡献** - 允许用户提交数据
3. **手动维护** - 重要数据手动更新

---

此方案可以立即执行，不依赖需要特殊权限的数据源，使用公开可访问的API和网页数据。