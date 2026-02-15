/** 2D point in canvas world space */
export type Point = {
  readonly x: number;
  readonly y: number;
};

/** Canvas viewport transform state */
export type ViewportState = {
  /** Horizontal offset (pan) in pixels */
  readonly offsetX: number;
  /** Vertical offset (pan) in pixels */
  readonly offsetY: number;
  /** Zoom scale factor (1.0 = 100%) */
  readonly scale: number;
};

/** Size of a rectangular area */
export type Size = {
  readonly width: number;
  readonly height: number;
};

/** A dot position for grid rendering */
export type GridDot = {
  readonly x: number;
  readonly y: number;
};
