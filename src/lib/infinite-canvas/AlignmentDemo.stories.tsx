import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { useCallback, useRef, useState } from "react";
import { CanvasItem } from "./CanvasItem";
import { InfiniteCanvas } from "./InfiniteCanvas";
import type { Point, ViewportState } from "./types";
import { useMarquee } from "./useMarquee";
import { selectAll, type SelectableItem } from "./multiSelection";
import {
  alignHorizontal,
  alignVertical,
  distribute,
  type AlignableItem,
} from "./alignment";

interface ItemData {
  readonly id: string;
  readonly position: Point;
  readonly label: string;
  readonly color: string;
  readonly size: { readonly width: number; readonly height: number };
}

const INITIAL_ITEMS: readonly ItemData[] = [
  {
    id: "1",
    position: { x: 50, y: 50 },
    label: "Item A",
    color: "#4a90d9",
    size: { width: 120, height: 40 },
  },
  {
    id: "2",
    position: { x: 250, y: 120 },
    label: "Item B",
    color: "#d94a4a",
    size: { width: 80, height: 60 },
  },
  {
    id: "3",
    position: { x: 150, y: 280 },
    label: "Item C",
    color: "#4ad94a",
    size: { width: 100, height: 50 },
  },
  {
    id: "4",
    position: { x: 400, y: 200 },
    label: "Item D",
    color: "#d9a54a",
    size: { width: 90, height: 45 },
  },
];

function AlignmentDemoComponent() {
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [items, setItems] = useState<readonly ItemData[]>(INITIAL_ITEMS);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const selectableItems: readonly SelectableItem[] = items.map((item) => ({
    id: item.id,
    position: item.position,
    size: item.size,
  }));

  const { marqueeRect, onPointerDown, onPointerMove, onPointerUp } = useMarquee(
    viewport,
    selectableItems,
    selectedIds,
    setSelectedIds,
    containerRef,
  );

  const applyPositionUpdates = useCallback(
    (updates: ReadonlyMap<string, Point>) => {
      if (updates.size === 0) return;
      setItems((prev) =>
        prev.map((item) => {
          const newPos = updates.get(item.id);
          return newPos ? { ...item, position: newPos } : item;
        }),
      );
    },
    [],
  );

  const selectedAlignableItems: readonly AlignableItem[] = items
    .filter((item) => selectedIds.has(item.id))
    .map((item) => ({
      id: item.id,
      position: item.position,
      size: item.size,
    }));

  const handleAlign = useCallback(
    (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
      if (type === "left" || type === "center" || type === "right") {
        applyPositionUpdates(alignHorizontal(selectedAlignableItems, type));
      } else {
        applyPositionUpdates(alignVertical(selectedAlignableItems, type));
      }
    },
    [selectedAlignableItems, applyPositionUpdates],
  );

  const handleDistribute = useCallback(
    (direction: "horizontal" | "vertical") => {
      applyPositionUpdates(distribute(selectedAlignableItems, direction));
    },
    [selectedAlignableItems, applyPositionUpdates],
  );

  const handlePositionChange = useCallback((id: string, newPosition: Point) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, position: newPosition } : item,
      ),
    );
  }, []);

  const handleItemClick = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleEmptyAreaClick = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(selectAll(selectableItems));
  }, [selectableItems]);

  const handleReset = useCallback(() => {
    setItems(INITIAL_ITEMS);
    setSelectedIds(new Set());
  }, []);

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    background: disabled ? "#555" : "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "4px 8px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 11,
    fontWeight: 600,
    opacity: disabled ? 0.5 : 1,
  });

  const hasSelection = selectedIds.size >= 2;
  const hasDistributeSelection = selectedIds.size >= 3;

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      ref={containerRef}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Escape") setSelectedIds(new Set());
        if ((e.metaKey || e.ctrlKey) && e.key === "a") {
          e.preventDefault();
          handleSelectAll();
        }
      }}
    >
      <InfiniteCanvas
        viewport={viewport}
        onViewportChange={setViewport}
        panEnabled={false}
        onEmptyAreaPointerDown={onPointerDown}
        onEmptyAreaPointerMove={onPointerMove}
        onEmptyAreaPointerUp={onPointerUp}
        onEmptyAreaClick={handleEmptyAreaClick}
        marqueeRect={marqueeRect}
      >
        {items.map((item) => (
          <CanvasItem
            key={item.id}
            position={item.position}
            viewport={viewport}
            onPositionChange={(pos) => {
              handlePositionChange(item.id, pos);
            }}
            onClick={() => {
              handleItemClick(item.id);
            }}
          >
            <div
              data-testid={`item-${item.id satisfies string}`}
              style={{
                padding: "8px 16px",
                background: item.color,
                color: "#fff",
                borderRadius: 6,
                fontFamily: "var(--font-ui)",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                whiteSpace: "nowrap",
                userSelect: "none",
                width: item.size.width,
                height: item.size.height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                outline: selectedIds.has(item.id)
                  ? "3px solid #fff"
                  : undefined,
                outlineOffset: selectedIds.has(item.id) ? 2 : undefined,
              }}
            >
              {item.label}
            </div>
          </CanvasItem>
        ))}
      </InfiniteCanvas>

      {/* ツールバー */}
      <div
        data-testid="alignment-toolbar"
        style={{
          position: "fixed",
          top: 8,
          left: 8,
          background: "rgba(0,0,0,0.85)",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 12,
          fontFamily: "var(--font-ui)",
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 2 }}>
          Alignment (selected: {String(selectedIds.size) satisfies string})
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          <button
            data-testid="align-left"
            style={btnStyle(!hasSelection)}
            disabled={!hasSelection}
            onClick={() => {
              handleAlign("left");
            }}
          >
            Left
          </button>
          <button
            data-testid="align-center"
            style={btnStyle(!hasSelection)}
            disabled={!hasSelection}
            onClick={() => {
              handleAlign("center");
            }}
          >
            Center
          </button>
          <button
            data-testid="align-right"
            style={btnStyle(!hasSelection)}
            disabled={!hasSelection}
            onClick={() => {
              handleAlign("right");
            }}
          >
            Right
          </button>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          <button
            data-testid="align-top"
            style={btnStyle(!hasSelection)}
            disabled={!hasSelection}
            onClick={() => {
              handleAlign("top");
            }}
          >
            Top
          </button>
          <button
            data-testid="align-middle"
            style={btnStyle(!hasSelection)}
            disabled={!hasSelection}
            onClick={() => {
              handleAlign("middle");
            }}
          >
            Middle
          </button>
          <button
            data-testid="align-bottom"
            style={btnStyle(!hasSelection)}
            disabled={!hasSelection}
            onClick={() => {
              handleAlign("bottom");
            }}
          >
            Bottom
          </button>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: 4,
            display: "flex",
            gap: 4,
          }}
        >
          <button
            data-testid="distribute-horizontal"
            style={btnStyle(!hasDistributeSelection)}
            disabled={!hasDistributeSelection}
            onClick={() => {
              handleDistribute("horizontal");
            }}
          >
            Distribute H
          </button>
          <button
            data-testid="distribute-vertical"
            style={btnStyle(!hasDistributeSelection)}
            disabled={!hasDistributeSelection}
            onClick={() => {
              handleDistribute("vertical");
            }}
          >
            Distribute V
          </button>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: 4,
            display: "flex",
            gap: 4,
          }}
        >
          <button
            data-testid="select-all"
            style={btnStyle(false)}
            onClick={handleSelectAll}
          >
            Select All
          </button>
          <button
            data-testid="reset"
            style={btnStyle(false)}
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "InfiniteCanvas/Alignment",
  component: AlignmentDemoComponent,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AlignmentDemoComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 全4アイテムが表示される
    await expect(canvas.getByTestId("item-1")).toBeInTheDocument();
    await expect(canvas.getByTestId("item-2")).toBeInTheDocument();
    await expect(canvas.getByTestId("item-3")).toBeInTheDocument();
    await expect(canvas.getByTestId("item-4")).toBeInTheDocument();

    // ツールバーが表示される
    const toolbar = canvas.getByTestId("alignment-toolbar");
    await expect(toolbar).toBeInTheDocument();
    await expect(toolbar).toHaveTextContent("selected: 0");

    // ボタンは選択なしでは無効
    await expect(canvas.getByTestId("align-left")).toBeDisabled();
    await expect(canvas.getByTestId("distribute-horizontal")).toBeDisabled();

    // Select Allで全選択
    await userEvent.click(canvas.getByTestId("select-all"));
    await expect(toolbar).toHaveTextContent("selected: 4");

    // ボタンが有効になる
    await expect(canvas.getByTestId("align-left")).toBeEnabled();
    await expect(canvas.getByTestId("distribute-horizontal")).toBeEnabled();

    // Align Leftを実行
    await userEvent.click(canvas.getByTestId("align-left"));

    // Resetで元に戻す
    await userEvent.click(canvas.getByTestId("reset"));
    await expect(toolbar).toHaveTextContent("selected: 0");
  },
};
