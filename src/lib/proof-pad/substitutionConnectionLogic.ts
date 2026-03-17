/**
 * 置換接続（SubstitutionConnection）適用のための純粋ロジック。
 *
 * ワークスペース上の2つのノードが項変数代入の関係にあるかを判定する。
 * findTermVariableSubstitution（logic-core）を使用。
 *
 * 変更時は substitutionConnectionLogic.test.ts, workspaceState.ts, index.ts も同期すること。
 */

import { Data, Effect, Either } from "effect";
import {
  findTermVariableSubstitution,
  isNonTrivialSubstitutionResult,
} from "../logic-core/termVariableMatching";
import { parseNodeFormula } from "./mpApplicationLogic";
import type { WorkspaceState, WorkspaceNode } from "./workspaceState";
import type { InferenceEdge } from "./inferenceEdge";
import { getInferenceEdgePremiseNodeIds } from "./inferenceEdge";

// --- エラー型 ---

export class SubstitutionConnectionPremiseMissing extends Data.TaggedError(
  "SubstitutionConnectionPremiseMissing",
)<Record<string, never>> {}

export class SubstitutionConnectionPremiseParseError extends Data.TaggedError(
  "SubstitutionConnectionPremiseParseError",
)<{ readonly nodeId: string }> {}

export class SubstitutionConnectionConclusionParseError extends Data.TaggedError(
  "SubstitutionConnectionConclusionParseError",
)<{ readonly nodeId: string }> {}

export class SubstitutionConnectionNotRelated extends Data.TaggedError(
  "SubstitutionConnectionNotRelated",
)<Record<string, never>> {}

export type SubstitutionConnectionApplicationError =
  | SubstitutionConnectionPremiseMissing
  | SubstitutionConnectionPremiseParseError
  | SubstitutionConnectionConclusionParseError
  | SubstitutionConnectionNotRelated;

// --- 成功型 ---

export type SubstitutionConnectionApplicationSuccess = {
  readonly _tag: "substitution-connection-valid";
};

export type SubstitutionConnectionApplicationResult = Either.Either<
  SubstitutionConnectionApplicationSuccess,
  SubstitutionConnectionApplicationError
>;

// --- バリデーション ---

/**
 * 置換接続エッジのバリデーション（Effect版）。
 *
 * 前提ノードと結論ノードの論理式が項変数代入の関係にあることを検証する。
 * source[σ] = target または target[σ] = source（双方向）を許可。
 */
export const validateSubstitutionConnectionApplicationEffect = (
  state: WorkspaceState,
  conclusionNodeId: string,
): Effect.Effect<
  SubstitutionConnectionApplicationSuccess,
  SubstitutionConnectionApplicationError
> =>
  Effect.gen(function* () {
    const edge = state.inferenceEdges.find(
      (e) =>
        e._tag === "substitution-connection" &&
        e.conclusionNodeId === conclusionNodeId,
    );

    if (
      !edge ||
      edge._tag !== "substitution-connection" ||
      !edge.premiseNodeId
    ) {
      return yield* Effect.fail(new SubstitutionConnectionPremiseMissing({}));
    }

    const premiseNode = state.nodes.find((n) => n.id === edge.premiseNodeId);
    const conclusionNode = state.nodes.find((n) => n.id === conclusionNodeId);

    /* v8 ignore start -- 防御的コード: ノードが削除済みのケース */
    if (!premiseNode) {
      return yield* Effect.fail(new SubstitutionConnectionPremiseMissing({}));
    }
    /* v8 ignore stop */

    /* v8 ignore start -- 防御的コード: 結論ノードが見つからないケース */
    if (!conclusionNode) {
      return yield* Effect.fail(
        new SubstitutionConnectionConclusionParseError({
          nodeId: conclusionNodeId,
        }),
      );
    }
    /* v8 ignore stop */

    const premiseFormula = parseNodeFormula(premiseNode);
    if (!premiseFormula) {
      return yield* Effect.fail(
        new SubstitutionConnectionPremiseParseError({
          nodeId: edge.premiseNodeId,
        }),
      );
    }

    const conclusionFormula = parseNodeFormula(conclusionNode);
    if (!conclusionFormula) {
      return yield* Effect.fail(
        new SubstitutionConnectionConclusionParseError({
          nodeId: conclusionNodeId,
        }),
      );
    }

    // 双方向: source→target または target→source
    const forward = findTermVariableSubstitution(
      premiseFormula,
      conclusionFormula,
    );
    const backward = findTermVariableSubstitution(
      conclusionFormula,
      premiseFormula,
    );

    if (forward === undefined && backward === undefined) {
      return yield* Effect.fail(new SubstitutionConnectionNotRelated({}));
    }

    return { _tag: "substitution-connection-valid" as const };
  });

/**
 * 置換接続エッジのバリデーション（Either版、公開API）。
 */
export const validateSubstitutionConnectionApplication = (
  state: WorkspaceState,
  conclusionNodeId: string,
): SubstitutionConnectionApplicationResult =>
  Effect.runSync(
    Effect.either(
      validateSubstitutionConnectionApplicationEffect(state, conclusionNodeId),
    ),
  );

// --- 互換ノード判定（ハイライト用） ---

/**
 * DAGサイクルを検出するヘルパー。
 * sourceからtargetへエッジを追加した場合にサイクルが発生するかをチェック。
 */
function wouldCreateCycle(
  edges: readonly InferenceEdge[],
  sourceNodeId: string,
  targetNodeId: string,
): boolean {
  // targetからsourceへのパスがあればサイクル
  const visited = new Set<string>();
  const queue = [targetNodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === sourceNodeId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    // currentを前提に持つエッジの結論ノードを探す
    for (const edge of edges) {
      if (getInferenceEdgePremiseNodeIds(edge).includes(current)) {
        queue.push(edge.conclusionNodeId);
      }
    }
  }
  return false;
}

/**
 * 指定ノードと項変数代入の関係にあるノードのIDセットを返す。
 * sourceNodeId 自身は結果に含まれない。
 * ループを作るノードは除外する。
 */
export function computeSubstitutionConnectionCompatibleNodeIds(
  nodes: readonly WorkspaceNode[],
  sourceNodeId: string,
  inferenceEdges: readonly InferenceEdge[],
): ReadonlySet<string> {
  const sourceNode = nodes.find((n) => n.id === sourceNodeId);
  if (!sourceNode) return new Set();

  const sourceFormula = parseNodeFormula(sourceNode);
  if (!sourceFormula) return new Set();

  const compatible = new Set<string>();
  for (const node of nodes) {
    if (node.id === sourceNodeId) continue;
    const formula = parseNodeFormula(node);
    if (!formula) continue;

    // 非自明な項変数代入の関係があるか（双方向）
    if (
      !isNonTrivialSubstitutionResult(sourceFormula, formula) &&
      !isNonTrivialSubstitutionResult(formula, sourceFormula)
    ) {
      continue;
    }

    // ループを作らないか確認（双方向のエッジどちらでもサイクルにならないこと）
    if (
      wouldCreateCycle(inferenceEdges, sourceNodeId, node.id) &&
      wouldCreateCycle(inferenceEdges, node.id, sourceNodeId)
    ) {
      continue;
    }

    compatible.add(node.id);
  }
  return compatible;
}

// --- エラーメッセージ ---

export function getSubstitutionConnectionErrorMessage(
  error: SubstitutionConnectionApplicationError,
): string {
  switch (error._tag) {
    case "SubstitutionConnectionPremiseMissing":
      return "Connect a premise to apply substitution connection";
    case "SubstitutionConnectionPremiseParseError":
      return "Premise has invalid formula";
    case "SubstitutionConnectionConclusionParseError":
      return "Conclusion has invalid formula";
    case "SubstitutionConnectionNotRelated":
      return "Formulas are not related by term-variable substitution";
  }
}
