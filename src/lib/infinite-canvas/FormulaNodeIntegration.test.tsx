/**
 * FI-008: CanvasItem + FormulaEditor 統合テスト。
 *
 * - FormulaEditorがCanvasItem内で正常に動作すること
 * - 編集モード中はドラッグが無効化されること
 * - ノードサイズが編集内容に合わせて変わること
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCallback, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormulaEditor } from "../formula-input/FormulaEditor";
import type { EditorMode } from "../formula-input/editorLogic";
import { CanvasItem } from "./CanvasItem";
import type { Point } from "./types";

// --- ヘルパー ---

function IntegrationWrapper({
  initialValue = "φ → ψ",
  initialPosition = { x: 100, y: 100 },
}: {
  readonly initialValue?: string;
  readonly initialPosition?: Point;
}) {
  const [value, setValue] = useState(initialValue);
  const [position, setPosition] = useState(initialPosition);
  const [isEditing, setIsEditing] = useState(false);

  const handleModeChange = useCallback((mode: EditorMode) => {
    setIsEditing(mode === "editing");
  }, []);

  return (
    <CanvasItem
      position={position}
      viewport={{ offsetX: 0, offsetY: 0, scale: 1 }}
      onPositionChange={setPosition}
      dragEnabled={!isEditing}
    >
      <div data-testid="node-content">
        <FormulaEditor
          value={value}
          onChange={setValue}
          onModeChange={handleModeChange}
          testId="editor"
        />
      </div>
    </CanvasItem>
  );
}

describe("CanvasItem + FormulaEditor 統合", () => {
  beforeEach(() => {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  it("FormulaEditorがCanvasItem内に表示される", () => {
    render(<IntegrationWrapper />);

    const canvasItem = screen.getByTestId("canvas-item");
    expect(canvasItem).toBeInTheDocument();

    const editorDisplay = screen.getByTestId("editor-display");
    expect(editorDisplay).toBeInTheDocument();
    expect(canvasItem.contains(editorDisplay)).toBe(true);
  });

  it("表示モードではドラッグが有効（grabカーソル）", () => {
    render(<IntegrationWrapper />);

    const canvasItem = screen.getByTestId("canvas-item");
    expect(canvasItem.style.cursor).toBe("grab");
  });

  it("編集モードに入るとドラッグが無効化される", () => {
    render(<IntegrationWrapper />);

    const canvasItem = screen.getByTestId("canvas-item");
    expect(canvasItem.style.cursor).toBe("grab");

    // 編集モードに入る
    fireEvent.click(screen.getByTestId("editor-display"));

    // ドラッグが無効化される
    expect(canvasItem.style.cursor).not.toBe("grab");
    expect(canvasItem.style.cursor).not.toBe("grabbing");
  });

  it("編集モード中はドラッグ操作でonPositionChangeが呼ばれない", () => {
    render(<IntegrationWrapper />);

    // 編集モードに入る
    fireEvent.click(screen.getByTestId("editor-display"));

    const canvasItem = screen.getByTestId("canvas-item");

    // ドラッグ操作
    fireEvent.pointerDown(canvasItem, {
      button: 0,
      clientX: 50,
      clientY: 50,
      pointerId: 1,
    });
    fireEvent.pointerMove(canvasItem, {
      clientX: 70,
      clientY: 80,
      pointerId: 1,
    });
    fireEvent.pointerUp(canvasItem, { pointerId: 1 });

    // 位置が変わっていない（初期位置のまま）
    expect(canvasItem.style.left).toBe("100px");
    expect(canvasItem.style.top).toBe("100px");
  });

  it("編集モードから表示モードに戻るとドラッグが再有効化される", async () => {
    render(<IntegrationWrapper />);

    const canvasItem = screen.getByTestId("canvas-item");

    // 編集モードに入る
    fireEvent.click(screen.getByTestId("editor-display"));
    expect(canvasItem.style.cursor).not.toBe("grab");

    // blurで表示モードに戻る
    const input = screen.getByTestId("editor-input-input");
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByTestId("editor-display")).toBeInTheDocument();
    });

    // ドラッグが再有効化
    expect(canvasItem.style.cursor).toBe("grab");
  });

  it("表示モードでのドラッグ操作が正常に動作する", () => {
    render(<IntegrationWrapper />);

    const canvasItem = screen.getByTestId("canvas-item");

    // 表示モードでドラッグ
    fireEvent.pointerDown(canvasItem, {
      button: 0,
      clientX: 50,
      clientY: 50,
      pointerId: 1,
    });
    fireEvent.pointerMove(canvasItem, {
      clientX: 70,
      clientY: 80,
      pointerId: 1,
    });

    // 位置が変わっている
    expect(canvasItem.style.left).toBe("120px");
    expect(canvasItem.style.top).toBe("130px");
  });

  it("編集モードで入力した値が保持される", async () => {
    render(<IntegrationWrapper initialValue="φ" />);

    // 編集モードに入る
    fireEvent.click(screen.getByTestId("editor-display"));

    const input = screen.getByTestId("editor-input-input");
    await userEvent.clear(input);
    await userEvent.type(input, "φ ∧ ψ");

    // blurで表示モードに戻る
    fireEvent.blur(input);

    await waitFor(() => {
      const display = screen.getByTestId("editor-display");
      expect(display).toBeInTheDocument();
    });

    // 更新された値が表示されている
    const unicode = screen.getByTestId("editor-unicode");
    expect(unicode).toHaveTextContent("φ ∧ ψ");
  });

  it("Escapeで表示モードに戻りドラッグが再有効化される", async () => {
    render(<IntegrationWrapper />);

    const canvasItem = screen.getByTestId("canvas-item");

    // 編集モードに入る
    fireEvent.click(screen.getByTestId("editor-display"));
    expect(canvasItem.style.cursor).not.toBe("grab");

    // Escapeで戻る
    const container = screen.getByTestId("editor");
    fireEvent.keyDown(container, { key: "Escape" });

    await waitFor(() => {
      expect(screen.getByTestId("editor-display")).toBeInTheDocument();
    });

    expect(canvasItem.style.cursor).toBe("grab");
  });
});
