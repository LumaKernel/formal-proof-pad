import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMarquee } from "./useMarquee";
import type { ViewportState } from "./types";
import type { SelectableItem } from "./multiSelection";

const DEFAULT_VIEWPORT: ViewportState = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

const ITEMS: readonly SelectableItem[] = [
  { id: "a", position: { x: 10, y: 10 }, size: { width: 80, height: 40 } },
  {
    id: "b",
    position: { x: 200, y: 200 },
    size: { width: 80, height: 40 },
  },
  { id: "c", position: { x: 50, y: 20 }, size: { width: 60, height: 30 } },
];

/**
 * useMarquee が PointerEvent から読み取るフィールドのみを持つ型。
 * テスト用に最小限のフィールドだけモックする。
 */
type PointerEventSubset = Pick<
  React.PointerEvent<HTMLElement>,
  "clientX" | "clientY" | "button" | "shiftKey" | "pointerId"
> & {
  readonly currentTarget: {
    readonly setPointerCapture: (id: number) => void;
    readonly releasePointerCapture: (id: number) => void;
  };
};

/** テストモック用: PointerEventSubset を React.PointerEvent として扱う */
function asPointerEvent(
  subset: PointerEventSubset,
): React.PointerEvent<HTMLElement> {
  // テスト用モック: hookが使うフィールドのみ含む部分オブジェクト
  return subset as never;
}

function createPointerEvent(
  clientX: number,
  clientY: number,
  opts: { button?: number; shiftKey?: boolean } = {},
): React.PointerEvent<HTMLElement> {
  return asPointerEvent({
    clientX,
    clientY,
    button: opts.button ?? 0,
    shiftKey: opts.shiftKey ?? false,
    pointerId: 1,
    currentTarget: {
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
    },
  });
}

function createContainerRef(
  rect: { left: number; top: number } = { left: 0, top: 0 },
) {
  return {
    current: {
      getBoundingClientRect: () => ({
        left: rect.left,
        top: rect.top,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: rect.left,
        y: rect.top,
        toJSON: () => ({}),
      }),
    } as HTMLDivElement,
  };
}

describe("useMarquee", () => {
  it("初期状態ではマーキーは非アクティブ", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );
    expect(result.current.marqueeRect).toBe(null);
    expect(result.current.isMarqueeActive).toBe(false);
  });

  it("pointerDownでマーキーがアクティブになる", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 100));
    });

    expect(result.current.isMarqueeActive).toBe(true);
    expect(result.current.marqueeRect).toEqual({
      x: 100,
      y: 100,
      width: 0,
      height: 0,
    });
  });

  it("右クリックではマーキーが開始しない", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 100, { button: 2 }));
    });

    expect(result.current.isMarqueeActive).toBe(false);
  });

  it("pointerMoveでマーキー矩形が更新される", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 100));
    });
    act(() => {
      result.current.onPointerMove(createPointerEvent(300, 250));
    });

    expect(result.current.marqueeRect).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 150,
    });
  });

  it("pointerMoveはマーキー非アクティブ時は何もしない", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerMove(createPointerEvent(300, 250));
    });

    expect(result.current.marqueeRect).toBe(null);
  });

  it("pointerUpでマーキーが完了し選択が更新される", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerDown(createPointerEvent(0, 0));
    });
    act(() => {
      result.current.onPointerMove(createPointerEvent(120, 60));
    });
    act(() => {
      result.current.onPointerUp(createPointerEvent(120, 60));
    });

    expect(result.current.isMarqueeActive).toBe(false);
    expect(result.current.marqueeRect).toBe(null);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    // a (10,10 80x40) と c (50,20 60x30) が0,0-120,60に入る
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["a", "c"]));
  });

  it("小さなマーキー（3px以下）では選択が更新されない", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 100));
    });
    act(() => {
      result.current.onPointerUp(createPointerEvent(102, 102));
    });

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("Shift+マーキーで既存選択に追加する", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    const existingSelection = new Set(["b"]);
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        existingSelection,
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerDown(
        createPointerEvent(0, 0, { shiftKey: true }),
      );
    });
    act(() => {
      result.current.onPointerUp(createPointerEvent(120, 60));
    });

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["b", "a", "c"]));
  });

  it("pointerUpはマーキー非アクティブ時は何もしない", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerUp(createPointerEvent(120, 60));
    });

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("コンテナのオフセットを考慮してローカル座標を計算する", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef({ left: 50, top: 30 });
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerDown(createPointerEvent(150, 130));
    });

    // clientX=150, containerLeft=50 → localX=100
    // clientY=130, containerTop=30 → localY=100
    expect(result.current.marqueeRect).toEqual({
      x: 100,
      y: 100,
      width: 0,
      height: 0,
    });
  });

  it("containerRefがnullの場合clientXをそのまま使う", () => {
    const onSelectionChange = vi.fn();
    const containerRef = { current: null };
    const { result } = renderHook(() =>
      useMarquee(
        DEFAULT_VIEWPORT,
        ITEMS,
        new Set(),
        onSelectionChange,
        containerRef,
      ),
    );

    act(() => {
      result.current.onPointerDown(createPointerEvent(100, 200));
    });

    expect(result.current.marqueeRect).toEqual({
      x: 100,
      y: 200,
      width: 0,
      height: 0,
    });
  });

  it("ビューポートスケールを考慮したヒット判定", () => {
    const onSelectionChange = vi.fn();
    const containerRef = createContainerRef();
    // スケール2.0: スクリーン上の0-200はワールド上の0-100
    const viewport: ViewportState = { offsetX: 0, offsetY: 0, scale: 2 };
    const { result } = renderHook(() =>
      useMarquee(viewport, ITEMS, new Set(), onSelectionChange, containerRef),
    );

    act(() => {
      result.current.onPointerDown(createPointerEvent(0, 0));
    });
    act(() => {
      result.current.onPointerUp(createPointerEvent(200, 100));
    });

    // ワールド座標: 0,0 → 100,50
    // a (10,10 80x40) → 含まれる (10+80=90 < 100, 10+40=50 ≤ 50)
    // c (50,20 60x30) → 50+60=110 > 100 だが重なりは50-100と50-110で重なる → 含まれる
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["a", "c"]));
  });
});
