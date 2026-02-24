/**
 * KaTeX 項レンダラー。
 *
 * Logic Core の Term AST を KaTeX で美しくレンダリングする React コンポーネント。
 * Logic Lang の formatTermLaTeX() を使用して AST → LaTeX 変換を行い、
 * KaTeX の renderToString() で HTML に変換する。
 *
 * 変更時は TermKaTeX.test.tsx, TermKaTeX.stories.tsx, index.ts も同期すること。
 */

import type { CSSProperties } from "react";
import { useMemo } from "react";
import katex from "katex";
import type { Term } from "../logic-core/term";
import { formatTermLaTeX } from "../logic-lang/formatLaTeX";

export interface TermKaTeXProps {
  /** 表示する項 AST */
  readonly term: Term;
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
 * Term AST を KaTeX で数式レンダリングするコンポーネント。
 *
 * LaTeX文字列を KaTeX の renderToString() で HTML に変換し、
 * インラインモード/ブロックモードの切替が可能。
 */
export function TermKaTeX({
  term,
  displayMode = false,
  fontSize,
  className,
  style,
  testId,
}: TermKaTeXProps) {
  const latex = useMemo(() => formatTermLaTeX(term), [term]);

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
