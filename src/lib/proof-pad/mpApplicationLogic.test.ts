import { describe, expect, it } from "vitest";
import { lukasiewiczSystem } from "../logic-core/inferenceRule";
import { metaVariable } from "../logic-core/formula";
import { createEmptyWorkspace, addNode, addConnection } from "./workspaceState";
import {
  getMPPremises,
  parseNodeFormula,
  validateMPApplication,
  getMPErrorMessage,
} from "./mpApplicationLogic";
import type { WorkspaceNode } from "./workspaceState";

describe("mpApplicationLogic", () => {
  describe("getMPPremises", () => {
    it("returns undefined for both when no connections", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "mp", "MP", { x: 0, y: 0 });
      const premises = getMPPremises(ws, "node-1");
      expect(premises.leftNodeId).toBeUndefined();
      expect(premises.rightNodeId).toBeUndefined();
    });

    it("returns left premise node id", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 100 });
      ws = addConnection(ws, "node-1", "out", "node-2", "premise-left");
      const premises = getMPPremises(ws, "node-2");
      expect(premises.leftNodeId).toBe("node-1");
      expect(premises.rightNodeId).toBeUndefined();
    });

    it("returns right premise node id", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi -> psi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 100 });
      ws = addConnection(ws, "node-1", "out", "node-2", "premise-right");
      const premises = getMPPremises(ws, "node-2");
      expect(premises.leftNodeId).toBeUndefined();
      expect(premises.rightNodeId).toBe("node-1");
    });

    it("returns both premise node ids", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "A2", { x: 200, y: 0 }, "phi -> psi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 150 });
      ws = addConnection(ws, "node-1", "out", "node-3", "premise-left");
      ws = addConnection(ws, "node-2", "out", "node-3", "premise-right");
      const premises = getMPPremises(ws, "node-3");
      expect(premises.leftNodeId).toBe("node-1");
      expect(premises.rightNodeId).toBe("node-2");
    });

    it("ignores connections to other nodes", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "mp", "MP-1", { x: 100, y: 100 });
      ws = addNode(ws, "mp", "MP-2", { x: 200, y: 200 });
      ws = addConnection(ws, "node-1", "out", "node-2", "premise-left");
      const premises = getMPPremises(ws, "node-3");
      expect(premises.leftNodeId).toBeUndefined();
      expect(premises.rightNodeId).toBeUndefined();
    });
  });

  describe("parseNodeFormula", () => {
    it("parses a valid formula", () => {
      const node: WorkspaceNode = {
        id: "node-1",
        kind: "axiom",
        label: "A1",
        formulaText: "phi -> psi",
        position: { x: 0, y: 0 },
      };
      const formula = parseNodeFormula(node);
      expect(formula).toBeDefined();
      expect(formula!._tag).toBe("Implication");
    });

    it("returns undefined for empty text", () => {
      const node: WorkspaceNode = {
        id: "node-1",
        kind: "axiom",
        label: "A1",
        formulaText: "",
        position: { x: 0, y: 0 },
      };
      expect(parseNodeFormula(node)).toBeUndefined();
    });

    it("returns undefined for whitespace-only text", () => {
      const node: WorkspaceNode = {
        id: "node-1",
        kind: "axiom",
        label: "A1",
        formulaText: "   ",
        position: { x: 0, y: 0 },
      };
      expect(parseNodeFormula(node)).toBeUndefined();
    });

    it("returns undefined for invalid formula text", () => {
      const node: WorkspaceNode = {
        id: "node-1",
        kind: "axiom",
        label: "A1",
        formulaText: "-> -> ->",
        position: { x: 0, y: 0 },
      };
      expect(parseNodeFormula(node)).toBeUndefined();
    });

    it("parses a meta variable", () => {
      const node: WorkspaceNode = {
        id: "node-1",
        kind: "axiom",
        label: "A1",
        formulaText: "phi",
        position: { x: 0, y: 0 },
      };
      const formula = parseNodeFormula(node);
      expect(formula).toBeDefined();
      expect(formula!._tag).toBe("MetaVariable");
    });
  });

  describe("validateMPApplication", () => {
    it("returns BothPremisesMissing when no connections", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "mp", "MP", { x: 0, y: 0 });
      const result = validateMPApplication(ws, "node-1");
      expect(result._tag).toBe("BothPremisesMissing");
    });

    it("returns LeftPremiseMissing when only right is connected", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi -> psi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 100 });
      ws = addConnection(ws, "node-1", "out", "node-2", "premise-right");
      const result = validateMPApplication(ws, "node-2");
      expect(result._tag).toBe("LeftPremiseMissing");
    });

    it("returns RightPremiseMissing when only left is connected", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 100 });
      ws = addConnection(ws, "node-1", "out", "node-2", "premise-left");
      const result = validateMPApplication(ws, "node-2");
      expect(result._tag).toBe("RightPremiseMissing");
    });

    it("returns LeftParseError when left formula is invalid", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "-> ->");
      ws = addNode(ws, "axiom", "A2", { x: 200, y: 0 }, "phi -> psi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 150 });
      ws = addConnection(ws, "node-1", "out", "node-3", "premise-left");
      ws = addConnection(ws, "node-2", "out", "node-3", "premise-right");
      const result = validateMPApplication(ws, "node-3");
      expect(result._tag).toBe("LeftParseError");
    });

    it("returns LeftParseError when left formula is empty", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "");
      ws = addNode(ws, "axiom", "A2", { x: 200, y: 0 }, "phi -> psi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 150 });
      ws = addConnection(ws, "node-1", "out", "node-3", "premise-left");
      ws = addConnection(ws, "node-2", "out", "node-3", "premise-right");
      const result = validateMPApplication(ws, "node-3");
      expect(result._tag).toBe("LeftParseError");
    });

    it("returns RightParseError when right formula is invalid", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "A2", { x: 200, y: 0 }, "-> ->");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 150 });
      ws = addConnection(ws, "node-1", "out", "node-3", "premise-left");
      ws = addConnection(ws, "node-2", "out", "node-3", "premise-right");
      const result = validateMPApplication(ws, "node-3");
      expect(result._tag).toBe("RightParseError");
    });

    it("returns RuleError NotAnImplication when right is not an implication", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "A2", { x: 200, y: 0 }, "psi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 150 });
      ws = addConnection(ws, "node-1", "out", "node-3", "premise-left");
      ws = addConnection(ws, "node-2", "out", "node-3", "premise-right");
      const result = validateMPApplication(ws, "node-3");
      expect(result._tag).toBe("RuleError");
      if (result._tag === "RuleError") {
        expect(result.error._tag).toBe("NotAnImplication");
      }
    });

    it("returns RuleError PremiseMismatch when antecedent does not match", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "A2", { x: 200, y: 0 }, "psi -> chi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 150 });
      ws = addConnection(ws, "node-1", "out", "node-3", "premise-left");
      ws = addConnection(ws, "node-2", "out", "node-3", "premise-right");
      const result = validateMPApplication(ws, "node-3");
      expect(result._tag).toBe("RuleError");
      if (result._tag === "RuleError") {
        expect(result.error._tag).toBe("PremiseMismatch");
      }
    });

    it("returns Success with conclusion when MP is valid", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "A2", { x: 200, y: 0 }, "phi -> psi");
      ws = addNode(ws, "mp", "MP", { x: 100, y: 150 });
      ws = addConnection(ws, "node-1", "out", "node-3", "premise-left");
      ws = addConnection(ws, "node-2", "out", "node-3", "premise-right");
      const result = validateMPApplication(ws, "node-3");
      expect(result._tag).toBe("Success");
      if (result._tag === "Success") {
        expect(result.conclusion._tag).toBe("MetaVariable");
        expect(result.conclusionText).toBe("ψ");
      }
    });

    it("handles complex MP application", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi -> (psi -> phi)");
      ws = addNode(
        ws,
        "axiom",
        "A2",
        { x: 200, y: 0 },
        "(phi -> (psi -> phi)) -> (chi -> (phi -> (psi -> phi)))",
      );
      ws = addNode(ws, "mp", "MP", { x: 100, y: 150 });
      ws = addConnection(ws, "node-1", "out", "node-3", "premise-left");
      ws = addConnection(ws, "node-2", "out", "node-3", "premise-right");
      const result = validateMPApplication(ws, "node-3");
      expect(result._tag).toBe("Success");
      if (result._tag === "Success") {
        expect(result.conclusionText).toBe("χ → φ → ψ → φ");
      }
    });

    it("handles chained MP (MP node output as input to another MP)", () => {
      let ws = createEmptyWorkspace(lukasiewiczSystem);
      // First MP: phi, phi -> psi => psi
      ws = addNode(ws, "axiom", "A1", { x: 0, y: 0 }, "phi");
      ws = addNode(ws, "axiom", "A2", { x: 200, y: 0 }, "phi -> psi");
      ws = addNode(ws, "mp", "MP-1", { x: 100, y: 150 }, "psi");
      ws = addConnection(ws, "node-1", "out", "node-3", "premise-left");
      ws = addConnection(ws, "node-2", "out", "node-3", "premise-right");
      // Second MP: psi, psi -> chi => chi
      ws = addNode(ws, "axiom", "A3", { x: 400, y: 0 }, "psi -> chi");
      ws = addNode(ws, "mp", "MP-2", { x: 250, y: 300 });
      ws = addConnection(ws, "node-3", "out", "node-5", "premise-left");
      ws = addConnection(ws, "node-4", "out", "node-5", "premise-right");
      const result = validateMPApplication(ws, "node-5");
      expect(result._tag).toBe("Success");
      if (result._tag === "Success") {
        expect(result.conclusionText).toBe("χ");
      }
    });
  });

  describe("getMPErrorMessage", () => {
    it("returns message for BothPremisesMissing", () => {
      expect(getMPErrorMessage({ _tag: "BothPremisesMissing" })).toBe(
        "Connect premises to apply MP",
      );
    });

    it("returns message for LeftPremiseMissing", () => {
      expect(getMPErrorMessage({ _tag: "LeftPremiseMissing" })).toBe(
        "Left premise (φ) not connected",
      );
    });

    it("returns message for RightPremiseMissing", () => {
      expect(getMPErrorMessage({ _tag: "RightPremiseMissing" })).toBe(
        "Right premise (φ→ψ) not connected",
      );
    });

    it("returns message for LeftParseError", () => {
      expect(
        getMPErrorMessage({ _tag: "LeftParseError", nodeId: "node-1" }),
      ).toBe("Left premise has invalid formula");
    });

    it("returns message for RightParseError", () => {
      expect(
        getMPErrorMessage({ _tag: "RightParseError", nodeId: "node-2" }),
      ).toBe("Right premise has invalid formula");
    });

    it("returns message for NotAnImplication", () => {
      expect(
        getMPErrorMessage({
          _tag: "RuleError",
          error: { _tag: "NotAnImplication", formula: metaVariable("φ") },
        }),
      ).toBe("Right premise must be an implication (φ→ψ)");
    });

    it("returns message for PremiseMismatch", () => {
      expect(
        getMPErrorMessage({
          _tag: "RuleError",
          error: {
            _tag: "PremiseMismatch",
            expected: metaVariable("φ"),
            actual: metaVariable("ψ"),
          },
        }),
      ).toBe("Left premise does not match antecedent of right premise");
    });
  });
});
