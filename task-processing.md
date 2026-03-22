# 現在のタスク

**出典:** `possible-next-tasks.md`（UIコンポーネントのカバレッジ改善）

## タスク

- [ ] ScriptApiReferencePanel.tsx の Storybook ストーリー作成（カバレッジ改善）

### コンテキスト

- ScriptApiReferencePanel.tsx は 75% Funcs, 86.2% Stmts
- Storybook ストーリーが存在しない
- ScriptLibraryPanel.stories.tsx のパターンに準拠して作成

## テスト計画

- play関数付きストーリー:
  - Default: パネル表示、検索フィールド、カテゴリ表示の確認
  - WithSearch: テキスト検索によるフィルタリング
  - WithClose: onClose コールバック動作確認
  - CategoryToggle: カテゴリの展開/折りたたみ
  - NoResults: 該当なし表示

## ベースライン

- Stmts 99.44%, Branch 97.49%, Funcs 89.86%, Lines 99.55%
