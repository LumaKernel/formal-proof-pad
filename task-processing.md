## 現在のタスク

**出典:** `tasks/prd-logic-pad-world.md` - 「ノート管理ができる。複製、削除、変換、詳細を見る、など」

### 実行内容

- useNotebookCollection hook（localStorage永続化含む）の作成
- ノート一覧UIコンポーネントの作成（一覧表示、削除、複製、名前変更）

### 周辺情報

- 純粋ロジック層 `src/lib/notebook/notebookState.ts` は完成済み（型定義・操作関数・テスト31件・100%カバレッジ）
- 3層分離パターン: notebookState.ts(純粋ロジック) → hook → UIコンポーネント
- ノート作成ダイアログ（体系選択等）は次のイテレーションで実施
