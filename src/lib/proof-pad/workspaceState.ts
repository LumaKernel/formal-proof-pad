/**
 * 証明ワークスペースの純粋な状態管理ロジック。
 *
 * ワークスペース上のノード（公理/MP/結論）の配置、接続、論理体系設定を管理する。
 * UIコンポーネント（ProofWorkspace.tsx）から利用される。
 *
 * 変更時は workspaceState.test.ts, ProofWorkspace.tsx, index.ts も同期すること。
 */

import type { LogicSystem } from "../logic-core/inferenceRule";
import type { Point } from "../infinite-canvas/types";
import type { ProofNodeKind } from "./proofNodeUI";

// --- ワークスペースノード ---

/** ワークスペース上の証明ノード */
export type WorkspaceNode = {
  readonly id: string;
  readonly kind: ProofNodeKind;
  readonly label: string;
  readonly formulaText: string;
  readonly position: Point;
};

/** ワークスペース上の接続（ポートベース） */
export type WorkspaceConnection = {
  readonly id: string;
  readonly fromNodeId: string;
  readonly fromPortId: string;
  readonly toNodeId: string;
  readonly toPortId: string;
};

/** ワークスペースの状態 */
export type WorkspaceState = {
  readonly system: LogicSystem;
  readonly nodes: readonly WorkspaceNode[];
  readonly connections: readonly WorkspaceConnection[];
  readonly nextNodeId: number;
};

// --- 初期状態 ---

/** 空のワークスペースを作成する */
export function createEmptyWorkspace(system: LogicSystem): WorkspaceState {
  return {
    system,
    nodes: [],
    connections: [],
    nextNodeId: 1,
  };
}

// --- ノード操作 ---

/** ノードを追加する */
export function addNode(
  state: WorkspaceState,
  kind: ProofNodeKind,
  label: string,
  position: Point,
  formulaText?: string,
): WorkspaceState {
  const id = `node-${String(state.nextNodeId) satisfies string}`;
  const newNode: WorkspaceNode = {
    id,
    kind,
    label,
    formulaText: formulaText ?? "",
    position,
  };
  return {
    ...state,
    nodes: [...state.nodes, newNode],
    nextNodeId: state.nextNodeId + 1,
  };
}

/** ノードの位置を更新する */
export function updateNodePosition(
  state: WorkspaceState,
  nodeId: string,
  position: Point,
): WorkspaceState {
  return {
    ...state,
    nodes: state.nodes.map((node) =>
      node.id === nodeId ? { ...node, position } : node,
    ),
  };
}

/** ノードの論理式テキストを更新する */
export function updateNodeFormulaText(
  state: WorkspaceState,
  nodeId: string,
  formulaText: string,
): WorkspaceState {
  return {
    ...state,
    nodes: state.nodes.map((node) =>
      node.id === nodeId ? { ...node, formulaText } : node,
    ),
  };
}

/** ノードをIDで検索する */
export function findNode(
  state: WorkspaceState,
  nodeId: string,
): WorkspaceNode | undefined {
  return state.nodes.find((n) => n.id === nodeId);
}

/** ノードを削除する（関連する接続も削除） */
export function removeNode(
  state: WorkspaceState,
  nodeId: string,
): WorkspaceState {
  return {
    ...state,
    nodes: state.nodes.filter((n) => n.id !== nodeId),
    connections: state.connections.filter(
      (c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId,
    ),
  };
}

// --- 接続操作 ---

/** 接続を追加する */
export function addConnection(
  state: WorkspaceState,
  fromNodeId: string,
  fromPortId: string,
  toNodeId: string,
  toPortId: string,
): WorkspaceState {
  const id = `conn-${fromNodeId satisfies string}-${fromPortId satisfies string}-${toNodeId satisfies string}-${toPortId satisfies string}`;
  const newConnection: WorkspaceConnection = {
    id,
    fromNodeId,
    fromPortId,
    toNodeId,
    toPortId,
  };
  return {
    ...state,
    connections: [...state.connections, newConnection],
  };
}

/** 接続を削除する */
export function removeConnection(
  state: WorkspaceState,
  connectionId: string,
): WorkspaceState {
  return {
    ...state,
    connections: state.connections.filter((c) => c.id !== connectionId),
  };
}

// --- 体系変更 ---

/** 論理体系を変更する */
export function changeSystem(
  state: WorkspaceState,
  system: LogicSystem,
): WorkspaceState {
  return {
    ...state,
    system,
  };
}
