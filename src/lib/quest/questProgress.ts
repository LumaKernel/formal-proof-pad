/**
 * クエスト進捗管理の純粋ロジック。
 *
 * 各クエストの完了状態、ベスト記録などを追跡する。
 * イミュータブルなデータ構造で、UIやストレージから独立。
 *
 * 変更時は questProgress.test.ts も同期すること。
 */

import type { QuestId } from "./questDefinition";

// --- 進捗レコード ---

/** 単一クエストの完了記録 */
export type QuestCompletionRecord = {
  /** 完了した日時（エポックミリ秒） */
  readonly completedAt: number;
  /** 使用したステップ数（公理ノード + MPノード + Genノードの合計） */
  readonly stepCount: number;
};

/** 単一クエストの進捗 */
export type QuestProgressEntry = {
  readonly questId: QuestId;
  /** 完了記録の一覧（ベスト記録を含む全履歴） */
  readonly completions: readonly QuestCompletionRecord[];
};

/** 全クエストの進捗状態 */
export type QuestProgressState = {
  readonly entries: ReadonlyMap<QuestId, QuestProgressEntry>;
};

// --- 初期状態 ---

/** 空の進捗状態を作成する */
export function createEmptyProgress(): QuestProgressState {
  return {
    entries: new Map(),
  };
}

// --- 進捗の問い合わせ ---

/** クエストが一度でも完了しているか */
export function isQuestCompleted(
  state: QuestProgressState,
  questId: QuestId,
): boolean {
  const entry = state.entries.get(questId);
  return entry !== undefined && entry.completions.length > 0;
}

/** クエストの完了回数 */
export function getCompletionCount(
  state: QuestProgressState,
  questId: QuestId,
): number {
  const entry = state.entries.get(questId);
  return entry?.completions.length ?? 0;
}

/** クエストのベストステップ数（未完了の場合はundefined） */
export function getBestStepCount(
  state: QuestProgressState,
  questId: QuestId,
): number | undefined {
  const entry = state.entries.get(questId);
  if (entry === undefined || entry.completions.length === 0) {
    return undefined;
  }
  return Math.min(...entry.completions.map((c) => c.stepCount));
}

/** クエストの最新完了記録（未完了の場合はundefined） */
export function getLatestCompletion(
  state: QuestProgressState,
  questId: QuestId,
): QuestCompletionRecord | undefined {
  const entry = state.entries.get(questId);
  if (entry === undefined || entry.completions.length === 0) {
    return undefined;
  }
  // completions は追記順なので最後が最新
  return entry.completions[entry.completions.length - 1];
}

// --- 進捗の更新 ---

/** クエスト完了を記録する */
export function recordCompletion(
  state: QuestProgressState,
  questId: QuestId,
  record: QuestCompletionRecord,
): QuestProgressState {
  const existingEntry = state.entries.get(questId);
  const newEntry: QuestProgressEntry = {
    questId,
    completions:
      existingEntry !== undefined
        ? [...existingEntry.completions, record]
        : [record],
  };
  const newEntries = new Map(state.entries);
  newEntries.set(questId, newEntry);
  return { entries: newEntries };
}

/** 特定クエストの進捗をリセットする */
export function resetQuestProgress(
  state: QuestProgressState,
  questId: QuestId,
): QuestProgressState {
  if (!state.entries.has(questId)) return state;
  const newEntries = new Map(state.entries);
  newEntries.delete(questId);
  return { entries: newEntries };
}

/** 全クエストの進捗をリセットする */
export function resetAllProgress(): QuestProgressState {
  return createEmptyProgress();
}

// --- 統計 ---

/** 完了済みクエスト数 */
export function countCompletedQuests(
  state: QuestProgressState,
  questIds: readonly QuestId[],
): number {
  return questIds.filter((id) => isQuestCompleted(state, id)).length;
}

// --- シリアライズ ---

/** シリアライズ用の中間表現（JSON互換） */
export type SerializedQuestProgress = {
  readonly entries: readonly {
    readonly questId: string;
    readonly completions: readonly {
      readonly completedAt: number;
      readonly stepCount: number;
    }[];
  }[];
};

/** 進捗状態をJSON互換形式にシリアライズする */
export function serializeProgress(
  state: QuestProgressState,
): SerializedQuestProgress {
  return {
    entries: [...state.entries.values()].map((entry) => ({
      questId: entry.questId,
      completions: entry.completions.map((c) => ({
        completedAt: c.completedAt,
        stepCount: c.stepCount,
      })),
    })),
  };
}

/** JSON互換形式から進捗状態をデシリアライズする */
export function deserializeProgress(data: unknown): QuestProgressState {
  if (
    typeof data !== "object" ||
    data === null ||
    !("entries" in data) ||
    !Array.isArray((data as { readonly entries: unknown }).entries)
  ) {
    return createEmptyProgress();
  }

  const entries = new Map<QuestId, QuestProgressEntry>();
  for (const raw of (data as { readonly entries: readonly unknown[] })
    .entries) {
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("questId" in raw) ||
      typeof (raw as { readonly questId: unknown }).questId !== "string" ||
      !("completions" in raw) ||
      !Array.isArray((raw as { readonly completions: unknown }).completions)
    ) {
      continue;
    }

    const questId = (raw as { readonly questId: string }).questId;
    const completions: QuestCompletionRecord[] = [];

    for (const rawComp of (raw as { readonly completions: readonly unknown[] })
      .completions) {
      if (
        typeof rawComp !== "object" ||
        rawComp === null ||
        !("completedAt" in rawComp) ||
        typeof (rawComp as { readonly completedAt: unknown }).completedAt !==
          "number" ||
        !("stepCount" in rawComp) ||
        typeof (rawComp as { readonly stepCount: unknown }).stepCount !==
          "number"
      ) {
        continue;
      }
      completions.push({
        completedAt: (rawComp as { readonly completedAt: number }).completedAt,
        stepCount: (rawComp as { readonly stepCount: number }).stepCount,
      });
    }

    if (completions.length > 0) {
      entries.set(questId, { questId, completions });
    }
  }

  return { entries };
}
