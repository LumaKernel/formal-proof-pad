import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConnectionPreview } from "./useConnectionPreview";
import type { PortCandidate } from "./connectionPreview";
import type { ConnectorPortOnItem } from "./connector";
import type { ViewportState } from "./types";

const defaultViewport: ViewportState = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

const sourcePort: ConnectorPortOnItem = {
  port: { id: "bottom", edge: "bottom", position: 0.5 },
  itemPosition: { x: 100, y: 100 },
  itemWidth: 100,
  itemHeight: 50,
};

const targetPort: ConnectorPortOnItem = {
  port: { id: "top", edge: "top", position: 0.5 },
  itemPosition: { x: 100, y: 250 },
  itemWidth: 100,
  itemHeight: 50,
};

const targetCandidate: PortCandidate = {
  itemId: "target-item",
  portOnItem: targetPort,
};

describe("useConnectionPreview", () => {
  it("initially has null preview state", () => {
    const { result } = renderHook(() =>
      useConnectionPreview(defaultViewport, [], undefined, undefined),
    );
    expect(result.current.previewState).toBeNull();
  });

  it("starts drag and creates preview state", () => {
    const { result } = renderHook(() =>
      useConnectionPreview(defaultViewport, [], undefined, undefined),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    expect(result.current.previewState).not.toBeNull();
    expect(result.current.previewState?.sourceItemId).toBe("source-item");
    expect(result.current.previewState?.mouseWorldPosition).toEqual({
      x: 150,
      y: 150,
    });
    expect(result.current.previewState?.snappedTarget).toBeNull();
  });

  it("updates drag position on mouse move", () => {
    const { result } = renderHook(() =>
      useConnectionPreview(defaultViewport, [], undefined, undefined),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    act(() => {
      result.current.updateDrag(200, 300);
    });

    expect(result.current.previewState?.mouseWorldPosition).toEqual({
      x: 200,
      y: 300,
    });
  });

  it("does nothing on updateDrag when not dragging", () => {
    const { result } = renderHook(() =>
      useConnectionPreview(defaultViewport, [], undefined, undefined),
    );

    act(() => {
      result.current.updateDrag(200, 300);
    });

    expect(result.current.previewState).toBeNull();
  });

  it("snaps to nearby port", () => {
    const candidates = [targetCandidate];

    const { result } = renderHook(() =>
      useConnectionPreview(defaultViewport, candidates, undefined, undefined),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    // Move near the target port (top port at x=150, y=250)
    act(() => {
      result.current.updateDrag(152, 252);
    });

    expect(result.current.previewState?.snappedTarget).not.toBeNull();
    expect(result.current.previewState?.snappedTarget?.itemId).toBe(
      "target-item",
    );
  });

  it("does not snap to source item ports", () => {
    const sourceSelfCandidate: PortCandidate = {
      itemId: "source-item",
      portOnItem: {
        port: { id: "top", edge: "top", position: 0.5 },
        itemPosition: { x: 100, y: 100 },
        itemWidth: 100,
        itemHeight: 50,
      },
    };

    const { result } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [sourceSelfCandidate],
        undefined,
        undefined,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 100);
    });

    // Move near the source item's own top port
    act(() => {
      result.current.updateDrag(150, 100);
    });

    expect(result.current.previewState?.snappedTarget).toBeNull();
  });

  it("validates connection when validator is provided", () => {
    const validator = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        validator,
        undefined,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    act(() => {
      result.current.updateDrag(152, 252);
    });

    expect(result.current.previewState?.snappedTarget).not.toBeNull();
    expect(result.current.previewState?.isValid).toBe(false);
    expect(validator).toHaveBeenCalledWith(
      "source-item",
      "bottom",
      "target-item",
      "top",
    );
  });

  it("marks as valid when validator returns true", () => {
    const validator = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        validator,
        undefined,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    act(() => {
      result.current.updateDrag(152, 252);
    });

    expect(result.current.previewState?.isValid).toBe(true);
  });

  it("marks as valid when no validator and snapped to target", () => {
    const { result } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        undefined,
        undefined,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    act(() => {
      result.current.updateDrag(152, 252);
    });

    expect(result.current.previewState?.isValid).toBe(true);
  });

  it("calls onConnectionComplete when dropping on valid target", () => {
    const onComplete = vi.fn();
    const validator = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        validator,
        onComplete,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    act(() => {
      result.current.updateDrag(152, 252);
    });

    act(() => {
      result.current.endDrag();
    });

    expect(onComplete).toHaveBeenCalledWith(
      "source-item",
      "bottom",
      "target-item",
      "top",
    );
    expect(result.current.previewState).toBeNull();
  });

  it("does not call onConnectionComplete when dropping on invalid target", () => {
    const onComplete = vi.fn();
    const validator = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        validator,
        onComplete,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    act(() => {
      result.current.updateDrag(152, 252);
    });

    act(() => {
      result.current.endDrag();
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(result.current.previewState).toBeNull();
  });

  it("does not call onConnectionComplete when not snapped to any target", () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        undefined,
        onComplete,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    // Mouse position is far from any port
    act(() => {
      result.current.updateDrag(500, 500);
    });

    act(() => {
      result.current.endDrag();
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("cancels drag without connecting", () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        undefined,
        onComplete,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    act(() => {
      result.current.updateDrag(152, 252);
    });

    act(() => {
      result.current.cancelDrag();
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(result.current.previewState).toBeNull();
  });

  it("does nothing on endDrag when not dragging", () => {
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useConnectionPreview(defaultViewport, [], undefined, onComplete),
    );

    act(() => {
      result.current.endDrag();
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(result.current.previewState).toBeNull();
  });

  it("applies viewport scale when converting screen to world coordinates", () => {
    const scaledViewport: ViewportState = {
      offsetX: 50,
      offsetY: 50,
      scale: 2,
    };

    const { result } = renderHook(() =>
      useConnectionPreview(scaledViewport, [], undefined, undefined),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 250, 250);
    });

    // screen (250, 250) with offset (50, 50) and scale 2 => world (100, 100)
    expect(result.current.previewState?.mouseWorldPosition).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("picks up updated viewport after rerender", () => {
    let viewport = defaultViewport;
    const { result, rerender } = renderHook(() =>
      useConnectionPreview(viewport, [], undefined, undefined),
    );

    // Start drag with default viewport
    act(() => {
      result.current.startDrag("source-item", sourcePort, 100, 100);
    });
    expect(result.current.previewState?.mouseWorldPosition).toEqual({
      x: 100,
      y: 100,
    });

    // Update viewport and rerender
    viewport = { offsetX: 0, offsetY: 0, scale: 2 };
    rerender();

    // updateDrag should use the new viewport
    act(() => {
      result.current.updateDrag(200, 200);
    });
    // screen (200, 200) with offset (0, 0) and scale 2 => world (100, 100)
    expect(result.current.previewState?.mouseWorldPosition).toEqual({
      x: 100,
      y: 100,
    });
  });

  it("picks up updated candidates after rerender", () => {
    let candidates: readonly PortCandidate[] = [];
    const { result, rerender } = renderHook(() =>
      useConnectionPreview(defaultViewport, candidates, undefined, undefined),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    // No candidates yet - no snap
    act(() => {
      result.current.updateDrag(152, 252);
    });
    expect(result.current.previewState?.snappedTarget).toBeNull();

    // Add candidates and rerender
    candidates = [targetCandidate];
    rerender();

    // Now should snap
    act(() => {
      result.current.updateDrag(152, 252);
    });
    expect(result.current.previewState?.snappedTarget).not.toBeNull();
  });

  it("picks up updated validator after rerender", () => {
    const validatorRef: {
      current:
        | ((s: string, sp: string, t: string, tp: string) => boolean)
        | undefined;
    } = { current: undefined };
    const { result, rerender } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        validatorRef.current,
        undefined,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    // No validator - valid by default when snapped
    act(() => {
      result.current.updateDrag(152, 252);
    });
    expect(result.current.previewState?.isValid).toBe(true);

    // Add rejecting validator and rerender
    validatorRef.current = () => false;
    rerender();

    act(() => {
      result.current.updateDrag(152, 252);
    });
    expect(result.current.previewState?.isValid).toBe(false);
  });

  it("picks up updated onConnectionComplete after rerender", () => {
    const onComplete1 = vi.fn();
    let onComplete = onComplete1;
    const { result, rerender } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        undefined,
        onComplete,
      ),
    );

    // Switch callback
    const onComplete2 = vi.fn();
    onComplete = onComplete2;
    rerender();

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    act(() => {
      result.current.updateDrag(152, 252);
    });

    act(() => {
      result.current.endDrag();
    });

    expect(onComplete1).not.toHaveBeenCalled();
    expect(onComplete2).toHaveBeenCalled();
  });

  it("picks up updated snap distance after rerender", () => {
    let snapDist = 5; // Very small snap distance
    const { result, rerender } = renderHook(() =>
      useConnectionPreview(
        defaultViewport,
        [targetCandidate],
        undefined,
        undefined,
        snapDist,
      ),
    );

    act(() => {
      result.current.startDrag("source-item", sourcePort, 150, 150);
    });

    // Target port is at (150, 250), mouse at (152, 252) => distance ~2.8, < 5
    act(() => {
      result.current.updateDrag(152, 252);
    });
    expect(result.current.previewState?.snappedTarget).not.toBeNull();

    // Change to even smaller snap distance
    snapDist = 1;
    rerender();

    act(() => {
      result.current.updateDrag(152, 252);
    });
    expect(result.current.previewState?.snappedTarget).toBeNull();
  });
});
