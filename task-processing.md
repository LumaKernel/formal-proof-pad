タスク元: `tasks/prd-theories.md` 行7

## 実行中タスク
- [ ] PA体系の例題、練習問題、クエストロードマップの用意

## 周辺情報
- PA流儀バリアント（Robinson Q, PA-HK, PA-Mendelson, HA）は実装済み
- 既存クエストは `src/lib/quest/builtinQuests.ts` に命題論理のものが定義済み
- クエスト定義は `questDefinition.ts` の型に従う
- PA公理テンプレートは `inferenceRule.ts` に定義済み（PA1-PA6, Q7）
- 現在のクエストはHilbert流命題論理のみ対応
- クエスト開始時にHilbert-onlyガードがある（questStartLogic.ts）
