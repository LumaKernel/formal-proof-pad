import { describe, it, expect } from "vitest";
import {
  type DeductionStyle,
  type NdRuleId,
  type DeductionSystem,
  nmSystem,
  njSystem,
  nkSystem,
  hilbertDeduction,
  naturalDeduction,
  getDeductionSystemName,
  getDeductionStyleLabel,
  isNdRuleEnabled,
  allNdRuleIds,
  getNdRuleDisplayName,
} from "./deductionSystem";
import { minimalLogicSystem, classicalLogicSystem } from "./inferenceRule";

// ── NM/NJ/NK体系のテスト ───────────────────────────────────

describe("NM (最小論理)", () => {
  it("名前が正しい", () => {
    expect(nmSystem.name).toBe("Natural Deduction NM");
  });

  it("基本規則9種を含む", () => {
    expect(nmSystem.rules.size).toBe(9);
  });

  it("→I, →E を含む", () => {
    expect(nmSystem.rules.has("implication-intro")).toBe(true);
    expect(nmSystem.rules.has("implication-elim")).toBe(true);
  });

  it("∧I, ∧E_L, ∧E_R を含む", () => {
    expect(nmSystem.rules.has("conjunction-intro")).toBe(true);
    expect(nmSystem.rules.has("conjunction-elim-left")).toBe(true);
    expect(nmSystem.rules.has("conjunction-elim-right")).toBe(true);
  });

  it("∨I_L, ∨I_R, ∨E を含む", () => {
    expect(nmSystem.rules.has("disjunction-intro-left")).toBe(true);
    expect(nmSystem.rules.has("disjunction-intro-right")).toBe(true);
    expect(nmSystem.rules.has("disjunction-elim")).toBe(true);
  });

  it("弱化を含む", () => {
    expect(nmSystem.rules.has("weakening")).toBe(true);
  });

  it("EFQを含まない", () => {
    expect(nmSystem.rules.has("efq")).toBe(false);
  });

  it("DNEを含まない", () => {
    expect(nmSystem.rules.has("dne")).toBe(false);
  });
});

describe("NJ (直観主義論理)", () => {
  it("名前が正しい", () => {
    expect(njSystem.name).toBe("Natural Deduction NJ");
  });

  it("NMの基本規則 + EFQ = 10種", () => {
    expect(njSystem.rules.size).toBe(10);
  });

  it("EFQを含む", () => {
    expect(njSystem.rules.has("efq")).toBe(true);
  });

  it("DNEを含まない", () => {
    expect(njSystem.rules.has("dne")).toBe(false);
  });

  it("NMの基本規則をすべて含む", () => {
    for (const rule of nmSystem.rules) {
      expect(njSystem.rules.has(rule)).toBe(true);
    }
  });
});

describe("NK (古典論理)", () => {
  it("名前が正しい", () => {
    expect(nkSystem.name).toBe("Natural Deduction NK");
  });

  it("NMの基本規則 + DNE = 10種", () => {
    expect(nkSystem.rules.size).toBe(10);
  });

  it("DNEを含む", () => {
    expect(nkSystem.rules.has("dne")).toBe(true);
  });

  it("EFQを含まない（NKではEFQは証明可能だが規則としては不要）", () => {
    expect(nkSystem.rules.has("efq")).toBe(false);
  });

  it("NMの基本規則をすべて含む", () => {
    for (const rule of nmSystem.rules) {
      expect(nkSystem.rules.has(rule)).toBe(true);
    }
  });
});

// ── DeductionSystem（統一型）のテスト ────────────────────────

describe("DeductionSystem", () => {
  it("hilbertDeduction でHilbert流体系を作成できる", () => {
    const ds = hilbertDeduction(minimalLogicSystem);
    expect(ds.style).toBe("hilbert");
    expect(ds.system).toBe(minimalLogicSystem);
  });

  it("naturalDeduction で自然演繹体系を作成できる", () => {
    const ds = naturalDeduction(nmSystem);
    expect(ds.style).toBe("natural-deduction");
    expect(ds.system).toBe(nmSystem);
  });

  it("getDeductionSystemName でHilbert流の名前を取得できる", () => {
    const ds = hilbertDeduction(classicalLogicSystem);
    expect(getDeductionSystemName(ds)).toBe("Classical Logic (HK)");
  });

  it("getDeductionSystemName で自然演繹の名前を取得できる", () => {
    const ds = naturalDeduction(njSystem);
    expect(getDeductionSystemName(ds)).toBe("Natural Deduction NJ");
  });
});

// ── DeductionStyleのテスト ──────────────────────────────────

describe("getDeductionStyleLabel", () => {
  it("hilbert → Hilbert流", () => {
    expect(getDeductionStyleLabel("hilbert")).toBe("Hilbert流");
  });

  it("natural-deduction → 自然演繹", () => {
    expect(getDeductionStyleLabel("natural-deduction")).toBe("自然演繹");
  });
});

// ── isNdRuleEnabled のテスト ────────────────────────────────

describe("isNdRuleEnabled", () => {
  it("NMでimplication-introは有効", () => {
    expect(isNdRuleEnabled(nmSystem, "implication-intro")).toBe(true);
  });

  it("NMでefqは無効", () => {
    expect(isNdRuleEnabled(nmSystem, "efq")).toBe(false);
  });

  it("NJでefqは有効", () => {
    expect(isNdRuleEnabled(njSystem, "efq")).toBe(true);
  });

  it("NKでdneは有効", () => {
    expect(isNdRuleEnabled(nkSystem, "dne")).toBe(true);
  });

  it("NKでefqは無効", () => {
    expect(isNdRuleEnabled(nkSystem, "efq")).toBe(false);
  });
});

// ── allNdRuleIds のテスト ───────────────────────────────────

describe("allNdRuleIds", () => {
  it("11種の規則IDを含む", () => {
    expect(allNdRuleIds).toHaveLength(11);
  });

  it("重複がない", () => {
    const unique = new Set(allNdRuleIds);
    expect(unique.size).toBe(allNdRuleIds.length);
  });

  it("NMの全規則を含む", () => {
    for (const rule of nmSystem.rules) {
      expect(allNdRuleIds).toContain(rule);
    }
  });

  it("efq と dne を含む", () => {
    expect(allNdRuleIds).toContain("efq");
    expect(allNdRuleIds).toContain("dne");
  });
});

// ── getNdRuleDisplayName のテスト ────────────────────────────

describe("getNdRuleDisplayName", () => {
  it("全規則の表示名が空でない", () => {
    for (const ruleId of allNdRuleIds) {
      const name = getNdRuleDisplayName(ruleId);
      expect(name).not.toBe("");
      expect(name.length).toBeGreaterThan(0);
    }
  });

  it("→導入の表示名", () => {
    expect(getNdRuleDisplayName("implication-intro")).toBe("→導入 (→I)");
  });

  it("→除去の表示名", () => {
    expect(getNdRuleDisplayName("implication-elim")).toBe("→除去 (→E)");
  });

  it("爆発律の表示名", () => {
    expect(getNdRuleDisplayName("efq")).toBe("爆発律 (EFQ)");
  });

  it("二重否定除去の表示名", () => {
    expect(getNdRuleDisplayName("dne")).toBe("二重否定除去 (DNE)");
  });

  it("弱化の表示名", () => {
    expect(getNdRuleDisplayName("weakening")).toBe("弱化 (w)");
  });
});

// ── 型の網羅性テスト ────────────────────────────────────────

describe("型の網羅性", () => {
  it("DeductionStyle の全バリアントを網羅している", () => {
    const styles: readonly DeductionStyle[] = ["hilbert", "natural-deduction"];
    // 全バリアントで getDeductionStyleLabel が動作する
    for (const style of styles) {
      expect(typeof getDeductionStyleLabel(style)).toBe("string");
    }
  });

  it("NdRuleId の全バリアントを網羅している", () => {
    // allNdRuleIds と getNdRuleDisplayName が全規則をカバー
    for (const ruleId of allNdRuleIds) {
      expect(typeof getNdRuleDisplayName(ruleId)).toBe("string");
    }
  });

  it("DeductionSystem の全バリアントを getDeductionSystemName が網羅している", () => {
    const systems: readonly DeductionSystem[] = [
      hilbertDeduction(minimalLogicSystem),
      naturalDeduction(nmSystem),
    ];
    for (const ds of systems) {
      expect(typeof getDeductionSystemName(ds)).toBe("string");
    }
  });
});
