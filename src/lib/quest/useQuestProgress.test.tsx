import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuestProgress } from "./useQuestProgress";
import {
  loadProgress,
  saveProgress,
  QUEST_PROGRESS_STORAGE_KEY,
} from "./useQuestProgress";
import {
  createEmptyProgress,
  recordCompletion,
  serializeProgress,
} from "./questProgress";

describe("localStorage adapter", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = globalThis.localStorage;
    storage.clear();
  });

  it("loadProgressは保存データがない場合空の進捗を返す", () => {
    const result = loadProgress(storage);
    expect(result).toEqual(createEmptyProgress());
  });

  it("saveProgress → loadProgress でラウンドトリップできる", () => {
    const state = recordCompletion(createEmptyProgress(), "quest-1", {
      completedAt: 1000,
      stepCount: 5,
    });
    saveProgress(storage, state);
    const loaded = loadProgress(storage);
    expect(loaded.entries.size).toBe(1);
    expect(loaded.entries.get("quest-1")?.completions).toHaveLength(1);
  });

  it("不正なJSONが保存されている場合空の進捗を返す", () => {
    storage.setItem(QUEST_PROGRESS_STORAGE_KEY, "invalid-json");
    const result = loadProgress(storage);
    expect(result).toEqual(createEmptyProgress());
  });

  it("構造的に不正なデータが保存されている場合空の進捗を返す", () => {
    storage.setItem(
      QUEST_PROGRESS_STORAGE_KEY,
      JSON.stringify({ wrong: true }),
    );
    const result = loadProgress(storage);
    expect(result).toEqual(createEmptyProgress());
  });

  it("正しいJSON形式のデータをデシリアライズできる", () => {
    const state = recordCompletion(createEmptyProgress(), "quest-2", {
      completedAt: 2000,
      stepCount: 10,
    });
    storage.setItem(
      QUEST_PROGRESS_STORAGE_KEY,
      JSON.stringify(serializeProgress(state)),
    );
    const loaded = loadProgress(storage);
    expect(loaded.entries.get("quest-2")?.completions[0]?.stepCount).toBe(10);
  });
});

describe("useQuestProgress hook", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("初期状態は空の進捗", () => {
    const { result } = renderHook(() => useQuestProgress());
    expect(result.current.progress.entries.size).toBe(0);
  });

  it("localStorageに保存済みデータがあれば復元される", () => {
    const state = recordCompletion(createEmptyProgress(), "quest-1", {
      completedAt: 1000,
      stepCount: 5,
    });
    globalThis.localStorage.setItem(
      QUEST_PROGRESS_STORAGE_KEY,
      JSON.stringify(serializeProgress(state)),
    );

    const { result } = renderHook(() => useQuestProgress());
    expect(result.current.progress.entries.size).toBe(1);
    expect(result.current.isCompleted("quest-1")).toBe(true);
  });

  it("recordで完了を記録できる", () => {
    const { result } = renderHook(() => useQuestProgress());

    act(() => {
      result.current.record("quest-1", {
        completedAt: 1000,
        stepCount: 5,
      });
    });

    expect(result.current.isCompleted("quest-1")).toBe(true);
    expect(result.current.completionCount("quest-1")).toBe(1);
    expect(result.current.bestStepCount("quest-1")).toBe(5);
  });

  it("複数回の完了記録でベストステップ数が正しい", () => {
    const { result } = renderHook(() => useQuestProgress());

    act(() => {
      result.current.record("quest-1", {
        completedAt: 1000,
        stepCount: 10,
      });
    });

    act(() => {
      result.current.record("quest-1", {
        completedAt: 2000,
        stepCount: 5,
      });
    });

    expect(result.current.completionCount("quest-1")).toBe(2);
    expect(result.current.bestStepCount("quest-1")).toBe(5);
  });

  it("resetQuestで特定クエストの進捗をリセットできる", () => {
    const { result } = renderHook(() => useQuestProgress());

    act(() => {
      result.current.record("quest-1", {
        completedAt: 1000,
        stepCount: 5,
      });
      result.current.record("quest-2", {
        completedAt: 2000,
        stepCount: 8,
      });
    });

    act(() => {
      result.current.resetQuest("quest-1");
    });

    expect(result.current.isCompleted("quest-1")).toBe(false);
    expect(result.current.isCompleted("quest-2")).toBe(true);
  });

  it("resetAllで全進捗をリセットできる", () => {
    const { result } = renderHook(() => useQuestProgress());

    act(() => {
      result.current.record("quest-1", {
        completedAt: 1000,
        stepCount: 5,
      });
      result.current.record("quest-2", {
        completedAt: 2000,
        stepCount: 8,
      });
    });

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.progress.entries.size).toBe(0);
    expect(result.current.isCompleted("quest-1")).toBe(false);
    expect(result.current.isCompleted("quest-2")).toBe(false);
  });

  it("未完了クエストのisCompletedはfalse", () => {
    const { result } = renderHook(() => useQuestProgress());
    expect(result.current.isCompleted("nonexistent")).toBe(false);
  });

  it("未完了クエストのcompletionCountは0", () => {
    const { result } = renderHook(() => useQuestProgress());
    expect(result.current.completionCount("nonexistent")).toBe(0);
  });

  it("未完了クエストのbestStepCountはundefined", () => {
    const { result } = renderHook(() => useQuestProgress());
    expect(result.current.bestStepCount("nonexistent")).toBeUndefined();
  });

  it("操作後にlocalStorageへ永続化される", () => {
    const { result } = renderHook(() => useQuestProgress());

    act(() => {
      result.current.record("quest-1", {
        completedAt: 1000,
        stepCount: 5,
      });
    });

    const stored = globalThis.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(stored).toContain("quest-1");
  });

  it("リセット後にlocalStorageも更新される", () => {
    const { result } = renderHook(() => useQuestProgress());

    act(() => {
      result.current.record("quest-1", {
        completedAt: 1000,
        stepCount: 5,
      });
    });

    act(() => {
      result.current.resetAll();
    });

    const stored = globalThis.localStorage.getItem(QUEST_PROGRESS_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.entries).toEqual([]);
  });
});
