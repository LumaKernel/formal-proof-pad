## 実行中タスク

**元ファイル:** `tasks/inserted-tasks.md`

**タスク:** Γ⇒Δのそれぞれの論理式列を、論理式列入力コンポーネントで入れる形にしよう (既存の列を入れるやつを使って、うまく共通化)

**背景:** SC(シーケント計算)クエストでは、ノードのテキストが `phi, psi ⇒ chi` のようなシーケント形式。現在のFormulaEditorは `⇒` を認識できず "Unexpected Character" エラーになり、編集モードから抜け出せない。

### テスト計画

- `sequentEditorLogic.test.ts`: 新規。sequent text ↔ formula lists 変換の純粋ロジックテスト
- `editorLogic.test.ts`: 既存に追加。sequentモードでの exit 許可テスト
- SequentExpandedEditor のplay関数付きストーリー

### ストーリー計画

- `SequentExpandedEditor.stories.tsx`: 新規。シーケント拡大エディタの基本操作ストーリー

### 実装方針

1. `sequentEditorLogic.ts`: シーケントテキスト ↔ formula配列の変換純粋ロジック
2. `editorLogic.ts`: `computeExitAction` にシーケントモードオプション追加（⇒含むテキストで exit 許可）
3. `SequentExpandedEditor.tsx`: 2つのFormulaListEditor + ⇒セパレータの拡大エディタ
4. `EditableProofNode.tsx`: `useSequentEditor` prop追加
5. `ProofWorkspace.tsx`: SC system 時に SequentExpandedEditor を使用
