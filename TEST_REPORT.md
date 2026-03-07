# UmamusumeDB 功能测试报告

## 测试概述

为 umamusumedb 赛马娘数据库项目的三个新功能编写了全面的单元测试。

---

## 测试统计

| 测试文件 | 测试数量 | 状态 |
|---------|---------|------|
| CharacterComparisonTool.test.ts | 15 | ✅ 通过 |
| SkillFilter.test.ts | 29 | ✅ 通过 |
| SupportDeckBuilder.test.ts | 25 | ✅ 通过 |
| **总计** | **69** | **✅ 全部通过** |

---

## 功能 1: 角色对比工具 (`CharacterComparisonTool`)

### 测试覆盖范围

#### 数据处理器测试
- ✅ 最佳初始属性计算
- ✅ 最佳最大属性计算
- ✅ 空角色数组处理
- ✅ 单角色处理

#### 适性计算测试
- ✅ 跨角色最佳适性查找
- ✅ 空数组适性处理
- ✅ 适性值比较逻辑

#### 辅助函数测试
- ✅ 成长率颜色类返回
- ✅ 适性格式化
- ✅ 缺失可选字段处理

#### 数据验证测试
- ✅ 总属性计算
- ✅ 搜索查询匹配
- ✅ 部分匹配处理
- ✅ 最高属性识别
- ✅ 缺失属性处理

### 关键测试用例

```typescript
// 最佳属性计算
const bestStats = calculateBestStats(mockCharacters);
expect(bestStats?.initial.speed).toBe(100); // char_1 has highest speed
expect(bestStats?.initial.stamina).toBe(100); // char_2 has highest stamina

// 适性比较
expect(getAptitudeValue('S')).toBe(0);
expect(getAptitudeValue('A')).toBe(1);
expect(getAptitudeValue('G')).toBe(7);
```

---

## 功能 2: 技能筛选器 (`SkillFilter`)

### 测试覆盖范围

#### 阶段推断测试 (8项)
- ✅ 触发条件阶段识别（Start/Middle/Final/Corner/Straight）
- ✅ 边界情况处理

#### 距离推断测试 (3项)
- ✅ 触发条件/效果距离识别
- ✅ 触发条件优先级

#### 跑法推断测试 (3项)
- ✅ 逃/先/差/追识别
- ✅ 追赶相关触发检测

#### 效果类型推断测试 (3项)
- ✅ 速度/加速度/耐力/力量/位置/全属性分类
- ✅ 耐力相关效果处理

#### 筛选组合测试 (8项)
- ✅ 单个筛选器（稀有度/类型/阶段/距离/效果）
- ✅ 多筛选器组合
- ✅ "all" 值返回全部

#### 搜索功能测试 (7项)
- ✅ 英文名搜索
- ✅ 日文名搜索
- ✅ 效果文本搜索
- ✅ 触发条件搜索
- ✅ 大小写不敏感
- ✅ 无匹配返回空
- ✅ 空查询返回全部

#### 边界情况测试 (5项)
- ✅ 缺失可选字段
- ✅ 空技能数组
- ✅ 搜索+筛选组合
- ✅ 结果计数验证
- ✅ 标签生成

### 关键测试用例

```typescript
// 阶段推断
expect(inferPhase({ trigger_condition: 'Middle phase' })).toBe('middle');
expect(inferPhase({ trigger_condition: 'Last 200m' })).toBe('final');

// 多筛选器组合
const result = filterSkills(mockSkills, '', 'A', 'common', 'middle', 'all', 'all', 'all');
expect(result.every(s => s.rarity === 'A' && s.skill_type === 'common')).toBe(true);
```

---

## 功能 3: 支援卡评分系统 (`SupportDeckBuilder`)

### 测试覆盖范围

#### 卡片评分测试 (8项)
- ✅ SSR/SR/R 卡片分数计算
- ✅ 最小效果卡片处理
- ✅ 分数上限处理
- ✅ Friend卡额外加成

#### 等级分类测试 (3项)
- ✅ SS等级 (>=70分)
- ✅ S等级 (55-69分)
- ✅ C等级 (<25分)

#### 卡组分析测试 (7项)
- ✅ 总加成计算
- ✅ 类型平衡
- ✅ 协同分数
- ✅ 空卡组处理
- ✅ LB等级因子

#### 推荐生成测试 (3项)
- ✅ Friend卡推荐
- ✅ 空卡组建议
- ✅ 类型多样性检测

#### 模板应用测试 (4项)
- ✅ Speed Focus模板
- ✅ Balanced模板
- ✅ 最高评分卡片选择

#### 效果提取测试 (3项)
- ✅ 数值效果值
- ✅ 对象效果值 (lv50)
- ✅ 缺失效果处理

### 关键测试用例

```typescript
// 卡片评分
const score = calculateCardScore(mockSupportCards[0]);
expect(score.breakdown.rarityScore).toBe(30);
expect(score.breakdown.friendshipScore).toBe(18);
expect(score.tier).toBe('SS');

// 卡组分析
const analysis = analyzeDeck(deck);
expect(analysis.totalBonus.friendship).toBe(55);
expect(analysis.synergyScore).toBe(45);

// 模板应用
const selected = applyTemplate(template, availableCards, lockedSlots);
expect(selected.length).toBeGreaterThanOrEqual(1);
```

---

## 评分算法验证

### 支援卡评分公式

```
总分 = 稀有度分(SSR=30, SR=15, R=5)
     + min(友情加成×0.5, 25)
     + min(训练加成×0.6, 20)
     + min(技能点×0.1, 15)
     + 干劲加成×0.5
     + Friend卡额外分(10)
```

### 等级划分

| 等级 | 分数范围 |
|-----|---------|
| SS | >= 70 |
| S | 55-69 |
| A | 40-54 |
| B | 25-39 |
| C | < 25 |

---

## 运行测试

```bash
# 运行所有测试
npm test

# 监视模式
npm run test:watch

# UI 模式
npm run test:ui

# 覆盖率报告
npm test -- --coverage
```

---

## 测试文件位置

```
src/
├── components/tools/__tests__/
│   ├── CharacterComparisonTool.test.ts    (15 tests)
│   └── SupportDeckBuilder.test.ts         (25 tests)
└── pages/skills/__tests__/
    └── SkillFilter.test.ts                (29 tests)
```

---

## 测试环境

- **测试框架**: Vitest 4.0.18
- **环境**: happy-dom
- **断言库**: 内置 Vitest
- **总测试数**: 69
- **通过率**: 100%

---

## 数据准确性验证

所有测试使用与生产代码相同的数据结构和算法：

1. **角色数据**: `Character` 类型 + `DEFAULT_STATS` / `DEFAULT_APTITUDES`
2. **技能数据**: `Skill` 类型 + 推断辅助函数
3. **支援卡数据**: `SupportCard` 类型 + `calculateCardScore` 函数

测试验证了关键业务逻辑的正确性和边界情况处理。
