import { describe, expect, it } from "vitest";
import { applyPanDelta, computeDelta } from "./pan";

describe("applyPanDelta", () => {
  it("adds delta to viewport offset", () => {
    const result = applyPanDelta(
      { offsetX: 10, offsetY: 20, scale: 1 },
      { x: 5, y: -3 },
    );
    expect(result).toEqual({ offsetX: 15, offsetY: 17, scale: 1 });
  });

  it("preserves scale", () => {
    const result = applyPanDelta(
      { offsetX: 0, offsetY: 0, scale: 2.5 },
      { x: 100, y: 200 },
    );
    expect(result.scale).toBe(2.5);
  });

  it("handles negative offsets", () => {
    const result = applyPanDelta(
      { offsetX: -50, offsetY: -30, scale: 1 },
      { x: -10, y: -20 },
    );
    expect(result).toEqual({ offsetX: -60, offsetY: -50, scale: 1 });
  });

  it("handles zero delta", () => {
    const viewport = { offsetX: 42, offsetY: 13, scale: 1 };
    const result = applyPanDelta(viewport, { x: 0, y: 0 });
    expect(result).toEqual(viewport);
  });
});

describe("computeDelta", () => {
  it("computes difference between two points", () => {
    const result = computeDelta({ x: 10, y: 20 }, { x: 30, y: 50 });
    expect(result).toEqual({ x: 20, y: 30 });
  });

  it("returns negative values when moving backward", () => {
    const result = computeDelta({ x: 100, y: 100 }, { x: 50, y: 70 });
    expect(result).toEqual({ x: -50, y: -30 });
  });

  it("returns zero for identical points", () => {
    const result = computeDelta({ x: 42, y: 13 }, { x: 42, y: 13 });
    expect(result).toEqual({ x: 0, y: 0 });
  });
});
