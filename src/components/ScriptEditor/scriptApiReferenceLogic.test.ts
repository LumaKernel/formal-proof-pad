import { describe, it, expect } from "vitest";
import {
  API_CATEGORIES,
  filterApis,
  filterCategories,
  getTotalApiCount,
} from "./scriptApiReferenceLogic";
import {
  PROOF_BRIDGE_API_DEFS,
  WORKSPACE_BRIDGE_API_DEFS,
  CUT_ELIMINATION_BRIDGE_API_DEFS,
} from "@/lib/script-runner";

describe("API_CATEGORIES", () => {
  it("3カテゴリが定義されている", () => {
    expect(API_CATEGORIES).toHaveLength(3);
  });

  it("各カテゴリに正しいAPI定義が含まれる", () => {
    const proof = API_CATEGORIES.find((c) => c.id === "proof");
    const workspace = API_CATEGORIES.find((c) => c.id === "workspace");
    const cutElim = API_CATEGORIES.find((c) => c.id === "cutElimination");

    expect(proof?.apis).toBe(PROOF_BRIDGE_API_DEFS);
    expect(workspace?.apis).toBe(WORKSPACE_BRIDGE_API_DEFS);
    expect(cutElim?.apis).toBe(CUT_ELIMINATION_BRIDGE_API_DEFS);
  });

  it("各カテゴリにlabelとdescriptionがある", () => {
    for (const cat of API_CATEGORIES) {
      expect(cat.label).toBeTruthy();
      expect(cat.description).toBeTruthy();
    }
  });
});

describe("filterApis", () => {
  it("空クエリで全件返す", () => {
    expect(filterApis(PROOF_BRIDGE_API_DEFS, "")).toBe(PROOF_BRIDGE_API_DEFS);
    expect(filterApis(PROOF_BRIDGE_API_DEFS, "  ")).toBe(PROOF_BRIDGE_API_DEFS);
  });

  it("関数名で部分一致検索できる", () => {
    const result = filterApis(PROOF_BRIDGE_API_DEFS, "parse");
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((api) => api.name.toLowerCase().includes("parse")),
    ).toBe(true);
  });

  it("大文字小文字を無視する", () => {
    const lower = filterApis(PROOF_BRIDGE_API_DEFS, "formula");
    const upper = filterApis(PROOF_BRIDGE_API_DEFS, "FORMULA");
    expect(lower).toEqual(upper);
  });

  it("signatureで検索できる", () => {
    const result = filterApis(PROOF_BRIDGE_API_DEFS, "boolean");
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.some((api) => api.signature.toLowerCase().includes("boolean")),
    ).toBe(true);
  });

  it("descriptionで検索できる", () => {
    const result = filterApis(WORKSPACE_BRIDGE_API_DEFS, "ノード");
    expect(result.length).toBeGreaterThan(0);
  });

  it("マッチなしで空配列を返す", () => {
    const result = filterApis(PROOF_BRIDGE_API_DEFS, "xyznonexistent");
    expect(result).toHaveLength(0);
  });
});

describe("filterCategories", () => {
  it("空クエリで全カテゴリ返す", () => {
    expect(filterCategories(API_CATEGORIES, "")).toBe(API_CATEGORIES);
  });

  it("マッチするカテゴリのみ返す", () => {
    const result = filterCategories(API_CATEGORIES, "カット");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((cat) => cat.apis.length > 0)).toBe(true);
    // "カット" はカット除去カテゴリにマッチするはず
    expect(result.some((cat) => cat.id === "cutElimination")).toBe(true);
  });

  it("全カテゴリからマッチなしで空配列を返す", () => {
    const result = filterCategories(API_CATEGORIES, "xyznonexistent");
    expect(result).toHaveLength(0);
  });

  it("複数カテゴリにマッチできる", () => {
    // "formula" は proof と workspace の両方にマッチしうる
    const result = filterCategories(API_CATEGORIES, "formula");
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe("getTotalApiCount", () => {
  it("全APIの合計数を返す", () => {
    const total = getTotalApiCount(API_CATEGORIES);
    expect(total).toBe(
      PROOF_BRIDGE_API_DEFS.length +
        WORKSPACE_BRIDGE_API_DEFS.length +
        CUT_ELIMINATION_BRIDGE_API_DEFS.length,
    );
  });

  it("空カテゴリで0を返す", () => {
    expect(getTotalApiCount([])).toBe(0);
  });
});
