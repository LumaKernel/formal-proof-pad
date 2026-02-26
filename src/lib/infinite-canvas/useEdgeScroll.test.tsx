import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEdgeScroll } from "./useEdgeScroll";
import type { ViewportState, Size } from "./types";
import type { EdgeScrollConfig } from "./edgeScrollLogic";

const CONTAINER_SIZE: Size = { width: 800, height: 600 };
const CONFIG: EdgeScrollConfig = { threshold: 40, maxSpeed: 800 };

describe("useEdgeScroll", () => {
  let rafCallbacks: Array<(time: number) => void>;
  let rafId: number;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: (time: number) => void) => {
      rafCallbacks.push(cb);
      rafId += 1;
      return rafId;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      void id;
      rafCallbacks = [];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function flushRaf(time: number) {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    for (const cb of cbs) {
      cb(time);
    }
  }

  it("does not start rAF when cursor is in center", () => {
    const viewport: ViewportState = { offsetX: 0, offsetY: 0, scale: 1 };
    const onViewportChange = vi.fn();

    const { result } = renderHook(() =>
      useEdgeScroll(viewport, CONTAINER_SIZE, onViewportChange, CONFIG),
    );

    act(() => {
      result.current.notifyDragMove({ x: 400, y: 300 });
    });

    expect(rafCallbacks).toHaveLength(0);
    expect(onViewportChange).not.toHaveBeenCalled();
  });

  it("starts rAF when cursor is near left edge", () => {
    const viewport: ViewportState = { offsetX: 0, offsetY: 0, scale: 1 };
    const onViewportChange = vi.fn();

    const { result } = renderHook(() =>
      useEdgeScroll(viewport, CONTAINER_SIZE, onViewportChange, CONFIG),
    );

    act(() => {
      result.current.notifyDragMove({ x: 10, y: 300 });
    });

    expect(rafCallbacks).toHaveLength(1);
  });

  it("pans viewport on rAF tick when cursor is near edge", () => {
    let viewport: ViewportState = { offsetX: 100, offsetY: 200, scale: 1 };
    const onViewportChange = vi.fn((v: ViewportState) => {
      viewport = v;
    });

    const { result, rerender } = renderHook(
      ({ vp }: { readonly vp: ViewportState }) =>
        useEdgeScroll(vp, CONTAINER_SIZE, onViewportChange, CONFIG),
      { initialProps: { vp: viewport } },
    );

    act(() => {
      result.current.notifyDragMove({ x: 0, y: 300 }); // left edge, full penetration
    });

    // First tick: sets lastTime, no viewport change yet
    act(() => {
      flushRaf(1000);
    });
    expect(onViewportChange).not.toHaveBeenCalled();

    // Rerender with same viewport to sync ref
    rerender({ vp: viewport });

    // Second tick: applies delta
    act(() => {
      flushRaf(1016); // 16ms later
    });
    expect(onViewportChange).toHaveBeenCalledOnce();
    const newViewport = onViewportChange.mock.calls[0]![0]!;
    // dx = 1 * (1^2) * 800 = 800 px/s, elapsed = 0.016s → offset change = 12.8
    expect(newViewport.offsetX).toBeCloseTo(100 + 800 * 0.016);
    expect(newViewport.offsetY).toBe(200);
  });

  it("stops rAF when notifyDragEnd is called", () => {
    const viewport: ViewportState = { offsetX: 0, offsetY: 0, scale: 1 };
    const onViewportChange = vi.fn();

    const { result } = renderHook(() =>
      useEdgeScroll(viewport, CONTAINER_SIZE, onViewportChange, CONFIG),
    );

    act(() => {
      result.current.notifyDragMove({ x: 0, y: 300 });
    });
    expect(rafCallbacks).toHaveLength(1);

    act(() => {
      result.current.notifyDragEnd();
    });
    expect(rafCallbacks).toHaveLength(0);
  });

  it("stops rAF loop when cursor moves back to center", () => {
    const viewport: ViewportState = { offsetX: 0, offsetY: 0, scale: 1 };
    const onViewportChange = vi.fn();

    const { result } = renderHook(() =>
      useEdgeScroll(viewport, CONTAINER_SIZE, onViewportChange, CONFIG),
    );

    // Start near edge
    act(() => {
      result.current.notifyDragMove({ x: 0, y: 300 });
    });
    expect(rafCallbacks).toHaveLength(1);

    // Move cursor to center
    act(() => {
      result.current.notifyDragMove({ x: 400, y: 300 });
    });

    // Tick: should compute zero delta and stop
    act(() => {
      flushRaf(1000);
    });

    // No more rAF scheduled
    expect(rafCallbacks).toHaveLength(0);
  });

  it("does not double-schedule rAF on repeated edge moves", () => {
    const viewport: ViewportState = { offsetX: 0, offsetY: 0, scale: 1 };
    const onViewportChange = vi.fn();

    const { result } = renderHook(() =>
      useEdgeScroll(viewport, CONTAINER_SIZE, onViewportChange, CONFIG),
    );

    act(() => {
      result.current.notifyDragMove({ x: 10, y: 300 });
    });
    expect(rafCallbacks).toHaveLength(1);

    act(() => {
      result.current.notifyDragMove({ x: 5, y: 300 });
    });
    // Should still be just 1 scheduled rAF
    expect(rafCallbacks).toHaveLength(1);
  });

  it("handles bottom-right corner edge scrolling", () => {
    let viewport: ViewportState = { offsetX: 0, offsetY: 0, scale: 1 };
    const onViewportChange = vi.fn((v: ViewportState) => {
      viewport = v;
    });

    const { result, rerender } = renderHook(
      ({ vp }: { readonly vp: ViewportState }) =>
        useEdgeScroll(vp, CONTAINER_SIZE, onViewportChange, CONFIG),
      { initialProps: { vp: viewport } },
    );

    act(() => {
      result.current.notifyDragMove({ x: 800, y: 600 }); // bottom-right corner
    });

    // First tick
    act(() => {
      flushRaf(1000);
    });

    rerender({ vp: viewport });

    // Second tick
    act(() => {
      flushRaf(1016);
    });

    expect(onViewportChange).toHaveBeenCalledOnce();
    const newViewport = onViewportChange.mock.calls[0]![0]!;
    expect(newViewport.offsetX).toBeLessThan(0); // panned left
    expect(newViewport.offsetY).toBeLessThan(0); // panned up
  });
});
