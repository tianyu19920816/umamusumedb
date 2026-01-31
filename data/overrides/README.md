# Data Overrides（可选的数据补丁）

本目录用于**可选**地覆盖/补充 `public/data/*.json` 的字段，用来快速丰富站点内容（例如：国际版译名、补充 CV / 生日、修正技能描述等）。

> 重要：请确保你导入/填写的数据来源**合法**且你拥有使用权。本仓库不提供、也不建议通过解包/逆向获取受版权保护的游戏资源。

## 用法

1. 在 `data/overrides/` 下创建同名 JSON 文件（例如 `characters.json`）。
2. 写入覆盖内容（推荐使用 **id -> patch** 的对象形式）。
3. 运行：

```bash
npm run data:overrides
```

脚本会将补丁合并到 `public/data/*.json`（原数组结构保持不变，匹配到 id 会覆盖字段；找不到 id 会新增记录）。

## 支持的文件

- `data/overrides/characters.json` → 覆盖 `public/data/characters.json`
- `data/overrides/supportCards.json` → 覆盖 `public/data/supportCards.json`
- `data/overrides/skills.json` → 覆盖 `public/data/skills.json`

## 示例

### `data/overrides/characters.json`

```json
{
  "silence_suzuka_2025": {
    "birthday": "May 1",
    "cv": "Marika Kouno",
    "name_en": "Silence Suzuka"
  }
}
```

### `data/overrides/supportCards.json`

```json
{
  "kitasan_black_ssr": {
    "release_date": "2025-10-01"
  }
}
```

### `data/overrides/skills.json`

```json
{
  "arc_maestro": {
    "description_en": "Speed +0.45 m/s on corners (approx.)"
  }
}
```







