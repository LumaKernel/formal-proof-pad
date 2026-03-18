## 実行中タスク

**元ファイル:** `tasks/prd-inserted-tasks.md` 行9

> ライブラリの充実

### 周辺情報

- 現在14テンプレート: SC用10個, Hilbert用4個, ND用0個, 汎用0個
- ND向けブリッジAPIは未実装
- 汎用テンプレート（全スタイル共通）が0個 — 基本的なAPI紹介テンプレートがない
- Hilbert用テンプレートも証明構築系のみ — 公理探索・ユニフィケーション活用系がない

### 方針

1. **汎用テンプレート**を追加（全DeductionStyle対応）:
   - 論理式パース・操作のデモ（parseFormula, formatFormula, equalFormula）
   - ユニフィケーションのデモ（unifyFormulas, substituteFormula）
2. **Hilbert用テンプレート**を追加:
   - 公理同定デモ（identifyAxiom）
   - 三段論法の証明構築
3. テンプレートの実用性・教育性を重視

### テスト計画

- `templates.test.ts` の既存パターンに従い、各テンプレートの実行テストを追加
- テンプレート総数の更新
- SC/Hilbert/汎用フィルタテストの更新

### ストーリー計画

- UI変更なし（テンプレート追加のみ）。既存のScriptLibraryPanelストーリーで確認
