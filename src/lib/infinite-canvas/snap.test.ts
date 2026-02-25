import { describe, expect, it } from "vitest";
import {
  DEFAULT_SNAP_GRID_SPACING,
  SNAP_DISABLED,
  applySnap,
  snapToGrid,
} from "./snap";
import type { SnapConfig } from "./snap";

describe("snapToGrid", () => {
  it("snaps to nearest grid point at default spacing", () => {
    expect(snapToGrid({ x: 12, y: 18 }, 20)).toEqual({ x: 20, y: 20 });
  });

  it("snaps exactly on grid point unchanged", () => {
    expect(snapToGrid({ x: 40, y: 60 }, 20)).toEqual({ x: 40, y: 60 });
  });

  it("snaps down when closer to lower grid line", () => {
    expect(snapToGrid({ x: 9, y: 9 }, 20)).toEqual({ x: 0, y: 0 });
  });

  it("snaps to midpoint rounding (Math.round: 0.5 rounds up)", () => {
    expect(snapToGrid({ x: 10, y: 10 }, 20)).toEqual({ x: 20, y: 20 });
  });

  it("handles negative positions", () => {
    expect(snapToGrid({ x: -12, y: -18 }, 20)).toEqual({ x: -20, y: -20 });
  });

  it("handles negative midpoint rounding (normalized from -0)", () => {
    // Math.round(-0.5) produces -0 in JS; implementation normalizes to 0
    expect(snapToGrid({ x: -10, y: -10 }, 20)).toEqual({ x: 0, y: 0 });
  });

  it("works with custom grid spacing", () => {
    expect(snapToGrid({ x: 7, y: 13 }, 10)).toEqual({ x: 10, y: 10 });
  });

  it("works with large grid spacing", () => {
    expect(snapToGrid({ x: 55, y: 130 }, 100)).toEqual({ x: 100, y: 100 });
  });

  it("returns position unchanged when gridSpacing is 0", () => {
    expect(snapToGrid({ x: 12, y: 18 }, 0)).toEqual({ x: 12, y: 18 });
  });

  it("returns position unchanged when gridSpacing is negative", () => {
    expect(snapToGrid({ x: 12, y: 18 }, -5)).toEqual({ x: 12, y: 18 });
  });

  it("handles origin position", () => {
    expect(snapToGrid({ x: 0, y: 0 }, 20)).toEqual({ x: 0, y: 0 });
  });

  it("handles fractional positions", () => {
    expect(snapToGrid({ x: 10.5, y: 29.9 }, 20)).toEqual({ x: 20, y: 20 });
  });

  it("handles small grid spacing", () => {
    expect(snapToGrid({ x: 3.7, y: 1.2 }, 5)).toEqual({ x: 5, y: 0 });
  });
});

describe("applySnap", () => {
  const enabledConfig: SnapConfig = {
    enabled: true,
    gridSpacing: 20,
  };

  it("returns position unchanged when snap is disabled", () => {
    expect(applySnap({ x: 12, y: 18 }, SNAP_DISABLED)).toEqual({
      x: 12,
      y: 18,
    });
  });

  it("snaps position when enabled", () => {
    expect(applySnap({ x: 12, y: 18 }, enabledConfig)).toEqual({
      x: 20,
      y: 20,
    });
  });

  it("uses custom grid spacing from config", () => {
    const config: SnapConfig = { enabled: true, gridSpacing: 50 };
    expect(applySnap({ x: 30, y: 80 }, config)).toEqual({ x: 50, y: 100 });
  });

  it("SNAP_DISABLED has default grid spacing", () => {
    expect(SNAP_DISABLED.gridSpacing).toBe(DEFAULT_SNAP_GRID_SPACING);
  });

  it("SNAP_DISABLED has enabled false", () => {
    expect(SNAP_DISABLED.enabled).toBe(false);
  });
});
