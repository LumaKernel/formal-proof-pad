import { describe, test, expect } from "vitest";
import { computeStepCount, checkQuestGoals } from "./questCompletionLogic";
import type { WorkspaceNode } from "../proof-pad/workspaceState";

// --- ヘルパー ---

function makeNode(
  overrides: Partial<WorkspaceNode> & { readonly kind: WorkspaceNode["kind"] },
): WorkspaceNode {
  return {
    id: "n1",
    label: "",
    formulaText: "",
    position: { x: 0, y: 0 },
    ...overrides,
  };
}

describe("computeStepCount", () => {
  test("空のノード配列は0を返す", () => {
    expect(computeStepCount([])).toBe(0);
  });

  test("axiomノードを1ステップとしてカウントする", () => {
    const nodes = [makeNode({ id: "n1", kind: "axiom" })];
    expect(computeStepCount(nodes)).toBe(1);
  });

  test("mpノードを1ステップとしてカウントする", () => {
    const nodes = [makeNode({ id: "n1", kind: "mp" })];
    expect(computeStepCount(nodes)).toBe(1);
  });

  test("genノードを1ステップとしてカウントする", () => {
    const nodes = [makeNode({ id: "n1", kind: "gen" })];
    expect(computeStepCount(nodes)).toBe(1);
  });

  test("conclusionノードはカウントしない", () => {
    const nodes = [makeNode({ id: "n1", kind: "conclusion" })];
    expect(computeStepCount(nodes)).toBe(0);
  });

  test("quest-goalで保護されたノードはカウントしない", () => {
    const nodes = [
      makeNode({ id: "n1", kind: "axiom", protection: "quest-goal" }),
    ];
    expect(computeStepCount(nodes)).toBe(0);
  });

  test("混合ノードのステップ数を正しく計算する", () => {
    const nodes = [
      makeNode({ id: "n1", kind: "axiom" }),
      makeNode({ id: "n2", kind: "axiom" }),
      makeNode({ id: "n3", kind: "mp" }),
      makeNode({ id: "n4", kind: "gen" }),
      makeNode({ id: "n5", kind: "conclusion" }),
      makeNode({ id: "n6", kind: "axiom", protection: "quest-goal" }),
    ];
    // axiom(2) + mp(1) + gen(1) = 4。conclusionとquest-goalは除外
    expect(computeStepCount(nodes)).toBe(4);
  });

  test("ゴールノードのみの場合は0を返す", () => {
    const nodes = [
      makeNode({ id: "n1", kind: "axiom", protection: "quest-goal" }),
      makeNode({ id: "n2", kind: "axiom", protection: "quest-goal" }),
    ];
    expect(computeStepCount(nodes)).toBe(0);
  });
});

describe("checkQuestGoals", () => {
  test("ゴールノードがない場合はNoGoalsを返す", () => {
    const nodes = [makeNode({ id: "n1", kind: "axiom", formulaText: "phi" })];
    expect(checkQuestGoals(nodes)).toEqual({ _tag: "NoGoals" });
  });

  test("空のノード配列はNoGoalsを返す", () => {
    expect(checkQuestGoals([])).toEqual({ _tag: "NoGoals" });
  });

  test("ゴールが未達成の場合はNotAllAchievedを返す", () => {
    const nodes = [
      makeNode({
        id: "g1",
        kind: "axiom",
        formulaText: "phi -> phi",
        protection: "quest-goal",
      }),
      makeNode({
        id: "n1",
        kind: "axiom",
        formulaText: "phi -> (psi -> phi)",
      }),
    ];
    const result = checkQuestGoals(nodes);
    expect(result._tag).toBe("NotAllAchieved");
    if (result._tag === "NotAllAchieved") {
      expect(result.achievedCount).toBe(0);
      expect(result.totalCount).toBe(1);
    }
  });

  test("ゴールが達成された場合はAllAchievedを返す", () => {
    const nodes = [
      makeNode({
        id: "g1",
        kind: "axiom",
        formulaText: "phi -> phi",
        protection: "quest-goal",
      }),
      makeNode({
        id: "n1",
        kind: "axiom",
        formulaText: "phi -> (psi -> phi)",
      }),
      makeNode({
        id: "n2",
        kind: "mp",
        formulaText: "phi -> phi",
      }),
    ];
    const result = checkQuestGoals(nodes);
    expect(result._tag).toBe("AllAchieved");
    if (result._tag === "AllAchieved") {
      // axiom(1) + mp(1) = 2ステップ（ゴールノードは除外）
      expect(result.stepCount).toBe(2);
    }
  });

  test("複数ゴールのうち一部のみ達成の場合はNotAllAchievedを返す", () => {
    const nodes = [
      makeNode({
        id: "g1",
        kind: "axiom",
        formulaText: "phi -> phi",
        protection: "quest-goal",
      }),
      makeNode({
        id: "g2",
        kind: "axiom",
        formulaText: "psi -> psi",
        protection: "quest-goal",
      }),
      makeNode({
        id: "n1",
        kind: "mp",
        formulaText: "phi -> phi",
      }),
    ];
    const result = checkQuestGoals(nodes);
    expect(result._tag).toBe("NotAllAchieved");
    if (result._tag === "NotAllAchieved") {
      expect(result.achievedCount).toBe(1);
      expect(result.totalCount).toBe(2);
    }
  });

  test("複数ゴールすべて達成の場合はAllAchievedを返す", () => {
    const nodes = [
      makeNode({
        id: "g1",
        kind: "axiom",
        formulaText: "phi -> phi",
        protection: "quest-goal",
      }),
      makeNode({
        id: "g2",
        kind: "axiom",
        formulaText: "psi -> psi",
        protection: "quest-goal",
      }),
      makeNode({
        id: "n1",
        kind: "mp",
        formulaText: "phi -> phi",
      }),
      makeNode({
        id: "n2",
        kind: "axiom",
        formulaText: "psi -> psi",
      }),
    ];
    const result = checkQuestGoals(nodes);
    expect(result._tag).toBe("AllAchieved");
    if (result._tag === "AllAchieved") {
      expect(result.stepCount).toBe(2);
    }
  });

  test("ゴールのformulaTextが空の場合はスキップする", () => {
    const nodes = [
      makeNode({
        id: "g1",
        kind: "axiom",
        formulaText: "",
        protection: "quest-goal",
      }),
      makeNode({
        id: "n1",
        kind: "axiom",
        formulaText: "phi",
      }),
    ];
    // 空のゴールはパース失敗→スキップされるので、ゴール0/1で未達成扱い
    const result = checkQuestGoals(nodes);
    // パース失敗のゴールはcontinueされ、achievedCountは増えないがtotalCountは1
    expect(result._tag).toBe("NotAllAchieved");
  });

  test("ゴールのformulaTextがパース不能な場合はスキップする", () => {
    const nodes = [
      makeNode({
        id: "g1",
        kind: "axiom",
        formulaText: ">>>invalid<<<",
        protection: "quest-goal",
      }),
      makeNode({
        id: "n1",
        kind: "axiom",
        formulaText: "phi",
      }),
    ];
    const result = checkQuestGoals(nodes);
    expect(result._tag).toBe("NotAllAchieved");
  });

  test("ワークノードのformulaTextがパース不能でもエラーにならない", () => {
    const nodes = [
      makeNode({
        id: "g1",
        kind: "axiom",
        formulaText: "phi",
        protection: "quest-goal",
      }),
      makeNode({
        id: "n1",
        kind: "axiom",
        formulaText: ">>>invalid<<<",
      }),
    ];
    const result = checkQuestGoals(nodes);
    expect(result._tag).toBe("NotAllAchieved");
    if (result._tag === "NotAllAchieved") {
      expect(result.achievedCount).toBe(0);
      expect(result.totalCount).toBe(1);
    }
  });
});
