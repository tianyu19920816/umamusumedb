# UmamusumeDB 改进计划

> 所有涉及赛马娘资料的调整都会在执行阶段通过网络检索获得权威依据，并在实现记录中注明来源。

## 任务清单

1. **修复 SupportDeckBuilder 占位图参数缺失** ✅ *(完成)*
   - 在 `src/components/tools/SupportDeckBuilder.tsx` 为占位图补齐 `name`、`rarity`，确保类型检查通过与占位渲染正常。
2. **修正角色页面战术判定逻辑** ✅ *(完成)*
   - 资料来源：アルテマ脚質分类（https://altema.jp/umamusume/saikyo，经 r.jina.ai 抓取）。
   - 将 `getBestStrategy` 的脚质键更新为 `escape/lead/between/chase`，并输出对应英文名称。
3. **建立统一数据类型与解析工具** ✅ *(完成)*
   - 新增 `src/types/index.ts` 汇总角色、支援卡、技能、榜单等数据接口。
   - 引入 `src/lib/parse-json-field.ts`，统一处理字符串化 JSON 字段并输出告警。
   - 更新 `src/lib/static-content.ts`、`src/components/CharacterCard.tsx`、`src/components/SupportCardCard.tsx`、`src/components/tools/SkillBuilder.tsx` 使用新类型。
4. **优化搜索与数据加载性能** ✅ *(完成)*
   - 新增 `scripts/generate-search-data.mjs` 在构建前生成轻量 `public/search-data.json`。
   - `Header` 搜索模块改用本地缓存 + 6 小时 TTL，并在离线时提供基础导航提示。
5. **提升玩法工具体验** ✅ *(完成)*
   - SupportDeckBuilder：新增卡槽锁定、稀有度与类型缺口分析、重复卡告警。
   - TrainingCalculator：补充倍率拆解、风险提示与动态公式展示。
   - SkillBuilder：扩展技能类型/触发条件过滤、文本搜索与已选技能统计。
6. **丰富角色与支援卡展示内容** ✅ *(完成)*
   - 角色详情：新增训练亮点卡片，快速呈现代表属性、距离、战术与场地适性。
   - 支援卡详情：总结关键训练效果、保留详细等级数据，便于比较技能收益。
7. **补充测试与 CI 保障**
   - 选择合适的测试框架与 CI 步骤，确保改动得到自动化验证。

执行顺序：从任务 1 开始，完成一个任务后更新本文件的状态记录，再进入下一项。
