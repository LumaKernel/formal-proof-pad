import { describe, it, expect } from "vitest";
import { getTabRuleReferenceEntryId } from "./tabRuleReferenceLogic";
import { allTabRuleIds } from "../logic-core/tableauCalculus";
import { findEntryById } from "../reference/referenceEntry";
import { allReferenceEntries } from "../reference/referenceContent";

describe("getTabRuleReferenceEntryId", () => {
  it("全TAB規則IDに対してリファレンスエントリIDを返す", () => {
    for (const ruleId of allTabRuleIds) {
      const entryId = getTabRuleReferenceEntryId(ruleId);
      expect(entryId).toBeDefined();
      expect(entryId).toMatch(/^rule-tab-/);
    }
  });

  it("返されたエントリIDがreferenceContentに存在する", () => {
    for (const ruleId of allTabRuleIds) {
      const entryId = getTabRuleReferenceEntryId(ruleId);
      expect(entryId).toBeDefined();
      const entry = findEntryById(allReferenceEntries, entryId!);
      expect(entry).toBeDefined();
      expect(entry?.category).toBe("inference-rule");
    }
  });

  it("bs → rule-tab-bs", () => {
    expect(getTabRuleReferenceEntryId("bs")).toBe("rule-tab-bs");
  });

  it("conjunction → rule-tab-conjunction", () => {
    expect(getTabRuleReferenceEntryId("conjunction")).toBe(
      "rule-tab-conjunction",
    );
  });

  it("neg-universal → rule-tab-neg-universal", () => {
    expect(getTabRuleReferenceEntryId("neg-universal")).toBe(
      "rule-tab-neg-universal",
    );
  });
});
