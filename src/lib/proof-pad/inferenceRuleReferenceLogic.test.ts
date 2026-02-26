import { describe, it, expect } from "vitest";
import { getInferenceRuleReferenceEntryId } from "./inferenceRuleReferenceLogic";

describe("getInferenceRuleReferenceEntryId", () => {
  it("mp → rule-mp", () => {
    expect(getInferenceRuleReferenceEntryId("mp")).toBe("rule-mp");
  });

  it("gen → rule-gen", () => {
    expect(getInferenceRuleReferenceEntryId("gen")).toBe("rule-gen");
  });

  it("未知のIDはundefined", () => {
    expect(getInferenceRuleReferenceEntryId("unknown")).toBeUndefined();
  });

  it("空文字列はundefined", () => {
    expect(getInferenceRuleReferenceEntryId("")).toBeUndefined();
  });
});
