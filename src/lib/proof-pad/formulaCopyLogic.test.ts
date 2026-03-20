import { describe, expect, it } from "vitest";
import { formatForCopy, getAllFormulaCopyFormats } from "./formulaCopyLogic";

describe("formulaCopyLogic", () => {
  describe("formatForCopy", () => {
    describe("ascii format", () => {
      it("formulaText をそのまま返す", () => {
        const result = formatForCopy("phi -> psi", "ascii");
        expect(result).toEqual({ success: true, text: "phi -> psi" });
      });

      it("空文字列でも成功する", () => {
        const result = formatForCopy("", "ascii");
        expect(result).toEqual({ success: true, text: "" });
      });

      it("不正な構文でもそのまま返す", () => {
        const result = formatForCopy("-> ->", "ascii");
        expect(result).toEqual({ success: true, text: "-> ->" });
      });
    });

    describe("unicode format", () => {
      it("含意をUnicode記号で返す", () => {
        const result = formatForCopy("phi -> psi", "unicode");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toContain("→");
        }
      });

      it("論理積をUnicode記号で返す", () => {
        const result = formatForCopy("phi /\\ psi", "unicode");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toContain("∧");
        }
      });

      it("全称量化をUnicode記号で返す", () => {
        const result = formatForCopy("all x. P(x)", "unicode");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toContain("∀");
        }
      });

      it("パース失敗時はsuccessがfalse", () => {
        const result = formatForCopy("-> ->", "unicode");
        expect(result).toEqual({ success: false });
      });

      it("空文字列はパース失敗", () => {
        const result = formatForCopy("", "unicode");
        expect(result).toEqual({ success: false });
      });
    });

    describe("latex format", () => {
      it("含意をLaTeXコマンドで返す", () => {
        const result = formatForCopy("phi -> psi", "latex");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toContain("\\to");
        }
      });

      it("論理積をLaTeXコマンドで返す", () => {
        const result = formatForCopy("phi /\\ psi", "latex");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toContain("\\land");
        }
      });

      it("否定をLaTeXコマンドで返す", () => {
        const result = formatForCopy("~phi", "latex");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.text).toContain("\\lnot");
        }
      });

      it("パース失敗時はsuccessがfalse", () => {
        const result = formatForCopy("-> ->", "latex");
        expect(result).toEqual({ success: false });
      });
    });
  });

  describe("getAllFormulaCopyFormats", () => {
    it("有効な論理式で全フォーマット成功", () => {
      const results = getAllFormulaCopyFormats("phi -> psi");
      expect(results.unicode.success).toBe(true);
      expect(results.ascii.success).toBe(true);
      expect(results.latex.success).toBe(true);
    });

    it("不正な論理式ではunicode/latexが失敗、asciiは成功", () => {
      const results = getAllFormulaCopyFormats("-> ->");
      expect(results.unicode.success).toBe(false);
      expect(results.ascii).toEqual({ success: true, text: "-> ->" });
      expect(results.latex.success).toBe(false);
    });

    it("各フォーマットが異なるテキストを返す", () => {
      const results = getAllFormulaCopyFormats("phi -> psi");
      if (results.unicode.success && results.latex.success) {
        expect(results.unicode.text).not.toBe(results.ascii);
        expect(results.latex.text).not.toBe(results.unicode.text);
      }
    });
  });
});
