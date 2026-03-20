## タスク: ノードのラベル(MP/Gen/Substなど)はノードとエッジの関係からのみをもとにcomputedであるべきだ

ソース: `tasks/inserted-tasks.md` 行7

### 現状

- `WorkspaceNode.label` はノード作成時に固定値で設定（"MP", "Gen", "Subst", "Node"等）
- `InferenceEdge` からも同じ情報を動的に導出可能（`getInferenceEdgeLabel`）
- 二重管理で不整合のリスク

### テスト計画

- `inferenceEdgeLabelLogic.test.ts` に `computeNodeLabelFromEdge` のテスト追加
  - エッジなし(axiom) → undefined (元ラベル維持)
  - MPエッジ → "MP"
  - Genエッジ → "Gen"
  - Substエッジ → "Subst"
  - NDエッジ各種 → 対応ラベル
  - TAB/SC/ATエッジ → 対応ラベル

### 実装計画

1. `inferenceEdgeLabelLogic.ts` に `computeNodeLabelFromEdge(nodeId, inferenceEdges): string | undefined` 追加
2. `ProofWorkspace.tsx` で `node.label` の代わりに computed ラベルを使用
3. `workspaceState.ts` の addNode 呼び出しで、導出ノードのラベルを "Node" に統一 (ラベルはエッジから計算されるため)
4. 既存のテスト修正

### ストーリー計画

- なし（内部ロジック変更のみ）
