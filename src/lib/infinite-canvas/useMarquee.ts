/**
 * マーキー選択のReact hook。
 *
 * InfiniteCanvas上でのマーキー矩形描画・アイテム選択を管理する。
 * 純粋ロジック（multiSelection.ts）をReactの状態管理と接続する。
 *
 * 変更時は useMarquee.test.tsx, InfiniteCanvas.tsx, multiSelection.ts も同期すること。
 */

import { useCallback, useRef, useState } from "react";
import type { Point, ViewportState } from "./types";
import {
  MARQUEE_INACTIVE,
  startMarquee,
  updateMarquee,
  endMarquee,
  computeMarqueeRect,
  marqueeRectToWorld,
  findItemsInMarquee,
  addToSelection,
  replaceSelection,
  type MarqueeState,
  type MarqueeRect,
  type SelectableItem,
} from "./multiSelection";

export type UseMarqueeResult = {
  /** マーキー矩形（スクリーン座標）。非アクティブ時はnull */
  readonly marqueeRect: MarqueeRect | null;
  /** マーキーが現在アクティブかどうか */
  readonly isMarqueeActive: boolean;
  /** InfiniteCanvasのpointerDownに呼ぶ。マーキー開始判定を行う */
  readonly onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  /** InfiniteCanvasのpointerMoveに呼ぶ */
  readonly onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  /** InfiniteCanvasのpointerUpに呼ぶ。マーキー完了・アイテム選択を行う */
  readonly onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
};

/**
 * マーキー選択 hook。
 *
 * @param viewport 現在のビューポート状態
 * @param items 選択可能なアイテムのリスト（位置+サイズ）
 * @param selectedIds 現在の選択ID
 * @param onSelectionChange 選択変更コールバック
 * @param containerRef コンテナ要素のref（コンテナローカル座標計算用）
 */
export function useMarquee(
  viewport: ViewportState,
  items: readonly SelectableItem[],
  selectedIds: ReadonlySet<string>,
  onSelectionChange: (ids: ReadonlySet<string>) => void,
  containerRef: React.RefObject<HTMLDivElement | null>,
): UseMarqueeResult {
  const [marqueeState, setMarqueeState] =
    useState<MarqueeState>(MARQUEE_INACTIVE);
  const marqueeActiveRef = useRef(false);
  const shiftRef = useRef(false);

  /** コンテナのローカル座標を計算する */
  const toContainerLocal = useCallback(
    (clientX: number, clientY: number): Point => {
      const el = containerRef.current;
      if (el === null) return { x: clientX, y: clientY };
      const rect = el.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [containerRef],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      const local = toContainerLocal(e.clientX, e.clientY);
      const state = startMarquee(local.x, local.y);
      setMarqueeState(state);
      marqueeActiveRef.current = true;
      shiftRef.current = e.shiftKey;

      // Pointer captureでコンテナ外でもイベントを受け取る
      /* v8 ignore start */
      if (e.currentTarget.setPointerCapture) {
        /* v8 ignore stop */
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    },
    [toContainerLocal],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!marqueeActiveRef.current) return;
      const local = toContainerLocal(e.clientX, e.clientY);
      setMarqueeState((prev) => updateMarquee(prev, local.x, local.y));
    },
    [toContainerLocal],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!marqueeActiveRef.current) return;

      /* v8 ignore start */
      if (e.currentTarget.releasePointerCapture) {
        /* v8 ignore stop */
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      // 最終マーキー矩形を計算
      const local = toContainerLocal(e.clientX, e.clientY);
      const finalState = updateMarquee(
        {
          active: true,
          startScreen: marqueeState.startScreen,
          currentScreen: local,
        },
        local.x,
        local.y,
      );
      const rect = computeMarqueeRect(finalState);

      if (rect !== null && (rect.width > 3 || rect.height > 3)) {
        // マーキー矩形が最低限のサイズを超えている場合のみ選択を更新
        const worldRect = marqueeRectToWorld(viewport, rect);
        const hitIds = findItemsInMarquee(worldRect, items);

        if (shiftRef.current) {
          // Shift+マーキー: 既存選択に追加
          onSelectionChange(addToSelection(selectedIds, hitIds));
        } else {
          // 通常マーキー: 新しい選択に置換
          onSelectionChange(replaceSelection(hitIds));
        }
      }

      setMarqueeState(endMarquee());
      marqueeActiveRef.current = false;
    },
    [
      viewport,
      items,
      selectedIds,
      onSelectionChange,
      toContainerLocal,
      marqueeState.startScreen,
    ],
  );

  const marqueeRect = computeMarqueeRect(marqueeState);

  return {
    marqueeRect,
    isMarqueeActive: marqueeState.active,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
