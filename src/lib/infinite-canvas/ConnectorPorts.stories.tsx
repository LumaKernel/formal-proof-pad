import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { useState } from "react";
import { CanvasItem } from "./CanvasItem";
import { type ConnectorPort, DEFAULT_PORTS } from "./connector";
import type { ConnectorPortOnItem } from "./connector";
import { ConnectorPortComponent } from "./ConnectorPortComponent";
import { InfiniteCanvas } from "./InfiniteCanvas";
import { PortConnection } from "./PortConnection";
import type { Obstacle } from "./connectionPath";
import type { Point, ViewportState } from "./types";

interface ItemData {
  readonly id: string;
  readonly position: Point;
  readonly label: string;
  readonly color: string;
  readonly width: number;
  readonly height: number;
  readonly ports: readonly ConnectorPort[];
}

interface ConnectionData {
  readonly id: string;
  readonly fromItemId: string;
  readonly fromPortId: string;
  readonly toItemId: string;
  readonly toPortId: string;
  readonly color: string;
}

const ITEM_PADDING_X = 32;
const ITEM_PADDING_Y = 24;

const INITIAL_ITEMS: readonly ItemData[] = [
  {
    id: "axiom",
    position: { x: 80, y: 60 },
    label: "Axiom K",
    color: "#4a90d9",
    width: 100 + ITEM_PADDING_X,
    height: 20 + ITEM_PADDING_Y,
    ports: DEFAULT_PORTS,
  },
  {
    id: "mp",
    position: { x: 350, y: 130 },
    label: "Modus Ponens",
    color: "#d9944a",
    width: 140 + ITEM_PADDING_X,
    height: 20 + ITEM_PADDING_Y,
    ports: [
      { id: "premise-1", edge: "left", position: 0.35 },
      { id: "premise-2", edge: "left", position: 0.65 },
      { id: "conclusion", edge: "right", position: 0.5 },
      { id: "top", edge: "top", position: 0.5 },
      { id: "bottom", edge: "bottom", position: 0.5 },
    ],
  },
  {
    id: "result",
    position: { x: 620, y: 130 },
    label: "Result",
    color: "#4ad94a",
    width: 80 + ITEM_PADDING_X,
    height: 20 + ITEM_PADDING_Y,
    ports: DEFAULT_PORTS,
  },
];

const INITIAL_CONNECTIONS: readonly ConnectionData[] = [
  {
    id: "axiom-to-mp",
    fromItemId: "axiom",
    fromPortId: "right",
    toItemId: "mp",
    toPortId: "premise-1",
    color: "#4a90d9",
  },
  {
    id: "mp-to-result",
    fromItemId: "mp",
    fromPortId: "conclusion",
    toItemId: "result",
    toPortId: "left",
    color: "#4ad94a",
  },
];

function findItem(
  items: readonly ItemData[],
  id: string,
): ItemData | undefined {
  return items.find((item) => item.id === id);
}

function findPortInItem(
  item: ItemData,
  portId: string,
): ConnectorPort | undefined {
  return item.ports.find((p) => p.id === portId);
}

function toPortOnItem(
  item: ItemData,
  portId: string,
): ConnectorPortOnItem | undefined {
  const port = findPortInItem(item, portId);
  if (!port) return undefined;
  return {
    port,
    itemPosition: item.position,
    itemWidth: item.width,
    itemHeight: item.height,
  };
}

function ConnectorPortsDemo() {
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [items, setItems] = useState<readonly ItemData[]>(INITIAL_ITEMS);
  const [highlightedPort, setHighlightedPort] = useState<string | null>(null);

  const handlePositionChange = (id: string, newPosition: Point) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, position: newPosition } : item,
      ),
    );
  };

  const obstacles: readonly Obstacle[] = items.map((item) => ({
    position: item.position,
    width: item.width,
    height: item.height,
  }));

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <InfiniteCanvas viewport={viewport} onViewportChange={setViewport}>
        {/* Port-based connections */}
        {INITIAL_CONNECTIONS.map((conn) => {
          const fromItem = findItem(items, conn.fromItemId);
          const toItem = findItem(items, conn.toItemId);
          if (!fromItem || !toItem) return null;
          const fromPortOnItem = toPortOnItem(fromItem, conn.fromPortId);
          const toPortOnItem_ = toPortOnItem(toItem, conn.toPortId);
          if (!fromPortOnItem || !toPortOnItem_) return null;
          return (
            <PortConnection
              key={conn.id}
              from={fromPortOnItem}
              to={toPortOnItem_}
              viewport={viewport}
              color={conn.color}
              obstacles={obstacles}
            />
          );
        })}

        {/* Items with connector ports */}
        {items.map((item) => (
          <CanvasItem
            key={item.id}
            position={item.position}
            viewport={viewport}
            onPositionChange={(pos) => {
              handlePositionChange(item.id, pos);
            }}
          >
            <div
              data-testid={`item-${item.id satisfies string}`}
              style={{
                padding: "12px 16px",
                background: item.color,
                color: "#fff",
                borderRadius: 8,
                fontFamily: "sans-serif",
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

        {/* Connector ports rendered on top of items */}
        {items.flatMap((item) =>
          item.ports.map((port) => (
            <ConnectorPortComponent
              key={`${item.id satisfies string}-${port.id satisfies string}`}
              port={port}
              itemPosition={item.position}
              itemWidth={item.width}
              itemHeight={item.height}
              viewport={viewport}
              highlighted={
                highlightedPort ===
                `${item.id satisfies string}-${port.id satisfies string}`
              }
              onPortClick={() => {
                setHighlightedPort(
                  `${item.id satisfies string}-${port.id satisfies string}`,
                );
              }}
            />
          )),
        )}
      </InfiniteCanvas>

      <div
        data-testid="status-bar"
        style={{
          position: "fixed",
          top: 8,
          left: 8,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: 4,
          fontSize: 12,
          fontFamily: "monospace",
          pointerEvents: "none",
        }}
      >
        <div>
          scale: {viewport.scale.toFixed(2)} | offset: (
          {viewport.offsetX.toFixed(0)}, {viewport.offsetY.toFixed(0)})
        </div>
        <div data-testid="selected-port">
          {highlightedPort !== null
            ? `Selected: ${highlightedPort satisfies string}`
            : "Click a port to select it"}
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "InfiniteCanvas/ConnectorPorts",
  component: ConnectorPortsDemo,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ConnectorPortsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all items are rendered
    const axiomNode = canvas.getByTestId("item-axiom");
    const mpNode = canvas.getByTestId("item-mp");
    const resultNode = canvas.getByTestId("item-result");
    await expect(axiomNode).toBeInTheDocument();
    await expect(mpNode).toBeInTheDocument();
    await expect(resultNode).toBeInTheDocument();

    // Verify connector ports are rendered
    // Total ports: axiom(4) + mp(5) + result(4) = 13
    const topPorts = canvas.getAllByTestId("connector-port-top");
    await expect(topPorts.length).toBeGreaterThanOrEqual(2);

    // MP has unique custom ports
    const mpPremise1 = canvas.getByTestId("connector-port-premise-1");
    const mpConclusion = canvas.getByTestId("connector-port-conclusion");
    await expect(mpPremise1).toBeInTheDocument();
    await expect(mpConclusion).toBeInTheDocument();

    // Verify port-based connections are rendered
    const connections = canvas.getAllByTestId("port-connection");
    await expect(connections).toHaveLength(2);

    const paths = canvas.getAllByTestId("port-connection-path");
    await expect(paths).toHaveLength(2);

    // Verify items are draggable
    const canvasItemAxiom = axiomNode.closest("[data-testid='canvas-item']");
    await expect(canvasItemAxiom).toHaveStyle({ cursor: "grab" });
  },
};
