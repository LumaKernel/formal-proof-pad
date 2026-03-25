import { describe, it, expect } from "vitest";
import {
  shouldShowLandingPage,
  updateHasEverHadNotebooks,
  recommendedQuestIds,
} from "./landingPageLogic";

describe("shouldShowLandingPage", () => {
  it("ノートブック0件 + セッション中にノートなし + 未遷移 → ランディング表示", () => {
    expect(shouldShowLandingPage(0, false, false)).toBe(true);
  });

  it("ノートブック1件以上 → ランディング非表示", () => {
    expect(shouldShowLandingPage(1, false, false)).toBe(false);
    expect(shouldShowLandingPage(5, false, false)).toBe(false);
  });

  it("ノートブック0件 + セッション中にノートあった → ランディング非表示", () => {
    expect(shouldShowLandingPage(0, true, false)).toBe(false);
  });

  it("ノートブック1件以上 + セッション中にノートあった → ランディング非表示", () => {
    expect(shouldShowLandingPage(3, true, false)).toBe(false);
  });

  it("セッション中にタブ遷移済み → ノート0件でもランディング非表示", () => {
    expect(shouldShowLandingPage(0, false, true)).toBe(false);
  });

  it("セッション中にタブ遷移済み + ノートあった → ランディング非表示", () => {
    expect(shouldShowLandingPage(0, true, true)).toBe(false);
  });

  it("セッション中にタブ遷移済み + ノート1件以上 → ランディング非表示", () => {
    expect(shouldShowLandingPage(3, false, true)).toBe(false);
  });
});

describe("updateHasEverHadNotebooks", () => {
  it("初期false + ノート0件 → false", () => {
    expect(updateHasEverHadNotebooks(false, 0)).toBe(false);
  });

  it("初期false + ノート1件以上 → true", () => {
    expect(updateHasEverHadNotebooks(false, 1)).toBe(true);
    expect(updateHasEverHadNotebooks(false, 5)).toBe(true);
  });

  it("初期true → 常にtrue（ノート数に関係なく）", () => {
    expect(updateHasEverHadNotebooks(true, 0)).toBe(true);
    expect(updateHasEverHadNotebooks(true, 3)).toBe(true);
  });
});

describe("recommendedQuestIds", () => {
  it("推奨クエストが定義されている", () => {
    expect(recommendedQuestIds.length).toBeGreaterThan(0);
  });

  it("すべてのIDが文字列", () => {
    for (const id of recommendedQuestIds) {
      expect(typeof id).toBe("string");
    }
  });
});
