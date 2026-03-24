/**
 * パース成功時にコールバックを呼ぶカスタムフック。
 *
 * FormulaInput, TermInput, FormulaExpandedEditor, TermExpandedEditor で
 * 共通する「パース成功時に onParsed を呼ぶ」useEffect パターンを集約する。
 *
 * 変更時は useNotifyOnParsed.test.ts も同期すること。
 */

import { useEffect } from "react";

/**
 * パース結果が非nullのとき、onParsed コールバックを呼び出す。
 *
 * @param parsedValue - パース成功時の値（null = パース失敗 or 空入力）
 * @param onParsed - パース成功時に呼ばれるコールバック（undefined の場合は何もしない）
 */
export function useNotifyOnParsed<T>(
  parsedValue: T | null,
  onParsed: ((value: T) => void) | undefined,
): void {
  useEffect(() => {
    if (parsedValue !== null && onParsed !== undefined) {
      onParsed(parsedValue);
    }
  }, [parsedValue, onParsed]);
}
