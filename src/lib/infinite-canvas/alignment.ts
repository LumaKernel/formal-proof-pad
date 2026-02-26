/**
 * 選択アイテムの整列・等間隔分配の純粋ロジック。
 *
 * 整列操作（左/中央/右/上/中/下）と等間隔分配（水平/垂直）を提供する。
 * UIコンポーネントやキーボードショートカットから利用される。
 *
 * 変更時は alignment.test.ts, index.ts も同期すること。
 */

import type { Point, Size } from "./types";

// --- 型定義 ---

/** 整列可能なアイテム（位置 + サイズ） */
export type AlignableItem = {
  readonly id: string;
  readonly position: Point;
  readonly size: Size;
};

/** 水平方向の整列アンカー */
export type HorizontalAlignment = "left" | "center" | "right";

/** 垂直方向の整列アンカー */
export type VerticalAlignment = "top" | "middle" | "bottom";

/** 分配方向 */
export type DistributeDirection = "horizontal" | "vertical";

// --- 整列操作 ---

/** 選択アイテムを水平方向に整列する */
export function alignHorizontal(
  items: readonly AlignableItem[],
  anchor: HorizontalAlignment,
): ReadonlyMap<string, Point> {
  if (items.length < 2) return new Map();

  const targetX = computeHorizontalTarget(items, anchor);
  const result = new Map<string, Point>();

  for (const item of items) {
    const newX = computeAlignedX(item, targetX, anchor);
    if (newX !== item.position.x) {
      result.set(item.id, { x: newX, y: item.position.y });
    }
  }

  return result;
}

/** 選択アイテムを垂直方向に整列する */
export function alignVertical(
  items: readonly AlignableItem[],
  anchor: VerticalAlignment,
): ReadonlyMap<string, Point> {
  if (items.length < 2) return new Map();

  const targetY = computeVerticalTarget(items, anchor);
  const result = new Map<string, Point>();

  for (const item of items) {
    const newY = computeAlignedY(item, targetY, anchor);
    if (newY !== item.position.y) {
      result.set(item.id, { x: item.position.x, y: newY });
    }
  }

  return result;
}

// --- 等間隔分配 ---

/** 選択アイテムを等間隔に分配する */
export function distribute(
  items: readonly AlignableItem[],
  direction: DistributeDirection,
): ReadonlyMap<string, Point> {
  if (items.length < 3) return new Map();

  if (direction === "horizontal") {
    return distributeHorizontal(items);
  }
  return distributeVertical(items);
}

// --- 内部関数 ---

/** 水平整列のターゲット座標を計算 */
function computeHorizontalTarget(
  items: readonly AlignableItem[],
  anchor: HorizontalAlignment,
): number {
  switch (anchor) {
    case "left":
      return Math.min(...items.map((item) => item.position.x));
    case "right":
      return Math.max(
        ...items.map((item) => item.position.x + item.size.width),
      );
    case "center": {
      const centers = items.map(
        (item) => item.position.x + item.size.width / 2,
      );
      return centers.reduce((a, b) => a + b, 0) / centers.length;
    }
  }
}

/** 垂直整列のターゲット座標を計算 */
function computeVerticalTarget(
  items: readonly AlignableItem[],
  anchor: VerticalAlignment,
): number {
  switch (anchor) {
    case "top":
      return Math.min(...items.map((item) => item.position.y));
    case "bottom":
      return Math.max(
        ...items.map((item) => item.position.y + item.size.height),
      );
    case "middle": {
      const middles = items.map(
        (item) => item.position.y + item.size.height / 2,
      );
      return middles.reduce((a, b) => a + b, 0) / middles.length;
    }
  }
}

/** アンカーに基づいて整列後のX座標を計算 */
function computeAlignedX(
  item: AlignableItem,
  targetX: number,
  anchor: HorizontalAlignment,
): number {
  switch (anchor) {
    case "left":
      return targetX;
    case "right":
      return targetX - item.size.width;
    case "center":
      return targetX - item.size.width / 2;
  }
}

/** アンカーに基づいて整列後のY座標を計算 */
function computeAlignedY(
  item: AlignableItem,
  targetY: number,
  anchor: VerticalAlignment,
): number {
  switch (anchor) {
    case "top":
      return targetY;
    case "bottom":
      return targetY - item.size.height;
    case "middle":
      return targetY - item.size.height / 2;
  }
}

/** 水平方向の等間隔分配 */
function distributeHorizontal(
  items: readonly AlignableItem[],
): ReadonlyMap<string, Point> {
  const sorted = [...items].sort(
    (a, b) =>
      a.position.x + a.size.width / 2 - (b.position.x + b.size.width / 2),
  );

  const totalItemWidth = sorted.reduce((sum, item) => sum + item.size.width, 0);
  const firstLeft = sorted[0]!.position.x;
  const lastRight =
    sorted[sorted.length - 1]!.position.x +
    sorted[sorted.length - 1]!.size.width;
  const totalSpace = lastRight - firstLeft;
  const gap = (totalSpace - totalItemWidth) / (sorted.length - 1);

  const result = new Map<string, Point>();
  let currentX = firstLeft;

  for (const item of sorted) {
    if (currentX !== item.position.x) {
      result.set(item.id, { x: currentX, y: item.position.y });
    }
    currentX += item.size.width + gap;
  }

  return result;
}

/** 垂直方向の等間隔分配 */
function distributeVertical(
  items: readonly AlignableItem[],
): ReadonlyMap<string, Point> {
  const sorted = [...items].sort(
    (a, b) =>
      a.position.y + a.size.height / 2 - (b.position.y + b.size.height / 2),
  );

  const totalItemHeight = sorted.reduce(
    (sum, item) => sum + item.size.height,
    0,
  );
  const firstTop = sorted[0]!.position.y;
  const lastBottom =
    sorted[sorted.length - 1]!.position.y +
    sorted[sorted.length - 1]!.size.height;
  const totalSpace = lastBottom - firstTop;
  const gap = (totalSpace - totalItemHeight) / (sorted.length - 1);

  const result = new Map<string, Point>();
  let currentY = firstTop;

  for (const item of sorted) {
    if (currentY !== item.position.y) {
      result.set(item.id, { x: item.position.x, y: currentY });
    }
    currentY += item.size.height + gap;
  }

  return result;
}
