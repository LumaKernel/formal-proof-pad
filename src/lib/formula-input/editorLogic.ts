/**
 * FormulaEditor / TermEditor 共通の純粋ロジック。
 *
 * モード遷移の判定とテキスト⇔AST変換の状態管理。
 *
 * 変更時は editorLogic.test.ts, FormulaEditor.tsx, TermEditor.tsx, index.ts も同期すること。
 */

// --- 共通パース状態型 ---

/**
 * FormulaParseState と TermParseState に共通する status 判別子。
 * canExitEditMode / computeExitAction は status のみを参照するため、
 * この型で汎用的に受け付ける。
 */
export type ParseStateStatus = {
  readonly status: "empty" | "success" | "error";
};

// --- モード遷移ロジック ---

/** editorモード離脱判定のオプション */
export interface ExitOptions {
  /** trueの場合、パースエラーでもシーケントテキスト（⇒含む）なら離脱を許可する */
  readonly allowSequentText?: boolean;
  /** allowSequentText=true時に参照する入力テキスト */
  readonly text?: string;
}

/**
 * 編集モードを離れられるかどうかを判定する。
 * パースエラー時は編集モードに留まらなければならない。
 * ただし allowSequentText=true かつテキストに ⇒ が含まれる場合は許可する。
 */
export const canExitEditMode = (
  parseState: ParseStateStatus,
  options?: ExitOptions,
): boolean => {
  switch (parseState.status) {
    case "empty":
      return true;
    case "success":
      return true;
    case "error":
      if (options?.allowSequentText && options.text?.includes("⇒")) {
        return true;
      }
      return false;
  }
};

// --- エディタの表示モード ---

export type DisplayRenderer = "unicode" | "katex";

export type EditorMode = "display" | "editing";

/**
 * 編集モードに入るトリガーの種類。
 * - "click": シングルクリックで即座に編集開始（デフォルト）
 * - "dblclick": ダブルクリックで編集開始
 * - "none": クリックでは編集しない（外部から制御する場合）
 */
export type EditTrigger = "click" | "dblclick" | "none";

/**
 * 編集終了アクション（blur/Escape/Enter）時の結果を計算する。
 * パースエラーの場合はnull（モード遷移しない）を返す。
 */
export const computeExitAction = (
  parseState: ParseStateStatus,
  options?: ExitOptions,
): EditorMode | null => {
  if (canExitEditMode(parseState, options)) {
    return "display";
  }
  return null;
};
