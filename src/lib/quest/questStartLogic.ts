/**
 * クエスト開始の純粋ロジック。
 *
 * QuestDefinition から ノートブック作成パラメータへの変換、
 * および公理系プリセットIDからLogicSystemへの解決を提供する。
 *
 * 変更時は questStartLogic.test.ts も同期すること。
 */

import type { LogicSystem } from "../logic-core/inferenceRule";
import type { QuestGoalDefinition } from "../proof-pad/workspaceState";
import type { SystemPreset } from "../notebook/notebookCreateLogic";
import { systemPresets } from "../notebook/notebookCreateLogic";
import type { QuestDefinition, SystemPresetId } from "./questDefinition";

// --- プリセット解決 ---

/**
 * SystemPresetId から LogicSystem を解決する。
 * 見つからない場合は undefined を返す。
 */
export function resolveSystemPreset(
  presetId: SystemPresetId,
): SystemPreset | undefined {
  return systemPresets.find((p) => p.id === presetId);
}

// --- クエスト開始パラメータ ---

/** クエスト開始時のノートブック作成に必要なパラメータ */
export type QuestStartParams = {
  readonly name: string;
  readonly system: LogicSystem;
  readonly goals: readonly QuestGoalDefinition[];
};

/**
 * QuestDefinition からノートブック作成に必要なパラメータを算出する。
 * プリセットIDが解決できない場合は undefined を返す。
 */
export function buildQuestStartParams(
  quest: QuestDefinition,
): QuestStartParams | undefined {
  const preset = resolveSystemPreset(quest.systemPresetId);
  if (preset === undefined) return undefined;

  // クエスト全体の allowedAxiomIds をゴール個別に引き継ぐ
  // ゴール個別に設定がある場合はそちらを優先
  const goals =
    quest.allowedAxiomIds !== undefined
      ? quest.goals.map((g) => ({
          ...g,
          allowedAxiomIds: g.allowedAxiomIds ?? quest.allowedAxiomIds,
        }))
      : quest.goals;

  // クエストは現在Hilbert流のみ対応
  if (preset.deductionSystem.style !== "hilbert") return undefined;

  return {
    name: `${quest.title satisfies string}`,
    system: preset.deductionSystem.system,
    goals,
  };
}

// --- クエスト開始結果 ---

/** クエスト開始の結果 */
export type QuestStartResult =
  | { readonly ok: true; readonly params: QuestStartParams }
  | { readonly ok: false; readonly reason: QuestStartError };

/** クエスト開始エラーの種類 */
export type QuestStartError = "quest-not-found" | "preset-not-found";

/**
 * クエストIDからクエストを検索して開始パラメータを組み立てる。
 * エラー時は理由を返す。
 */
export function prepareQuestStart(
  quests: readonly QuestDefinition[],
  questId: string,
): QuestStartResult {
  const quest = quests.find((q) => q.id === questId);
  if (quest === undefined) {
    return { ok: false, reason: "quest-not-found" };
  }

  const params = buildQuestStartParams(quest);
  if (params === undefined) {
    return { ok: false, reason: "preset-not-found" };
  }

  return { ok: true, params };
}
