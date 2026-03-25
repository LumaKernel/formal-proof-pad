/**
 * 論理式拡大編集モーダルコンポーネント。
 *
 * 広い画面で論理式をtextareaで編集し、リアルタイムにプレビューとエラー表示を行う。
 * BaseExpandedEditor を使い、モーダルシェル（オーバーレイ、ヘッダー、クローズ）を委譲する。
 *
 * 変更時は FormulaExpandedEditor.test.tsx, FormulaExpandedEditor.stories.tsx, index.ts も同期すること。
 */

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { Formula } from "../logic-core/formula";
import type { FormulaTokenKind } from "../logic-lang/formulaHighlight";
import { tokenizeDslInput } from "../logic-lang/formulaHighlight";
import { BaseExpandedEditor } from "./BaseExpandedEditor";
import type { FormulaParseState } from "./FormulaInput";
import { useNotifyOnParsed } from "./useNotifyOnParsed";
import {
  computeErrorHighlights,
  computeParseState,
  formatErrorMessage,
} from "./FormulaInput";
import { FormulaDisplay } from "./FormulaDisplay";
import {
  textareaContainerStyle,
  textareaBaseStyle,
  textareaErrorStyle,
  highlightOverlayStyle,
  previewSectionStyle,
  previewLabelStyle,
  errorContainerStyle,
  errorMessageStyle,
  textareaOverlayActiveStyle,
  emptyPreviewStyle,
} from "./expandedEditorStyles";
import { renderHighlightedText } from "./renderHighlightedText";

// --- Props ---

export interface FormulaExpandedEditorProps {
  /** 現在の入力テキスト */
  readonly value: string;
  /** テキスト変更時のコールバック */
  readonly onChange: (value: string) => void;
  /** パース成功時にFormula ASTを通知するコールバック */
  readonly onParsed?: (formula: Formula) => void;
  /** 閉じるコールバック */
  readonly onClose: () => void;
  /** 構文ヘルプを開くコールバック */
  readonly onOpenSyntaxHelp?: () => void;
  /** プレースホルダーテキスト */
  readonly placeholder?: string;
  /** data-testid */
  readonly testId?: string;
}

/**
 * FormulaTokenKind → CSS変数名の対応（FormulaDisplay.tsx と同一）。
 */
const tokenKindToVar: Readonly<Record<FormulaTokenKind, string>> = {
  connective: "var(--color-syntax-connective)",
  quantifier: "var(--color-syntax-quantifier)",
  variable: "var(--color-syntax-variable)",
  metaVariable: "var(--color-syntax-metaVariable)",
  predicate: "var(--color-syntax-predicate)",
  function: "var(--color-syntax-function)",
  constant: "var(--color-syntax-constant)",
  subscript: "var(--color-syntax-subscript)",
  equality: "var(--color-syntax-equality)",
  punctuation: "var(--color-syntax-punctuation)",
  negation: "var(--color-syntax-negation)",
  substitution: "var(--color-syntax-substitution)",
};

// --- コンポーネント ---

export function FormulaExpandedEditor({
  value,
  onChange,
  onParsed,
  onClose,
  onOpenSyntaxHelp,
  placeholder = "論理式を入力...",
  testId,
}: FormulaExpandedEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // パース状態を計算
  const deferredValue = useDeferredValue(value);
  const parseState: FormulaParseState = useMemo(
    () => computeParseState(deferredValue),
    [deferredValue],
  );

  // パース成功時に onParsed を呼ぶ
  const parsedFormula =
    parseState.status === "success" ? parseState.formula : null;
  useNotifyOnParsed(parsedFormula, onParsed);

  // 開いたらtextareaにフォーカス
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  // エラーハイライト
  const errorHighlights = useMemo(
    () =>
      parseState.status === "error"
        ? computeErrorHighlights(deferredValue, parseState.errors)
        : [],
    [parseState, deferredValue],
  );

  // シンタックスハイライト用トークン（エラーがない場合のみ）
  const syntaxTokens = useMemo(
    () =>
      errorHighlights.length === 0 ? tokenizeDslInput(deferredValue) : null,
    [deferredValue, errorHighlights.length],
  );

  const hasOverlay = errorHighlights.length > 0 || syntaxTokens !== null;

  const currentTextareaStyle =
    parseState.status === "error" ? textareaErrorStyle : textareaBaseStyle;

  return (
    <BaseExpandedEditor
      title="論理式エディタ"
      ariaLabel="論理式エディタ"
      onClose={onClose}
      onOpenSyntaxHelp={onOpenSyntaxHelp}
      testId={testId}
    >
      {/* テキストエリア + オーバーレイ */}
      <div style={textareaContainerStyle}>
        {/* エラーハイライトオーバーレイ */}
        {errorHighlights.length > 0 && (
          <div
            style={highlightOverlayStyle}
            aria-hidden="true"
            data-testid={
              testId ? `${testId satisfies string}-highlights` : undefined
            }
          >
            {renderHighlightedText(deferredValue, errorHighlights)}
          </div>
        )}
        {/* シンタックスハイライトオーバーレイ */}
        {syntaxTokens !== null && (
          <div
            style={highlightOverlayStyle}
            aria-hidden="true"
            data-testid={
              testId ? `${testId satisfies string}-syntax-highlight` : undefined
            }
          >
            {syntaxTokens.map((token, i) => (
              <span key={i} style={{ color: tokenKindToVar[token.kind] }}>
                {token.text}
              </span>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            ...currentTextareaStyle,
            ...(hasOverlay ? textareaOverlayActiveStyle : {}),
          }}
          data-testid={
            testId ? `${testId satisfies string}-textarea` : undefined
          }
          aria-invalid={parseState.status === "error"}
          aria-describedby={
            parseState.status === "error" && testId
              ? `${testId satisfies string}-errors`
              : undefined
          }
        />
      </div>

      {/* プレビュー */}
      <div
        style={previewSectionStyle}
        data-testid={testId ? `${testId satisfies string}-preview` : undefined}
      >
        <div style={previewLabelStyle}>プレビュー</div>
        {parseState.status === "success" ? (
          <FormulaDisplay
            formula={parseState.formula}
            highlight
            testId={
              testId ? `${testId satisfies string}-preview-formula` : undefined
            }
          />
        ) : parseState.status === "empty" ? (
          <span style={emptyPreviewStyle}>{placeholder}</span>
        ) : null}
      </div>

      {/* エラー表示 */}
      {parseState.status === "error" && (
        <div
          style={errorContainerStyle}
          data-testid={testId ? `${testId satisfies string}-errors` : undefined}
          id={testId ? `${testId satisfies string}-errors` : undefined}
          role="alert"
          aria-live="polite"
        >
          {parseState.errors.map((error, i) => (
            <div
              key={`${error.span.start.line satisfies number}:${error.span.start.column satisfies number}`}
              style={errorMessageStyle}
              data-testid={
                testId
                  ? `${testId satisfies string}-error-${`${i satisfies number}` satisfies string}`
                  : undefined
              }
            >
              {formatErrorMessage(error)}
            </div>
          ))}
        </div>
      )}
    </BaseExpandedEditor>
  );
}
