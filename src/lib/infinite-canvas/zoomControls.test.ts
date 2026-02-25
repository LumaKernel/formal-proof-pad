import { describe, expect, it } from "vitest";
import { MIN_SCALE, MAX_SCALE } from "./zoom";
import {
  computeFitViewport,
  computePresetZoomViewport,
  computeResetZoomViewport,
  computeZoomButtonStates,
  computeZoomControlsPlacementStyle,
  computeZoomDisplayLabel,
  computeZoomInViewport,
  computeZoomOutViewport,
  computePresetLabels,
} from "./zoomControls";

describe("computeZoomControlsPlacementStyle", () => {
  it("returns bottom-left position", () => {
    const style = computeZoomControlsPlacementStyle("bottom-left");
    expect(style).toEqual({ bottom: "12px", left: "12px" });
  });

  it("returns bottom-right position", () => {
    const style = computeZoomControlsPlacementStyle("bottom-right");
    expect(style).toEqual({ bottom: "12px", right: "12px" });
  });

  it("returns top-left position", () => {
    const style = computeZoomControlsPlacementStyle("top-left");
    expect(style).toEqual({ top: "12px", left: "12px" });
  });

  it("returns top-right position", () => {
    const style = computeZoomControlsPlacementStyle("top-right");
    expect(style).toEqual({ top: "12px", right: "12px" });
  });
});

describe("computeZoomInViewport", () => {
  const containerSize = { width: 800, height: 600 };

  it("increases scale", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 1 };
    const result = computeZoomInViewport(viewport, containerSize);
    expect(result.scale).toBeGreaterThan(1);
  });

  it("zooms centered on container center", () => {
    const viewport = { offsetX: 100, offsetY: 50, scale: 1 };
    const result = computeZoomInViewport(viewport, containerSize);
    // The world point at the center of the container should stay at the center
    const centerWorld = {
      x: (400 - viewport.offsetX) / viewport.scale,
      y: (300 - viewport.offsetY) / viewport.scale,
    };
    const screenAfter = {
      x: centerWorld.x * result.scale + result.offsetX,
      y: centerWorld.y * result.scale + result.offsetY,
    };
    expect(screenAfter.x).toBeCloseTo(400, 5);
    expect(screenAfter.y).toBeCloseTo(300, 5);
  });

  it("does not exceed max scale", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: MAX_SCALE };
    const result = computeZoomInViewport(viewport, containerSize);
    expect(result.scale).toBe(MAX_SCALE);
  });
});

describe("computeZoomOutViewport", () => {
  const containerSize = { width: 800, height: 600 };

  it("decreases scale", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 1 };
    const result = computeZoomOutViewport(viewport, containerSize);
    expect(result.scale).toBeLessThan(1);
  });

  it("does not go below min scale", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: MIN_SCALE };
    const result = computeZoomOutViewport(viewport, containerSize);
    expect(result.scale).toBe(MIN_SCALE);
  });
});

describe("computePresetZoomViewport", () => {
  const containerSize = { width: 800, height: 600 };

  it("zooms to preset scale", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 1 };
    const result = computePresetZoomViewport(
      viewport,
      containerSize,
      2,
    );
    expect(result.scale).toBe(2);
  });

  it("clamps preset to allowed range", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 1 };
    const result = computePresetZoomViewport(
      viewport,
      containerSize,
      100,
    );
    expect(result.scale).toBe(MAX_SCALE);
  });
});

describe("computeZoomButtonStates", () => {
  it("both enabled at normal scale", () => {
    const result = computeZoomButtonStates(1);
    expect(result.zoomInDisabled).toBe(false);
    expect(result.zoomOutDisabled).toBe(false);
  });

  it("zoom in disabled at max", () => {
    const result = computeZoomButtonStates(MAX_SCALE);
    expect(result.zoomInDisabled).toBe(true);
    expect(result.zoomOutDisabled).toBe(false);
  });

  it("zoom out disabled at min", () => {
    const result = computeZoomButtonStates(MIN_SCALE);
    expect(result.zoomInDisabled).toBe(false);
    expect(result.zoomOutDisabled).toBe(true);
  });

  it("both disabled at min=max", () => {
    const result = computeZoomButtonStates(1, 1, 1);
    expect(result.zoomInDisabled).toBe(true);
    expect(result.zoomOutDisabled).toBe(true);
  });
});

describe("computeZoomDisplayLabel", () => {
  it("shows 100% for scale 1", () => {
    expect(computeZoomDisplayLabel(1)).toBe("100%");
  });

  it("shows 50% for scale 0.5", () => {
    expect(computeZoomDisplayLabel(0.5)).toBe("50%");
  });

  it("rounds to nearest integer", () => {
    expect(computeZoomDisplayLabel(0.333)).toBe("33%");
  });
});

describe("computePresetLabels", () => {
  it("returns formatted labels for all presets", () => {
    const labels = computePresetLabels([0.5, 1, 2]);
    expect(labels).toEqual(["50%", "100%", "200%"]);
  });
});

describe("computeFitViewport", () => {
  const containerSize = { width: 800, height: 600 };

  it("returns reset viewport for no items", () => {
    expect(computeFitViewport([], containerSize)).toEqual(
      computeResetZoomViewport(),
    );
  });

  it("fits items in container", () => {
    const items = [{ x: 0, y: 0, width: 400, height: 300 }];
    const result = computeFitViewport(items, containerSize);
    expect(result.scale).toBeGreaterThan(0);
  });
});

describe("computeResetZoomViewport", () => {
  it("returns default viewport", () => {
    expect(computeResetZoomViewport()).toEqual({
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    });
  });
});
