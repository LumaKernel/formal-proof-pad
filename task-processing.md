## 現在のタスク

**出典:** `tasks/prd-infinite-canvas-enhancements.md` - Tier 1: 1.1 マルチセレクション（矩形選択）

### タスク内容

- [ ] 空のキャンバス領域でドラッグすると選択矩形（マーキー）が表示される
- [ ] 矩形内のアイテムがすべて選択される
- [ ] Shift+クリックで選択に追加/除外
- [ ] 選択中アイテムのハイライト表示（アウトライン等）
- [ ] 選択中アイテムの一括ドラッグ移動
- [ ] Escape で選択解除
- [ ] Ctrl/Cmd+A で全選択

### 周辺情報

- 既存の3層分離パターン: 純粋ロジック(.ts) → React hook → UIコンポーネント(.tsx)
- InfiniteCanvasは `src/lib/infinite-canvas/` に配置
- CanvasItem のドラッグは `useDragItem.ts` で管理
- パンは `usePan.ts`、ズームは `useZoom.ts` で管理
