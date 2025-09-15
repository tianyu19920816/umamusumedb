# UmamusumeDB 部署指南

## 项目架构

本项目是一个**纯静态网站**，使用以下技术栈：
- **前端**: Astro (静态站点生成器) + React + Tailwind CSS
- **数据**: 静态 JSON 文件（构建时生成）
- **图片存储**: Cloudflare R2
- **部署**: Cloudflare Pages

## 前置要求

1. Cloudflare 账号
2. Node.js 18+
3. Wrangler CLI (`npm install -g wrangler`)

## 部署步骤

### 1. 首次设置

#### 1.1 登录 Cloudflare
```bash
wrangler login
```

#### 1.2 创建 R2 Bucket（用于图片存储）
```bash
wrangler r2 bucket create umamusumedb-assets
```

#### 1.3 获取 R2 凭证
在 Cloudflare Dashboard > R2 > Manage R2 API Tokens 创建 API Token

#### 1.4 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 填入你的 R2 凭证
```

### 2. 部署网站

#### 2.1 自动部署（推荐）
```bash
# 部署到生产环境
./deploy.sh

# 部署到预览环境
./deploy.sh preview
```

#### 2.2 手动部署
```bash
# 1. 导出数据
npm run data:update

# 2. 构建网站
npm run build

# 3. 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=umamusumedb
```

### 3. 上传图片到 R2（可选）

如果你有角色和卡片图片：

```bash
# 1. 将图片放到对应目录
# public/images/characters/
# public/images/support-cards/
# public/images/skills/

# 2. 运行上传脚本
npm run images:upload

# 3. 重新构建和部署
npm run deploy
```

## 访问地址

部署成功后，你的网站将在以下地址可访问：

- **生产环境**: `https://umamusumedb.pages.dev`
- **预览环境**: `https://preview.umamusumedb.pages.dev`
- **自定义域名**: 在 Cloudflare Pages 设置中配置

## 数据更新

### 更新角色/卡片数据
```bash
# 1. 修改数据收集脚本
node scripts/collect-characters.js
node scripts/collect-support-cards.js

# 2. 导出为 JSON
npm run data:update

# 3. 重新部署
npm run deploy
```

## 项目结构

```
umamusumedb/
├── src/
│   ├── pages/         # 页面（静态生成）
│   ├── components/    # React 组件
│   └── lib/          # 工具函数
├── public/
│   └── data/         # JSON 数据文件
├── scripts/          # 数据处理脚本
├── dist/            # 构建输出
└── deploy.sh        # 部署脚本
```

## 常见问题

### Q: 为什么选择静态站点？
A: 
- 无服务器成本
- CDN 全球加速
- 高可用性（99.99%）
- 简单维护

### Q: 数据如何更新？
A: 所有数据在构建时生成为 JSON，更新数据需要重新构建和部署。

### Q: 图片存储在哪里？
A: 图片存储在 Cloudflare R2，通过 CDN 分发，无出站流量费用。

### Q: 可以添加动态功能吗？
A: 可以通过 Cloudflare Workers 添加 API，但当前版本是纯静态的。

## 成本估算

使用 Cloudflare 免费计划可以支持：
- **Pages**: 500 次构建/月，无限请求
- **R2**: 10GB 存储，1000万次请求/月
- **带宽**: 无限（通过 Cloudflare CDN）

对于大多数用例完全免费！

## 支持

如有问题，请查看：
- [CLAUDE.md](./CLAUDE.md) - 项目技术文档
- [README.md](./README.md) - 项目说明