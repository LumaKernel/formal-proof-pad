import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  biconditional,
  conjunction,
  disjunction,
  equality,
  existential,
  implication,
  metaVariable,
  negation,
  predicate,
  universal,
} from "../logic-core/formula";
import {
  binaryOperation,
  constant,
  functionApplication,
  termVariable,
} from "../logic-core/term";
import { FormulaKaTeX } from "./FormulaKaTeX";

describe("FormulaKaTeX", () => {
  describe("基本的なレンダリング", () => {
    it("メタ変数 φ を KaTeX でレンダリングする", () => {
      render(<FormulaKaTeX formula={metaVariable("φ")} testId="katex" />);
      const el = screen.getByTestId("katex");
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute("role", "math");
      expect(el).toHaveAttribute("aria-label", "\\varphi");
    });

    it("KaTeX の .katex クラスが出力に含まれる", () => {
      render(<FormulaKaTeX formula={metaVariable("φ")} testId="katex" />);
      const el = screen.getByTestId("katex");
      expect(el.querySelector(".katex")).not.toBeNull();
    });

    it("添字付きメタ変数 φ₁ を KaTeX でレンダリングする", () => {
      render(<FormulaKaTeX formula={metaVariable("φ", "1")} testId="katex" />);
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "\\varphi_{1}");
      expect(el.querySelector(".katex")).not.toBeNull();
    });

    it("否定 ¬φ をレンダリングする", () => {
      render(
        <FormulaKaTeX formula={negation(metaVariable("φ"))} testId="katex" />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "\\lnot \\varphi");
    });

    it("含意 φ → ψ をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={implication(metaVariable("φ"), metaVariable("ψ"))}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "\\varphi \\to \\psi");
    });

    it("連言 φ ∧ ψ をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={conjunction(metaVariable("φ"), metaVariable("ψ"))}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "\\varphi \\land \\psi");
    });

    it("選言 φ ∨ ψ をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={disjunction(metaVariable("φ"), metaVariable("ψ"))}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "\\varphi \\lor \\psi");
    });

    it("双条件 φ ↔ ψ をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={biconditional(metaVariable("φ"), metaVariable("ψ"))}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute(
        "aria-label",
        "\\varphi \\leftrightarrow \\psi",
      );
    });

    it("全称量化 ∀x.φ をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={universal(termVariable("x"), metaVariable("φ"))}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "\\forall x . \\varphi");
    });

    it("存在量化 ∃x.φ をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={existential(termVariable("x"), metaVariable("φ"))}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "\\exists x . \\varphi");
    });

    it("述語 P(x, y) をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={predicate("P", [termVariable("x"), termVariable("y")])}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "P\\left(x, y\\right)");
    });

    it("等号 x = y をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={equality(termVariable("x"), termVariable("y"))}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "x = y");
    });
  });

  describe("表示モード", () => {
    it("デフォルトはインラインモード", () => {
      render(<FormulaKaTeX formula={metaVariable("φ")} testId="katex" />);
      const el = screen.getByTestId("katex");
      // インラインモードでは .katex-display クラスがない
      expect(el.querySelector(".katex-display")).toBeNull();
    });

    it("displayMode=true でブロックモードになる", () => {
      render(
        <FormulaKaTeX
          formula={metaVariable("φ")}
          displayMode={true}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      // ブロックモードでは .katex-display クラスがある
      expect(el.querySelector(".katex-display")).not.toBeNull();
    });
  });

  describe("複合式", () => {
    it("K公理: φ → (ψ → φ) をレンダリングする", () => {
      const phi = metaVariable("φ");
      const psi = metaVariable("ψ");
      render(
        <FormulaKaTeX
          formula={implication(phi, implication(psi, phi))}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute(
        "aria-label",
        "\\varphi \\to \\psi \\to \\varphi",
      );
      expect(el.querySelector(".katex")).not.toBeNull();
    });

    it("等号+二項演算: x + 0 = x をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={equality(
            binaryOperation("+", termVariable("x"), constant("0")),
            termVariable("x"),
          )}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute("aria-label", "x + 0 = x");
    });

    it("関数適用を含む式をレンダリングする", () => {
      render(
        <FormulaKaTeX
          formula={equality(
            functionApplication("f", [termVariable("x")]),
            functionApplication("g", [termVariable("y")]),
          )}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveAttribute(
        "aria-label",
        "f\\left(x\\right) = g\\left(y\\right)",
      );
    });
  });

  describe("スタイルprops", () => {
    it("fontSize を適用する", () => {
      render(
        <FormulaKaTeX
          formula={metaVariable("φ")}
          fontSize={24}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el.style.fontSize).toBe("24px");
    });

    it("className を適用する", () => {
      render(
        <FormulaKaTeX
          formula={metaVariable("φ")}
          className="custom-class"
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el).toHaveClass("custom-class");
    });

    it("追加 style を適用する", () => {
      render(
        <FormulaKaTeX
          formula={metaVariable("φ")}
          style={{ letterSpacing: 2 }}
          testId="katex"
        />,
      );
      const el = screen.getByTestId("katex");
      expect(el.style.letterSpacing).toBe("2px");
    });
  });
});
