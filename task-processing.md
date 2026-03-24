## 実行中タスク

**出典:** `tasks/inserted-tasks.md` line 26

> 代入モーダル系は論理式が未入力のときはエラー扱いにして、デフォルトで代入元と同じ値が入ってる状態から始まる、というふうにして

### 解釈

- 代入ポップオーバーを開いたとき、各メタ変数の入力フィールドが空で始まるのではなく、代入元（前提スキーマのメタ変数に対応するデフォルト値）で初期化されるべき
- 空の入力はエラー扱い（前回タスクで `canConfirmSubstEdit` に構文検証追加済み。空は既にfalse判定）

### テスト計画

- `edgeBadgeEditLogic.test.ts`: `toSubstEditEntries` のデフォルト値生成テスト
- `EdgeParameterPopover.test.tsx`: 初期状態で値がプリフィルされていることのテスト

### ストーリー計画

- UI変更は初期値のみ。新ストーリー不要。

### 実装方針

1. `toSubstEditEntries` で、premiseFormulaTextからメタ変数を抽出した際、既存entriesに値がない場合のデフォルト値を設定
2. デフォルト値はメタ変数名そのもの（例: φ → "phi", τ → "tau"）が妥当か、要調査
