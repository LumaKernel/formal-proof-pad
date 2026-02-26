import { describe, it, expect } from "vitest";
import {
  applyModusPonens,
  applyGeneralization,
  matchPropositionalAxiom,
  matchAxiomA4,
  matchAxiomA5,
  matchEqualityAxiom,
  matchFormulaPattern,
  applySubstitution,
  identifyAxiom,
  axiomA1Template,
  axiomA2Template,
  axiomA3Template,
  axiomM3Template,
  axiomEFQTemplate,
  axiomDNETemplate,
  axiomE1Template,
  axiomE2Template,
  axiomE3Template,
  skSystem,
  minimalLogicSystem,
  intuitionisticSystem,
  lukasiewiczSystem,
  mendelsonSystem,
  classicalLogicSystem,
  predicateLogicSystem,
  equalityLogicSystem,
} from "./inferenceRule";
import {
  metaVariable,
  implication,
  negation,
  conjunction,
  disjunction,
  biconditional,
  universal,
  existential,
  predicate,
  equality,
} from "./formula";
import {
  termVariable,
  termMetaVariable,
  constant,
  functionApplication,
  binaryOperation,
} from "./term";
import { buildFormulaSubstitutionMap } from "./substitution";

// ── ヘルパー ──────────────────────────────────────────────

const phi = metaVariable("φ");
const psi = metaVariable("ψ");
const chi = metaVariable("χ");
const x = termVariable("x");
const y = termVariable("y");
const z = termVariable("z");
const a = constant("a");

// ── Modus Ponens ──────────────────────────────────────────

describe("applyModusPonens", () => {
  it("should derive ψ from φ and φ→ψ", () => {
    const result = applyModusPonens(phi, implication(phi, psi));
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.conclusion._tag).toBe("MetaVariable");
      expect((result.conclusion as typeof psi).name).toBe("ψ");
    }
  });

  it("should derive complex conclusion from MP", () => {
    // P(a) と P(a)→Q(a) から Q(a)
    const pa = predicate("P", [a]);
    const qa = predicate("Q", [a]);
    const result = applyModusPonens(pa, implication(pa, qa));
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.conclusion._tag).toBe("Predicate");
    }
  });

  it("should fail if conditional is not an implication", () => {
    const result = applyModusPonens(phi, phi);
    expect(result._tag).toBe("Error");
    if (result._tag === "Error") {
      expect(result.error._tag).toBe("NotAnImplication");
    }
  });

  it("should fail if antecedent does not match", () => {
    const result = applyModusPonens(psi, implication(phi, chi));
    expect(result._tag).toBe("Error");
    if (result._tag === "Error") {
      expect(result.error._tag).toBe("PremiseMismatch");
    }
  });

  it("should handle nested implications", () => {
    // (φ→ψ) と (φ→ψ)→χ から χ
    const phiToPsi = implication(phi, psi);
    const result = applyModusPonens(phiToPsi, implication(phiToPsi, chi));
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.conclusion).toBe(chi);
    }
  });

  it("should fail with negation as conditional", () => {
    const result = applyModusPonens(phi, negation(phi));
    expect(result._tag).toBe("Error");
    if (result._tag === "Error") {
      expect(result.error._tag).toBe("NotAnImplication");
    }
  });
});

// ── Generalization ────────────────────────────────────────

describe("applyGeneralization", () => {
  it("should derive ∀x.φ from φ when Gen is enabled", () => {
    const result = applyGeneralization(phi, x, predicateLogicSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.conclusion._tag).toBe("Universal");
    }
  });

  it("should derive ∀x.P(x) from P(x)", () => {
    const px = predicate("P", [x]);
    const result = applyGeneralization(px, x, predicateLogicSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.conclusion._tag).toBe("Universal");
    }
  });

  it("should fail when Gen is not enabled", () => {
    const result = applyGeneralization(phi, x, lukasiewiczSystem);
    expect(result._tag).toBe("Error");
    if (result._tag === "Error") {
      expect(result.error._tag).toBe("GeneralizationNotEnabled");
    }
  });

  it("should allow generalization with any variable", () => {
    const result = applyGeneralization(
      predicate("P", [y]),
      y,
      predicateLogicSystem,
    );
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.conclusion._tag).toBe("Universal");
    }
  });
});

// ── 命題論理公理 (A1, A2, A3) ───────────────────────────

describe("matchPropositionalAxiom", () => {
  describe("A1: K公理 φ → (ψ → φ)", () => {
    it("should match the template itself", () => {
      const result = matchPropositionalAxiom("A1", axiomA1Template);
      expect(result._tag).toBe("Ok");
    });

    it("should match a concrete instance: P(a) → (Q(a) → P(a))", () => {
      const pa = predicate("P", [a]);
      const qa = predicate("Q", [a]);
      const instance = implication(pa, implication(qa, pa));
      const result = matchPropositionalAxiom("A1", instance);
      expect(result._tag).toBe("Ok");
    });

    it("should match with negation: ¬φ → (ψ → ¬φ)", () => {
      const instance = implication(
        negation(phi),
        implication(psi, negation(phi)),
      );
      const result = matchPropositionalAxiom("A1", instance);
      expect(result._tag).toBe("Ok");
    });

    it("should not match a non-instance", () => {
      const nonInstance = implication(phi, implication(psi, psi));
      const result = matchPropositionalAxiom("A1", nonInstance);
      expect(result._tag).toBe("Error");
    });
  });

  describe("A2: S公理", () => {
    it("should match the template itself", () => {
      const result = matchPropositionalAxiom("A2", axiomA2Template);
      expect(result._tag).toBe("Ok");
    });

    it("should match a concrete instance", () => {
      // (P→(Q→R)) → ((P→Q) → (P→R))
      const p = predicate("P", []);
      const q = predicate("Q", []);
      const r = predicate("R", []);
      const instance = implication(
        implication(p, implication(q, r)),
        implication(implication(p, q), implication(p, r)),
      );
      const result = matchPropositionalAxiom("A2", instance);
      expect(result._tag).toBe("Ok");
    });

    it("should not match when structure differs", () => {
      const nonInstance = implication(phi, psi);
      const result = matchPropositionalAxiom("A2", nonInstance);
      expect(result._tag).toBe("Error");
    });
  });

  describe("A3: 対偶公理 (¬φ → ¬ψ) → (ψ → φ)", () => {
    it("should match the template itself", () => {
      const result = matchPropositionalAxiom("A3", axiomA3Template);
      expect(result._tag).toBe("Ok");
    });

    it("should match a concrete instance", () => {
      const p = predicate("P", []);
      const q = predicate("Q", []);
      const instance = implication(
        implication(negation(p), negation(q)),
        implication(q, p),
      );
      const result = matchPropositionalAxiom("A3", instance);
      expect(result._tag).toBe("Ok");
    });

    it("should not match when structure differs", () => {
      const nonInstance = implication(
        implication(negation(phi), psi),
        implication(psi, phi),
      );
      const result = matchPropositionalAxiom("A3", nonInstance);
      expect(result._tag).toBe("Error");
    });
  });

  describe("M3: 背理法 (¬φ → ¬ψ) → ((¬φ → ψ) → φ)", () => {
    it("should match the template itself", () => {
      const result = matchPropositionalAxiom("M3", axiomM3Template);
      expect(result._tag).toBe("Ok");
    });

    it("should match a concrete instance", () => {
      const p = predicate("P", []);
      const q = predicate("Q", []);
      // (¬P → ¬Q) → ((¬P → Q) → P)
      const instance = implication(
        implication(negation(p), negation(q)),
        implication(implication(negation(p), q), p),
      );
      const result = matchPropositionalAxiom("M3", instance);
      expect(result._tag).toBe("Ok");
    });

    it("should not match A3 template (A3 ≠ M3)", () => {
      const result = matchPropositionalAxiom("M3", axiomA3Template);
      expect(result._tag).toBe("Error");
    });

    it("A3 should not match M3 template", () => {
      const result = matchPropositionalAxiom("A3", axiomM3Template);
      expect(result._tag).toBe("Error");
    });

    it("should not match when structure differs", () => {
      const nonInstance = implication(
        implication(negation(phi), negation(psi)),
        implication(psi, phi),
      );
      const result = matchPropositionalAxiom("M3", nonInstance);
      expect(result._tag).toBe("Error");
    });
  });

  describe("EFQ: 爆発原理 ¬φ → (φ → ψ)", () => {
    it("should match the template itself", () => {
      const result = matchPropositionalAxiom("EFQ", axiomEFQTemplate);
      expect(result._tag).toBe("Ok");
    });

    it("should match a concrete instance", () => {
      const p = predicate("P", []);
      const q = predicate("Q", []);
      // ¬P → (P → Q)
      const instance = implication(negation(p), implication(p, q));
      const result = matchPropositionalAxiom("EFQ", instance);
      expect(result._tag).toBe("Ok");
    });

    it("should not match A3 template", () => {
      const result = matchPropositionalAxiom("EFQ", axiomA3Template);
      expect(result._tag).toBe("Error");
    });

    it("A3 should not match EFQ template", () => {
      const result = matchPropositionalAxiom("A3", axiomEFQTemplate);
      expect(result._tag).toBe("Error");
    });

    it("should not match when structure differs", () => {
      // φ → (¬φ → ψ) ≠ ¬φ → (φ → ψ)
      const nonInstance = implication(phi, implication(negation(phi), psi));
      const result = matchPropositionalAxiom("EFQ", nonInstance);
      expect(result._tag).toBe("Error");
    });
  });

  describe("DNE: 二重否定除去 ¬¬φ → φ", () => {
    it("should match the template itself", () => {
      const result = matchPropositionalAxiom("DNE", axiomDNETemplate);
      expect(result._tag).toBe("Ok");
    });

    it("should match a concrete instance", () => {
      const p = predicate("P", []);
      // ¬¬P → P
      const instance = implication(negation(negation(p)), p);
      const result = matchPropositionalAxiom("DNE", instance);
      expect(result._tag).toBe("Ok");
    });

    it("should not match EFQ template", () => {
      const result = matchPropositionalAxiom("DNE", axiomEFQTemplate);
      expect(result._tag).toBe("Error");
    });

    it("EFQ should not match DNE template", () => {
      const result = matchPropositionalAxiom("EFQ", axiomDNETemplate);
      expect(result._tag).toBe("Error");
    });

    it("should not match when structure differs", () => {
      // φ → ¬¬φ ≠ ¬¬φ → φ
      const nonInstance = implication(phi, negation(negation(phi)));
      const result = matchPropositionalAxiom("DNE", nonInstance);
      expect(result._tag).toBe("Error");
    });
  });
});

// ── A4: 全称例化 ──────────────────────────────────────────

describe("matchAxiomA4", () => {
  it("should match ∀x.P(x) → P(a)", () => {
    const instance = implication(
      universal(x, predicate("P", [x])),
      predicate("P", [a]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("should match ∀x.P(x) → P(x) (t=x, trivial substitution)", () => {
    const instance = implication(
      universal(x, predicate("P", [x])),
      predicate("P", [x]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("should match ∀x.Q(x,y) → Q(f(z),y)", () => {
    const fz = functionApplication("f", [z]);
    const instance = implication(
      universal(x, predicate("Q", [x, y])),
      predicate("Q", [fz, y]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("should match ∀x.(P(x)→Q(x)) → (P(a)→Q(a))", () => {
    const instance = implication(
      universal(x, implication(predicate("P", [x]), predicate("Q", [x]))),
      implication(predicate("P", [a]), predicate("Q", [a])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("should match when variable doesn't appear free in body", () => {
    // ∀x.P(a) → P(a) (x doesn't appear in body)
    const instance = implication(
      universal(x, predicate("P", [a])),
      predicate("P", [a]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("should not match non-implication", () => {
    const result = matchAxiomA4(phi);
    expect(result._tag).toBe("Error");
  });

  it("should not match when left is not universal", () => {
    const result = matchAxiomA4(implication(phi, psi));
    expect(result._tag).toBe("Error");
  });

  it("should not match when substitution is inconsistent", () => {
    // ∀x.P(x,x) → P(a,b) — different replacements for x
    const b = constant("b");
    const instance = implication(
      universal(x, predicate("P", [x, x])),
      predicate("P", [a, b]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("should match with binary operations: ∀x.(x+0=x) → (a+0=a)", () => {
    const zero = constant("0");
    const instance = implication(
      universal(x, equality(binaryOperation("+", x, zero), x)),
      equality(binaryOperation("+", a, zero), a),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("should match when body contains inner quantifier shadowing the bound variable: ∀x.(P(x) ∧ ∀x.Q(x)) → (P(a) ∧ ∀x.Q(x))", () => {
    // Inner ∀x.Q(x) shadows outer x, so it should remain unchanged
    const qx = predicate("Q", [x]);
    const px = predicate("P", [x]);
    const pa = predicate("P", [a]);
    const instance = implication(
      universal(x, conjunction(px, universal(x, qx))),
      conjunction(pa, universal(x, qx)),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("should match with existential shadowing: ∀x.(P(x) ∧ ∃x.Q(x)) → (P(a) ∧ ∃x.Q(x))", () => {
    const qx = predicate("Q", [x]);
    const px = predicate("P", [x]);
    const pa = predicate("P", [a]);
    const instance = implication(
      universal(x, conjunction(px, existential(x, qx))),
      conjunction(pa, existential(x, qx)),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });
});

// ── A5: 全称と含意の分配 ──────────────────────────────────

describe("matchAxiomA5", () => {
  it("should match ∀x.(P(y)→Q(x)) → (P(y) → ∀x.Q(x))", () => {
    const py = predicate("P", [y]);
    const qx = predicate("Q", [x]);
    const instance = implication(
      universal(x, implication(py, qx)),
      implication(py, universal(x, qx)),
    );
    const result = matchAxiomA5(instance);
    expect(result._tag).toBe("Ok");
  });

  it("should reject when x ∈ FV(φ): ∀x.(P(x)→Q(x)) → (P(x) → ∀x.Q(x))", () => {
    const px = predicate("P", [x]);
    const qx = predicate("Q", [x]);
    const instance = implication(
      universal(x, implication(px, qx)),
      implication(px, universal(x, qx)),
    );
    const result = matchAxiomA5(instance);
    expect(result._tag).toBe("Error");
    if (result._tag === "Error") {
      expect(result.error._tag).toBe("A5VariableFreeInAntecedent");
    }
  });

  it("should not match non-implication", () => {
    const result = matchAxiomA5(phi);
    expect(result._tag).toBe("Error");
  });

  it("should not match when left is not universal", () => {
    const result = matchAxiomA5(implication(phi, psi));
    expect(result._tag).toBe("Error");
  });

  it("should not match when inner body is not implication", () => {
    const result = matchAxiomA5(
      implication(universal(x, predicate("P", [x])), psi),
    );
    expect(result._tag).toBe("Error");
  });

  it("should not match when antecedents differ", () => {
    const py = predicate("P", [y]);
    const pz = predicate("P", [z]);
    const qx = predicate("Q", [x]);
    const instance = implication(
      universal(x, implication(py, qx)),
      implication(pz, universal(x, qx)),
    );
    const result = matchAxiomA5(instance);
    expect(result._tag).toBe("Error");
  });

  it("should not match when bound variables differ", () => {
    const py = predicate("P", [y]);
    const qx = predicate("Q", [x]);
    const instance = implication(
      universal(x, implication(py, qx)),
      implication(py, universal(y, qx)),
    );
    const result = matchAxiomA5(instance);
    expect(result._tag).toBe("Error");
  });

  it("should not match when consequents differ", () => {
    const py = predicate("P", [y]);
    const qx = predicate("Q", [x]);
    const rx = predicate("R", [x]);
    const instance = implication(
      universal(x, implication(py, qx)),
      implication(py, universal(x, rx)),
    );
    const result = matchAxiomA5(instance);
    expect(result._tag).toBe("Error");
  });

  it("should not match when right conclusion is not universal", () => {
    const py = predicate("P", [y]);
    const qx = predicate("Q", [x]);
    const instance = implication(
      universal(x, implication(py, qx)),
      implication(py, qx),
    );
    const result = matchAxiomA5(instance);
    expect(result._tag).toBe("Error");
  });

  it("should not match when right side is not implication", () => {
    // ∀x.(P(y) → Q(x)) → Q(x) — right side is not implication
    const py = predicate("P", [y]);
    const qx = predicate("Q", [x]);
    const instance = implication(universal(x, implication(py, qx)), qx);
    const result = matchAxiomA5(instance);
    expect(result._tag).toBe("Error");
  });
});

// ── 等号公理 ──────────────────────────────────────────────

describe("matchEqualityAxiom", () => {
  describe("E1: 反射律 ∀x. x = x", () => {
    it("should match the template", () => {
      const result = matchEqualityAxiom("E1", axiomE1Template);
      expect(result._tag).toBe("Ok");
    });

    it("should not match a non-instance", () => {
      const result = matchEqualityAxiom("E1", phi);
      expect(result._tag).toBe("Error");
    });
  });

  describe("E2: 対称律 ∀x.∀y. x = y → y = x", () => {
    it("should match the template", () => {
      const result = matchEqualityAxiom("E2", axiomE2Template);
      expect(result._tag).toBe("Ok");
    });
  });

  describe("E3: 推移律 ∀x.∀y.∀z. x = y → (y = z → x = z)", () => {
    it("should match the template", () => {
      const result = matchEqualityAxiom("E3", axiomE3Template);
      expect(result._tag).toBe("Ok");
    });
  });
});

// ── 代入の適用 ────────────────────────────────────────────

describe("applySubstitution", () => {
  it("should apply formula substitution", () => {
    const subst = buildFormulaSubstitutionMap([
      [metaVariable("φ"), predicate("P", [a])],
      [metaVariable("ψ"), predicate("Q", [a])],
    ]);
    const result = applySubstitution(axiomA1Template, subst, new Map());
    // P(a) → (Q(a) → P(a))
    expect(result._tag).toBe("Implication");
  });

  it("should apply both formula and term substitutions", () => {
    const fSubst = buildFormulaSubstitutionMap([
      [metaVariable("φ"), predicate("P", [termMetaVariable("τ")])],
    ]);
    const tSubst: ReadonlyMap<string, import("./term").Term> = new Map([
      ["τ", a],
    ]);
    const schema = implication(phi, phi);
    const result = applySubstitution(schema, fSubst, tSubst);
    expect(result._tag).toBe("Implication");
  });

  it("should return unchanged if substitutions are empty", () => {
    const result = applySubstitution(phi, new Map(), new Map());
    expect(result._tag).toBe("MetaVariable");
    expect((result as typeof phi).name).toBe("φ");
  });
});

// ── 体系設定 ──────────────────────────────────────────────

describe("LogicSystem", () => {
  it("SK system is same reference as minimal logic system", () => {
    expect(skSystem).toBe(minimalLogicSystem);
  });

  it("Minimal logic system has A1, A2 only", () => {
    expect(minimalLogicSystem.propositionalAxioms.has("A1")).toBe(true);
    expect(minimalLogicSystem.propositionalAxioms.has("A2")).toBe(true);
    expect(minimalLogicSystem.propositionalAxioms.has("A3")).toBe(false);
    expect(minimalLogicSystem.propositionalAxioms.has("M3")).toBe(false);
    expect(minimalLogicSystem.propositionalAxioms.size).toBe(2);
    expect(minimalLogicSystem.predicateLogic).toBe(false);
    expect(minimalLogicSystem.equalityLogic).toBe(false);
    expect(minimalLogicSystem.generalization).toBe(false);
  });

  it("Intuitionistic system has A1, A2, EFQ", () => {
    expect(intuitionisticSystem.propositionalAxioms.has("A1")).toBe(true);
    expect(intuitionisticSystem.propositionalAxioms.has("A2")).toBe(true);
    expect(intuitionisticSystem.propositionalAxioms.has("EFQ")).toBe(true);
    expect(intuitionisticSystem.propositionalAxioms.has("A3")).toBe(false);
    expect(intuitionisticSystem.propositionalAxioms.has("M3")).toBe(false);
    expect(intuitionisticSystem.propositionalAxioms.size).toBe(3);
    expect(intuitionisticSystem.predicateLogic).toBe(false);
    expect(intuitionisticSystem.equalityLogic).toBe(false);
    expect(intuitionisticSystem.generalization).toBe(false);
  });

  it("Łukasiewicz system has A1, A2, A3", () => {
    expect(lukasiewiczSystem.propositionalAxioms.has("A1")).toBe(true);
    expect(lukasiewiczSystem.propositionalAxioms.has("A2")).toBe(true);
    expect(lukasiewiczSystem.propositionalAxioms.has("A3")).toBe(true);
    expect(lukasiewiczSystem.predicateLogic).toBe(false);
    expect(lukasiewiczSystem.equalityLogic).toBe(false);
    expect(lukasiewiczSystem.generalization).toBe(false);
  });

  it("Mendelson system has A1, A2, M3", () => {
    expect(mendelsonSystem.propositionalAxioms.has("A1")).toBe(true);
    expect(mendelsonSystem.propositionalAxioms.has("A2")).toBe(true);
    expect(mendelsonSystem.propositionalAxioms.has("M3")).toBe(true);
    expect(mendelsonSystem.propositionalAxioms.has("A3")).toBe(false);
    expect(mendelsonSystem.predicateLogic).toBe(false);
    expect(mendelsonSystem.equalityLogic).toBe(false);
    expect(mendelsonSystem.generalization).toBe(false);
  });

  it("Predicate logic system has A1-A3 + predicateLogic + Gen", () => {
    expect(predicateLogicSystem.propositionalAxioms.has("A1")).toBe(true);
    expect(predicateLogicSystem.predicateLogic).toBe(true);
    expect(predicateLogicSystem.equalityLogic).toBe(false);
    expect(predicateLogicSystem.generalization).toBe(true);
  });

  it("Equality logic system has everything", () => {
    expect(equalityLogicSystem.propositionalAxioms.has("A1")).toBe(true);
    expect(equalityLogicSystem.predicateLogic).toBe(true);
    expect(equalityLogicSystem.equalityLogic).toBe(true);
    expect(equalityLogicSystem.generalization).toBe(true);
  });
});

// ── identifyAxiom ─────────────────────────────────────────

describe("identifyAxiom", () => {
  it("should identify A1 instance", () => {
    const pa = predicate("P", [a]);
    const qa = predicate("Q", [a]);
    const instance = implication(pa, implication(qa, pa));
    const result = identifyAxiom(instance, lukasiewiczSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("A1");
    }
  });

  it("should identify A2 instance", () => {
    const result = identifyAxiom(axiomA2Template, lukasiewiczSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("A2");
    }
  });

  it("should identify A3 instance", () => {
    const result = identifyAxiom(axiomA3Template, lukasiewiczSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("A3");
    }
  });

  it("should identify M3 instance in mendelson system", () => {
    const result = identifyAxiom(axiomM3Template, mendelsonSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("M3");
    }
  });

  it("should not identify M3 in lukasiewicz system", () => {
    const result = identifyAxiom(axiomM3Template, lukasiewiczSystem);
    expect(result._tag).toBe("Error");
  });

  it("should not identify A3 in mendelson system", () => {
    const result = identifyAxiom(axiomA3Template, mendelsonSystem);
    expect(result._tag).toBe("Error");
  });

  it("should identify A1 and A2 in mendelson system", () => {
    const a1Result = identifyAxiom(axiomA1Template, mendelsonSystem);
    expect(a1Result._tag).toBe("Ok");
    if (a1Result._tag === "Ok") {
      expect(a1Result.axiomId).toBe("A1");
    }
    const a2Result = identifyAxiom(axiomA2Template, mendelsonSystem);
    expect(a2Result._tag).toBe("Ok");
    if (a2Result._tag === "Ok") {
      expect(a2Result.axiomId).toBe("A2");
    }
  });

  it("should identify A1 and A2 in minimal logic system", () => {
    const a1Result = identifyAxiom(axiomA1Template, minimalLogicSystem);
    expect(a1Result._tag).toBe("Ok");
    if (a1Result._tag === "Ok") {
      expect(a1Result.axiomId).toBe("A1");
    }
    const a2Result = identifyAxiom(axiomA2Template, minimalLogicSystem);
    expect(a2Result._tag).toBe("Ok");
    if (a2Result._tag === "Ok") {
      expect(a2Result.axiomId).toBe("A2");
    }
  });

  it("should not identify A3 or M3 in minimal logic system", () => {
    const a3Result = identifyAxiom(axiomA3Template, minimalLogicSystem);
    expect(a3Result._tag).toBe("Error");
    const m3Result = identifyAxiom(axiomM3Template, minimalLogicSystem);
    expect(m3Result._tag).toBe("Error");
  });

  it("should identify EFQ instance in intuitionistic system", () => {
    const result = identifyAxiom(axiomEFQTemplate, intuitionisticSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("EFQ");
    }
  });

  it("should not identify EFQ in lukasiewicz system", () => {
    const result = identifyAxiom(axiomEFQTemplate, lukasiewiczSystem);
    expect(result._tag).toBe("Error");
  });

  it("should not identify A3 in intuitionistic system", () => {
    const result = identifyAxiom(axiomA3Template, intuitionisticSystem);
    expect(result._tag).toBe("Error");
  });

  it("should identify A1 and A2 in intuitionistic system", () => {
    const a1Result = identifyAxiom(axiomA1Template, intuitionisticSystem);
    expect(a1Result._tag).toBe("Ok");
    if (a1Result._tag === "Ok") {
      expect(a1Result.axiomId).toBe("A1");
    }
    const a2Result = identifyAxiom(axiomA2Template, intuitionisticSystem);
    expect(a2Result._tag).toBe("Ok");
    if (a2Result._tag === "Ok") {
      expect(a2Result.axiomId).toBe("A2");
    }
  });

  it("should identify DNE instance in classical logic system", () => {
    const result = identifyAxiom(axiomDNETemplate, classicalLogicSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("DNE");
    }
  });

  it("should not identify DNE in lukasiewicz system", () => {
    const result = identifyAxiom(axiomDNETemplate, lukasiewiczSystem);
    expect(result._tag).toBe("Error");
  });

  it("should not identify EFQ in classical logic system", () => {
    const result = identifyAxiom(axiomEFQTemplate, classicalLogicSystem);
    expect(result._tag).toBe("Error");
  });

  it("should identify A1 and A2 in classical logic system", () => {
    const a1Result = identifyAxiom(axiomA1Template, classicalLogicSystem);
    expect(a1Result._tag).toBe("Ok");
    if (a1Result._tag === "Ok") {
      expect(a1Result.axiomId).toBe("A1");
    }
    const a2Result = identifyAxiom(axiomA2Template, classicalLogicSystem);
    expect(a2Result._tag).toBe("Ok");
    if (a2Result._tag === "Ok") {
      expect(a2Result.axiomId).toBe("A2");
    }
  });

  it("should identify A4 instance when predicate logic enabled", () => {
    const instance = implication(
      universal(x, predicate("P", [x])),
      predicate("P", [a]),
    );
    const result = identifyAxiom(instance, predicateLogicSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("A4");
    }
  });

  it("should not identify A4 when predicate logic disabled", () => {
    const instance = implication(
      universal(x, predicate("P", [x])),
      predicate("P", [a]),
    );
    const result = identifyAxiom(instance, lukasiewiczSystem);
    // A4 is not checked in Łukasiewicz system
    expect(result._tag).toBe("Error");
  });

  it("should identify A5 instance when predicate logic enabled", () => {
    const py = predicate("P", [y]);
    const qx = predicate("Q", [x]);
    const instance = implication(
      universal(x, implication(py, qx)),
      implication(py, universal(x, qx)),
    );
    const result = identifyAxiom(instance, predicateLogicSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("A5");
    }
  });

  it("should identify E1 instance when equality logic enabled", () => {
    const result = identifyAxiom(axiomE1Template, equalityLogicSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("E1");
    }
  });

  it("should not identify E1 when equality logic disabled", () => {
    const result = identifyAxiom(axiomE1Template, predicateLogicSystem);
    expect(result._tag).toBe("Error");
  });

  it("should return Error for non-axiom formula", () => {
    const result = identifyAxiom(implication(phi, phi), lukasiewiczSystem);
    expect(result._tag).toBe("Error");
  });

  it("should skip propositional axioms not in system", () => {
    // System with no propositional axioms but predicate logic
    const minimalSystem: import("./inferenceRule").LogicSystem = {
      name: "minimal",
      propositionalAxioms: new Set(),
      predicateLogic: true,
      equalityLogic: false,
      generalization: false,
    };
    // An A1 instance should not be identified
    const pa = predicate("P", [a]);
    const qa = predicate("Q", [a]);
    const a1Instance = implication(pa, implication(qa, pa));
    const result = identifyAxiom(a1Instance, minimalSystem);
    expect(result._tag).toBe("Error");
  });
});

// ── φ→φ の証明検証 (統合テスト) ─────────────────────────

describe("integration: φ→φ proof", () => {
  it("should verify the proof of φ→φ", () => {
    // ステップ1: A2 インスタンス
    // (φ→((ψ→φ)→φ)) → ((φ→(ψ→φ)) → (φ→φ))
    // ψ := ψ→φ を代入
    // 実際: (φ→((φ→φ)→φ)) → ((φ→(φ→φ)) → (φ→φ))
    // ただしPRDの証明はψ:=φ→φ, χ:=φ
    const a2Instance = implication(
      implication(phi, implication(implication(phi, phi), phi)),
      implication(
        implication(phi, implication(phi, phi)),
        implication(phi, phi),
      ),
    );
    const a2Result = matchPropositionalAxiom("A2", a2Instance);
    expect(a2Result._tag).toBe("Ok");

    // ステップ2: A1 インスタンス (a)
    // φ → ((φ→φ) → φ)
    const a1InstanceA = implication(
      phi,
      implication(implication(phi, phi), phi),
    );
    const a1aResult = matchPropositionalAxiom("A1", a1InstanceA);
    expect(a1aResult._tag).toBe("Ok");

    // ステップ3: MP (A2 instance + A1 instance a)
    // A2 instance の left = A1 instance a
    const mp1Result = applyModusPonens(a1InstanceA, a2Instance);
    expect(mp1Result._tag).toBe("Ok");
    // 結果: (φ→(φ→φ)) → (φ→φ)
    if (mp1Result._tag === "Ok") {
      const mp1Conclusion = mp1Result.conclusion;

      // ステップ4: A1 インスタンス (b)
      // φ → (φ → φ)
      const a1InstanceB = implication(phi, implication(phi, phi));
      const a1bResult = matchPropositionalAxiom("A1", a1InstanceB);
      expect(a1bResult._tag).toBe("Ok");

      // ステップ5: MP (step3 result + A1 instance b)
      const mp2Result = applyModusPonens(a1InstanceB, mp1Conclusion);
      expect(mp2Result._tag).toBe("Ok");
      // 結果: φ→φ
      if (mp2Result._tag === "Ok") {
        expect(mp2Result.conclusion._tag).toBe("Implication");
      }
    }
  });
});

// ── 公理テンプレートのexhaucstivenessテスト ──────────────

describe("axiom templates", () => {
  it("A1 template has correct structure", () => {
    expect(axiomA1Template._tag).toBe("Implication");
  });

  it("A2 template has correct structure", () => {
    expect(axiomA2Template._tag).toBe("Implication");
  });

  it("A3 template has correct structure", () => {
    expect(axiomA3Template._tag).toBe("Implication");
  });

  it("E1 template has correct structure", () => {
    expect(axiomE1Template._tag).toBe("Universal");
  });

  it("E2 template has correct structure", () => {
    expect(axiomE2Template._tag).toBe("Universal");
  });

  it("E3 template has correct structure", () => {
    expect(axiomE3Template._tag).toBe("Universal");
  });
});

// ── エッジケース ─────────────────────────────────────────

describe("edge cases", () => {
  it("MP with identical antecedent and conclusion", () => {
    const result = applyModusPonens(phi, implication(phi, phi));
    expect(result._tag).toBe("Ok");
  });

  it("A4 with function application replacement", () => {
    const fx = functionApplication("f", [x]);
    const ffa = functionApplication("f", [functionApplication("f", [a])]);
    const instance = implication(
      universal(x, predicate("P", [fx])),
      predicate("P", [ffa]),
    );
    const result = matchAxiomA4(instance);
    // ∀x.P(f(x)) → P(f(f(a))): x ↦ f(a)
    expect(result._tag).toBe("Ok");
  });

  it("A4 with equality", () => {
    // ∀x.(x = a) → (y = a)
    const instance = implication(universal(x, equality(x, a)), equality(y, a));
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("identifyAxiom prefers A1 over other axioms for matching instances", () => {
    const result = identifyAxiom(axiomA1Template, lukasiewiczSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("A1");
    }
  });

  it("A4 with nested quantifier where bound var is shadowed", () => {
    // ∀x.∀x.P(x) → ∀x.P(x)
    // inner ∀x shadows outer x, so substitution of outer x doesn't affect inner
    const instance = implication(
      universal(x, universal(x, predicate("P", [x]))),
      universal(x, predicate("P", [x])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with negation in body", () => {
    // ∀x.¬P(x) → ¬P(a)
    const instance = implication(
      universal(x, negation(predicate("P", [x]))),
      negation(predicate("P", [a])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with conjunction in body", () => {
    // ∀x.(P(x)∧Q(x)) → (P(a)∧Q(a))
    const instance = implication(
      universal(x, conjunction(predicate("P", [x]), predicate("Q", [x]))),
      conjunction(predicate("P", [a]), predicate("Q", [a])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with disjunction in body", () => {
    const instance = implication(
      universal(x, disjunction(predicate("P", [x]), predicate("Q", [x]))),
      disjunction(predicate("P", [a]), predicate("Q", [a])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with biconditional in body", () => {
    const instance = implication(
      universal(x, biconditional(predicate("P", [x]), predicate("Q", [x]))),
      biconditional(predicate("P", [a]), predicate("Q", [a])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with existential quantifier in body", () => {
    // ∀x.∃y.P(x,y) → ∃y.P(a,y)
    const instance = implication(
      universal(x, existential(y, predicate("P", [x, y]))),
      existential(y, predicate("P", [a, y])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with meta variable in body", () => {
    // ∀x.(φ→P(x)) → (φ→P(a))
    const instance = implication(
      universal(x, implication(phi, predicate("P", [x]))),
      implication(phi, predicate("P", [a])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with constant and term meta variable in body", () => {
    // ∀x.P(x, c, τ) → P(a, c, τ)
    const c = constant("c");
    const tau = termMetaVariable("τ");
    const instance = implication(
      universal(x, predicate("P", [x, c, tau])),
      predicate("P", [a, c, tau]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with binary operation in replacement", () => {
    // ∀x.P(x) → P(a+b)
    const b = constant("b");
    const aplusb = binaryOperation("+", a, b);
    const instance = implication(
      universal(x, predicate("P", [x])),
      predicate("P", [aplusb]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with conjunction template (via inferTermReplacement)", () => {
    // ∀x.(P(x) ∧ Q(x)) → (P(a) ∧ Q(a))
    const instance = implication(
      universal(x, conjunction(predicate("P", [x]), predicate("Q", [x]))),
      conjunction(predicate("P", [a]), predicate("Q", [a])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("identifyAxiom with E2", () => {
    const result = identifyAxiom(axiomE2Template, equalityLogicSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("E2");
    }
  });

  it("identifyAxiom with E3", () => {
    const result = identifyAxiom(axiomE3Template, equalityLogicSystem);
    expect(result._tag).toBe("Ok");
    if (result._tag === "Ok") {
      expect(result.axiomId).toBe("E3");
    }
  });

  // ── matchFormulaPattern の matchTerm カバレッジ ─────────────

  it("E1 template is exact match (no meta variables)", () => {
    // E1: ∀x. x=x — template uses concrete TermVariables, so only exact match works
    const result = matchEqualityAxiom("E1", axiomE1Template);
    expect(result._tag).toBe("Ok");
  });

  it("E1 rejects non-matching variable name", () => {
    // E1: ∀x. x=x template won't match ∀y. y=y because x≠y (concrete var matching)
    const instance = universal(y, equality(y, y));
    const result = matchEqualityAxiom("E1", instance);
    expect(result._tag).toBe("Error");
  });

  it("E2 exact match", () => {
    // E2: ∀x.∀y. x=y → y=x
    const result = matchEqualityAxiom("E2", axiomE2Template);
    expect(result._tag).toBe("Ok");
  });

  // ── A4 エラー分岐のカバレッジ ─────────────────────────────

  it("A4 rejects non-implication", () => {
    const result = matchAxiomA4(phi);
    expect(result._tag).toBe("Error");
  });

  it("A4 rejects implication with non-universal left", () => {
    const result = matchAxiomA4(implication(phi, psi));
    expect(result._tag).toBe("Error");
  });

  it("A4 rejects when substitution yields different result", () => {
    // ∀x.P(x) → P(y) は正しいA4だが、∀x.P(x) → Q(a) は不正
    const instance = implication(
      universal(x, predicate("P", [x])),
      predicate("Q", [a]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 with substitution that is not free-for", () => {
    // ∀x.∀y.P(x,y) → ∀y.P(y,y) — x↦y but y is captured by ∀y
    const instance = implication(
      universal(x, universal(y, predicate("P", [x, y]))),
      universal(y, predicate("P", [y, y])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
    if (result._tag === "Error") {
      expect(result.error._tag).toBe("SubstitutionNotFreeFor");
    }
  });

  // ── inferTermReplacement カバレッジ ────────────────────────

  it("A4 with universal quantifier in body (shadowing)", () => {
    // ∀x.∀y.P(y,x) → ∀y.P(y,a) — covers Universal branch in inferTermReplacement
    const instance = implication(
      universal(x, universal(y, predicate("P", [y, x]))),
      universal(y, predicate("P", [y, a])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 rejects when predicate names differ in body vs target", () => {
    // ∀x.P(x) → Q(a) — P≠Q so inferTermReplacement fails
    const instance = implication(
      universal(x, predicate("P", [x])),
      predicate("Q", [a]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 rejects when predicate arity differs", () => {
    // ∀x.P(x) → P(a, b) — different arity
    const b = constant("b");
    const instance = implication(
      universal(x, predicate("P", [x])),
      predicate("P", [a, b]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 with function application mismatch in body", () => {
    // ∀x.P(f(x)) → P(g(a)) — f≠g
    const fx = functionApplication("f", [x]);
    const ga = functionApplication("g", [a]);
    const instance = implication(
      universal(x, predicate("P", [fx])),
      predicate("P", [ga]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 with function arity mismatch in body", () => {
    // ∀x.P(f(x)) → P(f(a,b)) — different arity
    const b = constant("b");
    const fx = functionApplication("f", [x]);
    const fab = functionApplication("f", [a, b]);
    const instance = implication(
      universal(x, predicate("P", [fx])),
      predicate("P", [fab]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 with binary operation mismatch (wrong operator)", () => {
    // ∀x.P(x+a) → P(a*a) — +≠*
    const xplusa = binaryOperation("+", x, a);
    const atimesa = binaryOperation("*", a, a);
    const instance = implication(
      universal(x, predicate("P", [xplusa])),
      predicate("P", [atimesa]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 with binary operation mismatch (wrong type)", () => {
    // ∀x.P(x+a) → P(f(a)) — BinaryOperation vs FunctionApplication
    const xplusa = binaryOperation("+", x, a);
    const fa = functionApplication("f", [a]);
    const instance = implication(
      universal(x, predicate("P", [xplusa])),
      predicate("P", [fa]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 with variable mismatch in non-target position", () => {
    // ∀x.P(x, y) → P(a, z) — y≠z so mismatch
    const instance = implication(
      universal(x, predicate("P", [x, y])),
      predicate("P", [a, z]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 where body has no free occurrence of bound var (identity case)", () => {
    // ∀x.P(a) → P(a) — x doesn't occur free, body=conclusion
    const instance = implication(
      universal(x, predicate("P", [a])),
      predicate("P", [a]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 where body has no free var and conclusion differs", () => {
    // ∀x.P(a) → P(b) — x doesn't occur free but body≠conclusion
    const b = constant("b");
    const instance = implication(
      universal(x, predicate("P", [a])),
      predicate("P", [b]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 with quantifier variable mismatch in body", () => {
    // ∀x.∀y.P(x,y) → ∀z.P(a,z) — y≠z so quantifier variables don't match
    const instance = implication(
      universal(x, universal(y, predicate("P", [x, y]))),
      universal(z, predicate("P", [a, z])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 where bound var shadows outer in body (equalFormula path)", () => {
    // ∀x.∀x.P(x) → ∀x.P(x) — inner ∀x shadows outer x
    // inferTermReplacement: b.variable.name === variable.name → equalFormula path
    const instance = implication(
      universal(x, universal(x, predicate("P", [x]))),
      universal(x, predicate("P", [x])),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });

  it("A4 with function application type mismatch in inferTermReplacement", () => {
    // ∀x.P(f(x, a)) → P(f(a)) — f arity mismatch
    const fxa = functionApplication("f", [x, a]);
    const fa = functionApplication("f", [a]);
    const instance = implication(
      universal(x, predicate("P", [fxa])),
      predicate("P", [fa]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Error");
  });

  it("A4 with function application vs non-function in target", () => {
    // ∀x.P(f(x)) → P(a) — body has f(x) at position, target has constant a
    const fx = functionApplication("f", [x]);
    const instance = implication(
      universal(x, predicate("P", [fx])),
      predicate("P", [a]),
    );
    const result = matchAxiomA4(instance);
    // f(x) with x->a would give f(a), but target position has just a (not f(a))
    expect(result._tag).toBe("Error");
  });

  it("A4 with function application in body and matching target (covers inferTermReplacement matchTerm)", () => {
    // ∀x.P(f(x), x) → P(f(a), a) — body has f(x) and x, target has f(a) and a
    const fx = functionApplication("f", [x]);
    const fa = functionApplication("f", [a]);
    const instance = implication(
      universal(x, predicate("P", [fx, x])),
      predicate("P", [fa, a]),
    );
    const result = matchAxiomA4(instance);
    expect(result._tag).toBe("Ok");
  });
});

// ── matchFormulaPattern (直接テスト) ─────────────────────────

describe("matchFormulaPattern", () => {
  describe("TermMetaVariable in template", () => {
    it("should bind TermMetaVariable to candidate term", () => {
      // Template: P(τ), Candidate: P(a)
      const tau = termMetaVariable("τ");
      const template = predicate("P", [tau]);
      const candidate = predicate("P", [a]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).not.toBeUndefined();
      if (result) {
        expect(result.termSub.size).toBe(1);
      }
    });

    it("should check consistency of TermMetaVariable bindings", () => {
      // Template: P(τ, τ), Candidate: P(a, b) — inconsistent
      const tau = termMetaVariable("τ");
      const b = constant("b");
      const template = predicate("P", [tau, tau]);
      const candidate = predicate("P", [a, b]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).toBeUndefined();
    });

    it("should accept consistent TermMetaVariable bindings", () => {
      // Template: P(τ, τ), Candidate: P(a, a) — consistent
      const tau = termMetaVariable("τ");
      const template = predicate("P", [tau, tau]);
      const candidate = predicate("P", [a, a]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).not.toBeUndefined();
    });
  });

  describe("Constant in template term", () => {
    it("should match identical constants", () => {
      // Template: P(0), Candidate: P(0)
      const zero = constant("0");
      const template = predicate("P", [zero]);
      const candidate = predicate("P", [zero]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).not.toBeUndefined();
    });

    it("should reject different constants", () => {
      // Template: P(0), Candidate: P(1)
      const zero = constant("0");
      const one = constant("1");
      const template = predicate("P", [zero]);
      const candidate = predicate("P", [one]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).toBeUndefined();
    });
  });

  describe("FunctionApplication in template term", () => {
    it("should match identical function applications", () => {
      // Template: P(f(x)), Candidate: P(f(x))
      const fx = functionApplication("f", [x]);
      const template = predicate("P", [fx]);
      const candidate = predicate("P", [fx]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).not.toBeUndefined();
    });

    it("should reject different function names", () => {
      // Template: P(f(x)), Candidate: P(g(x))
      const fx = functionApplication("f", [x]);
      const gx = functionApplication("g", [x]);
      const template = predicate("P", [fx]);
      const candidate = predicate("P", [gx]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).toBeUndefined();
    });

    it("should reject different arities", () => {
      // Template: P(f(x, y)), Candidate: P(f(x))
      const fxy = functionApplication("f", [x, y]);
      const fx = functionApplication("f", [x]);
      const template = predicate("P", [fxy]);
      const candidate = predicate("P", [fx]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).toBeUndefined();
    });
  });

  describe("Predicate mismatch", () => {
    it("should reject different predicate names", () => {
      // Template: P(x), Candidate: Q(x)
      const template = predicate("P", [x]);
      const candidate = predicate("Q", [x]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).toBeUndefined();
    });

    it("should reject different predicate arities", () => {
      // Template: P(x, y), Candidate: P(x)
      const template = predicate("P", [x, y]);
      const candidate = predicate("P", [x]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).toBeUndefined();
    });
  });

  describe("Term tag mismatch", () => {
    it("should reject when template has TermVariable but candidate has Constant", () => {
      // Template: P(x), Candidate: P(0)  — x is TermVariable not TermMetaVariable
      const template = predicate("P", [x]);
      const candidate = predicate("P", [constant("0")]);
      const result = matchFormulaPattern(template, candidate);
      expect(result).toBeUndefined();
    });
  });

  describe("BinaryOperation in template term", () => {
    it("should match identical binary operations", () => {
      // Template: x + y = z, Candidate: x + y = z
      const template = equality(binaryOperation("+", x, y), z);
      const candidate = equality(binaryOperation("+", x, y), z);
      const result = matchFormulaPattern(template, candidate);
      expect(result).not.toBeUndefined();
    });

    it("should reject different operators", () => {
      // Template: x + y = z, Candidate: x * y = z
      const template = equality(binaryOperation("+", x, y), z);
      const candidate = equality(binaryOperation("*", x, y), z);
      const result = matchFormulaPattern(template, candidate);
      expect(result).toBeUndefined();
    });
  });
});
