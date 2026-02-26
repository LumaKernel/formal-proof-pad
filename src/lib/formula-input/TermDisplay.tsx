/**
 * Unicode 項レンダラー。
 *
 * Logic Core の Term AST を Unicode 文字列で表示する React コンポーネント。
 * Logic Lang の formatTerm() を使用して AST → Unicode 変換を行う。
 *
 * 変更時は TermDisplay.test.tsx, TermDisplay.stories.tsx, index.ts も同期すること。
 */

import type { CSSProperties } from "react";
import { useMemo } from "react";
import type { Term } from "../logic-core/term";
import { formatTerm } from "../logic-lang/formatUnicode";

export interface TermDisplayProps {
  /** 表示する項 AST */
  readonly term: Term;
  /** フォントサイズ (CSS値) */
  readonly fontSize?: CSSProperties["fontSize"];
  /** テキスト色 (CSS値) */
  readonly color?: CSSProperties["color"];
  /** 追加の className */
  readonly className?: string;
  /** 追加のスタイル */
  readonly style?: CSSProperties;
  /** data-testid */
  readonly testId?: string;
}

/**
 * Term AST を Unicode 文字列で表示するコンポーネント。
 *
 * 二項演算子（+, −, ×, ÷, ^）、関数適用、定数、変数を正しく表示し、
 * 最小限の括弧のみ使用する。
 */
export function TermDisplay({
  term,
  fontSize,
  color,
  className,
  style,
  testId,
}: TermDisplayProps) {
  const text = useMemo(() => formatTerm(term), [term]);

  const mergedStyle: CSSProperties = useMemo(
    () => ({
      fontFamily: "var(--font-formula)",
      fontStyle: "italic",
      whiteSpace: "nowrap",
      ...style,
      ...(fontSize !== undefined ? { fontSize } : {}),
      ...(color !== undefined ? { color } : {}),
    }),
    [style, fontSize, color],
  );

  return (
    <span
      className={className}
      style={mergedStyle}
      data-testid={testId}
      role="math"
      aria-label={text}
    >
      {text}
    </span>
  );
}
