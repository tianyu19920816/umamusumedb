import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supportCardsPath = path.join(__dirname, '../public/data/support-cards.json');
const cards = JSON.parse(fs.readFileSync(supportCardsPath, 'utf8'));

console.log(`处理 ${cards.length} 张支援卡配图...`);

// 修正配图策略:
// 1. 对于有image_url的旧卡,保持R2 URL但使用正确的路径格式
// 2. 对于image_url为null的新卡,设置为null让前端使用PlaceholderImage组件

const R2_BASE_URL = 'https://pub-164966093c05481cab53a3e8cd2c7d2d.r2.dev';

const updatedCards = cards.map(card => {
  const updated = { ...card };

  // 如果已经有R2 URL,确保格式正确
  if (updated.image_url && updated.image_url.includes('r2.dev')) {
    // 保持现有的R2 URL格式
    // 路径应该是: /support-cards/{card_id}.png
    updated.image_url = `${R2_BASE_URL}/support-cards/${card.id}.png`;
  }
  // 如果是null,保持null(前端会显示占位图)
  else if (!updated.image_url || updated.image_url === 'null') {
    updated.image_url = null;
  }

  return updated;
});

// 统计
const withImages = updatedCards.filter(c => c.image_url !== null).length;
const withoutImages = updatedCards.filter(c => c.image_url === null).length;

console.log(`✅ 配图处理完成!`);
console.log(`   有配图URL: ${withImages}张 (使用R2 CDN)`);
console.log(`   无配图URL: ${withoutImages}张 (将显示占位图)`);

// 写入文件
fs.writeFileSync(
  supportCardsPath,
  JSON.stringify(updatedCards, null, 2),
  'utf8'
);

console.log(`\n📝 说明:`);
console.log(`   - R2 CDN地址: ${R2_BASE_URL}/support-cards/`);
console.log(`   - 占位图将自动生成(彩色渐变 + 卡片名称首字母)`);
console.log(`   - 如需上传真实图片,请将PNG文件上传到R2存储桶的support-cards/目录`);