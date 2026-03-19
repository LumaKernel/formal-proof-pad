/**
 * シーケントエディタの純粋ロジック。
 *
 * シーケントテキスト（"φ, ψ ⇒ χ" 形式）と
 * 前件・後件の論理式テキスト配列との相互変換を提供する。
 *
 * 変更時は sequentEditorLogic.test.ts, index.ts も同期すること。
 */

/**
 * シーケントの構造化データ。
 * antecedents = 左辺（前件）、succedents = 右辺（後件）
 */
export interface SequentParts {
  readonly antecedents: readonly string[];
  readonly succedents: readonly string[];
}

/**
 * シーケントテキストを前件・後件の配列に分割する。
 *
 * - "⇒" がなければ空のシーケント（両辺空）を返す
 * - 空文字列の論理式は保持する（編集中の空フィールドを壊さない）
 */
export function splitSequentToLists(text: string): SequentParts {
  const arrowIndex = text.indexOf("⇒");
  if (arrowIndex === -1) {
    return { antecedents: [], succedents: [] };
  }
  const leftStr = text.slice(0, arrowIndex).trim();
  const rightStr = text.slice(arrowIndex + 1).trim();
  const antecedents =
    leftStr === "" ? [] : leftStr.split(",").map((s) => s.trim());
  const succedents =
    rightStr === "" ? [] : rightStr.split(",").map((s) => s.trim());
  return { antecedents, succedents };
}

/**
 * 前件・後件の配列からシーケントテキストを組み立てる。
 *
 * - 空文字列の論理式はスキップする（保存時のクリーンアップ）
 * - 結果は "φ, ψ ⇒ χ, δ" 形式
 */
export function composeSequentText(parts: SequentParts): string {
  const left = parts.antecedents
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .join(", ");
  const right = parts.succedents
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .join(", ");
  return `${left satisfies string} ⇒ ${right satisfies string}`;
}

/**
 * テキストが有効なシーケント形式かを判定する。
 * ⇒ を含んでいればシーケントとみなす。
 */
export function isSequentEditorText(text: string): boolean {
  return text.includes("⇒");
}
