import { describe, it, expect } from "vitest";
import {
  createEmptyProgress,
  isQuestCompleted,
  getCompletionCount,
  getBestStepCount,
  getLatestCompletion,
  recordCompletion,
  resetQuestProgress,
  resetAllProgress,
  countCompletedQuests,
  serializeProgress,
  deserializeProgress,
} from "./questProgress";

// --- createEmptyProgress ---

describe("createEmptyProgress", () => {
  it("空のMapを持つ進捗状態を返す", () => {
    const state = createEmptyProgress();
    expect(state.entries.size).toBe(0);
  });
});

// --- isQuestCompleted ---

describe("isQuestCompleted", () => {
  it("未完了のクエストはfalse", () => {
    const state = createEmptyProgress();
    expect(isQuestCompleted(state, "q1")).toBe(false);
  });

  it("完了済みのクエストはtrue", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    expect(isQuestCompleted(state, "q1")).toBe(true);
  });

  it("別のクエストが完了していても対象は未完了", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    expect(isQuestCompleted(state, "q2")).toBe(false);
  });
});

// --- getCompletionCount ---

describe("getCompletionCount", () => {
  it("未完了のクエストは0", () => {
    const state = createEmptyProgress();
    expect(getCompletionCount(state, "q1")).toBe(0);
  });

  it("1回完了は1", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    expect(getCompletionCount(state, "q1")).toBe(1);
  });

  it("複数回完了はその回数", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    state = recordCompletion(state, "q1", {
      completedAt: 2000,
      stepCount: 3,
    });
    state = recordCompletion(state, "q1", {
      completedAt: 3000,
      stepCount: 7,
    });
    expect(getCompletionCount(state, "q1")).toBe(3);
  });
});

// --- getBestStepCount ---

describe("getBestStepCount", () => {
  it("未完了のクエストはundefined", () => {
    const state = createEmptyProgress();
    expect(getBestStepCount(state, "q1")).toBeUndefined();
  });

  it("1回完了はそのステップ数", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    expect(getBestStepCount(state, "q1")).toBe(5);
  });

  it("複数回完了の場合は最小ステップ数", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 10,
    });
    state = recordCompletion(state, "q1", {
      completedAt: 2000,
      stepCount: 3,
    });
    state = recordCompletion(state, "q1", {
      completedAt: 3000,
      stepCount: 7,
    });
    expect(getBestStepCount(state, "q1")).toBe(3);
  });
});

// --- getLatestCompletion ---

describe("getLatestCompletion", () => {
  it("未完了のクエストはundefined", () => {
    const state = createEmptyProgress();
    expect(getLatestCompletion(state, "q1")).toBeUndefined();
  });

  it("最後に記録された完了を返す", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    state = recordCompletion(state, "q1", {
      completedAt: 2000,
      stepCount: 3,
    });
    const latest = getLatestCompletion(state, "q1");
    expect(latest).toEqual({ completedAt: 2000, stepCount: 3 });
  });
});

// --- recordCompletion ---

describe("recordCompletion", () => {
  it("新しいクエストの完了を記録できる", () => {
    const state = createEmptyProgress();
    const newState = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    expect(newState.entries.size).toBe(1);
    expect(newState.entries.get("q1")?.completions).toHaveLength(1);
  });

  it("既存クエストに完了を追加できる", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    state = recordCompletion(state, "q1", {
      completedAt: 2000,
      stepCount: 3,
    });
    expect(state.entries.get("q1")?.completions).toHaveLength(2);
  });

  it("元の状態を変更しない（イミュータブル）", () => {
    const original = createEmptyProgress();
    recordCompletion(original, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    expect(original.entries.size).toBe(0);
  });

  it("複数のクエストを独立して記録できる", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    state = recordCompletion(state, "q2", {
      completedAt: 2000,
      stepCount: 8,
    });
    expect(state.entries.size).toBe(2);
    expect(state.entries.get("q1")?.completions).toHaveLength(1);
    expect(state.entries.get("q2")?.completions).toHaveLength(1);
  });
});

// --- resetQuestProgress ---

describe("resetQuestProgress", () => {
  it("特定クエストの進捗をリセットできる", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    state = recordCompletion(state, "q2", {
      completedAt: 2000,
      stepCount: 8,
    });
    state = resetQuestProgress(state, "q1");
    expect(isQuestCompleted(state, "q1")).toBe(false);
    expect(isQuestCompleted(state, "q2")).toBe(true);
  });

  it("存在しないクエストのリセットは何もしない", () => {
    const state = createEmptyProgress();
    const result = resetQuestProgress(state, "nonexistent");
    expect(result).toBe(state);
  });
});

// --- resetAllProgress ---

describe("resetAllProgress", () => {
  it("空の進捗状態を返す", () => {
    const state = resetAllProgress();
    expect(state.entries.size).toBe(0);
  });
});

// --- countCompletedQuests ---

describe("countCompletedQuests", () => {
  it("完了済みクエスト数を返す", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    state = recordCompletion(state, "q3", {
      completedAt: 3000,
      stepCount: 7,
    });
    expect(countCompletedQuests(state, ["q1", "q2", "q3", "q4"])).toBe(2);
  });

  it("全未完了の場合は0", () => {
    const state = createEmptyProgress();
    expect(countCompletedQuests(state, ["q1", "q2"])).toBe(0);
  });

  it("空のIDリストの場合は0", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    expect(countCompletedQuests(state, [])).toBe(0);
  });
});

// --- シリアライズ/デシリアライズ ---

describe("serializeProgress", () => {
  it("空の進捗状態をシリアライズできる", () => {
    const state = createEmptyProgress();
    const serialized = serializeProgress(state);
    expect(serialized.entries).toEqual([]);
  });

  it("完了記録を含む進捗状態をシリアライズできる", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    state = recordCompletion(state, "q1", {
      completedAt: 2000,
      stepCount: 3,
    });
    const serialized = serializeProgress(state);
    expect(serialized.entries).toHaveLength(1);
    expect(serialized.entries[0]?.questId).toBe("q1");
    expect(serialized.entries[0]?.completions).toHaveLength(2);
  });
});

describe("deserializeProgress", () => {
  it("有効なデータをデシリアライズできる", () => {
    const data = {
      entries: [
        {
          questId: "q1",
          completions: [
            { completedAt: 1000, stepCount: 5 },
            { completedAt: 2000, stepCount: 3 },
          ],
        },
      ],
    };
    const state = deserializeProgress(data);
    expect(state.entries.size).toBe(1);
    expect(isQuestCompleted(state, "q1")).toBe(true);
    expect(getCompletionCount(state, "q1")).toBe(2);
    expect(getBestStepCount(state, "q1")).toBe(3);
  });

  it("nullの場合は空の進捗を返す", () => {
    const state = deserializeProgress(null);
    expect(state.entries.size).toBe(0);
  });

  it("undefinedの場合は空の進捗を返す", () => {
    const state = deserializeProgress(undefined);
    expect(state.entries.size).toBe(0);
  });

  it("不正な形式の場合は空の進捗を返す", () => {
    const state = deserializeProgress({ foo: "bar" });
    expect(state.entries.size).toBe(0);
  });

  it("entriesが配列でない場合は空の進捗を返す", () => {
    const state = deserializeProgress({ entries: "not-array" });
    expect(state.entries.size).toBe(0);
  });

  it("不正なエントリはスキップされる", () => {
    const data = {
      entries: [
        { questId: "q1", completions: [{ completedAt: 1000, stepCount: 5 }] },
        { questId: 123, completions: [] }, // questIdが文字列でない
        { completions: [{ completedAt: 1000, stepCount: 5 }] }, // questIdがない
        { questId: "q3", completions: "invalid" }, // completionsが配列でない
        null, // null
      ],
    };
    const state = deserializeProgress(data);
    // q1のみ有効、他はスキップ
    expect(state.entries.size).toBe(1);
    expect(isQuestCompleted(state, "q1")).toBe(true);
  });

  it("不正な完了記録はスキップされる", () => {
    const data = {
      entries: [
        {
          questId: "q1",
          completions: [
            { completedAt: 1000, stepCount: 5 }, // 有効
            { completedAt: "invalid", stepCount: 5 }, // completedAtが数値でない
            { completedAt: 1000 }, // stepCountがない
            null, // null
          ],
        },
      ],
    };
    const state = deserializeProgress(data);
    expect(getCompletionCount(state, "q1")).toBe(1);
  });

  it("completionsが空のエントリはスキップされる", () => {
    const data = {
      entries: [{ questId: "q1", completions: [] }],
    };
    const state = deserializeProgress(data);
    expect(state.entries.size).toBe(0);
  });

  it("ラウンドトリップが正しく動作する", () => {
    let state = createEmptyProgress();
    state = recordCompletion(state, "q1", {
      completedAt: 1000,
      stepCount: 5,
    });
    state = recordCompletion(state, "q1", {
      completedAt: 2000,
      stepCount: 3,
    });
    state = recordCompletion(state, "q2", {
      completedAt: 3000,
      stepCount: 8,
    });

    const serialized = serializeProgress(state);
    const deserialized = deserializeProgress(serialized);

    expect(isQuestCompleted(deserialized, "q1")).toBe(true);
    expect(isQuestCompleted(deserialized, "q2")).toBe(true);
    expect(getCompletionCount(deserialized, "q1")).toBe(2);
    expect(getBestStepCount(deserialized, "q1")).toBe(3);
    expect(getBestStepCount(deserialized, "q2")).toBe(8);
  });
});
