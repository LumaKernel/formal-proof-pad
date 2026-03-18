From: tasks/prd-inserted-tasks.md

## 実行中タスク

- [ ] 残りテンプレート移行（step1-step6, auto-prove）をコンストラクタAPI利用に変更

### テスト計画

- templates.test.ts の既存テスト（テンプレートコード文字列の検証）が引き続き通ることを確認
- UI変更なし

### ストーリー計画

- UI変更なし

### 実装計画

1. cutEliminationStep1-6 の raw JSON 構築をコンストラクタ関数に置換
2. autoProveTemplate の raw sequent を sequent() に置換
3. 品質チェック
