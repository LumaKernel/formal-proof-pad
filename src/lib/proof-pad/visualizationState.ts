/**
 * アルゴリズム可視化のための純粋状態管理ロジック。
 *
 * ノードハイライト・吹き出しアノテーション・ログの状態を管理する。
 * UI層からは ReadonlyMap で参照し、ブリッジ経由でスクリプトから操作する。
 *
 * 変更時は visualizationState.test.ts, visualizationBridge.ts も同期すること。
 */

// ── 型定義 ─────────────────────────────────────────────────

/** ハイライトの色プリセット */
export type HighlightColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "orange";

/** ノードハイライト設定 */
export interface NodeHighlight {
  readonly nodeId: string;
  readonly color: HighlightColor;
  /** ハイライトのラベル（オプション。ノード近くに表示） */
  readonly label?: string;
}

/** 吹き出しアノテーション */
export interface NodeAnnotation {
  readonly id: string;
  readonly nodeId: string;
  readonly text: string;
}

/** 可視化ログエントリ */
export interface VisualizationLogEntry {
  readonly message: string;
  readonly level: "info" | "warn" | "error";
  readonly timestamp: number;
}

/** 可視化の全状態 */
export interface VisualizationState {
  /** nodeId → NodeHighlight */
  readonly highlights: ReadonlyMap<string, NodeHighlight>;
  /** annotationId → NodeAnnotation */
  readonly annotations: ReadonlyMap<string, NodeAnnotation>;
  /** ログエントリ（時系列順） */
  readonly logs: readonly VisualizationLogEntry[];
}

// ── 初期状態 ───────────────────────────────────────────────

export const emptyVisualizationState: VisualizationState = {
  highlights: new Map(),
  annotations: new Map(),
  logs: [],
};

// ── ハイライト操作 ─────────────────────────────────────────

const ALL_HIGHLIGHT_COLORS: ReadonlySet<string> = new Set<HighlightColor>([
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
]);

export const isHighlightColor = (value: unknown) =>
  typeof value === "string" && ALL_HIGHLIGHT_COLORS.has(value);

/** unknown → HighlightColor。無効なら undefined を返す */
export const toHighlightColor = (value: unknown): HighlightColor | undefined =>
  isHighlightColor(value) ? (value as HighlightColor) : undefined;

/** ノードにハイライトを追加（既存があれば上書き） */
export const addHighlight = (
  state: VisualizationState,
  highlight: NodeHighlight,
): VisualizationState => ({
  ...state,
  highlights: new Map([...state.highlights, [highlight.nodeId, highlight]]),
});

/** ノードのハイライトを除去 */
export const removeHighlight = (
  state: VisualizationState,
  nodeId: string,
): VisualizationState => {
  const next = new Map(state.highlights);
  next.delete(nodeId);
  return { ...state, highlights: next };
};

/** 全ハイライトをクリア */
export const clearHighlights = (
  state: VisualizationState,
): VisualizationState => ({
  ...state,
  highlights: new Map(),
});

// ── アノテーション操作 ─────────────────────────────────────

/** アノテーションを追加（同じIDがあれば上書き） */
export const addAnnotation = (
  state: VisualizationState,
  annotation: NodeAnnotation,
): VisualizationState => ({
  ...state,
  annotations: new Map([...state.annotations, [annotation.id, annotation]]),
});

/** アノテーションを除去 */
export const removeAnnotation = (
  state: VisualizationState,
  annotationId: string,
): VisualizationState => {
  const next = new Map(state.annotations);
  next.delete(annotationId);
  return { ...state, annotations: next };
};

/** 全アノテーションをクリア */
export const clearAnnotations = (
  state: VisualizationState,
): VisualizationState => ({
  ...state,
  annotations: new Map(),
});

// ── ログ操作 ──────────────────────────────────────────────

/** ログエントリを追加 */
export const addLog = (
  state: VisualizationState,
  entry: VisualizationLogEntry,
): VisualizationState => ({
  ...state,
  logs: [...state.logs, entry],
});

/** ログをクリア */
export const clearLogs = (state: VisualizationState): VisualizationState => ({
  ...state,
  logs: [],
});

// ── 全クリア ──────────────────────────────────────────────

/** 全可視化状態をクリア */
export const clearAll = (): VisualizationState => emptyVisualizationState;
