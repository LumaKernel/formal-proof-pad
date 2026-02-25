/**
 * クエスト完了検出の純粋ロジック。
 *
 * ワークスペースの状態からステップ数を計算し、
 * クエスト完了を判定するための純粋関数を提供する。
 *
 * 変更時は questCompletionLogic.test.ts も同期すること。
 */

import type { WorkspaceNode } from "../proof-pad/workspaceState";
import type { ProofNodeKind } from "../proof-pad/proofNodeUI";
import { equalFormula } from "../logic-core/equality";
import { parseString } from "../logic-lang/parser";

// --- ステップ数計算 ---

/**
 * ステップとしてカウントするノード種別。
 * 公理、MP（Modus Ponens）、Gen（汎化）がそれぞれ1ステップとなる。
 */
const STEP_NODE_KINDS: ReadonlySet<ProofNodeKind> = new Set([
  "axiom",
  "mp",
  "gen",
]);

/**
 * ワークスペース上のノードからステップ数を計算する。
 *
 * ステップ数 = 公理ノード + MPノード + Genノードの合計。
 * conclusionノードやゴールノードはカウントしない。
 *
 * @param nodes ワークスペース上のノード一覧
 * @returns ステップ数
 */
export function computeStepCount(nodes: readonly WorkspaceNode[]): number {
  return nodes.filter(
    (node) =>
      STEP_NODE_KINDS.has(node.kind) && node.protection !== "quest-goal",
  ).length;
}

// --- クエストゴール達成チェック ---

/** クエストゴール達成結果 */
export type QuestGoalCheckResult =
  | { readonly _tag: "NoGoals" }
  | {
      readonly _tag: "NotAllAchieved";
      readonly achievedCount: number;
      readonly totalCount: number;
    }
  | { readonly _tag: "AllAchieved"; readonly stepCount: number };

/**
 * クエストモードのワークスペースで、すべてのゴールが達成されているかチェックする。
 *
 * ゴールノード（protection: "quest-goal"）の各formulaが、
 * 非保護ノードのいずれかのformulaと一致すれば「達成」とみなす。
 *
 * @param nodes ワークスペース上のノード一覧
 * @returns クエストゴール達成チェック結果
 */
export function checkQuestGoals(
  nodes: readonly WorkspaceNode[],
): QuestGoalCheckResult {
  const goalNodes = nodes.filter((n) => n.protection === "quest-goal");
  if (goalNodes.length === 0) {
    return { _tag: "NoGoals" };
  }

  const workNodes = nodes.filter((n) => n.protection !== "quest-goal");

  let achievedCount = 0;
  for (const goal of goalNodes) {
    const goalParsed = parseString(goal.formulaText.trim());
    if (!goalParsed.ok) continue;

    const isAchieved = workNodes.some((work) => {
      const workParsed = parseString(work.formulaText.trim());
      if (!workParsed.ok) return false;
      return equalFormula(goalParsed.formula, workParsed.formula);
    });

    if (isAchieved) {
      achievedCount += 1;
    }
  }

  if (achievedCount >= goalNodes.length) {
    return {
      _tag: "AllAchieved",
      stepCount: computeStepCount(nodes),
    };
  }

  return {
    _tag: "NotAllAchieved",
    achievedCount,
    totalCount: goalNodes.length,
  };
}
