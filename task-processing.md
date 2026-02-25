## 現在のタスク

**元タスク:** `tasks/prd-logic-pad-world.md` - クエストモード充実化
**具体的作業:** ビルトインクエスト Q-08〜Q-14（命題論理の中級）を builtinQuests.ts に追加する

### 周辺情報

- dev/quest-problems/02-propositional-intermediate.md に問題定義あり
- 既存は Q-01〜Q-07 が propositional-basics カテゴリ
- Q-08〜Q-14 は同じ lukasiewicz 体系だが中級レベル
- questDefinition.ts のカテゴリに propositional-intermediate を追加する必要がある可能性あり
  - 既存は propositional-basics, propositional-negation, predicate-basics, equality-basics
  - Q-08〜Q-14 は否定を含まないので propositional-negation ではない → propositional-basics に含めるか新カテゴリか
- Q-09 と Q-06 はゴールが同一（学習コンテキストが異なる）
- Q-11 と Q-13 も A2 のインスタンスで同一ゴール（異なる名前・学習ポイント）
