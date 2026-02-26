import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { useCallback, useState } from "react";
import { CanvasItem } from "./CanvasItem";
import { type ConnectorPort, DEFAULT_PORTS } from "./connector";
import { ConnectorPortComponent } from "./ConnectorPortComponent";
import { ConnectionPreviewLine } from "./ConnectionPreviewLine";
import { InfiniteCanvas } from "./InfiniteCanvas";
import { PortConnection } from "./PortConnection";
import { useConnectionPreview } from "./useConnectionPreview";
import { buildPortCandidates } from "./connectionPreview";
import type { Obstacle } from "./connectionPath";
import type { ConnectorPortOnItem } from "./connector";
import type { Point, ViewportState } from "./types";

interface ItemData {
  readonly id: string;
  readonly position: Point;
  readonly label: string;
  readonly color: string;
  readonly ports: readonly ConnectorPort[];
}

interface ItemSize {
  readonly width: number;
  readonly height: number;
}

interface ConnectionData {
  readonly id: string;
  readonly fromItemId: string;
  readonly fromPortId: string;
  readonly toItemId: string;
  readonly toPortId: string;
}

const INITIAL_ITEMS: readonly ItemData[] = [
  {
    id: "node-a",
    position: { x: 80, y: 100 },
    label: "Node A",
    color: "#4a90d9",
    ports: DEFAULT_PORTS,
  },
  {
    id: "node-b",
    position: { x: 350, y: 100 },
    label: "Node B",
    color: "#d9944a",
    ports: DEFAULT_PORTS,
  },
  {
    id: "node-c",
    position: { x: 200, y: 280 },
    label: "Node C",
    color: "#4ad94a",
    ports: DEFAULT_PORTS,
  },
];

function ConnectionPreviewDemo() {
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [items, setItems] = useState<readonly ItemData[]>(INITIAL_ITEMS);
  const [connections, setConnections] = useState<readonly ConnectionData[]>([]);
  const [itemSizes, setItemSizes] = useState<ReadonlyMap<string, ItemSize>>(
    new Map(),
  );
  const [statusMessage, setStatusMessage] = useState(
    "Drag from a port to connect nodes",
  );

  const candidates = buildPortCandidates(
    items
      .map((item) => {
        const size = itemSizes.get(item.id);
        if (!size) return null;
        return {
          id: item.id,
          position: item.position,
          width: size.width,
          height: size.height,
          ports: [...item.ports],
        };
      })
      .filter((x) => x !== null),
  );

  const validateConnection = useCallback(
    (
      sourceItemId: string,
      sourcePortId: string,
      targetItemId: string,
      targetPortId: string,
    ): boolean => {
      // Use port IDs to suppress unused warnings
      void sourcePortId;
      void targetPortId;
      // Don't allow connecting to self
      if (sourceItemId === targetItemId) return false;
      // Don't allow duplicate connections
      return !connections.some(
        (c) =>
          (c.fromItemId === sourceItemId && c.toItemId === targetItemId) ||
          (c.fromItemId === targetItemId && c.toItemId === sourceItemId),
      );
    },
    [connections],
  );

  const handleConnectionComplete = useCallback(
    (
      sourceItemId: string,
      sourcePortId: string,
      targetItemId: string,
      targetPortId: string,
    ) => {
      const newConnection: ConnectionData = {
        id: `${sourceItemId satisfies string}-${sourcePortId satisfies string}-${targetItemId satisfies string}-${targetPortId satisfies string}`,
        fromItemId: sourceItemId,
        fromPortId: sourcePortId,
        toItemId: targetItemId,
        toPortId: targetPortId,
      };
      setConnections((prev) => [...prev, newConnection]);
      setStatusMessage(
        `Connected ${sourceItemId satisfies string}:${sourcePortId satisfies string} → ${targetItemId satisfies string}:${targetPortId satisfies string}`,
      );
    },
    [],
  );

  const { previewState, startDrag, updateDrag, endDrag } = useConnectionPreview(
    viewport,
    candidates,
    validateConnection,
    handleConnectionComplete,
  );

  const handlePositionChange = (id: string, newPosition: Point) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, position: newPosition } : item,
      ),
    );
  };

  const measureItem = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        const w = rect.width / viewport.scale;
        const h = rect.height / viewport.scale;
        setItemSizes((prev) => {
          const existing = prev.get(id);
          if (existing && existing.width === w && existing.height === h)
            return prev;
          const next = new Map(prev);
          next.set(id, { width: w, height: h });
          return next;
        });
      }
    },
    [viewport.scale],
  );

  const handlePortDragStart = useCallback(
    (itemId: string) => (portId: string, screenX: number, screenY: number) => {
      const size = itemSizes.get(itemId);
      const item = items.find((i) => i.id === itemId);
      const port = item?.ports.find((p) => p.id === portId);
      if (!size || !item || !port) return;

      const portOnItem: ConnectorPortOnItem = {
        port,
        itemPosition: item.position,
        itemWidth: size.width,
        itemHeight: size.height,
      };
      startDrag(itemId, portOnItem, screenX, screenY);
    },
    [items, itemSizes, startDrag],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (previewState !== null) {
        updateDrag(e.clientX, e.clientY);
      }
    },
    [previewState, updateDrag],
  );

  const handlePointerUp = useCallback(() => {
    if (previewState !== null) {
      endDrag();
    }
  }, [previewState, endDrag]);

  const obstacles: readonly Obstacle[] = items
    .map((item) => {
      const size = itemSizes.get(item.id);
      if (!size) return null;
      return {
        position: item.position,
        width: size.width,
        height: size.height,
      };
    })
    .filter((o) => o !== null);

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <InfiniteCanvas
        viewport={viewport}
        onViewportChange={setViewport}
        panEnabled={previewState === null}
      >
        {/* Existing connections */}
        {connections.map((conn) => {
          const fromItem = items.find((i) => i.id === conn.fromItemId);
          const toItem = items.find((i) => i.id === conn.toItemId);
          if (!fromItem || !toItem) return null;
          const fromSize = itemSizes.get(conn.fromItemId);
          const toSize = itemSizes.get(conn.toItemId);
          if (!fromSize || !toSize) return null;
          const fromPort = fromItem.ports.find((p) => p.id === conn.fromPortId);
          const toPort = toItem.ports.find((p) => p.id === conn.toPortId);
          if (!fromPort || !toPort) return null;
          return (
            <PortConnection
              key={conn.id}
              from={{
                port: fromPort,
                itemPosition: fromItem.position,
                itemWidth: fromSize.width,
                itemHeight: fromSize.height,
              }}
              to={{
                port: toPort,
                itemPosition: toItem.position,
                itemWidth: toSize.width,
                itemHeight: toSize.height,
              }}
              viewport={viewport}
              color="#666"
              obstacles={obstacles}
            />
          );
        })}

        {/* Preview line */}
        {previewState !== null && (
          <ConnectionPreviewLine state={previewState} viewport={viewport} />
        )}

        {/* Items */}
        {items.map((item) => (
          <CanvasItem
            key={item.id}
            position={item.position}
            viewport={viewport}
            onPositionChange={(pos) => {
              handlePositionChange(item.id, pos);
            }}
            dragEnabled={previewState === null}
          >
            <div
              ref={measureItem(item.id)}
              data-testid={`item-${item.id satisfies string}`}
              style={{
                padding: "12px 16px",
                background: item.color,
                color: "#fff",
                borderRadius: 8,
                fontFamily: "var(--font-ui)",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              {item.label}
            </div>
          </CanvasItem>
        ))}

        {/* Connector ports */}
        {items.flatMap((item) => {
          const size = itemSizes.get(item.id);
          if (!size) return [];
          return item.ports.map((port) => {
            const uniqueId = `${item.id satisfies string}-${port.id satisfies string}`;
            const isSnappedTarget =
              previewState?.snappedTarget !== null &&
              previewState?.snappedTarget?.itemId === item.id &&
              previewState?.snappedTarget?.portOnItem.port.id === port.id;
            return (
              <ConnectorPortComponent
                key={uniqueId}
                port={{ ...port, id: uniqueId }}
                itemPosition={item.position}
                itemWidth={size.width}
                itemHeight={size.height}
                viewport={viewport}
                highlighted={isSnappedTarget ?? false}
                color={
                  isSnappedTarget === true
                    ? previewState?.isValid === true
                      ? "#3b82f6"
                      : "#ef4444"
                    : "#fff"
                }
                borderColor={
                  isSnappedTarget === true
                    ? previewState?.isValid === true
                      ? "#3b82f6"
                      : "#ef4444"
                    : "#666"
                }
                onPortDragStart={handlePortDragStart(item.id)}
              />
            );
          });
        })}
      </InfiniteCanvas>

      <div
        data-testid="status-bar"
        style={{
          position: "fixed",
          top: 8,
          left: 8,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 4,
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          pointerEvents: "none",
          maxWidth: 300,
        }}
      >
        <div data-testid="status-message">{statusMessage}</div>
        <div>Connections: {connections.length}</div>
        {previewState !== null && (
          <div data-testid="dragging-indicator">
            Dragging from: {previewState.sourceItemId}
            {previewState.snappedTarget !== null && (
              <span>
                {" → "}
                {previewState.snappedTarget.itemId}
                {previewState.isValid ? " (valid)" : " (invalid)"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const meta = {
  title: "InfiniteCanvas/ConnectionPreview",
  component: ConnectionPreviewDemo,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ConnectionPreviewDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all items are rendered
    await expect(canvas.getByTestId("item-node-a")).toBeInTheDocument();
    await expect(canvas.getByTestId("item-node-b")).toBeInTheDocument();
    await expect(canvas.getByTestId("item-node-c")).toBeInTheDocument();

    // Verify status bar is shown
    await expect(canvas.getByTestId("status-message")).toHaveTextContent(
      "Drag from a port to connect nodes",
    );

    // Verify connector ports are rendered
    const ports = canvasElement.querySelectorAll(
      "[data-testid^='connector-port-']",
    );
    await expect(ports.length).toBeGreaterThanOrEqual(12); // 3 items × 4 ports

    // Verify no preview line initially
    const previewLine = canvasElement.querySelector(
      "[data-testid='connection-preview-line']",
    );
    await expect(previewLine).toBeNull();
  },
};
