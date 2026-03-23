## 現在のタスク

**出典:** `tasks/inserted-tasks.md`
演繹定理、その逆について、組込みでやらずに明示的にやるパターンのスクリプトも用意する

**今回集中するサブタスク:**

- [ ] 逆も同様（逆演繹定理の解説ドキュメント＋明示的実装スクリプト）

### 周辺情報

- 演繹定理のドキュメント（08-deduction-theorem.md）のセクション6に逆演繹定理の概要は記載済み
- 既存テンプレート: `reverse-deduction-theorem-workspace`（組込み版）
- 逆演繹定理は演繹定理と比べて非常にシンプル（MP 1回のみ）

### テスト計画

- ドキュメント更新 + テンプレート追加 → templates.test.ts のカウント更新

### ストーリー計画

- UI変更なし

### 実装計画

1. 08-deduction-theorem.md のセクション6を拡充（逆演繹定理の詳細解説）
2. reverse-deduction-theorem-explicit テンプレートを templates.ts に追加
3. テスト更新
