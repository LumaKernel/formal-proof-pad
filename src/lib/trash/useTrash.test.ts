import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useTrash,
  loadTrashState,
  saveTrashState,
  TRASH_STORAGE_KEY,
} from "./useTrash";
import {
  createEmptyTrash,
  addToTrash,
  serializeTrashState,
  TRASH_EXPIRY_MS,
} from "./trashState";

describe("localStorage adapter", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = globalThis.localStorage;
    storage.clear();
  });

  it("loadTrashStateは保存データがない場合空のゴミ箱を返す", () => {
    const result = loadTrashState(storage);
    expect(result).toEqual(createEmptyTrash());
  });

  it("saveTrashState → loadTrashState でラウンドトリップできる", () => {
    const state = addToTrash(
      createEmptyTrash(),
      "notebook",
      "nb-1",
      "テストノート",
      '{"data":"test"}',
      1000,
    );
    saveTrashState(storage, state);
    const loaded = loadTrashState(storage);
    expect(loaded.items.length).toBe(1);
    expect(loaded.items[0]?.displayName).toBe("テストノート");
  });

  it("不正なデータが保存されている場合空のゴミ箱を返す", () => {
    storage.setItem(TRASH_STORAGE_KEY, "invalid-json");
    const result = loadTrashState(storage);
    expect(result).toEqual(createEmptyTrash());
  });
});

describe("useTrash hook", () => {
  const baseNow = 1000000;
  const getNow = () => baseNow;

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it("初期状態は空のゴミ箱", () => {
    const { result } = renderHook(() => useTrash({ getNow }));
    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it("localStorageに保存済みデータがあれば復元される", () => {
    const state = addToTrash(
      createEmptyTrash(),
      "notebook",
      "nb-1",
      "保存済みノート",
      "{}",
      baseNow,
    );
    globalThis.localStorage.setItem(
      TRASH_STORAGE_KEY,
      serializeTrashState(state),
    );

    const { result } = renderHook(() => useTrash({ getNow }));
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0]?.displayName).toBe("保存済みノート");
  });

  it("moveToTrashでアイテムをゴミ箱に追加できる", () => {
    const { result } = renderHook(() => useTrash({ getNow }));

    act(() => {
      result.current.moveToTrash(
        "notebook",
        "nb-1",
        "テストノート",
        '{"id":"nb-1"}',
      );
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0]?.kind).toBe("notebook");
    expect(result.current.items[0]?.displayName).toBe("テストノート");
    expect(result.current.count).toBe(1);
  });

  it("findItemでゴミ箱アイテムを取得できる", () => {
    const { result } = renderHook(() => useTrash({ getNow }));

    act(() => {
      result.current.moveToTrash(
        "script",
        "s-1",
        "テストスクリプト",
        '{"code":"x"}',
      );
    });

    const trashId = result.current.items[0]?.trashId ?? "";
    const found = result.current.findItem(trashId);

    expect(found).toBeDefined();
    expect(found?.displayName).toBe("テストスクリプト");
    expect(found?.serializedData).toBe('{"code":"x"}');
  });

  it("findItemで存在しないIDを指定するとundefinedが返る", () => {
    const { result } = renderHook(() => useTrash({ getNow }));
    expect(result.current.findItem("nonexistent")).toBeUndefined();
  });

  it("removeFromTrashでアイテムをゴミ箱から除去できる", () => {
    const { result } = renderHook(() => useTrash({ getNow }));

    act(() => {
      result.current.moveToTrash(
        "script",
        "s-1",
        "テストスクリプト",
        '{"code":"x"}',
      );
    });

    const trashId = result.current.items[0]?.trashId ?? "";

    act(() => {
      result.current.removeFromTrash(trashId);
    });

    expect(result.current.items.length).toBe(0);
  });

  it("deletePermanentlyでアイテムを完全削除できる", () => {
    const { result } = renderHook(() => useTrash({ getNow }));

    act(() => {
      result.current.moveToTrash("custom-quest", "q-1", "テストクエスト", "{}");
    });

    const trashId = result.current.items[0]?.trashId ?? "";

    act(() => {
      result.current.deletePermanently(trashId);
    });

    expect(result.current.items.length).toBe(0);
  });

  it("emptyでゴミ箱を空にできる", () => {
    const { result } = renderHook(() => useTrash({ getNow }));

    act(() => {
      result.current.moveToTrash("notebook", "nb-1", "ノート1", "{}");
      result.current.moveToTrash("script", "s-1", "スクリプト1", "{}");
    });

    expect(result.current.count).toBe(2);

    act(() => {
      result.current.empty();
    });

    expect(result.current.count).toBe(0);
  });

  it("getItemsByKindで種別フィルタできる", () => {
    const { result } = renderHook(() => useTrash({ getNow }));

    act(() => {
      result.current.moveToTrash("notebook", "nb-1", "ノート1", "{}");
      result.current.moveToTrash("script", "s-1", "スクリプト1", "{}");
      result.current.moveToTrash("notebook", "nb-2", "ノート2", "{}");
    });

    expect(result.current.getItemsByKind("notebook").length).toBe(2);
    expect(result.current.getItemsByKind("script").length).toBe(1);
    expect(result.current.getItemsByKind("custom-quest").length).toBe(0);
  });

  it("初期化時に期限切れアイテムが自動パージされる", () => {
    // 期限切れのアイテムをlocalStorageに保存
    const expiredAt = baseNow - TRASH_EXPIRY_MS - 1;
    let state = addToTrash(
      createEmptyTrash(),
      "notebook",
      "nb-old",
      "期限切れノート",
      "{}",
      expiredAt,
    );
    state = addToTrash(
      state,
      "script",
      "s-new",
      "新しいスクリプト",
      "{}",
      baseNow,
    );
    globalThis.localStorage.setItem(
      TRASH_STORAGE_KEY,
      serializeTrashState(state),
    );

    const { result } = renderHook(() => useTrash({ getNow }));

    // 期限切れアイテムはパージされ、有効なアイテムのみ残る
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0]?.displayName).toBe("新しいスクリプト");
  });

  it("localStorageに永続化される", () => {
    const { result } = renderHook(() => useTrash({ getNow }));

    act(() => {
      result.current.moveToTrash("proof-entry", "pe-1", "証明エントリ", "{}");
    });

    // localStorageから直接読み出して確認
    const stored = globalThis.localStorage.getItem(TRASH_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed: unknown = JSON.parse(stored!);
    expect(parsed).toHaveProperty("items");
  });
});

describe("useTrash 定期パージ", () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("setIntervalで期限切れアイテムが自動パージされる", () => {
    // 初期状態: 有効アイテム1つ + 期限ギリギリのアイテム1つ
    const initialNow = 1_000_000;
    const almostExpiredAt = initialNow - TRASH_EXPIRY_MS + 100; // あと100msで期限切れ
    let state = addToTrash(
      createEmptyTrash(),
      "notebook",
      "nb-old",
      "もうすぐ期限切れ",
      "{}",
      almostExpiredAt,
    );
    state = addToTrash(
      state,
      "script",
      "s-new",
      "新しいスクリプト",
      "{}",
      initialNow,
    );
    globalThis.localStorage.setItem(
      TRASH_STORAGE_KEY,
      serializeTrashState(state),
    );

    // 時刻を進行させるgetNow
    let currentTime = initialNow;
    const getNow = () => currentTime;
    const purgeIntervalMs = 500; // テスト用に短い間隔

    const { result } = renderHook(() => useTrash({ getNow, purgeIntervalMs }));

    // 初期状態では両方残っている
    expect(result.current.items.length).toBe(2);

    // 時刻を進めて期限切れにする
    currentTime = initialNow + 200; // almostExpiredAt から TRASH_EXPIRY_MS + 100 経過

    // setInterval発火
    act(() => {
      vi.advanceTimersByTime(purgeIntervalMs);
    });

    // 期限切れアイテムがパージされ、有効なものだけ残る
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0]?.displayName).toBe("新しいスクリプト");
  });

  it("moveToTrash時に期限切れアイテムもパージされる", () => {
    const initialNow = 1_000_000;
    const expiredAt = initialNow - TRASH_EXPIRY_MS - 1;
    const state = addToTrash(
      createEmptyTrash(),
      "notebook",
      "nb-old",
      "期限切れノート",
      "{}",
      expiredAt,
    );
    globalThis.localStorage.setItem(
      TRASH_STORAGE_KEY,
      serializeTrashState(state),
    );

    // getNowが初期化時には初期時刻を返し、その後の呼び出しでは進めた時刻を返す
    let currentTime = expiredAt + 1; // 初期化時は期限切れではない
    const getNow = () => currentTime;

    const { result } = renderHook(() => useTrash({ getNow }));

    // 初期化時はまだ期限切れではない
    expect(result.current.items.length).toBe(1);

    // 時刻を進めて期限切れにする
    currentTime = initialNow;

    // moveToTrashで新しいアイテムを追加
    act(() => {
      result.current.moveToTrash("script", "s-1", "新しいスクリプト", "{}");
    });

    // 期限切れアイテムはパージされ、新しいアイテムのみ残る
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0]?.displayName).toBe("新しいスクリプト");
  });
});
