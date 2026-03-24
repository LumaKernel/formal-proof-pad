# 現在のタスク

**出典:** `tasks/inserted-tasks.md` line 51

> ドラッグ中限定のはずのエッジがまっすぐになるやつが、ドラッグ終わっても残ることがとてもある

## 原因分析

`ProofWorkspace.tsx` で `draggingNodeIdsRef` (useRef) を使い、ドラッグ中ノードを追跡している。
PortConnection の `simplified` prop はレンダー時に `draggingNodeIdsRef.current` から計算される。

問題: `handleNodeDragEnd` (line 1524) で `draggingNodeIdsRef.current = new Set()` と ref をクリアするが、
状態変更がないため **再レンダーが発生せず**、接続線が `simplified={true}` のまま残る。

## 修正方針

`isDraggingAny` state を追加し、ドラッグ開始時に true、終了時に false にする。
これにより drag end で再レンダーが発生し、`isDragSimplified` が正しく再計算される。

## テスト計画

- ドラッグ操作は `/* v8 ignore start */` 内（JSDOMでは検証不可）
- ブラウザテスト（Playwright MCP）で確認

## ストーリー計画

- 既存ストーリーで確認。新規ストーリーは不要。
