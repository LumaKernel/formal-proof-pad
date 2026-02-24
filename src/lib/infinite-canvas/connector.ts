import type { ConnectionDirection } from "./connectionPath";
import type { Point } from "./types";

/**
 * A connector port defines a named attachment point on a canvas item's edge.
 * Connections attach to ports rather than to item centers.
 */
export type ConnectorPort = {
  /** Unique identifier for this port within the item */
  readonly id: string;
  /** Which edge of the item the port sits on */
  readonly edge: ConnectionDirection;
  /**
   * Position along the edge, from 0.0 (start) to 1.0 (end).
   * For top/bottom: 0.0 = left, 1.0 = right.
   * For left/right: 0.0 = top, 1.0 = bottom.
   * Default: 0.5 (center of the edge).
   */
  readonly position?: number;
};

/**
 * A connector port definition with an associated item rectangle.
 * Used to compute the world-space position of the port.
 */
export type ConnectorPortOnItem = {
  readonly port: ConnectorPort;
  /** Top-left position of the item in world-space */
  readonly itemPosition: Point;
  /** Width of the item in world-space */
  readonly itemWidth: number;
  /** Height of the item in world-space */
  readonly itemHeight: number;
};

/**
 * Compute the world-space position of a connector port on an item.
 *
 * For top/bottom edges: x varies along the width, y is at the edge.
 * For left/right edges: y varies along the height, x is at the edge.
 */
export function computePortPosition(portOnItem: ConnectorPortOnItem): Point {
  const { port, itemPosition, itemWidth, itemHeight } = portOnItem;
  const t = port.position ?? 0.5;

  switch (port.edge) {
    case "top":
      return {
        x: itemPosition.x + itemWidth * t,
        y: itemPosition.y,
      };
    case "bottom":
      return {
        x: itemPosition.x + itemWidth * t,
        y: itemPosition.y + itemHeight,
      };
    case "left":
      return {
        x: itemPosition.x,
        y: itemPosition.y + itemHeight * t,
      };
    case "right":
      return {
        x: itemPosition.x + itemWidth,
        y: itemPosition.y + itemHeight * t,
      };
  }
}

/**
 * Default set of connector ports for an item (one per edge, centered).
 */
export const DEFAULT_PORTS: readonly ConnectorPort[] = [
  { id: "top", edge: "top", position: 0.5 },
  { id: "right", edge: "right", position: 0.5 },
  { id: "bottom", edge: "bottom", position: 0.5 },
  { id: "left", edge: "left", position: 0.5 },
];

/**
 * Find a port by its ID within a list of ports.
 */
export function findPort(
  ports: readonly ConnectorPort[],
  portId: string,
): ConnectorPort | undefined {
  return ports.find((p) => p.id === portId);
}

/**
 * Compute the world-space position and direction for a port-based connection endpoint.
 * Returns the edge direction matching the port's edge for use in path computation.
 */
export function computePortEndpoint(portOnItem: ConnectorPortOnItem): {
  readonly position: Point;
  readonly direction: ConnectionDirection;
} {
  return {
    position: computePortPosition(portOnItem),
    direction: portOnItem.port.edge,
  };
}
