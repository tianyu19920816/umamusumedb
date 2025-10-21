# UmamusumeDB - ウマ娘プリティーダービー データベース

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

UmamusumeDB はウマ娘プリティーダービーのデータベースとトレーニングツールをまとめたファンサイトです。最新データを収集し、キャラクター・サポートカード情報や計算ツールをわかりやすく提供します。

🌐 **本番サイト**: [https://umamusumedb.com](https://umamusumedb.com)

## 主な機能

- 📊 **キャラクターデータベース**: 成長率・適性・固有スキルなどを網羅
- 🎴 **サポートカード一覧**: スキル・ボーナス・イベント情報を掲載
- 🏆 **ティアリスト**: キャラクター・サポートカードの評価を整理
- 🛠️ **トレーニングツール**:
  - トレーニング計算機（公式式に基づく能力計算）
  - サポートデッキビルダー
  - スキルビルダー
  - 因子計算機、育成目標トラッカー
- 🌍 **多言語対応**: 英語 / 日本語 UI

## 技術スタック

- **Astro**（静的サイトジェネレーター）
- React + TypeScript
- Tailwind CSS
- データエクスポート用スクリプト（SQLite → JSON）
- Cloudflare Pages / Cloudflare R2

## 開発環境

```bash
git clone https://github.com/tianyu19920816/umamusumedb.git
cd umamusumedb
npm install
node scripts/export-to-json.js
npm run dev
```

## ディレクトリ構成

```
umamusumedb/
├── src/            # Astro ページ、React コンポーネント
├── public/         # 静的ファイル (data/ に JSON を配置)
├── scripts/        # データ出力・アップロード用スクリプト
└── dist/           # ビルド出力
```

## コントリビュート

Pull Request / Issue 大歓迎です。

1. リポジトリを fork
2. ブランチ作成 `git checkout -b feature/awesome`
3. 変更をコミット `git commit -m 'Add awesome feature'`
4. Push & Pull Request

## ライセンス

本プロジェクトは [MIT License](LICENSE) の下で提供されています。

---

ご意見・不具合報告は [GitHub Issues](https://github.com/tianyu19920816/umamusumedb/issues) までお願いします。ウマ娘トレーナーの皆さんの育成がもっと楽しくなりますように！ 🇯🇵🐎
