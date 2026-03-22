import { describe, it, expect } from "vitest";
import {
  alphaEqualFormula,
  areSimplificationEquivalent,
} from "./alphaEquivalence";
import {
  termVariable,
  termMetaVariable,
  constant,
  binaryOperation,
  functionApplication,
  metaVariable,
  negation,
  implication,
  conjunction,
  disjunction,
  biconditional,
  universal,
  existential,
  predicate,
  equality,
  formulaSubstitution,
  freeVariableAbsence,
} from "./index";
import { termSubstitution } from "./term";

// --- ヘルパー ---

const x = termVariable("x");
const y = termVariable("y");
const z = termVariable("z");
const w = termVariable("w");
const a = constant("a");
const tau = termMetaVariable("τ");
const phi = metaVariable("φ");
const psi = metaVariable("ψ");

const px = predicate("P", [x]);
const py = predicate("P", [y]);
const pz = predicate("P", [z]);
const pa = predicate("P", [a]);

// --- alphaEqualFormula ---

describe("alphaEqualFormula", () => {
  describe("基本的な構造的等価（α変換なし）", () => {
    it("同一の命題変数はα等価", () => {
      expect(alphaEqualFormula(phi, phi)).toBe(true);
    });

    it("異なる命題変数はα等価でない", () => {
      expect(alphaEqualFormula(phi, psi)).toBe(false);
    });

    it("同一の述語はα等価", () => {
      expect(alphaEqualFormula(px, px)).toBe(true);
    });

    it("異なる自由変数を持つ述語はα等価でない", () => {
      expect(alphaEqualFormula(px, py)).toBe(false);
    });

    it("否定のα等価性", () => {
      expect(alphaEqualFormula(negation(phi), negation(phi))).toBe(true);
      expect(alphaEqualFormula(negation(phi), negation(psi))).toBe(false);
    });

    it("含意のα等価性", () => {
      expect(
        alphaEqualFormula(implication(phi, psi), implication(phi, psi)),
      ).toBe(true);
      expect(
        alphaEqualFormula(implication(phi, psi), implication(psi, phi)),
      ).toBe(false);
    });

    it("連言のα等価性", () => {
      expect(
        alphaEqualFormula(conjunction(phi, psi), conjunction(phi, psi)),
      ).toBe(true);
    });

    it("選言のα等価性", () => {
      expect(
        alphaEqualFormula(disjunction(phi, psi), disjunction(phi, psi)),
      ).toBe(true);
    });

    it("双条件のα等価性", () => {
      expect(
        alphaEqualFormula(biconditional(phi, psi), biconditional(phi, psi)),
      ).toBe(true);
    });

    it("等号のα等価性", () => {
      expect(alphaEqualFormula(equality(x, y), equality(x, y))).toBe(true);
      expect(alphaEqualFormula(equality(x, y), equality(y, x))).toBe(false);
    });
  });

  describe("項のα等価性", () => {
    it("定数はα等価", () => {
      expect(
        alphaEqualFormula(
          equality(constant("a"), constant("b")),
          equality(constant("a"), constant("b")),
        ),
      ).toBe(true);
    });

    it("メタ変数はα等価", () => {
      expect(alphaEqualFormula(equality(tau, tau), equality(tau, tau))).toBe(
        true,
      );
    });

    it("関数適用のα等価性", () => {
      expect(
        alphaEqualFormula(
          predicate("P", [functionApplication("f", [x])]),
          predicate("P", [functionApplication("f", [x])]),
        ),
      ).toBe(true);
    });

    it("二項演算のα等価性", () => {
      expect(
        alphaEqualFormula(
          equality(binaryOperation("+", x, y), z),
          equality(binaryOperation("+", x, y), z),
        ),
      ).toBe(true);
    });
  });

  describe("量化子のα等価性（束縛変数リネーム）", () => {
    it("∀x.P(x) ≡α ∀y.P(y)", () => {
      expect(alphaEqualFormula(universal(x, px), universal(y, py))).toBe(true);
    });

    it("∃x.P(x) ≡α ∃y.P(y)", () => {
      expect(alphaEqualFormula(existential(x, px), existential(y, py))).toBe(
        true,
      );
    });

    it("∀x.P(x) ≢α ∀y.P(x) — xが自由変数として残る", () => {
      expect(alphaEqualFormula(universal(x, px), universal(y, px))).toBe(false);
    });

    it("∀x.P(x) ≢α ∃x.P(x) — 量化子の種類が異なる", () => {
      expect(alphaEqualFormula(universal(x, px), existential(x, px))).toBe(
        false,
      );
    });

    it("ネストした量化子: ∀x.∀y.P(x,y) ≡α ∀y.∀z.P(y,z)", () => {
      const pxy = predicate("P", [x, y]);
      const pyz = predicate("P", [y, z]);
      expect(
        alphaEqualFormula(
          universal(x, universal(y, pxy)),
          universal(y, universal(z, pyz)),
        ),
      ).toBe(true);
    });

    it("ネストした量化子（順序入替）: ∀x.∀y.P(x,y) ≢α ∀x.∀y.P(y,x)", () => {
      const pxy = predicate("P", [x, y]);
      const pyx = predicate("P", [y, x]);
      expect(
        alphaEqualFormula(
          universal(x, universal(y, pxy)),
          universal(x, universal(y, pyx)),
        ),
      ).toBe(false);
    });

    it("シャドーイング: ∀x.∀x.P(x) ≡α ∀y.∀z.P(z) — 内側のxはzにリネーム", () => {
      expect(
        alphaEqualFormula(
          universal(x, universal(x, px)),
          universal(y, universal(z, pz)),
        ),
      ).toBe(true);
    });

    it("シャドーイング非対称: ∀x.∀x.P(x) ≢α ∀y.∀z.P(y) — 内側でP(y)はzと対応しない", () => {
      expect(
        alphaEqualFormula(
          universal(x, universal(x, px)),
          universal(y, universal(z, py)),
        ),
      ).toBe(false);
    });

    it("自由変数と束縛変数の区別: ∀x.P(x,y) ≡α ∀z.P(z,y)", () => {
      const pxy_free = predicate("P", [x, y]);
      const pzy_free = predicate("P", [z, y]);
      expect(
        alphaEqualFormula(universal(x, pxy_free), universal(z, pzy_free)),
      ).toBe(true);
    });

    it("自由変数が一致しない: ∀x.P(x,y) ≢α ∀z.P(z,w)", () => {
      const pxy_free = predicate("P", [x, y]);
      const pzw_free = predicate("P", [z, w]);
      expect(
        alphaEqualFormula(universal(x, pxy_free), universal(z, pzw_free)),
      ).toBe(false);
    });
  });

  describe("FormulaSubstitution / FreeVariableAbsenceのα等価性", () => {
    it("同一のFormulaSubstitutionはα等価", () => {
      expect(
        alphaEqualFormula(
          formulaSubstitution(px, y, x),
          formulaSubstitution(px, y, x),
        ),
      ).toBe(true);
    });

    it("同一のFreeVariableAbsenceはα等価", () => {
      expect(
        alphaEqualFormula(
          freeVariableAbsence(py, x),
          freeVariableAbsence(py, x),
        ),
      ).toBe(true);
    });
  });
});

// --- areSimplificationEquivalent ---

describe("areSimplificationEquivalent", () => {
  describe("基本タスク要件", () => {
    it("phi→phiからpsi→psiは繋げない（自由変数の置換が必要）", () => {
      // φ→φ と ψ→ψ はメタ変数が異なるので非等価
      expect(
        areSimplificationEquivalent(
          implication(phi, phi),
          implication(psi, psi),
        ),
      ).toBe(false);
    });

    it("∀x.phiから∀y.phiは繋げる（phiはメタ変数でxもyも自由でない）", () => {
      // φはメタ変数なので、∀x.φ ≡ ∀y.φ（xもyもφに自由出現しない）
      expect(
        areSimplificationEquivalent(universal(x, phi), universal(y, phi)),
      ).toBe(true);
    });

    it("∀x.P(x)から∀y.P(y)は繋げる（alpha-equivalent）", () => {
      expect(
        areSimplificationEquivalent(universal(x, px), universal(y, py)),
      ).toBe(true);
    });

    it("∀x.P(x)から∀y.P(x)は繋げない（xが自由変数として残る）", () => {
      expect(
        areSimplificationEquivalent(universal(x, px), universal(y, px)),
      ).toBe(false);
    });
  });

  describe("置換の解決", () => {
    it("P(x)[a/x]はP(a)に繋げられる", () => {
      expect(
        areSimplificationEquivalent(formulaSubstitution(px, a, x), pa),
      ).toBe(true);
    });

    it("x[y/x]はyに繋げられる（等号の形で）", () => {
      // x[y/x] → y  =  (x = x)[y/x] → (y = y)
      expect(
        areSimplificationEquivalent(
          formulaSubstitution(equality(x, x), y, x),
          equality(y, y),
        ),
      ).toBe(true);
    });

    it("(x+x)[y/x]は(y+y)に繋げられる", () => {
      const xPlusX = binaryOperation("+", x, x);
      const yPlusY = binaryOperation("+", y, y);
      expect(
        areSimplificationEquivalent(
          formulaSubstitution(equality(xPlusX, a), y, x),
          equality(yPlusY, a),
        ),
      ).toBe(true);
    });
  });

  describe("FreeVariableAbsenceの解決", () => {
    it("y[/x]はyに繋げられる（Predicate形式: P(y)[/x] ≡ P(y)）", () => {
      // P(y) にxは自由出現しないので、P(y)[/x]はP(y)に等価
      expect(areSimplificationEquivalent(freeVariableAbsence(py, x), py)).toBe(
        true,
      );
    });

    it("x[/x]はxに繋げられない（P(x)[/x]はP(x)に等価でない）", () => {
      // P(x) にxが自由出現する → [/x]アサーションは意味がある
      // normalizeFormula はこのケースを解決しない（xがfreeなので）
      expect(areSimplificationEquivalent(freeVariableAbsence(px, x), px)).toBe(
        false,
      );
    });
  });

  describe("α等価 + 置換解決の複合", () => {
    it("∀x.P(x)[a/x] ≡ P(a) — 量化子の下での置換", () => {
      // ∀x.P(x) の x は束縛されているので [a/x] は外の x のみ影響
      // しかし normalizeFormula が φ[τ/x] を解決する
      // この場合、∀x.P(x) に x は自由出現しない → ∀x.P(x)[a/x] = ∀x.P(x)
      // これは P(a) とは非等価
      expect(
        areSimplificationEquivalent(
          formulaSubstitution(universal(x, px), a, x),
          pa,
        ),
      ).toBe(false);
    });

    it("対称性: areSimplificationEquivalentは対称", () => {
      // a ≡ b ⟺ b ≡ a
      expect(
        areSimplificationEquivalent(universal(x, px), universal(y, py)),
      ).toBe(true);
      expect(
        areSimplificationEquivalent(universal(y, py), universal(x, px)),
      ).toBe(true);
    });

    it("対称性: 置換解決でも対称", () => {
      expect(
        areSimplificationEquivalent(formulaSubstitution(px, a, x), pa),
      ).toBe(true);
      expect(
        areSimplificationEquivalent(pa, formulaSubstitution(px, a, x)),
      ).toBe(true);
    });
  });

  describe("ネストした量化子のコーナーケース", () => {
    it("∀x.∀y.P(x,y) ≡ ∀a.∀b.P(a,b)（ネストした変数リネーム）", () => {
      const pxy = predicate("P", [x, y]);
      const pab = predicate("P", [termVariable("a"), termVariable("b")]);
      expect(
        areSimplificationEquivalent(
          universal(x, universal(y, pxy)),
          universal(termVariable("a"), universal(termVariable("b"), pab)),
        ),
      ).toBe(true);
    });

    it("∀x.∃y.P(x,y) ≡ ∀z.∃w.P(z,w)", () => {
      const pxy = predicate("P", [x, y]);
      const pzw = predicate("P", [z, w]);
      expect(
        areSimplificationEquivalent(
          universal(x, existential(y, pxy)),
          universal(z, existential(w, pzw)),
        ),
      ).toBe(true);
    });

    it("量化子の種類が異なると非等価: ∀x.∃y.P(x,y) ≢ ∃x.∀y.P(x,y)", () => {
      const pxy = predicate("P", [x, y]);
      expect(
        areSimplificationEquivalent(
          universal(x, existential(y, pxy)),
          existential(x, universal(y, pxy)),
        ),
      ).toBe(false);
    });
  });

  describe("TermSubstitution を含む項のα等価性", () => {
    it("同一のTermSubstitutionを含む等式はα等価", () => {
      const sub1 = termSubstitution(x, y, z);
      const sub2 = termSubstitution(x, y, z);
      expect(alphaEqualFormula(equality(sub1, x), equality(sub2, x))).toBe(
        true,
      );
    });

    it("異なる変数名のTermSubstitutionはα等価でない", () => {
      const sub1 = termSubstitution(x, y, z);
      const sub2 = termSubstitution(x, y, w);
      expect(alphaEqualFormula(equality(sub1, x), equality(sub2, x))).toBe(
        false,
      );
    });

    it("異なる置換対象のTermSubstitutionはα等価でない", () => {
      const sub1 = termSubstitution(x, y, z);
      const sub2 = termSubstitution(y, y, z);
      expect(
        alphaEqualFormula(predicate("P", [sub1]), predicate("P", [sub2])),
      ).toBe(false);
    });

    it("異なる置換値のTermSubstitutionはα等価でない", () => {
      const sub1 = termSubstitution(x, y, z);
      const sub2 = termSubstitution(x, a, z);
      expect(
        alphaEqualFormula(predicate("P", [sub1]), predicate("P", [sub2])),
      ).toBe(false);
    });
  });
});
