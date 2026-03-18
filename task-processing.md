## タスク

from: tasks/prd-inserted-tasks.md

> 演繹定理の逆 (同様)

### 概要

演繹定理の逆: Γ ⊢ A → B ならば Γ ∪ {A} ⊢ B
これは自明: A を公理として追加し、元の証明木(A→B)とMP(A, A→B)で B を得る。

### テスト計画

- `deductionTheorem.test.ts` に `reverseDeductionTheorem` のテストを追加
  - 正常系: A→B の証明からA を仮定として追加し B の証明を得る
  - 結論が含意でない場合のエラー
  - 複雑な証明木での動作確認
- `hilbertProofBridge.test.ts` に `applyReverseDeductionTheorem` ブリッジのテスト追加
- `templates.test.ts` にテンプレートのテスト追加

### ストーリー計画

UIストーリーなし（スクリプトテンプレートのみ）

### 実装計画

1. `deductionTheorem.ts` に `reverseDeductionTheorem` を追加
2. `deductionTheorem.test.ts` にテスト追加
3. `hilbertProofBridge.ts` に `applyReverseDeductionTheorem` ブリッジ追加
4. `hilbertProofBridge.test.ts` にテスト追加
5. `templates.ts` に逆演繹定理テンプレート追加
6. `templates.test.ts` にテスト追加
7. 品質チェック（typecheck, lint, test, coverage）
