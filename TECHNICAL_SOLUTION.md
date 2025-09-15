# UmamusumeDB Cloudflare Workers 技术方案

## 1. 技术栈选择

### 1.1 核心技术栈
```
前端框架: Astro + React Components
API框架: Hono (Edge-first Web Framework)
部署平台: Cloudflare Pages + Workers
数据库: Cloudflare D1 (SQLite)
对象存储: Cloudflare R2
缓存: Cloudflare KV Store
CDN: Cloudflare CDN (自带)
搜索: Cloudflare Workers AI
分析: Cloudflare Analytics
```

### 1.2 选择理由
- **Astro**: 静态优先，支持岛屿架构，SEO友好，原生支持Cloudflare
- **Hono**: 专为Edge Runtime设计，极速启动，TypeScript优先
- **全Cloudflare生态**: 零冷启动，全球边缘部署，成本极低

## 2. 项目架构

### 2.1 目录结构
```
umamusumedb/
├── src/
│   ├── pages/                 # Astro页面
│   │   ├── index.astro        # 首页
│   │   ├── characters/        # 角色页面
│   │   ├── cards/            # 支援卡页面
│   │   └── tools/            # 工具页面
│   ├── components/            # React组件
│   │   ├── CharacterCard.tsx
│   │   ├── TierList.tsx
│   │   └── TeamBuilder.tsx
│   ├── layouts/              # 页面布局
│   ├── api/                  # Hono API路由
│   │   ├── index.ts         # API入口
│   │   ├── routes/          # API路由
│   │   └── middleware/      # 中间件
│   └── lib/                  # 工具函数
├── database/
│   ├── schema.sql           # D1数据库结构
│   ├── migrations/          # 数据库迁移
│   └── seeds/              # 初始数据
├── public/                  # 静态资源
├── wrangler.toml           # Workers配置
├── astro.config.mjs        # Astro配置
└── package.json
```

### 2.2 架构图
```
┌─────────────────────────────────────────┐
│            Cloudflare CDN               │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Cloudflare Pages                │
│         (Astro静态站点)                  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Cloudflare Workers               │
│         (Hono API服务)                   │
└────┬───────┬────────┬──────────┬────────┘
     │       │        │          │
┌────▼──┐ ┌─▼──┐ ┌──▼───┐ ┌────▼────┐
│  D1   │ │ KV │ │  R2  │ │Workers AI│
└───────┘ └────┘ └──────┘ └──────────┘
```

## 3. 数据存储方案

### 3.1 D1 数据库设计
```sql
-- 角色表
CREATE TABLE characters (
    id TEXT PRIMARY KEY,
    name_jp TEXT NOT NULL,
    name_en TEXT NOT NULL,
    rarity INTEGER,
    attributes JSON,
    skills JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 支援卡表
CREATE TABLE support_cards (
    id TEXT PRIMARY KEY,
    name_jp TEXT NOT NULL,
    name_en TEXT NOT NULL,
    type TEXT,
    rarity INTEGER,
    effects JSON,
    skills JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tier List表
CREATE TABLE tier_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    item_id TEXT NOT NULL,
    tier TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户数据表（简化版）
CREATE TABLE user_data (
    user_id TEXT PRIMARY KEY,
    preferences JSON,
    saved_teams JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 KV Store 使用策略
```typescript
// 缓存策略
const CACHE_KEYS = {
  TIER_LIST: 'tier_list:v1',
  CHARACTER_LIST: 'characters:all',
  HOT_TEAMS: 'teams:hot:daily',
  API_CACHE: 'api:cache:'
};

// 缓存时间
const TTL = {
  STATIC_DATA: 86400,    // 24小时
  TIER_LIST: 3600,       // 1小时
  API_CACHE: 300,        // 5分钟
};
```

### 3.3 R2 存储策略
```
/images/
  /characters/     # 角色图片
  /cards/         # 支援卡图片
  /skills/        # 技能图标
/data/
  /backups/       # 数据备份
  /exports/       # 用户导出数据
```

## 4. API设计

### 4.1 Hono路由结构
```typescript
// src/api/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';

const app = new Hono<{ Bindings: Env }>();

// 中间件
app.use('*', cors());
app.use('/api/*', cache({ cacheName: 'api-cache' }));

// 路由
app.route('/api/characters', charactersRoute);
app.route('/api/cards', cardsRoute);
app.route('/api/tier-list', tierListRoute);
app.route('/api/team-builder', teamBuilderRoute);
app.route('/api/search', searchRoute);

export default app;
```

### 4.2 API端点设计
```typescript
// 角色相关
GET  /api/characters              # 获取所有角色
GET  /api/characters/:id          # 获取单个角色
GET  /api/characters/search       # 搜索角色

// 支援卡相关
GET  /api/cards                   # 获取所有支援卡
GET  /api/cards/:id              # 获取单个支援卡
GET  /api/cards/search           # 搜索支援卡

// Tier List
GET  /api/tier-list/:category    # 获取分类排行
POST /api/tier-list/vote         # 投票
GET  /api/tier-list/trending     # 热门排行

// 工具API
POST /api/team-builder/optimize   # 队伍优化
POST /api/training/simulate      # 培养模拟
POST /api/inheritance/calculate  # 继承计算

// AI功能
POST /api/ai/recommend-deck      # AI卡组推荐
POST /api/ai/analyze-team       # AI队伍分析
```

## 5. 前端实现

### 5.1 Astro配置
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    mode: 'directory',
  }),
  integrations: [
    react(),
    tailwind(),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja', 'zh'],
  }
});
```

### 5.2 页面结构
```astro
---
// src/pages/characters/[id].astro
import Layout from '@/layouts/Layout.astro';
import CharacterDetail from '@/components/CharacterDetail';

const { id } = Astro.params;
const character = await fetchCharacter(id);
---

<Layout title={character.name}>
  <CharacterDetail character={character} client:load />
</Layout>
```

### 5.3 组件示例
```tsx
// src/components/TierList.tsx
import { useState, useEffect } from 'react';

export default function TierList({ category }) {
  const [tierData, setTierData] = useState([]);
  
  useEffect(() => {
    fetch(`/api/tier-list/${category}`)
      .then(res => res.json())
      .then(setTierData);
  }, [category]);

  return (
    <div className="tier-list">
      {/* 渲染Tier List */}
    </div>
  );
}
```

## 6. Workers配置

### 6.1 wrangler.toml
```toml
name = "umamusumedb"
main = "src/api/index.ts"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[[d1_databases]]
binding = "DB"
database_name = "umamusumedb"
database_id = "xxx"

[[kv_namespaces]]
binding = "CACHE"
id = "xxx"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "umamusumedb-assets"

[ai]
binding = "AI"

[analytics_engine_datasets]
binding = "ANALYTICS"
```

### 6.2 环境变量类型
```typescript
// src/types/env.d.ts
interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  STORAGE: R2Bucket;
  AI: Ai;
  ANALYTICS: AnalyticsEngineDataset;
  
  // 环境变量
  ENVIRONMENT: 'development' | 'production';
  API_VERSION: string;
}
```

## 7. 性能优化

### 7.1 边缘缓存策略
```typescript
// 多层缓存
const getCachedData = async (key: string) => {
  // 1. 内存缓存
  if (memCache.has(key)) {
    return memCache.get(key);
  }
  
  // 2. KV缓存
  const kvData = await env.CACHE.get(key, 'json');
  if (kvData) {
    memCache.set(key, kvData);
    return kvData;
  }
  
  // 3. 数据库查询
  const dbData = await queryDatabase(key);
  
  // 写入缓存
  await env.CACHE.put(key, JSON.stringify(dbData), {
    expirationTtl: 3600
  });
  
  return dbData;
};
```

### 7.2 图片优化
```typescript
// 使用Cloudflare Image Resizing
const getOptimizedImage = (path: string, options: ImageOptions) => {
  const params = new URLSearchParams({
    width: options.width,
    quality: options.quality || '85',
    format: 'auto'
  });
  
  return `/cdn-cgi/image/${params}/${path}`;
};
```

### 7.3 静态生成优化
```javascript
// 预渲染热门页面
export const prerender = true;
export async function getStaticPaths() {
  const characters = await getPopularCharacters();
  return characters.map(char => ({
    params: { id: char.id }
  }));
}
```

## 8. 开发工作流

### 8.1 本地开发
```bash
# 安装依赖
npm install

# 启动本地开发
npm run dev

# 本地D1数据库
wrangler d1 execute umamusumedb --local --file=./database/schema.sql

# 本地测试
npm run test
```

### 8.2 部署流程
```bash
# 构建
npm run build

# 部署到预览环境
wrangler pages deploy dist --project-name=umamusumedb --branch=preview

# 部署到生产环境
wrangler pages deploy dist --project-name=umamusumedb --branch=main

# 数据库迁移
wrangler d1 migrations apply umamusumedb
```

### 8.3 CI/CD配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx wrangler pages deploy dist
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

## 9. 成本估算

### 9.1 Cloudflare免费额度
- Workers: 100,000请求/天
- D1: 5GB存储 + 5百万读取/月
- KV: 1GB存储 + 10万读取/天
- R2: 10GB存储 + 无出站费用
- Pages: 无限站点 + 500次构建/月

### 9.2 预计成本（月）
```
初期（<10k DAU）: $0（免费额度足够）
成长期（10-50k DAU）: $5-20
成熟期（>50k DAU）: $50-200
```

## 10. 监控与分析

### 10.1 性能监控
```typescript
// 请求性能追踪
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  
  c.env.ANALYTICS.writeDataPoint({
    blobs: [c.req.path],
    doubles: [duration],
    indexes: [c.res.status.toString()]
  });
});
```

### 10.2 错误追踪
```typescript
// 全局错误处理
app.onError((err, c) => {
  console.error(`Error in ${c.req.path}:`, err);
  
  // 记录到Analytics
  c.env.ANALYTICS.writeDataPoint({
    blobs: [err.message, err.stack],
    indexes: ['error']
  });
  
  return c.json({ error: 'Internal Server Error' }, 500);
});
```

## 11. 安全措施

### 11.1 速率限制
```typescript
import { rateLimiter } from 'hono-rate-limiter';

app.use('/api/*', rateLimiter({
  windowMs: 60 * 1000,  // 1分钟
  limit: 100,            // 100请求
  keyGenerator: (c) => c.req.header('CF-Connecting-IP'),
}));
```

### 11.2 输入验证
```typescript
import { z } from 'zod';

const TeamSchema = z.object({
  characters: z.array(z.string()).max(15),
  strategy: z.enum(['balanced', 'speed', 'stamina'])
});

app.post('/api/team-builder', async (c) => {
  const body = await c.req.json();
  const validated = TeamSchema.parse(body);
  // 处理验证后的数据
});
```

## 12. 开发计划

### 第1周：环境搭建
- [ ] 初始化项目结构
- [ ] 配置Cloudflare账号
- [ ] 搭建本地开发环境
- [ ] 创建基础页面框架

### 第2-3周：数据层开发
- [ ] 设计D1数据库schema
- [ ] 实现数据导入脚本
- [ ] 开发基础API接口
- [ ] 配置缓存策略

### 第4-5周：核心功能
- [ ] 角色数据库页面
- [ ] 支援卡数据库页面
- [ ] Tier List功能
- [ ] 搜索功能实现

### 第6-8周：高级功能
- [ ] 队伍构建器
- [ ] 培养模拟器
- [ ] AI推荐系统
- [ ] 用户系统

### 第9-10周：优化发布
- [ ] 性能优化
- [ ] SEO优化
- [ ] 多语言支持
- [ ] 正式发布

## 13. 技术优势总结

1. **零冷启动**: Workers边缘计算，全球低延迟
2. **成本极低**: 充分利用免费额度，按需付费
3. **维护简单**: 无服务器架构，自动扩展
4. **SEO友好**: Astro静态生成，完美SEO
5. **开发效率**: TypeScript全栈，类型安全
6. **性能卓越**: 边缘缓存，CDN加速

---

*版本: 1.0*
*最后更新: 2025年1月*