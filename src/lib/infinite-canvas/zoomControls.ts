import type { Size, ViewportState } from "./types";
import type { ZoomItemBounds } from "./zoom";
import {
  applyZoom,
  computeFitToContentViewport,
  computeResetViewport,
  computeZoomInScale,
  computeZoomOutScale,
  formatZoomPercent,
  MIN_SCALE,
  MAX_SCALE,
  ZOOM_PRESETS,
} from "./zoom";

/** Position of the zoom controls overlay within the canvas. */
export type ZoomControlsPosition =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

/** Compute CSS placement style for the zoom controls position. Pure function. */
export function computeZoomControlsPlacementStyle(
  position: ZoomControlsPosition,
): Record<string, string> {
  switch (position) {
    case "bottom-left":
      return { bottom: "12px", left: "12px" };
    case "bottom-right":
      return { bottom: "12px", right: "12px" };
    case "top-left":
      return { top: "12px", left: "12px" };
    case "top-right":
      return { top: "12px", right: "12px" };
  }
}

/** Compute the viewport after a zoom-in action centered on the container center. Pure function. */
export function computeZoomInViewport(
  viewport: ViewportState,
  containerSize: Size,
  minScale: number = MIN_SCALE,
  maxScale: number = MAX_SCALE,
): ViewportState {
  const center = { x: containerSize.width / 2, y: containerSize.height / 2 };
  const newScale = computeZoomInScale(viewport.scale);
  return applyZoom(viewport, center, newScale, minScale, maxScale);
}

/** Compute the viewport after a zoom-out action centered on the container center. Pure function. */
export function computeZoomOutViewport(
  viewport: ViewportState,
  containerSize: Size,
  minScale: number = MIN_SCALE,
  maxScale: number = MAX_SCALE,
): ViewportState {
  const center = { x: containerSize.width / 2, y: containerSize.height / 2 };
  const newScale = computeZoomOutScale(viewport.scale);
  return applyZoom(viewport, center, newScale, minScale, maxScale);
}

/** Compute the viewport after zooming to a specific preset scale, centered on container center. Pure function. */
export function computePresetZoomViewport(
  viewport: ViewportState,
  containerSize: Size,
  presetScale: number,
  minScale: number = MIN_SCALE,
  maxScale: number = MAX_SCALE,
): ViewportState {
  const center = { x: containerSize.width / 2, y: containerSize.height / 2 };
  return applyZoom(viewport, center, presetScale, minScale, maxScale);
}

/** Compute button disabled states for zoom controls. Pure function. */
export function computeZoomButtonStates(
  scale: number,
  minScale: number = MIN_SCALE,
  maxScale: number = MAX_SCALE,
): {
  readonly zoomInDisabled: boolean;
  readonly zoomOutDisabled: boolean;
} {
  return {
    zoomInDisabled: scale >= maxScale,
    zoomOutDisabled: scale <= minScale,
  };
}

/** Compute the display label for the current zoom level. Pure function. */
export function computeZoomDisplayLabel(scale: number): string {
  return formatZoomPercent(scale);
}

/** Compute the full list of zoom preset display labels. Pure function. */
export function computePresetLabels(
  presets: readonly number[] = ZOOM_PRESETS,
): readonly string[] {
  return presets.map(formatZoomPercent);
}

/** Compute the viewport for "fit to content". Pure function. */
export function computeFitViewport(
  items: readonly ZoomItemBounds[],
  containerSize: Size,
  padding?: number,
  minScale?: number,
  maxScale?: number,
): ViewportState {
  return computeFitToContentViewport(
    items,
    containerSize,
    padding,
    minScale,
    maxScale,
  );
}

/** Compute the viewport for "reset to default". Pure function. */
export function computeResetZoomViewport(): ViewportState {
  return computeResetViewport();
}
