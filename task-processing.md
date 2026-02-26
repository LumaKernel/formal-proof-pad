## 現在のタスク

CIの修復: Prettierフォーマット問題を修正 (39ファイル)

### ソース

CIログから検出。`prd-formal-logic-pad.md` フェーズ0「CIは落ちてるから通す」に関連。

### 詳細

CI run #22453845670 で `prettier . --check` が39ファイルでスタイル問題を検出し失敗。
`npx prettier --write .` で一括修正し、CI通過を確認する。
