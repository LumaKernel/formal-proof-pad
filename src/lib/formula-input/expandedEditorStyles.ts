/**
 * FormulaExpandedEditor / TermExpandedEditor が共有するスタイル定数。
 *
 * テキストエリア、ハイライトオーバーレイ、プレビュー、エラー表示のスタイルを集約。
 * BaseExpandedEditor のオーバーレイ/モーダル/ヘッダースタイルは BaseExpandedEditor.tsx に定義。
 *
 * 変更時は FormulaExpandedEditor, TermExpandedEditor も同期すること。
 */

import type { CSSProperties } from "react";

export const textareaContainerStyle: CSSProperties = {
  position: "relative",
};

export const textareaBaseStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--font-size-base, 14px)",
  padding: "12px",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--color-border, #ccc)",
  borderRadius: 8,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "var(--color-surface, #ffffff)",
  color: "var(--color-text-primary, #171717)",
  resize: "vertical",
  minHeight: 120,
  lineHeight: 1.6,
};

export const textareaErrorStyle: CSSProperties = {
  ...textareaBaseStyle,
  borderColor: "var(--color-error, #e53e3e)",
  boxShadow: "0 0 0 1px var(--color-error, #e53e3e)",
};

export const highlightOverlayStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  fontFamily: "var(--font-mono)",
  fontSize: "var(--font-size-base, 14px)",
  padding: "12px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  pointerEvents: "none",
  overflow: "hidden",
  lineHeight: 1.6,
  borderRadius: 8,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "transparent",
};

export const previewSectionStyle: CSSProperties = {
  padding: "12px",
  backgroundColor: "var(--color-bg-secondary, #f7fafc)",
  borderRadius: 8,
  minHeight: 32,
};

export const previewLabelStyle: CSSProperties = {
  fontSize: "var(--font-size-xs, 11px)",
  color: "var(--color-text-tertiary, #767676)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export const errorContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

export const errorMessageStyle: CSSProperties = {
  color: "var(--color-error-text, #991b1b)",
  fontSize: "0.85em",
  fontFamily: "var(--font-mono)",
};

export const highlightMarkStyle: CSSProperties = {
  backgroundColor: "var(--color-error-bg, rgba(229, 62, 62, 0.3))",
  textDecoration: "underline",
  textDecorationColor: "var(--color-error, #e53e3e)",
  textDecorationStyle: "wavy",
  color: "var(--color-error-text, #991b1b)",
};

export const transparentTextStyle: CSSProperties = {
  color: "transparent",
};

export const textareaOverlayActiveStyle: CSSProperties = {
  backgroundColor: "transparent",
  color: "transparent",
  caretColor: "var(--color-text-primary, #171717)",
};

export const emptyPreviewStyle: CSSProperties = {
  color: "var(--color-text-tertiary, #767676)",
  fontStyle: "italic",
};
