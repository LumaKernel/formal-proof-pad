import { describe, expect, it } from "vitest";
import {
  CLICK_DISTANCE_THRESHOLD,
  closeNodeMenu,
  isClick,
  NODE_MENU_CLOSED,
  openNodeMenu,
} from "./nodeMenu";

describe("NODE_MENU_CLOSED", () => {
  it("has open: false", () => {
    expect(NODE_MENU_CLOSED).toEqual({ open: false });
  });
});

describe("openNodeMenu", () => {
  it("returns an open state with the given nodeId and screen position", () => {
    const state = openNodeMenu("node-1", 100, 200);
    expect(state).toEqual({
      open: true,
      nodeId: "node-1",
      screenPosition: { x: 100, y: 200 },
    });
  });

  it("creates distinct objects for different calls", () => {
    const a = openNodeMenu("a", 0, 0);
    const b = openNodeMenu("b", 10, 20);
    expect(a).not.toBe(b);
    expect(a.open && a.nodeId).toBe("a");
    expect(b.open && b.nodeId).toBe("b");
  });
});

describe("closeNodeMenu", () => {
  it("returns the singleton closed state", () => {
    expect(closeNodeMenu()).toBe(NODE_MENU_CLOSED);
  });
});

describe("isClick", () => {
  it("returns true when start and end are the same point", () => {
    expect(isClick({ x: 10, y: 20 }, { x: 10, y: 20 })).toBe(true);
  });

  it("returns true when distance is exactly at threshold", () => {
    // distance = 5 (horizontal)
    expect(isClick({ x: 0, y: 0 }, { x: 5, y: 0 })).toBe(true);
  });

  it("returns false when distance exceeds threshold", () => {
    expect(isClick({ x: 0, y: 0 }, { x: 6, y: 0 })).toBe(false);
  });

  it("considers diagonal movement", () => {
    // distance = sqrt(3^2 + 4^2) = 5 => at threshold
    expect(isClick({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(true);
    // distance = sqrt(4^2 + 4^2) ≈ 5.66 => exceeds threshold
    expect(isClick({ x: 0, y: 0 }, { x: 4, y: 4 })).toBe(false);
  });

  it("handles negative deltas", () => {
    expect(isClick({ x: 10, y: 10 }, { x: 7, y: 6 })).toBe(true);
  });

  it("respects custom threshold", () => {
    expect(isClick({ x: 0, y: 0 }, { x: 10, y: 0 }, 15)).toBe(true);
    expect(isClick({ x: 0, y: 0 }, { x: 10, y: 0 }, 5)).toBe(false);
  });

  it("CLICK_DISTANCE_THRESHOLD is 5", () => {
    expect(CLICK_DISTANCE_THRESHOLD).toBe(5);
  });
});
