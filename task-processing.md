## 現在のタスク

**出典:** `tasks/inserted-tasks.md`
演繹定理、その逆について、組込みでやらずに明示的にやるパターンのスクリプトも用意する

**今回集中するサブタスク:**
- [ ] 演繹定理の証明と、それをどう実装する場合対応するか、というのを丁寧に解説するドキュメントを用意

### 周辺情報

- 既存: `applyDeductionTheorem()` / `applyReverseDeductionTheorem()` は組込みブラックボックス関数
- 既存テンプレート: `deductionTheoremWorkspace` / `reverseDeductionTheoremWorkspace` (templates.ts)
- タスクの意図: ステップバイステップで演繹定理を理解できるスクリプト+解説ドキュメント

### テスト計画

- ドキュメント作成が中心 → テストは不要（ただし参照する既存機能のテストは維持）
- 新APIが必要な場合は、そのAPIのテストを追加

### ストーリー計画

- UIの変更はないため、Storybookストーリーの変更は不要

### 実装計画

1. まず既存の演繹定理ロジック（deductionTheorem.ts）を読んでアルゴリズムを理解
2. dev/ ディレクトリに解説ドキュメントを作成
3. 必要なAPIの棚卸し → 不足があればタスク分解
