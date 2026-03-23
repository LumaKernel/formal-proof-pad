import { describe, it, expect } from "vitest";
import {
  findTermVariableSubstitution,
  isNonTrivialSubstitutionResult,
  areSubstitutionConnectable,
} from "./termVariableMatching";
import {
  predicate,
  implication,
  conjunction,
  disjunction,
  negation,
  universal,
  existential,
  equality,
  formulaSubstitution,
  freeVariableAbsence,
  metaVariable,
} from "./formula";
import type { Term } from "./term";
import {
  termVariable,
  termMetaVariable,
  constant,
  functionApplication,
  binaryOperation,
  termSubstitution,
} from "./term";

const x = termVariable("x");
const y = termVariable("y");
const z = termVariable("z");
const a = constant("a");
const b = constant("b");

const P = (...args: readonly Term[]) => predicate("P", args);
const Q = (...args: readonly Term[]) => predicate("Q", args);

describe("findTermVariableSubstitution", () => {
  describe("基本的なマッチング", () => {
    it("同一論理式（自由変数なし）は空の代入", () => {
      const f = P(a);
      const result = findTermVariableSubstitution(f, f);
      expect(result).toBeDefined();
      expect(result!.size).toBe(0);
    });

    it("自由変数→定数の代入", () => {
      const source = P(x);
      const target = P(a);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(1);
      expect(result!.get("x")).toEqual(a);
    });

    it("自由変数→関数適用の代入", () => {
      const fa = functionApplication("f", [a]);
      const source = P(x);
      const target = P(fa);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.get("x")).toEqual(fa);
    });

    it("複数の自由変数の代入", () => {
      const source = predicate("R", [x, y]);
      const target = predicate("R", [a, b]);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(2);
      expect(result!.get("x")).toEqual(a);
      expect(result!.get("y")).toEqual(b);
    });

    it("同じ変数の複数出現は一貫した代入が必要", () => {
      const source = implication(P(x), Q(x));
      const target = implication(P(a), Q(a));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(1);
      expect(result!.get("x")).toEqual(a);
    });

    it("同じ変数が異なる項にマッチしようとすると失敗", () => {
      const source = implication(P(x), Q(x));
      const target = implication(P(a), Q(b));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });
  });

  describe("構造不一致の場合", () => {
    it("異なる述語名は失敗", () => {
      const result = findTermVariableSubstitution(P(x), Q(a));
      expect(result).toBeUndefined();
    });

    it("異なるアリティは失敗", () => {
      const source = predicate("P", [x]);
      const target = predicate("P", [a, b]);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("異なる論理結合子は失敗", () => {
      const source = implication(P(x), Q(x));
      const target = conjunction(P(a), Q(a));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });
  });

  describe("束縛変数の処理", () => {
    it("束縛変数はα等価で扱う（∀x.P(x) vs ∀y.P(y)）", () => {
      const source = universal(x, P(x));
      const target = universal(y, P(y));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(0); // 代入なし（α等価）
    });

    it("自由変数と束縛変数を正しく区別（∀y.P(x,y) vs ∀z.P(a,z)）", () => {
      const source = universal(y, predicate("P", [x, y]));
      const target = universal(z, predicate("P", [a, z]));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(1);
      expect(result!.get("x")).toEqual(a);
    });

    it("束縛変数のシャドーイング: 外の自由xと中の束縛x", () => {
      // P(x) ∧ ∀x. Q(x) vs P(a) ∧ ∀x. Q(x)
      const source = conjunction(P(x), universal(x, Q(x)));
      const target = conjunction(P(a), universal(x, Q(x)));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(1);
      expect(result!.get("x")).toEqual(a);
    });

    it("変数捕獲の防止: 自由変数→束縛変数を含む項への代入は拒否", () => {
      // ∀y. P(x, y) vs ∀y. P(y, y)
      // x → y だが y は束縛変数なので拒否
      const source = universal(y, predicate("P", [x, y]));
      const target = universal(y, predicate("P", [y, y]));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("変数捕獲の防止: BinaryOperationに束縛変数を含むターゲット", () => {
      // ∀y. P(x) vs ∀y. P(y + y) — x → y+y だが y は束縛変数
      const source = universal(y, P(x));
      const target = universal(y, P(binaryOperation("+", y, y)));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("変数捕獲の防止: BinaryOperationの右辺のみ束縛変数を含む", () => {
      // ∀y. P(x) vs ∀y. P(a + y) — 左辺aは定数、右辺yは束縛変数
      const source = universal(y, P(x));
      const target = universal(y, P(binaryOperation("+", a, y)));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("変数捕獲の防止: TermSubstitutionに束縛変数を含むターゲット", () => {
      // ∀y. P(x) vs ∀y. P(t[y/z]) — x → t[y/z] だが y は束縛変数
      const source = universal(y, P(x));
      const target = universal(y, P(termSubstitution(a, y, z)));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("変数捕獲の防止: FunctionApplicationに束縛変数を含むターゲット", () => {
      // ∀y. P(x) vs ∀y. P(f(y)) — x → f(y) だが y は束縛変数
      const source = universal(y, P(x));
      const target = universal(y, P(functionApplication("f", [y])));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("変数捕獲なし: ターゲットがConstantのみの場合はマッチ成功", () => {
      // ∀y. P(x) vs ∀y. P(a) — x → a, aは定数なので束縛変数を含まない
      const source = universal(y, P(x));
      const target = universal(y, P(a));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.get("x")).toEqual(a);
    });

    it("変数捕獲なし: ターゲットがTermMetaVariableのみの場合はマッチ成功", () => {
      // ∀y. P(x) vs ∀y. P(α) — x → α, αはメタ変数なので束縛変数を含まない
      const alpha = termMetaVariable("α");
      const source = universal(y, P(x));
      const target = universal(y, P(alpha));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.get("x")).toEqual(alpha);
    });

    it("ソース束縛変数 vs ターゲット非変数項は失敗", () => {
      // ∀x. P(x) vs ∀x. P(f(a)) — x は束縛変数、ターゲットは FunctionApplication
      const source = universal(x, P(x));
      const target = universal(x, P(functionApplication("f", [a])));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("束縛変数同士の不一致（de Bruijnレベル不一致）", () => {
      // ∀x.∀y.P(x,y) vs ∀x.∀y.P(y,x)（束縛変数の入れ替え）
      const source = universal(x, universal(y, predicate("P", [x, y])));
      const target = universal(x, universal(y, predicate("P", [y, x])));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("存在量化子でもα等価で扱う", () => {
      const source = existential(x, P(x));
      const target = existential(y, P(y));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(0);
    });
  });

  describe("複合論理式", () => {
    it("含意の両辺でマッチ", () => {
      const source = implication(P(x), Q(y));
      const target = implication(P(a), Q(b));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.get("x")).toEqual(a);
      expect(result!.get("y")).toEqual(b);
    });

    it("否定を含む論理式", () => {
      const source = negation(P(x));
      const target = negation(P(a));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.get("x")).toEqual(a);
    });

    it("選言を含む論理式", () => {
      const source = disjunction(P(x), Q(y));
      const target = disjunction(P(a), Q(b));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(2);
    });

    it("等式を含む論理式", () => {
      const source = equality(x, y);
      const target = equality(a, b);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.get("x")).toEqual(a);
      expect(result!.get("y")).toEqual(b);
    });

    it("二項演算を含む項", () => {
      const source = equality(binaryOperation("+", x, y), z);
      const target = equality(binaryOperation("+", a, b), constant("c"));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(3);
      expect(result!.get("x")).toEqual(a);
      expect(result!.get("y")).toEqual(b);
      expect(result!.get("z")).toEqual(constant("c"));
    });

    it("異なる二項演算子は失敗", () => {
      const source = equality(binaryOperation("+", x, y), z);
      const target = equality(binaryOperation("*", a, b), constant("c"));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("FunctionApplication同士の構造的マッチ", () => {
      // f(x, y) = f(a, b) → 項レベルで直接マッチ
      const source = equality(functionApplication("f", [x, y]), z);
      const target = equality(functionApplication("f", [a, b]), constant("c"));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(3);
      expect(result!.get("x")).toEqual(a);
      expect(result!.get("y")).toEqual(b);
      expect(result!.get("z")).toEqual(constant("c"));
    });

    it("異なる関数名のFunctionApplicationは失敗", () => {
      const source = equality(functionApplication("f", [x]), z);
      const target = equality(functionApplication("g", [a]), constant("c"));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("異なるアリティのFunctionApplicationは失敗", () => {
      const source = equality(functionApplication("f", [x]), z);
      const target = equality(functionApplication("f", [a, b]), constant("c"));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("TermSubstitution同士の構造的マッチ", () => {
      // t[a/x] vs t[b/x] — termSubstitution の term と replacement をマッチ
      const source = equality(termSubstitution(x, y, z), a);
      const target = equality(termSubstitution(a, b, z), a);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.get("x")).toEqual(a);
      expect(result!.get("y")).toEqual(b);
    });
  });

  describe("正規化を伴うマッチング", () => {
    it("FormulaSubstitutionが正規化されてからマッチ", () => {
      // P(x)[a/x] → P(a) にマッチ
      const source = formulaSubstitution(P(x), a, x);
      const target = P(a);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(0); // 正規化後は同一
    });

    it("FreeVariableAbsenceが正規化されてからマッチ", () => {
      // P(a)[/x] → P(a) にマッチ（x は P(a) で自由でない）
      const source = freeVariableAbsence(P(a), x);
      const target = P(a);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(0);
    });
  });

  describe("MetaVariable / TermMetaVariable", () => {
    it("TermMetaVariableは名前とsubscriptで構造的マッチ", () => {
      const source = equality(termMetaVariable("α", "1"), a);
      const target = equality(termMetaVariable("α", "1"), a);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(0);
    });

    it("異なるTermMetaVariable名は失敗", () => {
      const source = equality(termMetaVariable("α"), a);
      const target = equality(termMetaVariable("β"), a);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("異なるTermMetaVariable subscriptは失敗", () => {
      const source = equality(termMetaVariable("α", "1"), a);
      const target = equality(termMetaVariable("α", "2"), a);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });

    it("MetaVariableは構造的にマッチ", () => {
      const source = implication(metaVariable("φ"), metaVariable("ψ"));
      const target = implication(metaVariable("φ"), metaVariable("ψ"));
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(0);
    });

    it("異なるMetaVariableは失敗", () => {
      const source = metaVariable("φ");
      const target = metaVariable("ψ");
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeUndefined();
    });
  });

  describe("FormulaSubstitution / FreeVariableAbsence（正規化後に残る場合）", () => {
    it("MetaVariableベースのFormulaSubstitutionは構造的マッチ", () => {
      // φ[a/x] vs φ[a/x] — MetaVariableベースなので正規化後も残る
      // variable の x は自由変数として扱われるので x → x の同一代入が記録される
      const source = formulaSubstitution(metaVariable("φ"), a, x);
      const target = formulaSubstitution(metaVariable("φ"), a, x);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.size).toBe(1); // x → x (identity)
      expect(result!.get("x")).toEqual(x);
    });

    it("MetaVariableベースのFreeVariableAbsenceは構造的マッチ", () => {
      const source = freeVariableAbsence(metaVariable("φ"), x);
      const target = freeVariableAbsence(metaVariable("φ"), x);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
    });

    it("MetaVariableベースのFormulaSubstitutionでも項変数マッチ", () => {
      // φ[x/z] vs φ[a/z] — x が自由変数としてマッチ
      const source = formulaSubstitution(metaVariable("φ"), x, z);
      const target = formulaSubstitution(metaVariable("φ"), a, z);
      const result = findTermVariableSubstitution(source, target);
      expect(result).toBeDefined();
      expect(result!.get("x")).toEqual(a);
    });
  });
});

describe("isNonTrivialSubstitutionResult", () => {
  it("非自明な代入がある場合はtrue", () => {
    expect(isNonTrivialSubstitutionResult(P(x), P(a))).toBe(true);
  });

  it("α等価（空の代入）はfalse", () => {
    expect(
      isNonTrivialSubstitutionResult(universal(x, P(x)), universal(y, P(y))),
    ).toBe(false);
  });

  it("同一論理式はfalse", () => {
    expect(isNonTrivialSubstitutionResult(P(a), P(a))).toBe(false);
  });

  it("恒等代入のみ（x → x）はfalse", () => {
    // P(x) vs P(x) — x → x で恒等代入、非自明ではない
    expect(isNonTrivialSubstitutionResult(P(x), P(x))).toBe(false);
  });

  it("マッチ不可はfalse", () => {
    expect(isNonTrivialSubstitutionResult(P(x), Q(a))).toBe(false);
  });
});

describe("areSubstitutionConnectable", () => {
  it("一方向で代入可能な場合はtrue", () => {
    // P(x) → P(a) は可能（source→target）
    expect(areSubstitutionConnectable(P(x), P(a))).toBe(true);
  });

  it("逆方向も検出する", () => {
    // P(a) → P(x) は可能（target→source）
    expect(areSubstitutionConnectable(P(a), P(x))).toBe(true);
  });

  it("双方向で代入不可の場合はfalse", () => {
    expect(areSubstitutionConnectable(P(a), Q(b))).toBe(false);
  });

  it("α等価はfalse（整理で扱うべき）", () => {
    expect(
      areSubstitutionConnectable(universal(x, P(x)), universal(y, P(y))),
    ).toBe(false);
  });

  it("相互に代入可能な場合もtrue", () => {
    // P(x) vs P(y) — 双方向で代入可能
    expect(areSubstitutionConnectable(P(x), P(y))).toBe(true);
  });
});
