## 実行中タスク

**ソース:** `tasks/prd-inserted-tasks.md`

**タスク:** ヒルベルトスタイルのphi->phiの証明を実際に証明ツリーとして出すスクリプトテンプレート追加

- ヒルベルト流以外でやろうとしたら、スクリプトの提供API側のガードで失敗する想定
- 体系の情報を取れるAPI（`getDeductionSystemInfo()`）は既に実装済み

### 周辺情報

- 既存の `build-identity-proof` テンプレートはコンソール出力のみ。今回はワークスペースに証明木を構築する
- ワークスペースAPI: `addNode()`, `connectMP()`, `setNodeRoleAxiom()`, `applyLayout()`, `getDeductionSystemInfo()` が利用可能
- `connectMP(antecedentId, conditionalId) → string` で結論ノードIDが返る

### テスト計画

- `templates.test.ts` にテスト追加:
  - 新テンプレートの基本プロパティ検証
  - `compatibleStyles` が `["hilbert"]` であること
  - `filterTemplatesByStyle` でhilbertフィルタ時に含まれること
  - BUILTIN_TEMPLATES の数を更新

### ストーリー計画

- UI変更なし（テンプレートはコードのみ）。ScriptEditorComponentのテンプレート一覧に自動表示される
