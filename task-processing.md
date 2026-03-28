## 実行中タスク

**ソース:** `tasks/play-function-enhancement.md` PLAY-PP-01

- [ ] PLAY-PP-01: `ScAutoProofDemo` — 自動証明の実行フロー確認（ボタンクリック→結果表示）

### コンテキスト

ScAutoProofDemo.stories.tsx の AutoProofIdentity ストーリーのplay関数が expect のみ。
sc-ap-01 クエストのモデルアンサーワークスペース（LK SC、3ステップ証明）。
現在: workspace存在確認 + parseエラーなし確認のみ。

### テスト計画

- ScAutoProofDemo.stories.tsx の AutoProofIdentity play 関数を強化:
  - 完了バナー確認
  - fitToContent でculling回避
  - ノード存在確認（SC証明のシーケントノード）
  - SC規則パレット存在確認
  - エッジバッジまたはルールパレットのインタラクション

### ストーリー計画

- 既存ストーリーの play 関数強化のみ。新規ストーリー追加なし。
