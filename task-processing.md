## 実行中タスク

**出典:** tasks/prd-inserted-tasks.md

- [ ] エラー時の文字色が背景色と同じで見えない
  - http://localhost:13006/?path=/story/formulainput-formulaeditor--error-stays-in-edit-mode
  - pw mcpでも分かるとのこと

### テスト計画

- FormulaEditor のエラー状態のスタイルテスト（既存テストの確認・必要に応じ追加）
- エラー時の文字色が適切なコントラストを持つことを確認

### ストーリー計画

- 既存の `ErrorStaysInEditMode` ストーリーが修正後も正しく動作することを確認
- 必要に応じ play 関数でエラー状態の視覚的確認を追加

### バグ修正計画

- 再現: エラー状態の FormulaEditor で文字が見えない
- リグレッションテスト: エラー時のテキスト色が背景色と異なることを確認
