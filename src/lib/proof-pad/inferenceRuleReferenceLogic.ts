/**
 * 推論規則のリファレンスマッピング純粋ロジック。
 *
 * 推論規則ID（"mp", "gen"）からリファレンスエントリIDへのマッピングを提供する。
 * ProofWorkspace.tsx から利用される。
 *
 * 変更時は inferenceRuleReferenceLogic.test.ts, ProofWorkspace.tsx も同期すること。
 */

import type { ReferenceEntryId } from "../reference/referenceEntry";

// --- 推論規則ID → リファレンスエントリID マッピング ---

/**
 * 推論規則IDからリファレンスエントリIDへのマッピング。
 *
 * 新しい推論規則リファレンスエントリ追加時は referenceContent.ts にも追加すること。
 */
const inferenceRuleIdToReferenceEntryId: ReadonlyMap<string, ReferenceEntryId> =
  new Map([
    ["mp", "rule-mp"],
    ["gen", "rule-gen"],
  ]);

/**
 * 推論規則IDに対応するリファレンスエントリIDを返す。
 * 対応するエントリがない場合はundefinedを返す。
 */
export function getInferenceRuleReferenceEntryId(
  ruleId: string,
): ReferenceEntryId | undefined {
  return inferenceRuleIdToReferenceEntryId.get(ruleId);
}
