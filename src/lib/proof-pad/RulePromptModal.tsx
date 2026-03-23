/**
 * 規則パラメータ入力モーダル。
 *
 * globalThis.prompt() の代替として、規則適用時に必要なパラメータ（位置、項、固有変数等）を
 * カスタムモーダルで収集する。
 *
 * 変更時は RulePromptModal.test.tsx も同期すること。
 */

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// --- 型定義 ---

export interface RulePromptModalProps {
  /** プロンプトメッセージ */
  readonly message: string;
  /** デフォルト値 */
  readonly defaultValue: string;
  /** 確定コールバック */
  readonly onConfirm: (value: string) => void;
  /** キャンセルコールバック */
  readonly onCancel: () => void;
  /** data-testid */
  readonly testId?: string;
}

// --- スタイル ---

const overlayStyle: Readonly<CSSProperties> = {
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};

const modalStyle: Readonly<CSSProperties> = {
  background: "var(--color-surface, #2d3436)",
  border: "1px solid var(--color-border, #636e72)",
  borderRadius: 8,
  padding: 16,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
  minWidth: 280,
  maxWidth: 400,
};

const inputStyle: Readonly<CSSProperties> = {
  backgroundColor: "#ffffff",
  color: "#171717",
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "#636e72",
  borderRadius: 4,
  padding: "6px 8px",
  fontSize: 13,
  fontFamily: "var(--font-mono, monospace)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const messageStyle: Readonly<CSSProperties> = {
  marginBottom: 8,
  fontSize: 12,
  color: "var(--color-text-muted, #b2bec3)",
  fontWeight: 600,
};

const buttonRowStyle: Readonly<CSSProperties> = {
  display: "flex",
  gap: 6,
  marginTop: 10,
  justifyContent: "flex-end",
};

const buttonBaseStyle: Readonly<CSSProperties> = {
  padding: "5px 12px",
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 4,
  border: "1px solid var(--color-border, #636e72)",
  cursor: "pointer",
  background: "var(--color-surface, #2d3436)",
  color: "var(--color-text, #dfe6e9)",
};

const confirmButtonStyle: Readonly<CSSProperties> = {
  ...buttonBaseStyle,
  background: "var(--color-badge-gen, #00b894)",
  color: "white",
  borderColor: "transparent",
};

// --- コンポーネント ---

export function RulePromptModal({
  message,
  defaultValue,
  onConfirm,
  onCancel,
  testId,
}: RulePromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(value);
  }, [value, onConfirm]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleConfirm();
      } else if (e.key === "Escape") {
        onCancel();
      }
    },
    [handleConfirm, onCancel],
  );

  return (
    <div
      style={overlayStyle}
      data-testid={testId}
      onClick={(e) => {
        /* v8 ignore start -- 防御的コード: 内側modal divがstopPropagation()するため、e.target !== e.currentTargetは構造的に到達しない */
        if (e.target === e.currentTarget) {
          onCancel();
        }
        /* v8 ignore stop */
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div style={messageStyle}>{message}</div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={inputStyle}
          data-testid={
            testId ? `${testId satisfies string}-input` : "rule-prompt-input"
          }
        />
        <div style={buttonRowStyle}>
          <button
            type="button"
            style={buttonBaseStyle}
            onClick={onCancel}
            data-testid={
              testId
                ? `${testId satisfies string}-cancel`
                : "rule-prompt-cancel"
            }
          >
            Cancel
          </button>
          <button
            type="button"
            style={confirmButtonStyle}
            onClick={handleConfirm}
            data-testid={
              testId
                ? `${testId satisfies string}-confirm`
                : "rule-prompt-confirm"
            }
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
