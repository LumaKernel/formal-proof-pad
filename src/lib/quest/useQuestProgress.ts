/**
 * クエスト進捗の状態管理 React hook。
 *
 * localStorage への永続化を含む。
 * 純粋ロジック (questProgress.ts) に依存。
 *
 * 変更時は useQuestProgress.test.tsx も同期すること。
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  QuestProgressState,
  QuestCompletionRecord,
} from "./questProgress";
import {
  createEmptyProgress,
  recordCompletion,
  resetQuestProgress,
  resetAllProgress,
  isQuestCompleted,
  getCompletionCount,
  getBestStepCount,
  serializeProgress,
  deserializeProgress,
} from "./questProgress";
import type { QuestId } from "./questDefinition";

// --- localStorage adapter (pure functions operating on Storage interface) ---

export const QUEST_PROGRESS_STORAGE_KEY = "quest-progress";

export function loadProgress(storage: Storage): QuestProgressState {
  const stored = storage.getItem(QUEST_PROGRESS_STORAGE_KEY);
  if (stored === null) {
    return createEmptyProgress();
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    return deserializeProgress(parsed);
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(
  storage: Storage,
  state: QuestProgressState,
): void {
  storage.setItem(
    QUEST_PROGRESS_STORAGE_KEY,
    JSON.stringify(serializeProgress(state)),
  );
}

// --- hook ---

export interface UseQuestProgressResult {
  /** 現在の進捗状態 */
  readonly progress: QuestProgressState;
  /** クエスト完了を記録する */
  readonly record: (questId: QuestId, record: QuestCompletionRecord) => void;
  /** 特定クエストの進捗をリセットする */
  readonly resetQuest: (questId: QuestId) => void;
  /** 全進捗をリセットする */
  readonly resetAll: () => void;
  /** クエストが完了済みかどうか */
  readonly isCompleted: (questId: QuestId) => boolean;
  /** クエストの完了回数 */
  readonly completionCount: (questId: QuestId) => number;
  /** クエストのベストステップ数 */
  readonly bestStepCount: (questId: QuestId) => number | undefined;
}

export function useQuestProgress(): UseQuestProgressResult {
  const [state, setState] = useState<QuestProgressState>(() =>
    /* v8 ignore start */
    typeof window === "undefined"
      ? createEmptyProgress()
      : /* v8 ignore stop */
        loadProgress(window.localStorage),
  );

  // Persist to localStorage when state changes
  useEffect(() => {
    /* v8 ignore start */
    if (typeof window === "undefined") return;
    /* v8 ignore stop */
    saveProgress(window.localStorage, state);
  }, [state]);

  const record = useCallback(
    (questId: QuestId, completionRecord: QuestCompletionRecord) => {
      setState((prev) => recordCompletion(prev, questId, completionRecord));
    },
    [],
  );

  const resetQuest = useCallback((questId: QuestId) => {
    setState((prev) => resetQuestProgress(prev, questId));
  }, []);

  const resetAll = useCallback(() => {
    setState(resetAllProgress());
  }, []);

  const isCompleted = useCallback(
    (questId: QuestId) => isQuestCompleted(state, questId),
    [state],
  );

  const completionCount = useCallback(
    (questId: QuestId) => getCompletionCount(state, questId),
    [state],
  );

  const bestStepCount = useCallback(
    (questId: QuestId) => getBestStepCount(state, questId),
    [state],
  );

  return useMemo(
    () => ({
      progress: state,
      record,
      resetQuest,
      resetAll,
      isCompleted,
      completionCount,
      bestStepCount,
    }),
    [
      state,
      record,
      resetQuest,
      resetAll,
      isCompleted,
      completionCount,
      bestStepCount,
    ],
  );
}
