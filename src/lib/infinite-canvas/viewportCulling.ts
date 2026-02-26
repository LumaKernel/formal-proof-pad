/**
 * Viewport Culling の純粋ロジック。
 *
 * 画面外のアイテムを非表示にしてパフォーマンスを改善するための判定関数を提供する。
 * バッファゾーンを含むビューポート境界の計算、アイテム可視性判定、接続可視性判定。
 *
 * 変更時は viewportCulling.test.ts, InfiniteCanvas index.ts, ProofWorkspace.tsx も同期すること。
 */

import type { Point, Size, ViewportState } from "./types";

// --- ビューポート境界（ワールド座標） ---

/** ワールド座標系でのビューポート境界 */
export type ViewportBounds = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
};

/** バッファゾーン設定 */
export type CullingConfig = {
  /** ビューポート外側に追加するバッファ（ワールド座標ピクセル） */
  readonly bufferPx: number;
};

/** デフォルトのバッファゾーン（200ワールドピクセル） */
export const DEFAULT_CULLING_CONFIG: CullingConfig = {
  bufferPx: 200,
};

/**
 * ビューポートの可視領域をワールド座標で計算する。
 * バッファゾーンを含めた拡張された領域を返す。
 */
export function computeViewportBounds(
  viewport: ViewportState,
  containerSize: Size,
  config: CullingConfig = DEFAULT_CULLING_CONFIG,
): ViewportBounds {
  const worldLeft = -viewport.offsetX / viewport.scale;
  const worldTop = -viewport.offsetY / viewport.scale;
  const worldRight = worldLeft + containerSize.width / viewport.scale;
  const worldBottom = worldTop + containerSize.height / viewport.scale;

  return {
    minX: worldLeft - config.bufferPx,
    minY: worldTop - config.bufferPx,
    maxX: worldRight + config.bufferPx,
    maxY: worldBottom + config.bufferPx,
  };
}

// --- アイテム可視性判定 ---

/** カリング対象のアイテム（位置 + サイズ） */
export type CullableItem = {
  readonly position: Point;
  readonly size: Size;
};

/**
 * アイテムがビューポート境界内（バッファ含む）に存在するか判定する。
 * AABB (Axis-Aligned Bounding Box) の重なり判定。
 */
export function isItemVisible(
  item: CullableItem,
  bounds: ViewportBounds,
): boolean {
  const itemRight = item.position.x + item.size.width;
  const itemBottom = item.position.y + item.size.height;

  return (
    item.position.x < bounds.maxX &&
    itemRight > bounds.minX &&
    item.position.y < bounds.maxY &&
    itemBottom > bounds.minY
  );
}

// --- 接続可視性判定 ---

/** カリング対象の接続（両端点の位置 + サイズ） */
export type CullableConnection = {
  readonly fromPosition: Point;
  readonly fromSize: Size;
  readonly toPosition: Point;
  readonly toSize: Size;
};

/**
 * 接続がビューポート境界内に存在するか判定する。
 * 両端ノードの位置からAABBを構築し、ビューポートとの重なりを判定。
 * ベジェ曲線は端点AABBを超える場合があるが、バッファゾーンで吸収する。
 */
export function isConnectionVisible(
  conn: CullableConnection,
  bounds: ViewportBounds,
): boolean {
  // 両端ノードを包含するAABBを計算
  const fromRight = conn.fromPosition.x + conn.fromSize.width;
  const fromBottom = conn.fromPosition.y + conn.fromSize.height;
  const toRight = conn.toPosition.x + conn.toSize.width;
  const toBottom = conn.toPosition.y + conn.toSize.height;

  const connMinX = Math.min(conn.fromPosition.x, conn.toPosition.x);
  const connMinY = Math.min(conn.fromPosition.y, conn.toPosition.y);
  const connMaxX = Math.max(fromRight, toRight);
  const connMaxY = Math.max(fromBottom, toBottom);

  return (
    connMinX < bounds.maxX &&
    connMaxX > bounds.minX &&
    connMinY < bounds.maxY &&
    connMaxY > bounds.minY
  );
}

// --- バッチカリング ---

/** IDを持つカリング対象アイテム */
export type CullableItemWithId = CullableItem & {
  readonly id: string;
};

/**
 * 可視アイテムのIDセットを返す。
 * サイズ不明のアイテムは安全のため常に可視とする。
 */
export function computeVisibleItemIds(
  items: readonly CullableItemWithId[],
  bounds: ViewportBounds,
): ReadonlySet<string> {
  const result = new Set<string>();
  for (const item of items) {
    if (isItemVisible(item, bounds)) {
      result.add(item.id);
    }
  }
  return result;
}
