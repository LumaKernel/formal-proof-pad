/**
 * KaTeX 論理式レンダラー。
 *
 * Logic Core の Formula AST を KaTeX で美しくレンダリングする React コンポーネント。
 * Logic Lang の formatFormulaLaTeX() を使用して AST → LaTeX 変換を行い、
 * KaTeX の renderToString() で HTML に変換する。
 *
 * 変更時は FormulaKaTeX.test.tsx, FormulaKaTeX.stories.tsx, index.ts も同期すること。
 */

import type { CSSProperties } from "react";
import { useMemo } from "react";
import katex from "katex";
import type { Formula } from "../logic-core/formula";
import { formatFormulaLaTeX } from "../logic-lang/formatLaTeX";

export interface FormulaKaTeXProps {
  /** 表示する論理式 AST */
  readonly formula: Formula;
  /** 表示モード: inline($...$相当) or block($$...$$相当) */
  readonly displayMode?: boolean;
  /** フォントサイズ (CSS値) */
  readonly fontSize?: CSSProperties["fontSize"];
  /** 追加の className */
  readonly className?: string;
  /** 追加のスタイル */
  readonly style?: CSSProperties;
  /** data-testid */
  readonly testId?: string;
}

/**
 * Formula AST を KaTeX で数式レンダリングするコンポーネント。
 *
 * LaTeX文字列を KaTeX の renderToString() で HTML に変換し、
 * インラインモード/ブロックモードの切替が可能。
 */
export function FormulaKaTeX({
  formula,
  displayMode = false,
  fontSize,
  className,
  style,
  testId,
}: FormulaKaTeXProps) {
  const latex = useMemo(() => formatFormulaLaTeX(formula), [formula]);

  const html = useMemo(
    () =>
      katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        output: "htmlAndMathml",
      }),
    [latex, displayMode],
  );

  const mergedStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      ...(fontSize !== undefined ? { fontSize } : {}),
    }),
    [style, fontSize],
  );

  return (
    <span
      className={className}
      style={mergedStyle}
      data-testid={testId}
      role="math"
      aria-label={latex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
