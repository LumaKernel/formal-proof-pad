import { type ReactNode, useId } from "react";
import { computeGridPatternParams } from "./grid";
import type { ViewportState } from "./types";
import { usePan } from "./usePan";

export interface InfiniteCanvasProps {
  /** Current viewport state (offset + scale) */
  readonly viewport?: ViewportState;
  /** Spacing between grid dots in world-space pixels */
  readonly dotSpacing?: number;
  /** Color of the grid dots */
  readonly dotColor?: string;
  /** Background color of the canvas */
  readonly backgroundColor?: string;
  /** Callback when viewport changes (e.g. from panning) */
  readonly onViewportChange?: (viewport: ViewportState) => void;
  /** Child elements to render on the canvas */
  readonly children?: ReactNode;
}

const DEFAULT_VIEWPORT: ViewportState = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

const NOOP = () => {};

/** A half-infinite canvas with a dot-grid background.
 *  Fills its parent container. */
export function InfiniteCanvas({
  viewport = DEFAULT_VIEWPORT,
  dotSpacing = 20,
  dotColor = "#c0c0c0",
  backgroundColor = "#ffffff",
  onViewportChange = NOOP,
  children,
}: InfiniteCanvasProps) {
  const patternId = useId();
  const { patternSize, patternOffsetX, patternOffsetY, dotRadius } =
    computeGridPatternParams(viewport, dotSpacing);

  const { isDragging, onPointerDown, onPointerMove, onPointerUp } = usePan(
    viewport,
    onViewportChange,
  );

  return (
    <div
      data-testid="infinite-canvas"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        backgroundColor,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={patternId}
            x={patternOffsetX}
            y={patternOffsetY}
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={dotRadius}
              cy={dotRadius}
              r={dotRadius}
              fill={dotColor}
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${patternId satisfies string})`}
        />
      </svg>
      {children}
    </div>
  );
}
