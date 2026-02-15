import { type ReactNode, useId } from "react";
import { computeGridPatternParams } from "./grid";
import type { ViewportState } from "./types";

export interface InfiniteCanvasProps {
  /** Current viewport state (offset + scale) */
  readonly viewport?: ViewportState;
  /** Spacing between grid dots in world-space pixels */
  readonly dotSpacing?: number;
  /** Color of the grid dots */
  readonly dotColor?: string;
  /** Background color of the canvas */
  readonly backgroundColor?: string;
  /** Child elements to render on the canvas */
  readonly children?: ReactNode;
}

const DEFAULT_VIEWPORT: ViewportState = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
};

/** A half-infinite canvas with a dot-grid background.
 *  Fills its parent container. */
export function InfiniteCanvas({
  viewport = DEFAULT_VIEWPORT,
  dotSpacing = 20,
  dotColor = "#c0c0c0",
  backgroundColor = "#ffffff",
  children,
}: InfiniteCanvasProps) {
  const patternId = useId();
  const { patternSize, patternOffsetX, patternOffsetY, dotRadius } =
    computeGridPatternParams(viewport, dotSpacing);

  return (
    <div
      data-testid="infinite-canvas"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        backgroundColor,
      }}
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
