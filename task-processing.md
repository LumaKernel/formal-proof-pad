## 実行中タスク

**出典**: `tasks/prd-inserted-tasks.md`

> クエストを完遂するストーリーを作るタスク — クエストを開始するところから証明完了するところまでを各章の最初の問題と、いくつか特殊な重要な問題についてストーリーで保証せよ。

### 今回のスコープ

prop-01（Hilbert系、恒等律 φ→φ）の**完全なクエスト完遂ストーリー**を作成する。
既存の `QuestCompleteProp01` は公理インスタンスが事前配置された状態から開始しているが、
今回は**空のワークスペースから**以下の完全フローを再現する:

1. 空のクエストワークスペース（ゴール: φ→φ）
2. 公理パレットからA2をクリック → スキーマノード追加
3. 右クリック → Apply Substitution → φ:=phi, ψ:=(phi->phi), χ:=phi → インスタンスノード生成
4. 公理パレットからA1をクリック → スキーマノード追加
5. 右クリック → Apply Substitution → φ:=phi, ψ:=(phi->phi) → インスタンスノード生成
6. MPボタン → left=A1インスタンス, right=A2インスタンス → 結論ノード生成
7. 公理パレットからA1をクリック → スキーマノード追加
8. 右クリック → Apply Substitution → φ:=phi, ψ:=phi → インスタンスノード生成
9. MPボタン → left=A1₂インスタンス, right=MP₁結果 → φ→φ（ゴール達成）

### テスト計画

- ストーリーのplay関数自体がインタラクションテスト
- 既存の `QuestCompleteProp01`（公理事前配置版）は残す
- 新規: `QuestCompleteProp01FullFlow` — 空ワークスペースからの完全フロー

### ストーリー計画

- `WorkspacePageView.stories.tsx` に `QuestCompleteProp01FullFlow` を追加
