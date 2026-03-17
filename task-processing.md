## 実行中タスク

**出典**: `tasks/prd-inserted-tasks.md`

> クエストを開始するところから証明完了するところまでを各章の最初の問題についてストーリーで保証せよ

### 今回のスコープ

SC-01 (シーケント計算) と TAB-01 (タブロー法) の完全フローストーリーを追加する。
prop-01 と nd-01 は既に完了済み。

SC-01 フロー: Add Sequent → 式入力 `=> phi -> phi` → ゴール達成
TAB-01 フロー: Add Sequent → 式入力 `~(phi -> phi)` → ゴール達成

### テスト計画

- WorkspacePageView.stories.tsx: `QuestCompleteSc01FullFlow`, `QuestCompleteTab01FullFlow` 追加
