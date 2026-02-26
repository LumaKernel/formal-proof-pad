import { describe, it, expect } from "vitest";
import {
  computeViewportBounds,
  isItemVisible,
  isConnectionVisible,
  computeVisibleItemIds,
  DEFAULT_CULLING_CONFIG,
} from "./viewportCulling";
import type {
  ViewportBounds,
  CullingConfig,
  CullableItem,
  CullableConnection,
  CullableItemWithId,
} from "./viewportCulling";

describe("computeViewportBounds", () => {
  it("scale=1, offset=0でコンテナサイズ+バッファの範囲を返す", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 1 };
    const containerSize = { width: 800, height: 600 };
    const bounds = computeViewportBounds(viewport, containerSize);

    expect(bounds).toEqual({
      minX: -200, // 0 - buffer
      minY: -200,
      maxX: 1000, // 800 + buffer
      maxY: 800, // 600 + buffer
    });
  });

  it("パンオフセットが適用される", () => {
    // offsetX=-100 means world is shifted right by 100/scale
    const viewport = { offsetX: -100, offsetY: -50, scale: 1 };
    const containerSize = { width: 800, height: 600 };
    const bounds = computeViewportBounds(viewport, containerSize);

    // worldLeft = -(-100) / 1 = 100
    // worldTop = -(-50) / 1 = 50
    expect(bounds).toEqual({
      minX: -100, // 100 - 200
      minY: -150, // 50 - 200
      maxX: 1100, // 100 + 800 + 200
      maxY: 850, // 50 + 600 + 200
    });
  });

  it("ズームスケールが適用される", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 2 };
    const containerSize = { width: 800, height: 600 };
    const bounds = computeViewportBounds(viewport, containerSize);

    // worldRight = 0 + 800/2 = 400
    // worldBottom = 0 + 600/2 = 300
    expect(bounds).toEqual({
      minX: -200,
      minY: -200,
      maxX: 600, // 400 + 200
      maxY: 500, // 300 + 200
    });
  });

  it("小さいスケールでは広いワールド領域がカバーされる", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 0.5 };
    const containerSize = { width: 800, height: 600 };
    const bounds = computeViewportBounds(viewport, containerSize);

    // worldRight = 0 + 800/0.5 = 1600
    // worldBottom = 0 + 600/0.5 = 1200
    expect(bounds).toEqual({
      minX: -200,
      minY: -200,
      maxX: 1800, // 1600 + 200
      maxY: 1400, // 1200 + 200
    });
  });

  it("カスタムバッファ設定", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 1 };
    const containerSize = { width: 800, height: 600 };
    const config: CullingConfig = { bufferPx: 50 };
    const bounds = computeViewportBounds(viewport, containerSize, config);

    expect(bounds).toEqual({
      minX: -50,
      minY: -50,
      maxX: 850,
      maxY: 650,
    });
  });

  it("バッファ0でビューポートぴったりの範囲", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 1 };
    const containerSize = { width: 800, height: 600 };
    const config: CullingConfig = { bufferPx: 0 };
    const bounds = computeViewportBounds(viewport, containerSize, config);

    // 0 - 0 = -0 in JS, so use closeTo for min values
    expect(bounds.minX).toBeCloseTo(0);
    expect(bounds.minY).toBeCloseTo(0);
    expect(bounds.maxX).toBe(800);
    expect(bounds.maxY).toBe(600);
  });

  it("DEFAULT_CULLING_CONFIGの値が正しい", () => {
    expect(DEFAULT_CULLING_CONFIG).toEqual({ bufferPx: 200 });
  });
});

describe("isItemVisible", () => {
  const bounds: ViewportBounds = {
    minX: 0,
    minY: 0,
    maxX: 800,
    maxY: 600,
  };

  it("ビューポート内のアイテムは可視", () => {
    const item: CullableItem = {
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
    };
    expect(isItemVisible(item, bounds)).toBe(true);
  });

  it("完全にビューポート外（右側）のアイテムは不可視", () => {
    const item: CullableItem = {
      position: { x: 900, y: 100 },
      size: { width: 100, height: 100 },
    };
    expect(isItemVisible(item, bounds)).toBe(false);
  });

  it("完全にビューポート外（左側）のアイテムは不可視", () => {
    const item: CullableItem = {
      position: { x: -200, y: 100 },
      size: { width: 100, height: 100 },
    };
    expect(isItemVisible(item, bounds)).toBe(false);
  });

  it("完全にビューポート外（上側）のアイテムは不可視", () => {
    const item: CullableItem = {
      position: { x: 100, y: -200 },
      size: { width: 100, height: 100 },
    };
    expect(isItemVisible(item, bounds)).toBe(false);
  });

  it("完全にビューポート外（下側）のアイテムは不可視", () => {
    const item: CullableItem = {
      position: { x: 100, y: 700 },
      size: { width: 100, height: 100 },
    };
    expect(isItemVisible(item, bounds)).toBe(false);
  });

  it("境界にちょうど触れるアイテム（右端=bounds.minX）は不可視", () => {
    // item right edge = 0 = bounds.minX → not overlapping (> not >=)
    const item: CullableItem = {
      position: { x: -100, y: 100 },
      size: { width: 100, height: 100 },
    };
    expect(isItemVisible(item, bounds)).toBe(false);
  });

  it("境界を1px超えるアイテムは可視", () => {
    // item right edge = 1 > bounds.minX(0)
    const item: CullableItem = {
      position: { x: -99, y: 100 },
      size: { width: 100, height: 100 },
    };
    expect(isItemVisible(item, bounds)).toBe(true);
  });

  it("ビューポートと部分的に重なるアイテムは可視", () => {
    const item: CullableItem = {
      position: { x: 750, y: 550 },
      size: { width: 200, height: 200 },
    };
    expect(isItemVisible(item, bounds)).toBe(true);
  });

  it("ビューポートを完全に包含する大きなアイテムは可視", () => {
    const item: CullableItem = {
      position: { x: -100, y: -100 },
      size: { width: 1000, height: 800 },
    };
    expect(isItemVisible(item, bounds)).toBe(true);
  });

  it("サイズ0のアイテム（ビューポート内）は可視", () => {
    const item: CullableItem = {
      position: { x: 400, y: 300 },
      size: { width: 0, height: 0 },
    };
    // position.x(400) < maxX(800), right(400) > minX(0)
    // position.y(300) < maxY(600), bottom(300) > minY(0)
    expect(isItemVisible(item, bounds)).toBe(true);
  });

  it("サイズ0のアイテム（ビューポート境界上）は不可視", () => {
    // position exactly at bounds edge
    const item: CullableItem = {
      position: { x: 800, y: 300 },
      size: { width: 0, height: 0 },
    };
    // item.position.x(800) < bounds.maxX(800) → false
    expect(isItemVisible(item, bounds)).toBe(false);
  });
});

describe("isConnectionVisible", () => {
  const bounds: ViewportBounds = {
    minX: 0,
    minY: 0,
    maxX: 800,
    maxY: 600,
  };

  it("両端がビューポート内の接続は可視", () => {
    const conn: CullableConnection = {
      fromPosition: { x: 100, y: 100 },
      fromSize: { width: 200, height: 50 },
      toPosition: { x: 400, y: 300 },
      toSize: { width: 200, height: 50 },
    };
    expect(isConnectionVisible(conn, bounds)).toBe(true);
  });

  it("両端が完全にビューポート外（同じ側）の接続は不可視", () => {
    const conn: CullableConnection = {
      fromPosition: { x: 900, y: 100 },
      fromSize: { width: 100, height: 50 },
      toPosition: { x: 1100, y: 300 },
      toSize: { width: 100, height: 50 },
    };
    expect(isConnectionVisible(conn, bounds)).toBe(false);
  });

  it("接続がビューポートをまたぐ場合は可視", () => {
    // from は左上、to は右下 → AABBがビューポートと重なる
    const conn: CullableConnection = {
      fromPosition: { x: -200, y: -100 },
      fromSize: { width: 100, height: 50 },
      toPosition: { x: 900, y: 700 },
      toSize: { width: 100, height: 50 },
    };
    expect(isConnectionVisible(conn, bounds)).toBe(true);
  });

  it("両端がビューポート外の反対側にある場合は可視", () => {
    // from は左側、to は右側
    const conn: CullableConnection = {
      fromPosition: { x: -300, y: 200 },
      fromSize: { width: 100, height: 50 },
      toPosition: { x: 900, y: 200 },
      toSize: { width: 100, height: 50 },
    };
    expect(isConnectionVisible(conn, bounds)).toBe(true);
  });

  it("片方がビューポート内にある場合は可視", () => {
    const conn: CullableConnection = {
      fromPosition: { x: 400, y: 300 },
      fromSize: { width: 100, height: 50 },
      toPosition: { x: 1000, y: 800 },
      toSize: { width: 100, height: 50 },
    };
    expect(isConnectionVisible(conn, bounds)).toBe(true);
  });
});

describe("computeVisibleItemIds", () => {
  const bounds: ViewportBounds = {
    minX: 0,
    minY: 0,
    maxX: 800,
    maxY: 600,
  };

  it("空の配列で空セットを返す", () => {
    const result = computeVisibleItemIds([], bounds);
    expect(result.size).toBe(0);
  });

  it("すべて可視の場合は全IDを返す", () => {
    const items: readonly CullableItemWithId[] = [
      {
        id: "a",
        position: { x: 100, y: 100 },
        size: { width: 100, height: 50 },
      },
      {
        id: "b",
        position: { x: 400, y: 300 },
        size: { width: 100, height: 50 },
      },
    ];
    const result = computeVisibleItemIds(items, bounds);
    expect(result).toEqual(new Set(["a", "b"]));
  });

  it("一部が不可視の場合は可視アイテムのIDのみ返す", () => {
    const items: readonly CullableItemWithId[] = [
      {
        id: "visible",
        position: { x: 100, y: 100 },
        size: { width: 100, height: 50 },
      },
      {
        id: "hidden",
        position: { x: 2000, y: 2000 },
        size: { width: 100, height: 50 },
      },
    ];
    const result = computeVisibleItemIds(items, bounds);
    expect(result).toEqual(new Set(["visible"]));
  });

  it("すべて不可視の場合は空セットを返す", () => {
    const items: readonly CullableItemWithId[] = [
      {
        id: "a",
        position: { x: -500, y: -500 },
        size: { width: 100, height: 50 },
      },
      {
        id: "b",
        position: { x: 2000, y: 2000 },
        size: { width: 100, height: 50 },
      },
    ];
    const result = computeVisibleItemIds(items, bounds);
    expect(result.size).toBe(0);
  });

  it("多数のアイテムでも正しくフィルタされる", () => {
    const items: readonly CullableItemWithId[] = Array.from(
      { length: 100 },
      (_, i) => ({
        id: `item-${String(i) satisfies string}`,
        position: { x: i * 50, y: i * 50 },
        size: { width: 40, height: 30 },
      }),
    );
    const result = computeVisibleItemIds(items, bounds);
    // 可視: position.x < 800 && position.x + 40 > 0 && position.y < 600 && position.y + 30 > 0
    // position.x + 40 > 0 → always true for i >= 0
    // position.x < 800 → i * 50 < 800 → i < 16
    // position.y + 30 > 0 → always true for i >= 0
    // position.y < 600 → i * 50 < 600 → i < 12
    // So visible: i = 0..11 → 12 items
    expect(result.size).toBe(12);
  });
});
