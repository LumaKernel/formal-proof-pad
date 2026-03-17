## 実行中タスク

**元ファイル:** `tasks/prd-inserted-tasks.md`

> スクリプトエディタからすぐにスクリプトに関するリファレンスを開けるように
> 提供されるAPIなどの説明を網羅 (索引と、それぞれの項目は分けてよいだろう)

### 現状分析

- `PROOF_BRIDGE_API_DEFS`, `WORKSPACE_BRIDGE_API_DEFS`, `CUT_ELIMINATION_BRIDGE_API_DEFS` に各API関数の name/signature/description が定義済み
- Monaco Editor の autocomplete で型情報は提供されているが、一覧性がない
- UI上にリファレンスパネルは未実装

### 実装計画

1. **純粋ロジック `scriptApiReferenceLogic.ts`**: 全API定義を3カテゴリにまとめ、検索フィルタ関数を提供
2. **UIコンポーネント `ScriptApiReferencePanel.tsx`**: 折りたたみ可能なリファレンスパネル（検索付き）
3. **ScriptEditorComponent にトグルボタン追加**: ツールバーに "API Reference" ボタンを追加し、パネルの開閉を切り替え

### テスト計画

- `scriptApiReferenceLogic.test.ts`: フィルタ関数のテスト
- `ScriptEditorComponent.stories.tsx` の更新（既存ストーリーの確認 + リファレンスパネル表示ストーリー）

### ストーリー計画

- 既存ストーリーでAPI Referenceボタンが見えることを確認
