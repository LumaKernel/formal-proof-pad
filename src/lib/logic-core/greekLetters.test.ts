import { describe, it, expect } from "vitest";
import {
  greekLetters,
  greekLetterNames,
  isGreekLetter,
  isValidSubscript,
} from "./greekLetters";

describe("greekLetters", () => {
  it("contains 23 letters (omicron excluded)", () => {
    expect(greekLetters).toHaveLength(23);
  });

  it("does not include omicron (ο)", () => {
    expect(greekLetters).not.toContain("ο");
  });

  it("includes common letters used as meta variables", () => {
    expect(greekLetters).toContain("φ");
    expect(greekLetters).toContain("ψ");
    expect(greekLetters).toContain("χ");
    expect(greekLetters).toContain("α");
    expect(greekLetters).toContain("ω");
  });
});

describe("greekLetterNames", () => {
  it("maps ASCII names to Greek letters", () => {
    expect(greekLetterNames.get("phi")).toBe("φ");
    expect(greekLetterNames.get("psi")).toBe("ψ");
    expect(greekLetterNames.get("chi")).toBe("χ");
    expect(greekLetterNames.get("alpha")).toBe("α");
    expect(greekLetterNames.get("omega")).toBe("ω");
  });

  it("has the same count as greekLetters", () => {
    expect(greekLetterNames.size).toBe(greekLetters.length);
  });

  it("returns undefined for invalid names", () => {
    expect(greekLetterNames.get("omicron")).toBeUndefined();
    expect(greekLetterNames.get("foo")).toBeUndefined();
  });
});

describe("isGreekLetter", () => {
  it("returns true for valid Greek letters", () => {
    expect(isGreekLetter("φ")).toBe(true);
    expect(isGreekLetter("ψ")).toBe(true);
    expect(isGreekLetter("α")).toBe(true);
  });

  it("returns false for omicron", () => {
    expect(isGreekLetter("ο")).toBe(false);
  });

  it("returns false for non-Greek characters", () => {
    expect(isGreekLetter("a")).toBe(false);
    expect(isGreekLetter("X")).toBe(false);
    expect(isGreekLetter("1")).toBe(false);
    expect(isGreekLetter("")).toBe(false);
  });
});

describe("isValidSubscript", () => {
  it("accepts single digits (0-9)", () => {
    for (let i = 0; i <= 9; i++) {
      expect(isValidSubscript(String(i))).toBe(true);
    }
  });

  it("accepts two-digit subscripts (00-99)", () => {
    expect(isValidSubscript("00")).toBe(true);
    expect(isValidSubscript("01")).toBe(true);
    expect(isValidSubscript("99")).toBe(true);
    expect(isValidSubscript("42")).toBe(true);
  });

  it("accepts three-digit subscripts (000-999)", () => {
    expect(isValidSubscript("000")).toBe(true);
    expect(isValidSubscript("001")).toBe(true);
    expect(isValidSubscript("999")).toBe(true);
    expect(isValidSubscript("123")).toBe(true);
  });

  it("rejects four or more digits", () => {
    expect(isValidSubscript("1000")).toBe(false);
    expect(isValidSubscript("0000")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidSubscript("")).toBe(false);
  });

  it("rejects non-digit characters", () => {
    expect(isValidSubscript("a")).toBe(false);
    expect(isValidSubscript("1a")).toBe(false);
    expect(isValidSubscript("abc")).toBe(false);
  });

  it("distinguishes '1' from '01' from '001'", () => {
    expect(isValidSubscript("1")).toBe(true);
    expect(isValidSubscript("01")).toBe(true);
    expect(isValidSubscript("001")).toBe(true);
    // All valid but they are distinct strings
    expect("1").not.toBe("01");
    expect("01").not.toBe("001");
  });
});
