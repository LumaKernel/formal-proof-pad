## 実行中タスク

**出典:** `tasks/inserted-tasks.md` line 21

**タスク:** 代入モーダル系を開いてるときに、対象のノードがどれか分からない。じわっと光らせるなどして分かりやすくせよ。

### 現状

- `edgeBadgeEditState` (ProofWorkspace.tsx) が non-null のとき、代入/Genポップオーバーが表示される
- `edgeBadgeEditState.conclusionNodeId` で対象ノードが特定できる
- 現在、対象ノードにハイライト表示なし

### 実装方針

- `EditableProofNode` に `highlighted` prop を追加
- `proofNodeUI.ts` にハイライト用のスタイル計算を追加（CSS animationによるpulse glow）
- `ProofWorkspace.tsx` で `edgeBadgeEditState?.conclusionNodeId` と一致するノードに `highlighted={true}` を渡す
- CSS keyframesは globals.css に追加するか、inline style + boxShadow で実現

### テスト計画

- `proofNodeUI.test.ts`: ハイライト時のスタイル計算テスト追加
- `EditableProofNode.test.tsx`: highlighted prop のレンダリング確認テスト追加

### ストーリー計画

- 既存のEdgeParameterPopover関連ストーリーがないため、EditableProofNode.stories.tsx にハイライト状態のストーリーを追加
