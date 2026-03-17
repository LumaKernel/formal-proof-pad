## 実行中タスク

**出典:** `tasks/prd-inserted-tasks.md` > 整理する、という関係を繋ぐこともできるようにする

### タスク内容

- 構文的に置換等の処理や束縛変数の違いを除いて同値であれば繋ぐことができる
- 整理（simplification）エッジタイプの追加、適用ロジック、状態統合

### テスト計画

- `simplificationApplicationLogic.test.ts`（新規）: 整理適用の純粋ロジックテスト
  - 等価なノード間の接続が成功する
  - 非等価なノード間の接続が失敗する
  - 互換ノードID一覧の計算
- `inferenceEdge.test.ts`: 既存テストにsimplificationエッジのケース追加
- `workspaceState.test.ts`: applySimplificationAndConnect の統合テスト

### ストーリー計画

- UI変更なし（コンテキストメニューは次のイテレーション）
