/**
 * 可視化 API のサンドボックスブリッジ。
 *
 * スクリプトからノードハイライト・アノテーション・ログ操作を行う。
 * コールバック方式で VisualizationState を間接的に操作する。
 *
 * 変更時は visualizationBridge.test.ts, index.ts, builtin-api.d.ts も同期すること。
 */

import type { NativeFunctionBridge } from "./scriptRunner";
import type { ProofBridgeApiDef } from "./proofBridge";
import type { HighlightColor } from "../proof-pad/visualizationState";
import { toHighlightColor } from "../proof-pad/visualizationState";

// ── 可視化コマンド型 ──────────────────────────────────────

/** 可視化操作ハンドラー。各操作の実装を外部から注入する。 */
export interface VisualizationCommandHandler {
  /** ノードにハイライトを追加する（既存があれば上書き） */
  readonly highlightNode: (
    nodeId: string,
    color: HighlightColor,
    label?: string,
  ) => void;
  /** ノードのハイライトを除去する */
  readonly unhighlightNode: (nodeId: string) => void;
  /** 全ハイライトをクリアする */
  readonly clearHighlights: () => void;
  /** アノテーションを追加する。ID を返す */
  readonly addAnnotation: (nodeId: string, text: string) => string;
  /** アノテーションを除去する */
  readonly removeAnnotation: (annotationId: string) => void;
  /** 全アノテーションをクリアする */
  readonly clearAnnotations: () => void;
  /** 可視化ログを追加する */
  readonly addLog: (message: string, level: "info" | "warn" | "error") => void;
  /** 全可視化状態をクリアする */
  readonly clearVisualization: () => void;
}

// ── ブリッジ関数実装 ──────────────────────────────────────

const createHighlightNodeFn =
  (handler: VisualizationCommandHandler) =>
  (nodeId: unknown, color?: unknown, label?: unknown): void => {
    if (typeof nodeId !== "string" || nodeId === "") {
      throw new Error("highlightNode: nodeId must be a non-empty string");
    }
    const resolvedColor: HighlightColor =
      color !== undefined && color !== null
        ? (toHighlightColor(color) ??
          (() => {
            throw new Error(
              `highlightNode: invalid color "${String(color) satisfies string}". Use: red, blue, green, yellow, purple, orange`,
            );
          })())
        : "yellow";
    const resolvedLabel =
      label !== undefined && label !== null ? String(label) : undefined;
    handler.highlightNode(nodeId, resolvedColor, resolvedLabel);
  };

const createUnhighlightNodeFn =
  (handler: VisualizationCommandHandler) =>
  (nodeId: unknown): void => {
    if (typeof nodeId !== "string" || nodeId === "") {
      throw new Error("unhighlightNode: nodeId must be a non-empty string");
    }
    handler.unhighlightNode(nodeId);
  };

const createClearHighlightsFn =
  (handler: VisualizationCommandHandler) => (): void => {
    handler.clearHighlights();
  };

const createAddAnnotationFn =
  (handler: VisualizationCommandHandler) =>
  (nodeId: unknown, text: unknown): unknown => {
    if (typeof nodeId !== "string" || nodeId === "") {
      throw new Error("addAnnotation: nodeId must be a non-empty string");
    }
    if (typeof text !== "string") {
      throw new Error("addAnnotation: text must be a string");
    }
    return handler.addAnnotation(nodeId, text);
  };

const createRemoveAnnotationFn =
  (handler: VisualizationCommandHandler) =>
  (annotationId: unknown): void => {
    if (typeof annotationId !== "string" || annotationId === "") {
      throw new Error(
        "removeAnnotation: annotationId must be a non-empty string",
      );
    }
    handler.removeAnnotation(annotationId);
  };

const createClearAnnotationsFn =
  (handler: VisualizationCommandHandler) => (): void => {
    handler.clearAnnotations();
  };

const createVizLogFn =
  (handler: VisualizationCommandHandler) =>
  (message: unknown, level?: unknown): void => {
    const msg =
      message === undefined || message === null ? "" : String(message);
    const resolvedLevel =
      level === "warn" || level === "error" ? level : "info";
    handler.addLog(msg, resolvedLevel);
  };

const createClearVisualizationFn =
  (handler: VisualizationCommandHandler) => (): void => {
    handler.clearVisualization();
  };

// ── ブリッジ生成 ──────────────────────────────────────────

/**
 * 可視化 API の NativeFunctionBridge 配列を生成する。
 *
 * サンドボックス内で以下の関数が利用可能になる:
 * - highlightNode(nodeId, color?, label?) → void
 * - unhighlightNode(nodeId) → void
 * - clearHighlights() → void
 * - addAnnotation(nodeId, text) → annotationId
 * - removeAnnotation(annotationId) → void
 * - clearAnnotations() → void
 * - vizLog(message, level?) → void
 * - clearVisualization() → void
 */
export const createVisualizationBridges = (
  handler: VisualizationCommandHandler,
): readonly NativeFunctionBridge[] => [
  { name: "highlightNode", fn: createHighlightNodeFn(handler) },
  { name: "unhighlightNode", fn: createUnhighlightNodeFn(handler) },
  { name: "clearHighlights", fn: createClearHighlightsFn(handler) },
  { name: "addAnnotation", fn: createAddAnnotationFn(handler) },
  { name: "removeAnnotation", fn: createRemoveAnnotationFn(handler) },
  { name: "clearAnnotations", fn: createClearAnnotationsFn(handler) },
  { name: "vizLog", fn: createVizLogFn(handler) },
  { name: "clearVisualization", fn: createClearVisualizationFn(handler) },
];

// ── API 定義（Monaco Editor 補完用）──────────────────────

/**
 * ブリッジ関数の API 定義一覧。
 * builtin-api.d.ts との同期確認テストで使用する。
 */
export const VISUALIZATION_BRIDGE_API_DEFS: readonly ProofBridgeApiDef[] = [
  {
    name: "highlightNode",
    signature:
      '(nodeId: string, color?: "red" | "blue" | "green" | "yellow" | "purple" | "orange", label?: string) => void',
    description:
      "ノードにハイライトを追加する。色を省略するとyellow。既存があれば上書き。",
  },
  {
    name: "unhighlightNode",
    signature: "(nodeId: string) => void",
    description: "ノードのハイライトを除去する。",
  },
  {
    name: "clearHighlights",
    signature: "() => void",
    description: "全ノードのハイライトをクリアする。",
  },
  {
    name: "addAnnotation",
    signature: "(nodeId: string, text: string) => string",
    description:
      "ノードに吹き出しアノテーションを追加する。アノテーションIDを返す。",
  },
  {
    name: "removeAnnotation",
    signature: "(annotationId: string) => void",
    description: "アノテーションを除去する。",
  },
  {
    name: "clearAnnotations",
    signature: "() => void",
    description: "全アノテーションをクリアする。",
  },
  {
    name: "vizLog",
    signature: '(message: string, level?: "info" | "warn" | "error") => void',
    description: "可視化ログにメッセージを追加する。levelを省略するとinfo。",
  },
  {
    name: "clearVisualization",
    signature: "() => void",
    description:
      "全可視化状態（ハイライト・アノテーション・ログ）をクリアする。",
  },
];
