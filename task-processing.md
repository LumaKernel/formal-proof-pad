## 実行中タスク

**出典:** `tasks/inserted-tasks.md` line 26

> 代入モーダル系は論理式が不正なのにそのまま進めるようにはしないで (disabledに)

### コンテキスト (line 27も関連)

> 代入モーダル系は論理式が未入力のときはエラー扱いにして、デフォルトで代入元と同じ値が入ってる状態から始まる、というふうにして

### テスト計画

- `edgeBadgeEditLogic.test.ts`: `canConfirmSubstEdit` が不正な論理式/項を持つエントリでfalseを返すことをテスト
- `EdgeParameterPopover.test.tsx`: Applyボタンが不正な論理式入力時にdisabledであることをテスト

### ストーリー計画

- UI変更は既存ポップオーバーのdisabled状態のみ。新ストーリーは不要だが、既存ストーリーで確認。

### 実装方針

1. `canConfirmSubstEdit` に論理式/項の構文チェックを追加（パーサーを呼ぶ）
2. SubstitutionPopoverのApplyボタンは既に `disabled={!canConfirmSubstEdit(entries)}` なので、ロジック側の修正で自動的にUI反映
