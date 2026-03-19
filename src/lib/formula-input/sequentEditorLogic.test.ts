import { describe, it, expect } from "vitest";
import {
  splitSequentToLists,
  composeSequentText,
  isSequentEditorText,
} from "./sequentEditorLogic";

describe("splitSequentToLists", () => {
  it("splits standard sequent text", () => {
    expect(splitSequentToLists("φ, ψ ⇒ χ, δ")).toEqual({
      antecedents: ["φ", "ψ"],
      succedents: ["χ", "δ"],
    });
  });

  it("handles empty antecedents", () => {
    expect(splitSequentToLists("⇒ φ")).toEqual({
      antecedents: [],
      succedents: ["φ"],
    });
  });

  it("handles empty succedents", () => {
    expect(splitSequentToLists("φ ⇒")).toEqual({
      antecedents: ["φ"],
      succedents: [],
    });
  });

  it("handles both sides empty", () => {
    expect(splitSequentToLists("⇒")).toEqual({
      antecedents: [],
      succedents: [],
    });
  });

  it("handles spaces around ⇒", () => {
    expect(splitSequentToLists(" ⇒ ")).toEqual({
      antecedents: [],
      succedents: [],
    });
  });

  it("returns empty parts when no ⇒ present", () => {
    expect(splitSequentToLists("phi -> psi")).toEqual({
      antecedents: [],
      succedents: [],
    });
  });

  it("returns empty parts for empty string", () => {
    expect(splitSequentToLists("")).toEqual({
      antecedents: [],
      succedents: [],
    });
  });

  it("handles complex formulas with arrows", () => {
    expect(splitSequentToLists("phi -> psi ⇒ psi -> chi")).toEqual({
      antecedents: ["phi -> psi"],
      succedents: ["psi -> chi"],
    });
  });

  it("handles multiple formulas on both sides", () => {
    expect(splitSequentToLists("phi -> psi, psi -> chi, phi ⇒ chi")).toEqual({
      antecedents: ["phi -> psi", "psi -> chi", "phi"],
      succedents: ["chi"],
    });
  });
});

describe("composeSequentText", () => {
  it("composes standard sequent", () => {
    expect(
      composeSequentText({ antecedents: ["φ", "ψ"], succedents: ["χ"] }),
    ).toBe("φ, ψ ⇒ χ");
  });

  it("composes with empty antecedents", () => {
    expect(composeSequentText({ antecedents: [], succedents: ["φ"] })).toBe(
      " ⇒ φ",
    );
  });

  it("composes with empty succedents", () => {
    expect(composeSequentText({ antecedents: ["φ"], succedents: [] })).toBe(
      "φ ⇒ ",
    );
  });

  it("composes both sides empty", () => {
    expect(composeSequentText({ antecedents: [], succedents: [] })).toBe(" ⇒ ");
  });

  it("filters out empty strings", () => {
    expect(
      composeSequentText({
        antecedents: ["φ", "", "ψ"],
        succedents: ["", "χ"],
      }),
    ).toBe("φ, ψ ⇒ χ");
  });

  it("trims whitespace", () => {
    expect(
      composeSequentText({ antecedents: [" φ "], succedents: [" ψ "] }),
    ).toBe("φ ⇒ ψ");
  });
});

describe("isSequentEditorText", () => {
  it("returns true for text with ⇒", () => {
    expect(isSequentEditorText("⇒ phi")).toBe(true);
    expect(isSequentEditorText("phi ⇒ psi")).toBe(true);
  });

  it("returns false for text without ⇒", () => {
    expect(isSequentEditorText("phi -> psi")).toBe(false);
    expect(isSequentEditorText("")).toBe(false);
  });
});
