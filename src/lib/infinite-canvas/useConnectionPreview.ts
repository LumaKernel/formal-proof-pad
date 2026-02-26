import { useCallback, useEffect, useRef, useState } from "react";
import type { ConnectorPortOnItem } from "./connector";
import {
  findNearestPort,
  DEFAULT_SNAP_DISTANCE,
  type PortCandidate,
  type ConnectionPreviewState,
} from "./connectionPreview";
import { screenToWorld } from "./multiSelection";
import type { Point, ViewportState } from "./types";

/**
 * Callback type for validating whether a connection between two ports is valid.
 */
export type ValidateConnection = (
  sourceItemId: string,
  sourcePortId: string,
  targetItemId: string,
  targetPortId: string,
) => boolean;

/**
 * Callback type for when a connection is completed (drop on valid target).
 */
export type OnConnectionComplete = (
  sourceItemId: string,
  sourcePortId: string,
  targetItemId: string,
  targetPortId: string,
) => void;

export type UseConnectionPreviewResult = {
  /** Current preview state (null when not dragging) */
  readonly previewState: ConnectionPreviewState | null;
  /** Start dragging from a port. Attach to port's onPointerDown. */
  readonly startDrag: (
    itemId: string,
    portOnItem: ConnectorPortOnItem,
    screenX: number,
    screenY: number,
  ) => void;
  /** Update drag position. Attach to canvas onPointerMove. */
  readonly updateDrag: (screenX: number, screenY: number) => void;
  /** End drag. Attach to canvas onPointerUp. */
  readonly endDrag: () => void;
  /** Cancel drag without connecting. */
  readonly cancelDrag: () => void;
};

/**
 * Hook that manages connection preview (ghost line) state during port-to-port drag.
 *
 * @param viewport - Current viewport state for coordinate conversion
 * @param candidates - Available port candidates for snapping
 * @param validateConnection - Optional validator for connection validity
 * @param onConnectionComplete - Callback when a valid connection is completed
 * @param snapDistance - Maximum snap distance in world-space units
 */
export function useConnectionPreview(
  viewport: ViewportState,
  candidates: readonly PortCandidate[],
  validateConnection: ValidateConnection | undefined,
  onConnectionComplete: OnConnectionComplete | undefined,
  snapDistance: number = DEFAULT_SNAP_DISTANCE,
): UseConnectionPreviewResult {
  const [previewState, setPreviewState] =
    useState<ConnectionPreviewState | null>(null);

  // Refs for stable access in callbacks (updated via useEffect to comply with React 19 refs rules)
  const viewportRef = useRef(viewport);
  const candidatesRef = useRef(candidates);
  const validateRef = useRef(validateConnection);
  const onCompleteRef = useRef(onConnectionComplete);
  const snapDistanceRef = useRef(snapDistance);
  const sourceRef = useRef<{
    readonly itemId: string;
    readonly portOnItem: ConnectorPortOnItem;
  } | null>(null);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);

  useEffect(() => {
    validateRef.current = validateConnection;
  }, [validateConnection]);

  useEffect(() => {
    onCompleteRef.current = onConnectionComplete;
  }, [onConnectionComplete]);

  useEffect(() => {
    snapDistanceRef.current = snapDistance;
  }, [snapDistance]);

  const computeSnappedState = useCallback(
    (
      mouseWorld: Point,
      sourceItemId: string,
      sourcePortOnItem: ConnectorPortOnItem,
    ): ConnectionPreviewState => {
      const snappedTarget = findNearestPort(
        mouseWorld,
        candidatesRef.current,
        snapDistanceRef.current,
        sourceItemId,
      );

      const isValid =
        snappedTarget !== null &&
        (validateRef.current === undefined ||
          validateRef.current(
            sourceItemId,
            sourcePortOnItem.port.id,
            snappedTarget.itemId,
            snappedTarget.portOnItem.port.id,
          ));

      return {
        sourceItemId,
        sourcePortOnItem,
        mouseWorldPosition: mouseWorld,
        snappedTarget,
        isValid,
      };
    },
    [],
  );

  const startDrag = useCallback(
    (
      itemId: string,
      portOnItem: ConnectorPortOnItem,
      screenX: number,
      screenY: number,
    ) => {
      sourceRef.current = { itemId, portOnItem };
      const mouseWorld = screenToWorld(viewportRef.current, {
        x: screenX,
        y: screenY,
      });
      setPreviewState(computeSnappedState(mouseWorld, itemId, portOnItem));
    },
    [computeSnappedState],
  );

  const updateDrag = useCallback(
    (screenX: number, screenY: number) => {
      const source = sourceRef.current;
      if (source === null) return;

      const mouseWorld = screenToWorld(viewportRef.current, {
        x: screenX,
        y: screenY,
      });
      setPreviewState(
        computeSnappedState(mouseWorld, source.itemId, source.portOnItem),
      );
    },
    [computeSnappedState],
  );

  const endDrag = useCallback(() => {
    const source = sourceRef.current;
    if (source === null) return;

    setPreviewState((current) => {
      if (current?.snappedTarget !== null && current?.isValid === true) {
        const target = current.snappedTarget;
        onCompleteRef.current?.(
          source.itemId,
          source.portOnItem.port.id,
          target.itemId,
          target.portOnItem.port.id,
        );
      }
      return null;
    });
    sourceRef.current = null;
  }, []);

  const cancelDrag = useCallback(() => {
    sourceRef.current = null;
    setPreviewState(null);
  }, []);

  return {
    previewState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  };
}

/**
 * Compute the effective target position for the preview line rendering.
 * Re-exports the pure function for convenience.
 */
export { computePreviewTarget } from "./connectionPreview";
