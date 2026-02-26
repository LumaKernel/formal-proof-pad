import {
  computePortPosition,
  type ConnectorPort,
  type ConnectorPortOnItem,
} from "./connector";
import type { Point } from "./types";

/**
 * Information about a port candidate for snapping during connection preview.
 */
export type PortCandidate = {
  /** The item that owns this port */
  readonly itemId: string;
  /** Port on item with geometry */
  readonly portOnItem: ConnectorPortOnItem;
};

/**
 * The state of a connection preview (ghost line shown while dragging from a port).
 */
export type ConnectionPreviewState = {
  /** The source port being dragged from */
  readonly sourceItemId: string;
  readonly sourcePortOnItem: ConnectorPortOnItem;
  /** Current mouse position in world-space */
  readonly mouseWorldPosition: Point;
  /** The port currently being snapped to (if any) */
  readonly snappedTarget: PortCandidate | null;
  /** Whether the current connection is valid */
  readonly isValid: boolean;
};

/**
 * Compute the squared distance between two points.
 * Using squared distance avoids the sqrt cost when only comparing distances.
 */
export function distanceSquared(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/**
 * Find the nearest port candidate to a given world-space position,
 * within a maximum distance threshold.
 *
 * @param position - The position to search from (world-space)
 * @param candidates - Available port candidates to snap to
 * @param maxDistance - Maximum snap distance in world-space units
 * @param excludeItemId - Item ID to exclude from candidates (the source item)
 * @returns The nearest candidate within range, or null
 */
export function findNearestPort(
  position: Point,
  candidates: readonly PortCandidate[],
  maxDistance: number,
  excludeItemId: string,
): PortCandidate | null {
  const maxDistSq = maxDistance * maxDistance;
  let best: PortCandidate | null = null;
  let bestDistSq = Infinity;

  for (const candidate of candidates) {
    if (candidate.itemId === excludeItemId) continue;

    const portPos = computePortPosition(candidate.portOnItem);
    const dSq = distanceSquared(position, portPos);

    if (dSq < maxDistSq && dSq < bestDistSq) {
      bestDistSq = dSq;
      best = candidate;
    }
  }

  return best;
}

/**
 * Compute the effective target position for a connection preview line.
 * If snapped to a port, returns the port's world-space position.
 * Otherwise returns the mouse position.
 */
export function computePreviewTarget(
  state: ConnectionPreviewState,
): Point {
  if (state.snappedTarget !== null) {
    return computePortPosition(state.snappedTarget.portOnItem);
  }
  return state.mouseWorldPosition;
}

/**
 * Build a list of port candidates from items and their ports.
 *
 * @param items - Array of items with their geometry and port definitions
 * @returns Flat list of all port candidates
 */
export function buildPortCandidates(
  items: readonly {
    readonly id: string;
    readonly position: Point;
    readonly width: number;
    readonly height: number;
    readonly ports: readonly ConnectorPort[];
  }[],
): readonly PortCandidate[] {
  const result: PortCandidate[] = [];
  for (const item of items) {
    for (const port of item.ports) {
      result.push({
        itemId: item.id,
        portOnItem: {
          port,
          itemPosition: item.position,
          itemWidth: item.width,
          itemHeight: item.height,
        },
      });
    }
  }
  return result;
}

/**
 * Determine the visual style for a connection preview based on validity.
 */
export type PreviewStyle = {
  readonly color: string;
  readonly opacity: number;
  readonly strokeDasharray: string;
};

export function computePreviewStyle(isValid: boolean): PreviewStyle {
  return isValid
    ? { color: "#3b82f6", opacity: 0.6, strokeDasharray: "6 3" }
    : { color: "#ef4444", opacity: 0.4, strokeDasharray: "4 4" };
}

/**
 * Default snap distance in world-space units.
 */
export const DEFAULT_SNAP_DISTANCE = 30;
