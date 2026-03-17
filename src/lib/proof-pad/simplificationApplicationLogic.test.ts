import { describe, expect, it } from "vitest";
import { Either } from "effect";
import { lukasiewiczSystem } from "../logic-core/inferenceRule";
import { createEmptyWorkspace, addNode } from "./workspaceState";
import {
  validateSimplificationApplication,
  computeSimplificationCompatibleNodeIds,
  getSimplificationErrorMessage,
  SimplificationPremiseMissing,
  SimplificationPremiseParseError,
  SimplificationConclusionParseError,
  SimplificationNotEquivalent,
} from "./simplificationApplicationLogic";
import type { SimplificationEdge } from "./inferenceEdge";

/** Helper to add a simplification inference edge to a workspace state */
function addSimpEdge(
  ws: ReturnType<typeof createEmptyWorkspace>,
  conclusionNodeId: string,
  premiseNodeId: string | undefined,
  conclusionText = "",
): ReturnType<typeof createEmptyWorkspace> {
  const edge: SimplificationEdge = {
    _tag: "simplification",
    conclusionNodeId,
    premiseNodeId,
    conclusionText,
  };
  return {
    ...ws,
    inferenceEdges: [...ws.inferenceEdges, edge],
  };
}

describe("simplificationApplicationLogic", () => {
  describe("validateSimplificationApplication", () => {
    it("前提なしでエラー", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "phi");
      ws = addSimpEdge(ws, "node-1", undefined);
      const result = validateSimplificationApplication(ws, "node-1");
      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SimplificationPremiseMissing");
      }
    });

    it("SimplificationEdgeが存在しない場合エラー", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "phi");
      const result = validateSimplificationApplication(ws, "node-1");
      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SimplificationPremiseMissing");
      }
    });

    it("前提がパースできない場合エラー", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "invalid!!!");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "phi");
      ws = addSimpEdge(ws, "node-2", "node-1");
      const result = validateSimplificationApplication(ws, "node-2");
      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SimplificationPremiseParseError");
      }
    });

    it("結論がパースできない場合エラー", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "invalid!!!");
      ws = addSimpEdge(ws, "node-2", "node-1");
      const result = validateSimplificationApplication(ws, "node-2");
      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SimplificationConclusionParseError");
      }
    });

    it("等価でない論理式はエラー", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "psi");
      ws = addSimpEdge(ws, "node-2", "node-1");
      const result = validateSimplificationApplication(ws, "node-2");
      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SimplificationNotEquivalent");
      }
    });

    it("同一の論理式は整理等価", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "phi -> psi");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "phi -> psi");
      ws = addSimpEdge(ws, "node-2", "node-1");
      const result = validateSimplificationApplication(ws, "node-2");
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right._tag).toBe("simplification-valid");
      }
    });

    it("α等価な論理式（∀x.P(x) ≡ ∀y.P(y)）は整理等価", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "all x. P(x)");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "all y. P(y)");
      ws = addSimpEdge(ws, "node-2", "node-1");
      const result = validateSimplificationApplication(ws, "node-2");
      expect(Either.isRight(result)).toBe(true);
    });

    it("置換解決（P(x)[a/x] ≡ P(a)）は整理等価", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "P(x)[a/x]");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "P(a)");
      ws = addSimpEdge(ws, "node-2", "node-1");
      const result = validateSimplificationApplication(ws, "node-2");
      expect(Either.isRight(result)).toBe(true);
    });

    it("phi→phiとpsi→psiは非等価", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "phi -> phi");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "psi -> psi");
      ws = addSimpEdge(ws, "node-2", "node-1");
      const result = validateSimplificationApplication(ws, "node-2");
      expect(Either.isLeft(result)).toBe(true);
    });

    it("対称性: 逆方向も成功する", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "all y. P(y)");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "all x. P(x)");
      ws = addSimpEdge(ws, "node-2", "node-1");
      const result = validateSimplificationApplication(ws, "node-2");
      expect(Either.isRight(result)).toBe(true);
    });

    it("空のformulaTextはパースエラー", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "");
      ws = addSimpEdge(ws, "node-2", "node-1");
      const result = validateSimplificationApplication(ws, "node-2");
      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SimplificationConclusionParseError");
      }
    });
  });

  describe("computeSimplificationCompatibleNodeIds", () => {
    it("整理等価なノードのIDを返す", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "all x. P(x)");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "all y. P(y)");
      ws = addNode(ws, "axiom", "", { x: 200, y: 0 }, "psi");
      const compatible = computeSimplificationCompatibleNodeIds(
        ws.nodes,
        "node-1",
      );
      expect(compatible.has("node-2")).toBe(true);
      expect(compatible.has("node-3")).toBe(false);
    });

    it("自分自身は含まない", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "phi");
      const compatible = computeSimplificationCompatibleNodeIds(
        ws.nodes,
        "node-1",
      );
      expect(compatible.has("node-1")).toBe(false);
    });

    it("存在しないノードIDでは空セット", () => {
      const ws = createEmptyWorkspace(lukasiewiczSystem);
      const compatible = computeSimplificationCompatibleNodeIds(
        ws.nodes,
        "nonexistent",
      );
      expect(compatible.size).toBe(0);
    });

    it("パースできないノードは除外", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "invalid!!!");
      const compatible = computeSimplificationCompatibleNodeIds(
        ws.nodes,
        "node-1",
      );
      expect(compatible.size).toBe(0);
    });

    it("パースできないソースノードは空セット", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "", { x: 0, y: 0 }, "invalid!!!");
      ws = addNode(ws, "axiom", "", { x: 100, y: 0 }, "phi");
      const compatible = computeSimplificationCompatibleNodeIds(
        ws.nodes,
        "node-1",
      );
      expect(compatible.size).toBe(0);
    });
  });

  describe("getSimplificationErrorMessage", () => {
    it("各エラー型に対してメッセージを返す", () => {
      expect(
        getSimplificationErrorMessage(new SimplificationPremiseMissing({})),
      ).toBe("Connect a premise to apply simplification");
      expect(
        getSimplificationErrorMessage(
          new SimplificationPremiseParseError({ nodeId: "n1" }),
        ),
      ).toBe("Premise has invalid formula");
      expect(
        getSimplificationErrorMessage(
          new SimplificationConclusionParseError({ nodeId: "n1" }),
        ),
      ).toBe("Conclusion has invalid formula");
      expect(
        getSimplificationErrorMessage(new SimplificationNotEquivalent({})),
      ).toBe("Formulas are not simplification-equivalent");
    });
  });
});
