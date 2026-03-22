/**
 * 可視化ブリッジのテスト。
 *
 * createVisualizationBridges() が返す NativeFunctionBridge[] の動作を検証する。
 */
import { describe, it, expect, vi } from "vitest";
import {
  createVisualizationBridges,
  type VisualizationCommandHandler,
} from "./visualizationBridge";

const createMockHandler = (): VisualizationCommandHandler => ({
  highlightNode: vi.fn(),
  unhighlightNode: vi.fn(),
  clearHighlights: vi.fn(),
  addAnnotation: vi.fn(() => "ann-1"),
  removeAnnotation: vi.fn(),
  clearAnnotations: vi.fn(),
  addLog: vi.fn(),
  clearVisualization: vi.fn(),
});

const setup = () => {
  const handler = createMockHandler();
  const bridges = createVisualizationBridges(handler);
  const bridgeMap = new Map(bridges.map((b) => [b.name, b.fn] as const));

  const call = (name: string, ...args: readonly unknown[]): unknown => {
    const fn = bridgeMap.get(name);
    if (!fn) throw new Error(`Bridge not found: ${name satisfies string}`);
    return fn(...args);
  };

  return { handler, call };
};

describe("visualizationBridge", () => {
  // ── highlightNode ──

  describe("highlightNode", () => {
    it("デフォルト色（yellow）でハイライトする", () => {
      const { handler, call } = setup();
      call("highlightNode", "n1");
      expect(handler.highlightNode).toHaveBeenCalledWith(
        "n1",
        "yellow",
        undefined,
      );
    });

    it("色を指定してハイライトする", () => {
      const { handler, call } = setup();
      call("highlightNode", "n1", "red");
      expect(handler.highlightNode).toHaveBeenCalledWith(
        "n1",
        "red",
        undefined,
      );
    });

    it("ラベル付きでハイライトする", () => {
      const { handler, call } = setup();
      call("highlightNode", "n1", "blue", "Step 1");
      expect(handler.highlightNode).toHaveBeenCalledWith(
        "n1",
        "blue",
        "Step 1",
      );
    });

    it("null色はデフォルト（yellow）になる", () => {
      const { handler, call } = setup();
      call("highlightNode", "n1", null);
      expect(handler.highlightNode).toHaveBeenCalledWith(
        "n1",
        "yellow",
        undefined,
      );
    });

    it("nodeIdが空文字列で例外", () => {
      const { call } = setup();
      expect(() => call("highlightNode", "")).toThrow(
        "nodeId must be a non-empty string",
      );
    });

    it("nodeIdが非文字列で例外", () => {
      const { call } = setup();
      expect(() => call("highlightNode", 42)).toThrow(
        "nodeId must be a non-empty string",
      );
    });

    it("無効な色で例外", () => {
      const { call } = setup();
      expect(() => call("highlightNode", "n1", "pink")).toThrow(
        "invalid color",
      );
    });
  });

  // ── unhighlightNode ──

  describe("unhighlightNode", () => {
    it("ハイライトを除去する", () => {
      const { handler, call } = setup();
      call("unhighlightNode", "n1");
      expect(handler.unhighlightNode).toHaveBeenCalledWith("n1");
    });

    it("nodeIdが空文字列で例外", () => {
      const { call } = setup();
      expect(() => call("unhighlightNode", "")).toThrow(
        "nodeId must be a non-empty string",
      );
    });

    it("nodeIdが非文字列で例外", () => {
      const { call } = setup();
      expect(() => call("unhighlightNode", undefined)).toThrow(
        "nodeId must be a non-empty string",
      );
    });
  });

  // ── clearHighlights ──

  describe("clearHighlights", () => {
    it("全ハイライトをクリアする", () => {
      const { handler, call } = setup();
      call("clearHighlights");
      expect(handler.clearHighlights).toHaveBeenCalledOnce();
    });
  });

  // ── addAnnotation ──

  describe("addAnnotation", () => {
    it("アノテーションを追加しIDを返す", () => {
      const { handler, call } = setup();
      const result = call("addAnnotation", "n1", "This is a note");
      expect(handler.addAnnotation).toHaveBeenCalledWith(
        "n1",
        "This is a note",
      );
      expect(result).toBe("ann-1");
    });

    it("nodeIdが空文字列で例外", () => {
      const { call } = setup();
      expect(() => call("addAnnotation", "", "text")).toThrow(
        "nodeId must be a non-empty string",
      );
    });

    it("nodeIdが非文字列で例外", () => {
      const { call } = setup();
      expect(() => call("addAnnotation", null, "text")).toThrow(
        "nodeId must be a non-empty string",
      );
    });

    it("textが非文字列で例外", () => {
      const { call } = setup();
      expect(() => call("addAnnotation", "n1", 42)).toThrow(
        "text must be a string",
      );
    });
  });

  // ── removeAnnotation ──

  describe("removeAnnotation", () => {
    it("アノテーションを除去する", () => {
      const { handler, call } = setup();
      call("removeAnnotation", "ann-1");
      expect(handler.removeAnnotation).toHaveBeenCalledWith("ann-1");
    });

    it("annotationIdが空文字列で例外", () => {
      const { call } = setup();
      expect(() => call("removeAnnotation", "")).toThrow(
        "annotationId must be a non-empty string",
      );
    });

    it("annotationIdが非文字列で例外", () => {
      const { call } = setup();
      expect(() => call("removeAnnotation", 123)).toThrow(
        "annotationId must be a non-empty string",
      );
    });
  });

  // ── clearAnnotations ──

  describe("clearAnnotations", () => {
    it("全アノテーションをクリアする", () => {
      const { handler, call } = setup();
      call("clearAnnotations");
      expect(handler.clearAnnotations).toHaveBeenCalledOnce();
    });
  });

  // ── vizLog ──

  describe("vizLog", () => {
    it("infoレベルでログする（デフォルト）", () => {
      const { handler, call } = setup();
      call("vizLog", "test message");
      expect(handler.addLog).toHaveBeenCalledWith("test message", "info");
    });

    it("warnレベルでログする", () => {
      const { handler, call } = setup();
      call("vizLog", "warning", "warn");
      expect(handler.addLog).toHaveBeenCalledWith("warning", "warn");
    });

    it("errorレベルでログする", () => {
      const { handler, call } = setup();
      call("vizLog", "error msg", "error");
      expect(handler.addLog).toHaveBeenCalledWith("error msg", "error");
    });

    it("無効なlevelはinfoにフォールバック", () => {
      const { handler, call } = setup();
      call("vizLog", "test", "debug");
      expect(handler.addLog).toHaveBeenCalledWith("test", "info");
    });

    it("null messageは空文字列になる", () => {
      const { handler, call } = setup();
      call("vizLog", null);
      expect(handler.addLog).toHaveBeenCalledWith("", "info");
    });

    it("undefined messageは空文字列になる", () => {
      const { handler, call } = setup();
      call("vizLog", undefined);
      expect(handler.addLog).toHaveBeenCalledWith("", "info");
    });

    it("数値messageは文字列に変換される", () => {
      const { handler, call } = setup();
      call("vizLog", 42);
      expect(handler.addLog).toHaveBeenCalledWith("42", "info");
    });
  });

  // ── clearVisualization ──

  describe("clearVisualization", () => {
    it("全可視化状態をクリアする", () => {
      const { handler, call } = setup();
      call("clearVisualization");
      expect(handler.clearVisualization).toHaveBeenCalledOnce();
    });
  });

  // ── ブリッジ数の検証 ──

  describe("createVisualizationBridges", () => {
    it("8つのブリッジ関数を返す", () => {
      const handler = createMockHandler();
      const bridges = createVisualizationBridges(handler);
      expect(bridges).toHaveLength(8);
    });

    it("全ブリッジに一意の名前がある", () => {
      const handler = createMockHandler();
      const bridges = createVisualizationBridges(handler);
      const names = bridges.map((b) => b.name);
      expect(new Set(names).size).toBe(names.length);
    });
  });
});
