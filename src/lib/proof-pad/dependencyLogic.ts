/**
 * ノードの依存関係・サブツリーを追跡する純粋ロジック。
 *
 * - getNodeDependencies: 接続グラフを逆方向に遡り、ルートノード（公理）を特定
 * - getSubtreeNodeIds: 接続グラフを順方向に辿り、子孫ノードを収集
 *
 * 変更時は dependencyLogic.test.ts, ProofWorkspace.tsx, index.ts も同期すること。
 */

import type { WorkspaceNode, WorkspaceConnection } from "./workspaceState";
import { isRootNode } from "./nodeRoleLogic";

/**
 * あるノードが依存するルートノード（公理）のID集合を返す。
 *
 * 接続グラフを逆方向に辿り、入力のないルートノードに到達するまで再帰的に探索する。
 * ルートノード自身は自分自身のIDのみを含む集合を返す。
 * 循環参照がある場合は訪問済みノードをスキップして無限ループを防止する。
 *
 * @param nodeId 対象ノードのID
 * @param nodes ワークスペースの全ノード
 * @param connections ワークスペースの全接続
 * @returns 依存するルートノードIDの集合（ReadonlySet）
 */
export function getNodeDependencies(
  nodeId: string,
  nodes: readonly WorkspaceNode[],
  connections: readonly WorkspaceConnection[],
): ReadonlySet<string> {
  const result = new Set<string>();
  const visited = new Set<string>();

  function traverse(currentId: string): void {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    if (isRootNode(currentId, connections)) {
      result.add(currentId);
      return;
    }

    // このノードへの入力接続を見つけて、ソースノードを再帰的に辿る
    const incomingConnections = connections.filter(
      (c) => c.toNodeId === currentId,
    );
    for (const conn of incomingConnections) {
      traverse(conn.fromNodeId);
    }
  }

  // ノードが存在するか確認
  const node = nodes.find((n) => n.id === nodeId);
  if (node === undefined) return result;

  traverse(nodeId);
  return result;
}

/**
 * ワークスペース上のすべてのノードの公理依存関係を計算する。
 *
 * @param nodes ワークスペースの全ノード
 * @param connections ワークスペースの全接続
 * @returns ノードID → 依存するルートノードIDの集合のMap
 */
export function getAllNodeDependencies(
  nodes: readonly WorkspaceNode[],
  connections: readonly WorkspaceConnection[],
): ReadonlyMap<string, ReadonlySet<string>> {
  const result = new Map<string, ReadonlySet<string>>();
  for (const node of nodes) {
    result.set(node.id, getNodeDependencies(node.id, nodes, connections));
  }
  return result;
}

/**
 * あるノードとその全子孫（サブツリー）のID集合を返す。
 *
 * 接続グラフを順方向（fromNodeId → toNodeId）に辿り、
 * 指定ノードから到達可能なすべてのノードを収集する。
 * DAG構造で共有されたノード（複数の親を持つ）も含む。
 * 循環参照がある場合は訪問済みノードをスキップして無限ループを防止する。
 *
 * @param nodeId 起点ノードのID
 * @param connections ワークスペースの全接続
 * @returns サブツリーに含まれるノードIDの集合（起点ノード自身を含む）
 */
export function getSubtreeNodeIds(
  nodeId: string,
  connections: readonly WorkspaceConnection[],
): ReadonlySet<string> {
  const result = new Set<string>([nodeId]);

  function traverse(currentId: string): void {
    const outgoing = connections.filter(
      (c) => c.fromNodeId === currentId,
    );
    for (const conn of outgoing) {
      if (!result.has(conn.toNodeId)) {
        result.add(conn.toNodeId);
        traverse(conn.toNodeId);
      }
    }
  }

  traverse(nodeId);
  return result;
}
