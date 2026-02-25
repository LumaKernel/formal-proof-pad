## 実行中タスク

**ソース:** `tasks/prd-logic-pad-world.md` - クエストモード

**タスク:** 命題論理上級クエスト Q-20〜Q-24 を追加する

**周辺情報:**

- 設計ドキュメント: `dev/quest-problems/03-propositional-advanced.md`
- Q-20: 排中律 (Law of Excluded Middle) - `~phi \/ phi` - Level 4
- Q-21: Peirce の法則 - `((phi -> psi) -> phi) -> phi` - Level 4
- Q-22: 連言の導入 - `phi -> (psi -> (phi /\ psi))` - Level 5
- Q-23: 連言の除去 - `(phi /\ psi) -> phi` - Level 5
- Q-24: De Morgan の法則 - `~(phi \/ psi) -> (~phi /\ ~psi)` - Level 5
- カテゴリ: propositional-negation (Q-20, Q-21) + 新カテゴリ要検討 (Q-22〜Q-24 は Level 5 挑戦問題)
