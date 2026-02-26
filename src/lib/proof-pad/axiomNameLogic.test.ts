import { describe, it, expect } from "vitest";
import { identifyAxiomName, getAxiomDisplayName } from "./axiomNameLogic";
import {
  intuitionisticSystem,
  classicalLogicSystem,
  lukasiewiczSystem,
  mendelsonSystem,
  equalityLogicSystem,
  peanoArithmeticSystem,
  axiomPA1Template,
  axiomPA3Template,
} from "../logic-core/inferenceRule";
import type { LogicSystem } from "../logic-core/inferenceRule";
import { implication, universal, equality } from "../logic-core/formula";
import { termVariable, constant } from "../logic-core/term";
import { parseString } from "../logic-lang/parser";

// --- ヘルパー ---

/** DSL文字列をパースしてFormulaを返す（テスト用）*/
function parseFormula(text: string) {
  const result = parseString(text);
  if (!result.ok) throw new Error(`Parse error: ${text satisfies string}`);
  return result.formula;
}

describe("axiomNameLogic", () => {
  describe("identifyAxiomName", () => {
    // --- A1 (K公理) ---
    describe("A1 (K)", () => {
      it("identifies exact A1 template", () => {
        const formula = parseFormula("phi -> (psi -> phi)");
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("A1");
          expect(result.displayName).toBe("A1 (K)");
        }
      });

      it("identifies A1 instance with specific propositions", () => {
        // p → (q → p) where p, q are specific formulas
        const formula = parseFormula(
          "(alpha -> beta) -> (chi -> (alpha -> beta))",
        );
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("A1");
        }
      });
    });

    // --- A2 (S公理) ---
    describe("A2 (S)", () => {
      it("identifies exact A2 template", () => {
        const formula = parseFormula(
          "(phi -> (psi -> chi)) -> ((phi -> psi) -> (phi -> chi))",
        );
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("A2");
          expect(result.displayName).toBe("A2 (S)");
        }
      });
    });

    // --- A3 (対偶) ---
    describe("A3", () => {
      it("identifies exact A3 template", () => {
        const formula = parseFormula("(~phi -> ~psi) -> (psi -> phi)");
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("A3");
          expect(result.displayName).toBe("A3");
        }
      });
    });

    // --- M3 (背理法) ---
    describe("M3", () => {
      it("identifies exact M3 template in mendelson system", () => {
        const formula = parseFormula(
          "(~phi -> ~psi) -> ((~phi -> psi) -> phi)",
        );
        const result = identifyAxiomName(formula, mendelsonSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("M3");
          expect(result.displayName).toBe("M3");
        }
      });

      it("does not identify M3 in lukasiewicz system", () => {
        const formula = parseFormula(
          "(~phi -> ~psi) -> ((~phi -> psi) -> phi)",
        );
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("NotIdentified");
      });
    });

    // --- EFQ (爆発原理) ---
    describe("EFQ", () => {
      it("identifies EFQ template in intuitionistic system", () => {
        const formula = parseFormula("~phi -> (phi -> psi)");
        const result = identifyAxiomName(formula, intuitionisticSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("EFQ");
          expect(result.displayName).toBe("EFQ");
        }
      });

      it("does not identify EFQ in lukasiewicz system", () => {
        const formula = parseFormula("~phi -> (phi -> psi)");
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("NotIdentified");
      });
    });

    // --- DNE (二重否定除去) ---
    describe("DNE", () => {
      it("identifies DNE template in classical logic system", () => {
        const formula = parseFormula("~~phi -> phi");
        const result = identifyAxiomName(formula, classicalLogicSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("DNE");
          expect(result.displayName).toBe("DNE");
        }
      });

      it("does not identify DNE in lukasiewicz system", () => {
        const formula = parseFormula("~~phi -> phi");
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("NotIdentified");
      });
    });

    // --- 非公理 ---
    describe("non-axiom formulas", () => {
      it("returns NotIdentified for arbitrary formula", () => {
        const formula = parseFormula("phi -> psi");
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("NotIdentified");
      });

      it("returns NotIdentified for negation", () => {
        const formula = parseFormula("~phi");
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("NotIdentified");
      });
    });

    // --- 体系依存 ---
    describe("system-dependent identification", () => {
      it("does not identify A3 if not enabled in system", () => {
        const system: LogicSystem = {
          name: "A1A2 only",
          propositionalAxioms: new Set(["A1", "A2"]),
          predicateLogic: false,
          equalityLogic: false,
          generalization: false,
        };
        const formula = parseFormula("(~phi -> ~psi) -> (psi -> phi)");
        const result = identifyAxiomName(formula, system);
        expect(result._tag).toBe("NotIdentified");
      });
    });

    // --- 等号公理 ---
    describe("equality axioms", () => {
      it("identifies E1 (Refl)", () => {
        const formula = parseFormula("all x. x = x");
        const result = identifyAxiomName(formula, equalityLogicSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("E1");
          expect(result.displayName).toBe("E1 (Refl)");
        }
      });

      it("identifies E2 (Sym)", () => {
        const formula = parseFormula("all x. all y. x = y -> y = x");
        const result = identifyAxiomName(formula, equalityLogicSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("E2");
          expect(result.displayName).toBe("E2 (Sym)");
        }
      });

      it("identifies E3 (Trans)", () => {
        const formula = parseFormula(
          "all x. all y. all z. x = y -> (y = z -> x = z)",
        );
        const result = identifyAxiomName(formula, equalityLogicSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("E3");
          expect(result.displayName).toBe("E3 (Trans)");
        }
      });

      it("does not identify equality axioms if equality logic is disabled", () => {
        const formula = parseFormula("all x. x = x");
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("NotIdentified");
      });
    });

    // --- 述語論理公理 ---
    describe("predicate logic axioms", () => {
      it("identifies A4 (UI) instance: ∀x.(x=x) → a=a", () => {
        // A4: ∀x.φ → φ[t/x]
        // Instance: ∀x.(x=x) → a=a (φ = x=x, t = a)
        const x = termVariable("x");
        const a = constant("a");
        const formula = implication(
          universal(x, equality(x, x)),
          equality(a, a),
        );
        const result = identifyAxiomName(formula, equalityLogicSystem);
        expect(result._tag).toBe("Identified");
        if (result._tag === "Identified") {
          expect(result.axiomId).toBe("A4");
          expect(result.displayName).toBe("A4 (UI)");
        }
      });

      it("does not identify A4 if predicate logic is disabled", () => {
        const x = termVariable("x");
        const a = constant("a");
        const formula = implication(
          universal(x, equality(x, x)),
          equality(a, a),
        );
        const result = identifyAxiomName(formula, lukasiewiczSystem);
        expect(result._tag).toBe("NotIdentified");
      });
    });
  });

  describe("getAxiomDisplayName", () => {
    it("returns display name for A1", () => {
      expect(getAxiomDisplayName("A1")).toBe("A1 (K)");
    });

    it("returns display name for A2", () => {
      expect(getAxiomDisplayName("A2")).toBe("A2 (S)");
    });

    it("returns display name for A3", () => {
      expect(getAxiomDisplayName("A3")).toBe("A3");
    });

    it("returns display name for M3", () => {
      expect(getAxiomDisplayName("M3")).toBe("M3");
    });

    it("returns display name for EFQ", () => {
      expect(getAxiomDisplayName("EFQ")).toBe("EFQ");
    });

    it("returns display name for DNE", () => {
      expect(getAxiomDisplayName("DNE")).toBe("DNE");
    });

    it("returns display name for A4", () => {
      expect(getAxiomDisplayName("A4")).toBe("A4 (UI)");
    });

    it("returns display name for A5", () => {
      expect(getAxiomDisplayName("A5")).toBe("A5 (∀-Dist)");
    });

    it("returns display name for E1", () => {
      expect(getAxiomDisplayName("E1")).toBe("E1 (Refl)");
    });

    it("returns display name for E2", () => {
      expect(getAxiomDisplayName("E2")).toBe("E2 (Sym)");
    });

    it("returns display name for E3", () => {
      expect(getAxiomDisplayName("E3")).toBe("E3 (Trans)");
    });

    it("returns display name for E4", () => {
      expect(getAxiomDisplayName("E4")).toBe("E4");
    });

    it("returns display name for E5", () => {
      expect(getAxiomDisplayName("E5")).toBe("E5");
    });
  });

  describe("theory axiom identification", () => {
    it("identifies PA1 in peano arithmetic system", () => {
      const result = identifyAxiomName(axiomPA1Template, peanoArithmeticSystem);
      expect(result._tag).toBe("TheoryAxiomIdentified");
      if (result._tag === "TheoryAxiomIdentified") {
        expect(result.theoryAxiomId).toBe("PA1");
        expect(result.displayName).toBe("PA1 (0≠後者)");
      }
    });

    it("identifies PA3 in peano arithmetic system", () => {
      const result = identifyAxiomName(axiomPA3Template, peanoArithmeticSystem);
      expect(result._tag).toBe("TheoryAxiomIdentified");
      if (result._tag === "TheoryAxiomIdentified") {
        expect(result.theoryAxiomId).toBe("PA3");
        expect(result.displayName).toBe("PA3 (加法基底)");
      }
    });

    it("does not identify PA axioms in non-PA systems", () => {
      const result = identifyAxiomName(axiomPA1Template, equalityLogicSystem);
      expect(result._tag).toBe("NotIdentified");
    });
  });
});
