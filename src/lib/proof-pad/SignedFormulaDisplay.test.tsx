import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SignedFormulaDisplay } from "./SignedFormulaDisplay";

describe("SignedFormulaDisplay", () => {
  describe("パース成功 (T符号)", () => {
    it("T:φ を正しく表示する", () => {
      render(<SignedFormulaDisplay text="T:φ" testId="sf" />);
      const el = screen.getByTestId("sf");
      expect(el).toHaveAttribute("role", "math");
      expect(el).toHaveAttribute("aria-label", "T:φ");
      // 符号バッジ
      const sign = screen.getByTestId("sf-sign");
      expect(sign).toHaveTextContent("T");
      // 論理式（parsed slot → FormulaDisplay）
      const formula = screen.getByTestId("sf-formula");
      expect(formula).toHaveAttribute("role", "math");
      expect(formula).toHaveTextContent("φ");
    });
  });

  describe("パース成功 (F符号)", () => {
    it("F:ψ を正しく表示する", () => {
      render(<SignedFormulaDisplay text="F:ψ" testId="sf" />);
      const sign = screen.getByTestId("sf-sign");
      expect(sign).toHaveTextContent("F");
      const formula = screen.getByTestId("sf-formula");
      expect(formula).toHaveTextContent("ψ");
    });
  });

  describe("パース失敗（フォールバック）", () => {
    it("非署名テキストはプレーンテキスト表示", () => {
      render(<SignedFormulaDisplay text="plain text" testId="sf" />);
      const el = screen.getByTestId("sf");
      expect(el).not.toHaveAttribute("role", "math");
      expect(el).toHaveTextContent("plain text");
    });
  });

  describe("formulaSlot text fallback", () => {
    it("パース不能な論理式はテキスト表示", () => {
      render(<SignedFormulaDisplay text="T:???" testId="sf" />);
      const el = screen.getByTestId("sf");
      expect(el).toHaveAttribute("role", "math");
      // formula slot が text → span（role="math" なし）
      const formula = screen.getByTestId("sf-formula");
      expect(formula).not.toHaveAttribute("role", "math");
      expect(formula).toHaveTextContent("???");
    });
  });

  describe("スタイル props", () => {
    it("fontSize/color をパース成功時に適用", () => {
      render(
        <SignedFormulaDisplay
          text="T:φ"
          fontSize={24}
          color="green"
          testId="sf"
        />,
      );
      const el = screen.getByTestId("sf");
      expect(el.style.fontSize).toBe("24px");
      expect(el.style.color).toBe("green");
    });

    it("fontSize/color をパース失敗時に適用", () => {
      render(
        <SignedFormulaDisplay
          text="plain"
          fontSize={18}
          color="red"
          testId="sf"
        />,
      );
      const el = screen.getByTestId("sf");
      expect(el.style.fontSize).toBe("18px");
      expect(el.style.color).toBe("red");
    });

    it("fontSize/color 未指定でもレンダリングされる", () => {
      render(<SignedFormulaDisplay text="T:φ" testId="sf" />);
      const el = screen.getByTestId("sf");
      expect(el.style.fontSize).toBe("");
      expect(el.style.color).toBe("");
    });

    it("fontSize/color 未指定でパース失敗フォールバック", () => {
      render(<SignedFormulaDisplay text="plain" testId="sf" />);
      const el = screen.getByTestId("sf");
      expect(el.style.fontSize).toBe("");
      expect(el.style.color).toBe("");
    });
  });

  describe("testId 分岐", () => {
    it("testId 未指定でもレンダリングされる", () => {
      const { container } = render(<SignedFormulaDisplay text="T:φ" />);
      const el = container.querySelector("[role='math']");
      expect(el).not.toBeNull();
      expect(el).not.toHaveAttribute("data-testid");
    });

    it("testId 未指定でパース失敗時もレンダリングされる", () => {
      const { container } = render(<SignedFormulaDisplay text="plain" />);
      expect(container.textContent).toBe("plain");
    });

    it("testId 未指定でテキストフォールバック論理式もレンダリングされる", () => {
      const { container } = render(<SignedFormulaDisplay text="T:???" />);
      expect(container.textContent).toContain("???");
    });
  });

  describe("text slot のスタイル props", () => {
    it("fontSize/color をテキストフォールバック論理式に適用", () => {
      render(
        <SignedFormulaDisplay
          text="T:???"
          fontSize={16}
          color="purple"
          testId="sf"
        />,
      );
      const formula = screen.getByTestId("sf-formula");
      expect(formula.style.fontSize).toBe("16px");
      expect(formula.style.color).toBe("purple");
    });

    it("fontSize/color 未指定のテキストフォールバック論理式", () => {
      render(<SignedFormulaDisplay text="T:???" testId="sf" />);
      const formula = screen.getByTestId("sf-formula");
      expect(formula.style.fontSize).toBe("");
      expect(formula.style.color).toBe("");
    });
  });
});
