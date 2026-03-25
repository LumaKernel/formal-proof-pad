/**
 * エラーハイライトテキストのレンダリング関数。
 *
 * FormulaExpandedEditor / TermExpandedEditor が共有。
 * テキスト上のエラー位置をハイライト表示する。
 *
 * 変更時は FormulaExpandedEditor.test.tsx, TermExpandedEditor.test.tsx も同期すること。
 */

import type React from "react";
import {
  highlightMarkStyle,
  transparentTextStyle,
} from "./expandedEditorStyles";

export function renderHighlightedText(
  text: string,
  highlights: ReadonlyArray<{ readonly start: number; readonly end: number }>,
): readonly React.ReactNode[] {
  /* v8 ignore start -- defensive */
  if (highlights.length === 0) {
    return [
      <span key="text" style={transparentTextStyle}>
        {text}
      </span>,
    ];
  }
  /* v8 ignore stop */

  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const h of sorted) {
    const last = merged[merged.length - 1];
    /* v8 ignore start -- highlight merge overlap rare */
    if (last && h.start <= last.end) {
      merged[merged.length - 1] = {
        start: last.start,
        end: Math.max(last.end, h.end),
      };
    } else {
      /* v8 ignore stop */
      merged.push({ ...h });
    }
  }

  const parts: React.ReactNode[] = [];
  let pos = 0;

  for (const h of merged) {
    if (pos < h.start) {
      parts.push(
        <span
          key={`t-${`${pos satisfies number}` satisfies string}`}
          style={transparentTextStyle}
        >
          {text.slice(pos, h.start)}
        </span>,
      );
    }
    parts.push(
      <mark
        key={`h-${`${h.start satisfies number}` satisfies string}`}
        style={highlightMarkStyle}
      >
        {text.slice(h.start, h.end)}
      </mark>,
    );
    pos = h.end;
  }

  /* v8 ignore start -- 防御的: ハイライトがテキスト末尾まで伸びない場合の残りテキスト */
  if (pos < text.length) {
    parts.push(
      <span
        key={`t-${`${pos satisfies number}` satisfies string}`}
        style={transparentTextStyle}
      >
        {text.slice(pos)}
      </span>,
    );
  }
  /* v8 ignore stop */

  return parts;
}
