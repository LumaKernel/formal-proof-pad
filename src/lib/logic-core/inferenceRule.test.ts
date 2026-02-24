import { describe, it, expect } from "vitest";
import {
  applyModusPonens,
  applyGeneralization,
  matchPropositionalAxiom,
  matchAxiomA4,
  matchAxiomA5,
  matchEqualityAxiom,
  applySubstitution,
  identifyAxiom,
  axiomA1Template,
  axiomA2Template,
  axiomA3Template,
  axiomE1Template,
  axiomE2Template,
  axiomE3Template,
  lukasiewiczSystem,
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
  it("Łukasiewicz system has A1, A2, A3", () => {
    expect(lukasiewiczSystem.propositionalAxioms.has("A1")).toBe(true);
    expect(lukasiewiczSystem.propositionalAxioms.has("A2")).toBe(true);
    expect(lukasiewiczSystem.propositionalAxioms.has("A3")).toBe(true);
    expect(lukasiewiczSystem.predicateLogic).toBe(false);
    expect(lukasiewiczSystem.equalityLogic).toBe(false);
    expect(lukasiewiczSystem.generalization).toBe(false);
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
});
