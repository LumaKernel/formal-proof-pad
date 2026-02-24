import type { ConnectorPortOnItem } from "./connector";
import { computePortConnectionPath, type Obstacle } from "./connectionPath";
import type { ViewportState } from "./types";

export interface PortConnectionProps {
  /** Source port with item geometry */
  readonly from: ConnectorPortOnItem;
  /** Target port with item geometry */
  readonly to: ConnectorPortOnItem;
  /** Current viewport state */
  readonly viewport: ViewportState;
  /** Stroke color of the connection line */
  readonly color?: string;
  /** Stroke width in pixels */
  readonly strokeWidth?: number;
  /** Other items on the canvas that the connection should try to avoid */
  readonly obstacles?: readonly Obstacle[];
}

/**
 * Renders a bezier curve connection between two connector ports.
 * Similar to Connection but uses explicit port positions instead of
 * auto-determined edge midpoints.
 */
export function PortConnection({
  from,
  to,
  viewport,
  color = "#666",
  strokeWidth = 2,
  obstacles = [],
}: PortConnectionProps) {
  const path = computePortConnectionPath(from, to, viewport, obstacles);

  return (
    <svg
      data-testid="port-connection"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {/* Background stroke for visibility behind items */}
      <path
        d={path.d}
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth + 2}
        strokeDasharray="8 4"
        opacity={0.6}
      />
      {/* Main stroke */}
      <path
        data-testid="port-connection-path"
        d={path.d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray="8 4"
        opacity={0.8}
      />
    </svg>
  );
}
