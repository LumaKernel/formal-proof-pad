## 実行中タスク

**ソース:** `tasks/prd-inserted-tasks.md`

- [-] 開く、ファイル管理、リネーム、削除、などもvscode explorer的に、見た目のリッチさ(web的な太い感じ) ではなく、vscodeに寄せたような使い勝手、UIを目指す

### 周辺情報

- 既存: `savedScriptsLogic.ts` に CRUD（addScript, removeScript, renameScript, updateScriptCode, findScript）
- 既存: `ScriptLibraryPanel` がライブラリ＋保存済みスクリプト一覧表示（検索・フィルタ付き）
- 既存: `scriptWorkspaceState.ts` にタブ管理（openSavedTab等）
- 目指す: VSCode のサイドバー Explorerのようなファイル一覧パネル
  - 保存済みスクリプトの一覧表示
  - ダブルクリックで開く（タブに追加）
  - 右クリックまたはインラインで：リネーム、削除
  - VSCode的なミニマルUI（コンパクト、単色アイコン）

### テスト計画

- `scriptFileExplorerLogic.test.ts`: ファイル一覧の表示ロジック（ソート、フィルタ、リネーム状態管理）
- `ScriptFileExplorer.stories.tsx`: ストーリー + play関数でインタラクション確認

### ストーリー計画

- Default: 複数保存済みスクリプト表示
- EmptyState: 保存済みスクリプトなし
- RenameFlow: リネーム操作のインタラクション
- DeleteFlow: 削除操作のインタラクション
- OpenFile: ダブルクリックでファイルを開く
