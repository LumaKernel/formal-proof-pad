/**
 * メニュー位置のビューポートクランプフック。
 *
 * 固定位置のメニューをDOMサイズ計測後にビューポート内に収まるよう調整する。
 * ContextMenuComponent.tsx の既存パターンを再利用可能なフックに抽出。
 *
 * 変更時は useClampedMenuPosition.test.ts も同期すること。
 */

import { useEffect } from "react";
import type { RefObject } from "react";
import type { Point } from "./types";
import { clampMenuPosition } from "./contextMenu";

/**
 * メニュー要素のrefとスクリーン位置を受け取り、
 * DOMサイズ計測後にビューポート内に収まるよう位置を調整する。
 *
 * メニュー要素は `position: fixed; left: screenPosition.x; top: screenPosition.y` で
 * 初期レンダリングされることを前提とする。
 */
export function useClampedMenuPosition(
  ref: RefObject<HTMLDivElement | null>,
  screenPosition: Point,
): void {
  useEffect(() => {
    const el = ref.current;
    /* v8 ignore start -- defensive: el is always non-null when hook is used with mounted element */
    if (el === null) return;
    /* v8 ignore stop */
    const clamped = clampMenuPosition(
      screenPosition,
      el.offsetWidth,
      el.offsetHeight,
      window.innerWidth,
      window.innerHeight,
    );
    el.style.left = `${String(clamped.x) satisfies string}px`;
    el.style.top = `${String(clamped.y) satisfies string}px`;
  }, [ref, screenPosition]);
}
