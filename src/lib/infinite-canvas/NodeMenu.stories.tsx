import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { useCallback, useState } from "react";
import { CanvasItem } from "./CanvasItem";
import { InfiniteCanvas } from "./InfiniteCanvas";
import {
  closeNodeMenu,
  NODE_MENU_CLOSED,
  openNodeMenu,
  type NodeMenuState,
} from "./nodeMenu";
import type { Point, ViewportState } from "./types";

interface NodeData {
  readonly id: string;
  readonly position: Point;
  readonly label: string;
  readonly color: string;
  readonly menuActions: readonly {
    readonly id: string;
    readonly label: string;
  }[];
}

const INITIAL_NODES: readonly NodeData[] = [
  {
    id: "axiom-k",
    position: { x: 80, y: 80 },
    label: "Axiom K",
    color: "#4a90d9",
    menuActions: [
      { id: "edit", label: "Edit Formula" },
      { id: "details", label: "View Details" },
      { id: "delete", label: "Delete Node" },
    ],
  },
  {
    id: "axiom-s",
    position: { x: 350, y: 80 },
    label: "Axiom S",
    color: "#d94a4a",
    menuActions: [
      { id: "edit", label: "Edit Formula" },
      { id: "duplicate", label: "Duplicate" },
      { id: "delete", label: "Delete Node" },
    ],
  },
  {
    id: "mp-result",
    position: { x: 200, y: 250 },
    label: "MP Result",
    color: "#4ad94a",
    menuActions: [
      { id: "details", label: "View Details" },
      { id: "verify", label: "Verify Step" },
    ],
  },
];

function NodeMenuPanel({
  node,
  screenPosition,
  onSelect,
  onClose,
}: {
  readonly node: NodeData;
  readonly screenPosition: Point;
  readonly onSelect: (nodeId: string, actionId: string) => void;
  readonly onClose: () => void;
}) {
  return (
    <div
      data-testid="node-menu"
      style={{
        position: "fixed",
        left: screenPosition.x + 10,
        top: screenPosition.y + 10,
        zIndex: 2000,
        minWidth: 160,
        background: "#fff",
        border: `2px solid ${node.color satisfies string}`,
        borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        padding: 0,
        fontFamily: "var(--font-ui)",
        fontSize: 13,
        userSelect: "none",
        overflow: "hidden",
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        data-testid="node-menu-header"
        style={{
          background: node.color,
          color: "#fff",
          padding: "8px 12px",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {node.label}
      </div>
      <div style={{ padding: "4px 0" }}>
        {node.menuActions.map((action) => (
          <button
            key={action.id}
            data-testid={`node-menu-action-${action.id satisfies string}`}
            onClick={() => {
              onSelect(node.id, action.id);
              onClose();
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "6px 16px",
              border: "none",
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
              color: "#333",
              fontSize: 13,
              lineHeight: "1.4",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NodeMenuDemo() {
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [nodes, setNodes] = useState<readonly NodeData[]>(INITIAL_NODES);
  const [menuState, setMenuState] = useState<NodeMenuState>(NODE_MENU_CLOSED);
  const [lastAction, setLastAction] = useState<string>("");

  const handlePositionChange = useCallback((id: string, newPosition: Point) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, position: newPosition } : node,
      ),
    );
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string, screenX: number, screenY: number) => {
      setMenuState((prev) => {
        if (prev.open && prev.nodeId === nodeId) {
          return closeNodeMenu();
        }
        return openNodeMenu(nodeId, screenX, screenY);
      });
    },
    [],
  );

  const handleMenuSelect = useCallback((nodeId: string, actionId: string) => {
    setLastAction(`${nodeId satisfies string}: ${actionId satisfies string}`);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuState(closeNodeMenu());
  }, []);

  const activeNode = menuState.open
    ? nodes.find((n) => n.id === menuState.nodeId)
    : undefined;

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      onPointerDown={() => {
        if (menuState.open) {
          handleMenuClose();
        }
      }}
    >
      <InfiniteCanvas viewport={viewport} onViewportChange={setViewport}>
        {nodes.map((node) => (
          <CanvasItem
            key={node.id}
            position={node.position}
            viewport={viewport}
            onPositionChange={(pos) => {
              handlePositionChange(node.id, pos);
            }}
            onClick={(screenX, screenY) => {
              handleNodeClick(node.id, screenX, screenY);
            }}
          >
            <div
              data-testid={`node-${node.id satisfies string}`}
              style={{
                padding: "12px 16px",
                background: node.color,
                color: "#fff",
                borderRadius: 8,
                fontFamily: "var(--font-ui)",
                fontSize: 14,
                fontWeight: 600,
                boxShadow:
                  menuState.open && menuState.nodeId === node.id
                    ? `0 0 0 3px ${node.color satisfies string}, 0 2px 8px rgba(0,0,0,0.2)`
                    : "0 2px 8px rgba(0,0,0,0.2)",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              {node.label}
            </div>
          </CanvasItem>
        ))}
      </InfiniteCanvas>
      {menuState.open && activeNode !== undefined && (
        <NodeMenuPanel
          node={activeNode}
          screenPosition={menuState.screenPosition}
          onSelect={handleMenuSelect}
          onClose={handleMenuClose}
        />
      )}
      <div
        data-testid="last-action"
        style={{
          position: "fixed",
          top: 8,
          left: 8,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: 4,
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          pointerEvents: "none",
        }}
      >
        {lastAction !== ""
          ? `Last action: ${lastAction satisfies string}`
          : "Click a node to open its menu"}
      </div>
    </div>
  );
}

const meta = {
  title: "InfiniteCanvas/NodeMenu",
  component: NodeMenuDemo,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof NodeMenuDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all nodes are rendered
    const axiomK = canvas.getByTestId("node-axiom-k");
    const axiomS = canvas.getByTestId("node-axiom-s");
    const mpResult = canvas.getByTestId("node-mp-result");
    await expect(axiomK).toBeInTheDocument();
    await expect(axiomS).toBeInTheDocument();
    await expect(mpResult).toBeInTheDocument();

    // No menu should be open initially
    await expect(canvas.queryByTestId("node-menu")).not.toBeInTheDocument();

    // Click Axiom K to open its menu
    await userEvent.click(axiomK);

    // Menu should appear
    const menu = canvas.getByTestId("node-menu");
    await expect(menu).toBeInTheDocument();

    // Menu header should show the node label
    const header = canvas.getByTestId("node-menu-header");
    await expect(header).toHaveTextContent("Axiom K");

    // Menu should have the correct actions
    const editAction = canvas.getByTestId("node-menu-action-edit");
    await expect(editAction).toBeInTheDocument();
    await expect(editAction).toHaveTextContent("Edit Formula");

    // Click an action
    await userEvent.click(editAction);

    // Menu should close after action
    await expect(canvas.queryByTestId("node-menu")).not.toBeInTheDocument();

    // Last action should be updated
    const lastAction = canvas.getByTestId("last-action");
    await expect(lastAction).toHaveTextContent("Last action: axiom-k: edit");

    // Click another node (Axiom S) to open its menu
    await userEvent.click(axiomS);

    const menu2 = canvas.getByTestId("node-menu");
    await expect(menu2).toBeInTheDocument();

    const header2 = canvas.getByTestId("node-menu-header");
    await expect(header2).toHaveTextContent("Axiom S");

    // Click the same node again to toggle close
    await userEvent.click(axiomS);
    await expect(canvas.queryByTestId("node-menu")).not.toBeInTheDocument();
  },
};
