import type { Point } from "./types";

/** Default grid spacing for snapping (same as default dot spacing) */
export const DEFAULT_SNAP_GRID_SPACING = 20;

/** Configuration for grid snapping behavior */
export interface SnapConfig {
  /** Whether grid snapping is enabled */
  readonly enabled: boolean;
  /** Grid spacing in world units (default: 20) */
  readonly gridSpacing: number;
}

/** Default snap configuration: disabled */
export const SNAP_DISABLED: SnapConfig = {
  enabled: false,
  gridSpacing: DEFAULT_SNAP_GRID_SPACING,
};

/** Snap a world-space position to the nearest grid point.
 *  Pure function — no side effects.
 *
 *  @param position    World-space position to snap
 *  @param gridSpacing Grid spacing in world units
 *  @returns           Snapped world-space position */
export function snapToGrid(position: Point, gridSpacing: number): Point {
  if (gridSpacing <= 0) {
    return position;
  }
  // Normalize -0 to 0 with `|| 0` (Math.round(-0.5) produces -0 in JS)
  return {
    x: Math.round(position.x / gridSpacing) * gridSpacing || 0,
    y: Math.round(position.y / gridSpacing) * gridSpacing || 0,
  };
}

/** Conditionally apply grid snapping based on config.
 *  If snapping is disabled, returns position unchanged.
 *  Pure function — no side effects.
 *
 *  @param position   World-space position
 *  @param snapConfig Snap configuration
 *  @returns          Position (snapped if enabled, unchanged otherwise) */
export function applySnap(position: Point, snapConfig: SnapConfig): Point {
  if (!snapConfig.enabled) {
    return position;
  }
  return snapToGrid(position, snapConfig.gridSpacing);
}
