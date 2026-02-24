import type { Point } from "./types";

/** Maximum distance (in screen pixels) between pointerDown and pointerUp
 *  to count as a "click" rather than a drag. */
export const CLICK_DISTANCE_THRESHOLD = 5;

/** Node menu state — closed or open at a specific node + screen position. */
export type NodeMenuState =
  | { readonly open: false }
  | {
      readonly open: true;
      /** ID of the node whose menu is open */
      readonly nodeId: string;
      /** Screen-space position where the menu should appear */
      readonly screenPosition: Point;
    };

/** Singleton closed state for referential equality. */
export const NODE_MENU_CLOSED: NodeMenuState = { open: false };

/** Open a node menu for the given node at the given screen position. */
export function openNodeMenu(
  nodeId: string,
  screenX: number,
  screenY: number,
): NodeMenuState {
  return {
    open: true,
    nodeId,
    screenPosition: { x: screenX, y: screenY },
  };
}

/** Close the node menu. */
export function closeNodeMenu(): NodeMenuState {
  return NODE_MENU_CLOSED;
}

/** Determine whether the pointer movement constitutes a "click"
 *  (as opposed to a drag). Returns true if the distance is within threshold. */
export function isClick(
  start: Point,
  end: Point,
  threshold: number = CLICK_DISTANCE_THRESHOLD,
): boolean {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.sqrt(dx * dx + dy * dy) <= threshold;
}
