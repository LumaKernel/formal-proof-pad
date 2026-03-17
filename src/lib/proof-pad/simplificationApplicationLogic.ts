/**
 * 整理（Simplification）適用のための純粋ロジック。
 *
 * ワークスペース上の2つのノードが整理等価（α等価 + 置換解決）かを判定する。
 * areSimplificationEquivalent（logic-core）を使用。
 *
 * 変更時は simplificationApplicationLogic.test.ts, workspaceState.ts, index.ts も同期すること。
 */

import { Data, Effect, Either } from "effect";
import { areSimplificationEquivalent } from "../logic-core/alphaEquivalence";
import { parseNodeFormula } from "./mpApplicationLogic";
import type { WorkspaceState, WorkspaceNode } from "./workspaceState";

// --- エラー型 ---

export class SimplificationPremiseMissing extends Data.TaggedError(
  "SimplificationPremiseMissing",
)<Record<string, never>> {}

export class SimplificationPremiseParseError extends Data.TaggedError(
  "SimplificationPremiseParseError",
)<{ readonly nodeId: string }> {}

export class SimplificationConclusionParseError extends Data.TaggedError(
  "SimplificationConclusionParseError",
)<{ readonly nodeId: string }> {}

export class SimplificationNotEquivalent extends Data.TaggedError(
  "SimplificationNotEquivalent",
)<Record<string, never>> {}

export type SimplificationApplicationError =
  | SimplificationPremiseMissing
  | SimplificationPremiseParseError
  | SimplificationConclusionParseError
  | SimplificationNotEquivalent;

// --- 成功型 ---

export type SimplificationApplicationSuccess = {
  readonly _tag: "simplification-valid";
};

export type SimplificationApplicationResult = Either.Either<
  SimplificationApplicationSuccess,
  SimplificationApplicationError
>;

// --- バリデーション ---

/**
 * 整理エッジのバリデーション（Effect版）。
 *
 * 前提ノードと結論ノードの論理式が整理等価であることを検証する。
 * 結論テキストの自動計算は行わない（両方のノードが既にテキストを持つ前提）。
 */
export const validateSimplificationApplicationEffect = (
  state: WorkspaceState,
  conclusionNodeId: string,
): Effect.Effect<
  SimplificationApplicationSuccess,
  SimplificationApplicationError
> =>
  Effect.gen(function* () {
    const edge = state.inferenceEdges.find(
      (e) =>
        e._tag === "simplification" && e.conclusionNodeId === conclusionNodeId,
    );

    if (!edge || edge._tag !== "simplification" || !edge.premiseNodeId) {
      return yield* Effect.fail(new SimplificationPremiseMissing({}));
    }

    const premiseNode = state.nodes.find((n) => n.id === edge.premiseNodeId);
    const conclusionNode = state.nodes.find((n) => n.id === conclusionNodeId);

    /* v8 ignore start -- 防御的コード: ノードが削除済みのケース */
    if (!premiseNode) {
      return yield* Effect.fail(new SimplificationPremiseMissing({}));
    }
    /* v8 ignore stop */

    /* v8 ignore start -- 防御的コード: 結論ノードが見つからないケース */
    if (!conclusionNode) {
      return yield* Effect.fail(
        new SimplificationConclusionParseError({ nodeId: conclusionNodeId }),
      );
    }
    /* v8 ignore stop */

    const premiseFormula = parseNodeFormula(premiseNode);
    if (!premiseFormula) {
      return yield* Effect.fail(
        new SimplificationPremiseParseError({ nodeId: edge.premiseNodeId }),
      );
    }

    const conclusionFormula = parseNodeFormula(conclusionNode);
    if (!conclusionFormula) {
      return yield* Effect.fail(
        new SimplificationConclusionParseError({ nodeId: conclusionNodeId }),
      );
    }

    if (!areSimplificationEquivalent(premiseFormula, conclusionFormula)) {
      return yield* Effect.fail(new SimplificationNotEquivalent({}));
    }

    return { _tag: "simplification-valid" as const };
  });

/**
 * 整理エッジのバリデーション（Either版、公開API）。
 */
export const validateSimplificationApplication = (
  state: WorkspaceState,
  conclusionNodeId: string,
): SimplificationApplicationResult =>
  Effect.runSync(
    Effect.either(
      validateSimplificationApplicationEffect(state, conclusionNodeId),
    ),
  );

// --- 互換ノード判定（ハイライト用） ---

/**
 * 指定ノードと整理等価な論理式を持つノードのIDセットを返す。
 * sourceNodeId 自身は結果に含まれない。
 */
export function computeSimplificationCompatibleNodeIds(
  nodes: readonly WorkspaceNode[],
  sourceNodeId: string,
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
    if (areSimplificationEquivalent(sourceFormula, formula)) {
      compatible.add(node.id);
    }
  }
  return compatible;
}

// --- エラーメッセージ ---

export function getSimplificationErrorMessage(
  error: SimplificationApplicationError,
): string {
  switch (error._tag) {
    case "SimplificationPremiseMissing":
      return "Connect a premise to apply simplification";
    case "SimplificationPremiseParseError":
      return "Premise has invalid formula";
    case "SimplificationConclusionParseError":
      return "Conclusion has invalid formula";
    case "SimplificationNotEquivalent":
      return "Formulas are not simplification-equivalent";
  }
}
