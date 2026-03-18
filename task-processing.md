## 実行中タスク

**出典:** `tasks/prd-inserted-tasks.md` > スクリプトエディタのテンプレート > ライブラリの充実

> 選択しているノードの証明に対するカット除去の実行 (対象でない体系ならエラーで停止)

### テスト計画

- `workspaceBridge.test.ts`: `extractScProof` ブリッジ関数のテスト追加
  - SC体系で正常にScProofNode JSONを返すこと
  - 非SC体系でエラーをthrowすること
  - 不完全な証明でエラーをthrowすること
- `templates.test.ts`: 新テンプレート追加に伴うテンプレート数更新 + フィルタリングテスト

### ストーリー計画

- UI変更なし（テンプレート追加のみ）。既存のScriptEditorストーリーで動作確認

### 実装計画

1. `WorkspaceCommandHandler` に `extractScProof` メソッド追加
2. `workspaceBridge.ts` にブリッジ関数実装（`buildScProofTree` + `encodeScProofNode` を使用）
3. `ProofWorkspace.tsx` にハンドラー実装
4. `templates.ts` に「選択証明のカット除去」テンプレート追加
5. テスト更新
