/**
 * TAB規則リファレンスID解決ロジック。
 *
 * TabRuleId → ReferenceEntryId のマッピングを提供する。
 * AxiomPaletteのgetAxiomReferenceEntryIdと同パターン。
 *
 * 変更時は tabRuleReferenceLogic.test.ts, TabRulePalette.tsx も同期すること。
 */

import type { TabRuleId } from "../logic-core/tableauCalculus";
import type { ReferenceEntryId } from "../reference/referenceEntry";

/**
 * TabRuleId → ReferenceEntryId マッピング。
 * 各TAB規則に対応するリファレンスエントリIDを返す。
 */
const tabRuleIdToReferenceEntryId: ReadonlyMap<TabRuleId, ReferenceEntryId> =
  new Map<TabRuleId, ReferenceEntryId>([
    ["bs", "rule-tab-bs"],
    ["bottom", "rule-tab-bottom"],
    ["exchange", "rule-tab-exchange"],
    ["double-negation", "rule-tab-double-negation"],
    ["conjunction", "rule-tab-conjunction"],
    ["neg-conjunction", "rule-tab-neg-conjunction"],
    ["disjunction", "rule-tab-disjunction"],
    ["neg-disjunction", "rule-tab-neg-disjunction"],
    ["implication", "rule-tab-implication"],
    ["neg-implication", "rule-tab-neg-implication"],
    ["universal", "rule-tab-universal"],
    ["neg-universal", "rule-tab-neg-universal"],
    ["existential", "rule-tab-existential"],
    ["neg-existential", "rule-tab-neg-existential"],
  ]);

/**
 * TAB規則IDからリファレンスエントリIDを取得する。
 *
 * @param ruleId TAB規則ID
 * @returns 対応するリファレンスエントリID。未定義の場合はundefined
 */
export function getTabRuleReferenceEntryId(
  ruleId: TabRuleId,
): ReferenceEntryId | undefined {
  return tabRuleIdToReferenceEntryId.get(ruleId);
}
