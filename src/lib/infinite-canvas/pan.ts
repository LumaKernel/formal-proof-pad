import type { Point, ViewportState } from "./types";

/** Compute the new viewport state after applying a pan delta.
 *  Pure function — no side effects. */
export function applyPanDelta(
  viewport: ViewportState,
  delta: Point,
): ViewportState {
  return {
    offsetX: viewport.offsetX + delta.x,
    offsetY: viewport.offsetY + delta.y,
    scale: viewport.scale,
  };
}

/** Compute the delta between two screen-space points.
 *  Useful for calculating mouse/touch movement. */
export function computeDelta(from: Point, to: Point): Point {
  return {
    x: to.x - from.x,
    y: to.y - from.y,
  };
}
