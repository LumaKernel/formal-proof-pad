# Logic Core

UIなし・言語パーサーなしの**完全にピュア**なロジックライブラリ。Effect.ts のみに依存。

## AST 設計

- `Schema.TaggedClass` で各ノードを定義。`_tag` で discriminated union
- 再帰型は `Schema.suspend(() => Formula)` / `Schema.suspend(() => Term)` で定義
- `Schema.optionalWith({ as: "Option" })` は Type/Encoded の型不一致により union schema で使えない。`Schema.optional` を使う
- `Function` はJSグローバルと衝突するため `FunctionApplication` に改名

## 参考ドキュメント

- `dev/logic-reference/01-notation.md` — AST型名、記法、優先順位の定義
- `dev/logic-reference/06-dsl-specification.md` — DSL言語仕様（lexer/parser実装時に参照）
- `dev/logic-reference/04-substitution-and-unification.md` — 代入・ユニフィケーション（US-011, US-012で参照）

## テスト方針

- 100%カバレッジを維持する
- exhaustive switch テストで全 `_tag` ケースをカバーする
- ファクトリ関数経由でAST構築し、`_tag` と各フィールドを検証
- K公理、S公理、対偶公理など実際の論理式を構築して統合テスト
