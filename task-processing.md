## 現在のタスク

**出典:** `tasks/prd-infinite-canvas-enhancements.md` - Tier 2.2 ビュー操作の拡充

- [ ] 選択範囲にズーム（Shift+2）

### 周辺情報

- Tier 2.2 には他に「ノード検索＆ナビゲーション」「ドラッグ中のエッジスクロール」もある
- 既存のズーム関連: `zoom.ts`(純粋ロジック), `useZoom.ts`(hook), `ZoomControlsComponent.tsx`(UI), `zoomControls.ts`(純粋ロジック)
- 既存のマルチセレクション: `multiSelection.ts`(純粋ロジック), `useMarquee.ts`(hook)
- 3層分離パターンに従う: 純粋ロジック → hook → UIコンポーネント
