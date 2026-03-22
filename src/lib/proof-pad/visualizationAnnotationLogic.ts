/**
 * 可視化アノテーション（吹き出し）の表示ロジック（純粋関数）。
 *
 * NodeAnnotation → CSS スタイル / ノード別グルーピングを行う。
 *
 * 変更時は visualizationAnnotationLogic.test.ts も同期すること。
 */

import type { NodeAnnotation } from "./visualizationState";

// ── スタイル定義 ─────────────────────────────────────────────

export interface AnnotationBubbleStyle {
  readonly backgroundColor: string;
  readonly color: string;
  readonly border: string;
  readonly borderRadius: string;
  readonly padding: string;
  readonly fontSize: string;
  readonly maxWidth: string;
  readonly boxShadow: string;
  readonly whiteSpace: string;
  readonly wordBreak: string;
}

const ANNOTATION_BUBBLE_STYLE: AnnotationBubbleStyle = {
  backgroundColor: "var(--color-annotation-bg, rgba(255, 255, 220, 0.95))",
  color: "var(--color-annotation-text, #333)",
  border: "1px solid var(--color-annotation-border, rgba(200, 180, 100, 0.6))",
  borderRadius: "6px",
  padding: "4px 8px",
  fontSize: "12px",
  maxWidth: "200px",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

/**
 * アノテーション吹き出しの CSS スタイルを返す。
 */
export const getAnnotationBubbleStyle = (): AnnotationBubbleStyle =>
  ANNOTATION_BUBBLE_STYLE;

// ── コンテナスタイル ─────────────────────────────────────────

export interface AnnotationContainerStyle {
  readonly position: string;
  readonly top: string;
  readonly left: string;
  readonly display: string;
  readonly flexDirection: string;
  readonly gap: string;
  readonly pointerEvents: string;
  readonly zIndex: number;
}

const ANNOTATION_CONTAINER_STYLE: AnnotationContainerStyle = {
  position: "absolute",
  top: "100%",
  left: "0",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  pointerEvents: "none",
  zIndex: 10,
};

/**
 * アノテーションコンテナ（ノードの下に配置）の CSS スタイルを返す。
 */
export const getAnnotationContainerStyle = (): AnnotationContainerStyle =>
  ANNOTATION_CONTAINER_STYLE;

// ── グルーピング ─────────────────────────────────────────────

/**
 * アノテーションをノードID別にグルーピングする。
 *
 * @returns nodeId → annotations（挿入順）の ReadonlyMap
 */
export const groupAnnotationsByNodeId = (
  annotations: ReadonlyMap<string, NodeAnnotation>,
): ReadonlyMap<string, readonly NodeAnnotation[]> => {
  const result = new Map<string, NodeAnnotation[]>();
  for (const annotation of annotations.values()) {
    const existing = result.get(annotation.nodeId);
    if (existing) {
      existing.push(annotation);
    } else {
      result.set(annotation.nodeId, [annotation]);
    }
  }
  return result;
};
