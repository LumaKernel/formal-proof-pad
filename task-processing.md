## 実行中タスク

**元ファイル:** `tasks/prd-inserted-tasks.md`

> クエストを開始するところから証明完了するところまでを各章の最初の問題と、いくつか特殊な重要な問題についてストーリーで保証せよ。— prop-01, nd-01, sc-01, tab-01 完了。AT-01は未対応

### テスト計画

- **ストーリー追加:** `WorkspacePageView.stories.tsx` に `QuestCompleteAt01FullFlow` ストーリーを追加
  - AT パレット表示確認
  - 「式を追加」ボタンクリック → node-1 作成
  - node-1 に `phi \/ ~phi` を入力
  - ゴール達成（1/1, Proved!）確認
- 既存テストへの影響: なし（新規ストーリー追加のみ）

### ストーリー計画

- `QuestCompleteAt01FullFlow`: SC-01/TAB-01 と同パターンの完全フローストーリー
  - AT 固有のテストID: `workspace-at-rule-palette`, `workspace-at-rule-palette-add-formula`
