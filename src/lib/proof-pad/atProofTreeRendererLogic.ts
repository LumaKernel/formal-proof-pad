/**
 * AT分析的タブロー証明木のレンダリング用純粋ロジック。
 *
 * ワークスペースのノード＋AtInferenceEdgesからタブロースタイル（上から下）の
 * 証明木表示データに変換する。
 *
 * ATの特徴（TABとの違い）:
 * - 各ノードは1つの署名付き論理式（T:φ または F:φ）
 * - α規則: 非分岐、1-2個の子ノードを同一枝上に追加
 * - β規則: 分岐、2つの枝に分かれる
 * - γ/δ規則: 非分岐、1個の子ノード
 * - closure: 枝が閉じる（T(φ)とF(φ)の矛盾）
 *
 * 変更時は atProofTreeRendererLogic.test.ts, AtProofTreePanel.tsx, index.ts も同期すること。
 */

import type { AtInferenceEdge } from "./inferenceEdge";
import { getInferenceEdgeLabel, isAtInferenceEdge } from "./inferenceEdge";
import type { InferenceEdge } from "./inferenceEdge";
import type { WorkspaceNode } from "./workspaceState";

// --- AT証明木表示用データ構造 ---

/** AT証明木の枝の状態 */
export type AtBranchStatus = "closed" | "open";

/** ATスタイル証明木の1ノード */
export type AtTreeDisplayNode = {
  /** ユニークID */
  readonly id: string;
  /** 署名付き論理式のテキスト（例: "T:P ∧ Q"） */
  readonly formulaText: string;
  /** 適用された規則のラベル（例: "α∧T"）。ルートノードはundefined */
  readonly ruleLabel: string | undefined;
  /** 子ノードのID配列（0=葉, 1=単項, 2=分岐） */
  readonly childIds: readonly string[];
  /** 枝の状態: closureならclosed、規則未適用の葉ならopen */
  readonly branchStatus: AtBranchStatus | undefined;
  /** ツリーの深さ（ルートが0） */
  readonly depth: number;
  /** ワークスペースノードID（対応がある場合） */
  readonly workspaceNodeId: string | undefined;
};

/** AT証明木全体の表示データ */
export type AtTreeDisplayData = {
  /** ルートノードID */
  readonly rootId: string;
  /** 全ノード（idでアクセス可能） */
  readonly nodes: ReadonlyMap<string, AtTreeDisplayNode>;
};

/** AT証明木の統計情報 */
export type AtTreeStats = {
  /** 総ノード数 */
  readonly totalNodes: number;
  /** 最大深さ */
  readonly maxDepth: number;
  /** 閉じた枝の数 */
  readonly closedBranches: number;
  /** 開いた枝の数 */
  readonly openBranches: number;
  /** 使用されている規則の種類 */
  readonly usedRules: readonly string[];
};

// --- ワークスペースグラフ → AT証明木変換 ---

/**
 * ワークスペースグラフの解析に必要な中間データ。
 */
type AtGraphAnalysis = {
  /** nodeId → そのノードを結論として持つATエッジ */
  readonly outgoingEdge: ReadonlyMap<string, AtInferenceEdge>;
  /** nodeId → そのノードのformulaText */
  readonly nodeTexts: ReadonlyMap<string, string>;
  /** ルートノードのID */
  readonly rootNodeIds: readonly string[];
};

/**
 * ATエッジのみをフィルタしてAtInferenceEdgeとして返す。
 */
function filterAtEdges(
  edges: readonly InferenceEdge[],
): readonly AtInferenceEdge[] {
  return edges.filter(isAtInferenceEdge) as readonly AtInferenceEdge[];
}

/**
 * ATエッジから子ノードIDを取得する。
 * α規則は1-2個、β規則は2個、γ/δ規則は1個、closureは0個。
 */
function getAtChildNodeIds(edge: AtInferenceEdge): readonly string[] {
  if (edge._tag === "at-alpha") {
    const ids: string[] = [];
    if (edge.resultNodeId !== undefined) {
      ids.push(edge.resultNodeId);
    }
    if (edge.secondResultNodeId !== undefined) {
      ids.push(edge.secondResultNodeId);
    }
    return ids;
  }
  if (edge._tag === "at-beta") {
    const ids: string[] = [];
    if (edge.leftResultNodeId !== undefined) {
      ids.push(edge.leftResultNodeId);
    }
    if (edge.rightResultNodeId !== undefined) {
      ids.push(edge.rightResultNodeId);
    }
    return ids;
  }
  if (edge._tag === "at-gamma" || edge._tag === "at-delta") {
    return edge.resultNodeId !== undefined ? [edge.resultNodeId] : [];
  }
  // at-closed: no children
  return [];
}

/**
 * β規則かどうかを判定する（分岐表示用）。
 */
function isAtBranchingEdge(edge: AtInferenceEdge): boolean {
  return edge._tag === "at-beta";
}

/**
 * ワークスペースのノードとATエッジからグラフ解析データを構築する。
 */
function analyzeAtWorkspaceGraph(
  nodes: readonly WorkspaceNode[],
  inferenceEdges: readonly InferenceEdge[],
): AtGraphAnalysis {
  const atEdges = filterAtEdges(inferenceEdges);

  // nodeId → outgoing edge
  const outgoingEdge = new Map<string, AtInferenceEdge>();
  for (const edge of atEdges) {
    outgoingEdge.set(edge.conclusionNodeId, edge);
  }

  // nodeId → formulaText
  const nodeTexts = new Map<string, string>();
  for (const node of nodes) {
    nodeTexts.set(node.id, node.formulaText);
  }

  // 前提として使われているノードIDの集合
  const childNodeIds = new Set<string>();
  for (const edge of atEdges) {
    for (const childId of getAtChildNodeIds(edge)) {
      childNodeIds.add(childId);
    }
  }

  // ATに関与するすべてのノードID
  const atNodeIds = new Set<string>();
  for (const edge of atEdges) {
    atNodeIds.add(edge.conclusionNodeId);
    for (const childId of getAtChildNodeIds(edge)) {
      atNodeIds.add(childId);
    }
  }

  // ルートノード = ATに関与し、他のエッジの子になっていないノード
  const rootNodeIds: string[] = [];
  for (const nodeId of atNodeIds) {
    if (!childNodeIds.has(nodeId)) {
      rootNodeIds.push(nodeId);
    }
  }

  return { outgoingEdge, nodeTexts, rootNodeIds };
}

/**
 * 指定されたノードIDを起点に、子方向へ再帰的にATツリーを構築する。
 */
function buildAtTreeFromNode(
  nodeId: string,
  analysis: AtGraphAnalysis,
  depth: number,
  nodes: Map<string, AtTreeDisplayNode>,
  visited: Set<string>,
  nextIdRef: { value: number },
  ruleLabel: string | undefined,
): string {
  const id = `attree-${String(nextIdRef.value++) satisfies string}`;

  // 循環参照ガード
  if (visited.has(nodeId)) {
    nodes.set(id, {
      id,
      formulaText: analysis.nodeTexts.get(nodeId) ?? nodeId,
      ruleLabel,
      childIds: [],
      branchStatus: undefined,
      depth,
      workspaceNodeId: nodeId,
    });
    return id;
  }
  visited.add(nodeId);

  const edge = analysis.outgoingEdge.get(nodeId);

  if (edge === undefined) {
    // 葉ノード（規則未適用 = 開いた枝）
    nodes.set(id, {
      id,
      formulaText: analysis.nodeTexts.get(nodeId) ?? nodeId,
      ruleLabel,
      childIds: [],
      branchStatus: "open",
      depth,
      workspaceNodeId: nodeId,
    });
    return id;
  }

  // closureノード
  if (edge._tag === "at-closed") {
    nodes.set(id, {
      id,
      formulaText: analysis.nodeTexts.get(nodeId) ?? nodeId,
      ruleLabel,
      childIds: [],
      branchStatus: "closed",
      depth,
      workspaceNodeId: nodeId,
    });
    return id;
  }

  // 子ノードを再帰的に構築
  const childNodeIds = getAtChildNodeIds(edge);
  const childLabel = getInferenceEdgeLabel(edge);

  // β規則の場合は分岐として扱う
  if (isAtBranchingEdge(edge)) {
    const childDisplayIds = childNodeIds.map((childId) =>
      buildAtTreeFromNode(
        childId,
        analysis,
        depth + 1,
        nodes,
        visited,
        nextIdRef,
        childLabel,
      ),
    );

    nodes.set(id, {
      id,
      formulaText: analysis.nodeTexts.get(nodeId) ?? nodeId,
      ruleLabel,
      childIds: childDisplayIds,
      branchStatus: undefined,
      depth,
      workspaceNodeId: nodeId,
    });
    return id;
  }

  // α/γ/δ規則: 非分岐（同一枝上に追加）
  const childDisplayIds = childNodeIds.map((childId) =>
    buildAtTreeFromNode(
      childId,
      analysis,
      depth + 1,
      nodes,
      visited,
      nextIdRef,
      childLabel,
    ),
  );

  nodes.set(id, {
    id,
    formulaText: analysis.nodeTexts.get(nodeId) ?? nodeId,
    ruleLabel,
    childIds: childDisplayIds,
    branchStatus: undefined,
    depth,
    workspaceNodeId: nodeId,
  });

  return id;
}

/**
 * ワークスペースの特定ノードを起点にAT証明木の表示データを構築する。
 */
export function convertAtWorkspaceToTreeDisplay(
  nodes: readonly WorkspaceNode[],
  inferenceEdges: readonly InferenceEdge[],
  rootNodeId: string,
): AtTreeDisplayData {
  const analysis = analyzeAtWorkspaceGraph(nodes, inferenceEdges);
  const displayNodes = new Map<string, AtTreeDisplayNode>();
  const visited = new Set<string>();
  const nextIdRef = { value: 0 };

  const rootId = buildAtTreeFromNode(
    rootNodeId,
    analysis,
    0,
    displayNodes,
    visited,
    nextIdRef,
    undefined,
  );

  return { rootId, nodes: displayNodes };
}

/**
 * ワークスペースから自動的にルートノードを検出し、AT証明木を構築する。
 */
export function convertAtWorkspaceToTreeDisplayAuto(
  nodes: readonly WorkspaceNode[],
  inferenceEdges: readonly InferenceEdge[],
): AtTreeDisplayData | null {
  const analysis = analyzeAtWorkspaceGraph(nodes, inferenceEdges);

  if (analysis.rootNodeIds.length === 0) return null;

  const rootNodeId = analysis.rootNodeIds[0]!;

  const displayNodes = new Map<string, AtTreeDisplayNode>();
  const visited = new Set<string>();
  const nextIdRef = { value: 0 };

  const rootId = buildAtTreeFromNode(
    rootNodeId,
    analysis,
    0,
    displayNodes,
    visited,
    nextIdRef,
    undefined,
  );

  return { rootId, nodes: displayNodes };
}

/**
 * ワークスペースからAT証明木のルートノードID一覧を返す。
 */
export function findAtTreeRoots(
  nodes: readonly WorkspaceNode[],
  inferenceEdges: readonly InferenceEdge[],
): readonly string[] {
  const analysis = analyzeAtWorkspaceGraph(nodes, inferenceEdges);
  return analysis.rootNodeIds;
}

// --- ツリー統計 ---

/**
 * AT証明木の統計情報を計算する。
 */
export function computeAtTreeStats(data: AtTreeDisplayData): AtTreeStats {
  let maxDepth = 0;
  let closedBranches = 0;
  let openBranches = 0;
  const usedRulesSet = new Set<string>();

  for (const node of data.nodes.values()) {
    if (node.depth > maxDepth) maxDepth = node.depth;
    if (node.ruleLabel !== undefined) {
      usedRulesSet.add(node.ruleLabel);
    }
    if (node.branchStatus === "closed") closedBranches++;
    if (node.branchStatus === "open") openBranches++;
  }

  return {
    totalNodes: data.nodes.size,
    maxDepth,
    closedBranches,
    openBranches,
    usedRules: [...usedRulesSet].sort(),
  };
}
