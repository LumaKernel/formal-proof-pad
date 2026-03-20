/**
 * 論理式コピー用の純粋ロジック。
 *
 * ノードの formulaText から各フォーマットのテキストを生成する。
 *
 * 変更時は formulaCopyLogic.test.ts, ProofWorkspace.tsx, proofMessages.ts, index.ts も同期すること。
 */

import { parseString } from "../logic-lang/parser";
import { formatFormula } from "../logic-lang/formatUnicode";
import { formatFormulaLaTeX } from "../logic-lang/formatLaTeX";

/** コピー可能なフォーマット種別 */
export type FormulaCopyFormat = "unicode" | "ascii" | "latex";

/** フォーマット変換結果 */
export type FormulaCopyResult =
  | { readonly success: true; readonly text: string }
  | { readonly success: false };

/**
 * formulaText を指定フォーマットに変換する。
 *
 * - unicode: パース → Unicode フォーマッター（表示用）
 * - ascii: formulaText そのまま（DSL テキスト）
 * - latex: パース → LaTeX フォーマッター
 *
 * パースに失敗した場合、unicode/latex は失敗を返す。
 * ascii は常に成功する（生テキストのため）。
 */
export function formatForCopy(
  formulaText: string,
  format: FormulaCopyFormat,
): FormulaCopyResult {
  if (format === "ascii") {
    return { success: true, text: formulaText };
  }

  const parsed = parseString(formulaText);
  if (parsed._tag !== "Right") {
    return { success: false };
  }

  if (format === "unicode") {
    return { success: true, text: formatFormula(parsed.right) };
  }

  // format === "latex"
  return { success: true, text: formatFormulaLaTeX(parsed.right) };
}

/**
 * 全フォーマットの変換結果を一度に取得する。
 */
export function getAllFormulaCopyFormats(formulaText: string): {
  readonly unicode: FormulaCopyResult;
  readonly ascii: FormulaCopyResult;
  readonly latex: FormulaCopyResult;
} {
  return {
    unicode: formatForCopy(formulaText, "unicode"),
    ascii: formatForCopy(formulaText, "ascii"),
    latex: formatForCopy(formulaText, "latex"),
  };
}
