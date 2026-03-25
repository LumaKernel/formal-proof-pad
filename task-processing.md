# 実行中タスク

**ソース:** `tasks/inserted-tasks.md`

- [ ] 残りのa11y違反を修正し Storybook `a11y.test: "error"` を有効化する

## コンテキスト

- 現状287テストがa11y違反で失敗（すべてcolor-contrast）
- 54ストーリーファイル中が影響
- 主な問題箇所:
  - globals.css のCSS変数（バッジ色、ノード色、UIカラー）
  - inferenceEdgeLabelLogic.ts のバッジ色フォールバック
  - InferenceEdgeBadge.tsx の白文字ハードコード
  - proofNodeUI.ts のノード色
  - その他UIコンポーネントの色定義

## テスト計画

- `npx vitest --project storybook` で a11y テスト実行（`test: "error"` モード）
- 修正前: 287 failed / 226 passed
- 修正後: 0 failed を目標

## ストーリー計画

- 既存ストーリーがそのまま a11y テストとして機能する
- 新規ストーリー追加は不要
