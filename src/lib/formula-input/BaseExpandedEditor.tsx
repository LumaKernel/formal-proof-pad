/**
 * 拡大編集モーダルの共通シェルコンポーネント。
 *
 * オーバーレイ描画、モーダルコンテナ、ヘッダー（タイトル + 構文ヘルプ + 閉じるボタン）、
 * Escape/overlay click によるクローズロジックを一箇所に集約する。
 *
 * FormulaExpandedEditor / TermExpandedEditor / SequentExpandedEditor が
 * このコンポーネントを使い、エディタ本体（children）のみを実装する。
 *
 * 変更時は BaseExpandedEditor.test.tsx, FormulaExpandedEditor, TermExpandedEditor,
 * SequentExpandedEditor も同期すること。
 */

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// --- Props ---

export interface BaseExpandedEditorProps {
  /** モーダルタイトル */
  readonly title: string;
  /** aria-label（アクセシビリティ） */
  readonly ariaLabel: string;
  /** 閉じるコールバック */
  readonly onClose: () => void;
  /** 構文ヘルプを開くコールバック */
  readonly onOpenSyntaxHelp?: () => void;
  /** data-testid */
  readonly testId?: string;
  /** body部のgap（デフォルト12） */
  readonly bodyGap?: number;
  /** モーダル本体（エディタ固有のUI） */
  readonly children: ReactNode;
}

// --- スタイル ---

export const overlayStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  padding: "24px",
};

export const modalStyle: CSSProperties = {
  backgroundColor: "var(--color-surface, #ffffff)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  width: "700px",
  maxWidth: "100%",
  maxHeight: "80vh",
  overflow: "auto",
  fontFamily: "var(--font-ui)",
  fontSize: "var(--font-size-base, 14px)",
  color: "var(--color-text-primary, #171717)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px 12px",
  borderBottom: "1px solid var(--color-border, #e2e8f0)",
};

const headerTitleStyle: CSSProperties = {
  fontSize: "var(--font-size-lg, 16px)",
  fontWeight: 600,
  margin: 0,
};

const headerActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const closeButtonStyle: CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "var(--font-size-xl, 20px)",
  color: "var(--color-text-secondary, #666666)",
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: "4px",
  lineHeight: 1,
  fontFamily: "var(--font-ui)",
};

const syntaxHelpButtonStyle: CSSProperties = {
  background: "none",
  border: "1px solid var(--color-border, #e2e8f0)",
  fontSize: "var(--font-size-sm, 12px)",
  color: "var(--color-text-secondary, #666666)",
  cursor: "pointer",
  padding: "4px 10px",
  borderRadius: "4px",
  fontFamily: "var(--font-ui)",
};

export const bodyStyle: CSSProperties = {
  padding: "16px 20px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

// --- コンポーネント ---

export function BaseExpandedEditor({
  title,
  ariaLabel,
  onClose,
  onOpenSyntaxHelp,
  testId,
  bodyGap = 12,
  children,
}: BaseExpandedEditorProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Escapeキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // モーダル外クリックで閉じる
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  return createPortal(
    <div
      style={overlayStyle}
      onClick={handleOverlayClick}
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div ref={modalRef} style={modalStyle}>
        {/* ヘッダー */}
        <div style={headerStyle}>
          <h2 style={headerTitleStyle}>{title}</h2>
          <div style={headerActionsStyle}>
            {onOpenSyntaxHelp !== undefined && (
              <button
                type="button"
                style={syntaxHelpButtonStyle}
                onClick={onOpenSyntaxHelp}
                aria-label="構文ヘルプ"
                data-testid={
                  testId ? `${testId satisfies string}-syntax-help` : undefined
                }
              >
                ?
              </button>
            )}
            <button
              type="button"
              style={closeButtonStyle}
              onClick={onClose}
              aria-label="閉じる"
              data-testid={
                testId ? `${testId satisfies string}-close` : undefined
              }
            >
              ×
            </button>
          </div>
        </div>

        {/* 本体 */}
        <div style={{ ...bodyStyle, gap: bodyGap }}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
