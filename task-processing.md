## 現在のタスク

**出典:** `tasks/inserted-tasks.md`

### 対象タスク

- [ ] 残りのドキュメントにもリンクを追加していく

### コンテキスト

- 親タスク: ドキュメント内の用語でもすぐ飛べるような仕組みを用意
- 前回: `[[ref:id|text]]` 構文を実装。guide-what-is-formal-proof, guide-hilbert-proof-method, axiom-a1 に適用済み
- 残り: 他のドキュメントで他エントリへの言及があるがリンクになっていない箇所を網羅的にリンク化

### テスト計画

- 既存テストで十分（パーサー・レンダラーは前回テスト済み）
- referenceContent.ts の変更のみなのでテスト追加不要

### ストーリー計画

- UI変更なし。ストーリー追加不要

### 実装計画

1. referenceContent.ts を読んで、他エントリIDに言及している箇所を特定
2. `[[ref:id|text]]` リンクに置き換え
3. typecheck + lint + test で確認
