/**
 * ゴミ箱の純粋ロジックテスト。
 */
import { describe, it, expect } from "vitest";
import {
  createEmptyTrash,
  addToTrash,
  getTrashItem,
  restoreFromTrash,
  permanentlyDelete,
  emptyTrash,
  purgeExpiredItems,
  getTrashItemsByKind,
  getTrashItemCount,
  isExpired,
  getRemainingDays,
  serializeTrashState,
  deserializeTrashState,
  TRASH_EXPIRY_MS,
  TRASH_EXPIRY_DAYS,
} from "./trashState";

const NOW = 1700000000000; // 固定タイムスタンプ

describe("trashState", () => {
  describe("createEmptyTrash", () => {
    it("空のゴミ箱を作成する", () => {
      const trash = createEmptyTrash();
      expect(trash.items).toEqual([]);
      expect(trash.nextTrashId).toBe(1);
    });
  });

  describe("addToTrash", () => {
    it("アイテムをゴミ箱に追加する", () => {
      const trash = createEmptyTrash();
      const result = addToTrash(
        trash,
        "notebook",
        "nb-1",
        "My Notebook",
        '{"data":"test"}',
        NOW,
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.trashId).toBe("trash-1");
      expect(result.items[0]!.kind).toBe("notebook");
      expect(result.items[0]!.originalId).toBe("nb-1");
      expect(result.items[0]!.displayName).toBe("My Notebook");
      expect(result.items[0]!.trashedAt).toBe(NOW);
      expect(result.items[0]!.serializedData).toBe('{"data":"test"}');
      expect(result.nextTrashId).toBe(2);
    });

    it("連続追加でIDがインクリメントされる", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note 1", "{}", NOW);
      trash = addToTrash(trash, "script", "sc-1", "Script 1", "{}", NOW);
      expect(trash.items).toHaveLength(2);
      expect(trash.items[0]!.trashId).toBe("trash-1");
      expect(trash.items[1]!.trashId).toBe("trash-2");
      expect(trash.nextTrashId).toBe(3);
    });

    it("異なる種別のアイテムを追加できる", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note", "{}", NOW);
      trash = addToTrash(trash, "custom-quest", "cq-1", "Quest", "{}", NOW);
      trash = addToTrash(trash, "script", "sc-1", "Script", "{}", NOW);
      trash = addToTrash(trash, "proof-entry", "pe-1", "Proof", "{}", NOW);
      expect(trash.items).toHaveLength(4);
      expect(trash.items.map((i) => i.kind)).toEqual([
        "notebook",
        "custom-quest",
        "script",
        "proof-entry",
      ]);
    });
  });

  describe("getTrashItem", () => {
    it("存在するアイテムを取得する", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note", "{}", NOW);
      const item = getTrashItem(trash, "trash-1");
      expect(item).toBeDefined();
      expect(item!.originalId).toBe("nb-1");
    });

    it("存在しないIDでundefinedを返す", () => {
      const trash = createEmptyTrash();
      expect(getTrashItem(trash, "trash-999")).toBeUndefined();
    });
  });

  describe("restoreFromTrash", () => {
    it("アイテムを復元してゴミ箱から除去する", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note", '{"a":1}', NOW);
      trash = addToTrash(trash, "script", "sc-1", "Script", '{"b":2}', NOW);
      const { newState, item } = restoreFromTrash(trash, "trash-1");
      expect(item).toBeDefined();
      expect(item!.originalId).toBe("nb-1");
      expect(item!.serializedData).toBe('{"a":1}');
      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]!.trashId).toBe("trash-2");
    });

    it("存在しないIDではundefinedを返し状態を変更しない", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note", "{}", NOW);
      const { newState, item } = restoreFromTrash(trash, "trash-999");
      expect(item).toBeUndefined();
      expect(newState).toBe(trash); // 参照等価
    });
  });

  describe("permanentlyDelete", () => {
    it("アイテムを完全削除する", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note", "{}", NOW);
      const result = permanentlyDelete(trash, "trash-1");
      expect(result.items).toHaveLength(0);
    });

    it("存在しないIDでは変更なし", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note", "{}", NOW);
      const result = permanentlyDelete(trash, "trash-999");
      expect(result.items).toHaveLength(1);
    });
  });

  describe("emptyTrash", () => {
    it("全アイテムを削除する", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note 1", "{}", NOW);
      trash = addToTrash(trash, "script", "sc-1", "Script 1", "{}", NOW);
      const result = emptyTrash(trash);
      expect(result.items).toHaveLength(0);
      expect(result.nextTrashId).toBe(3); // IDカウンタは保持
    });
  });

  describe("purgeExpiredItems", () => {
    it("期限切れアイテムを削除する", () => {
      let trash = createEmptyTrash();
      // 31日前に追加（期限切れ）
      const thirtyOneDaysAgo = NOW - 31 * 24 * 60 * 60 * 1000;
      trash = addToTrash(
        trash,
        "notebook",
        "nb-old",
        "Old Note",
        "{}",
        thirtyOneDaysAgo,
      );
      // 今追加（有効）
      trash = addToTrash(trash, "script", "sc-new", "New Script", "{}", NOW);
      const result = purgeExpiredItems(trash, NOW);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.originalId).toBe("sc-new");
    });

    it("ちょうど30日のアイテムは削除される", () => {
      let trash = createEmptyTrash();
      const exactly30Days = NOW - TRASH_EXPIRY_MS;
      trash = addToTrash(
        trash,
        "notebook",
        "nb-1",
        "Note",
        "{}",
        exactly30Days,
      );
      const result = purgeExpiredItems(trash, NOW);
      expect(result.items).toHaveLength(0);
    });

    it("30日未満のアイテムは保持される", () => {
      let trash = createEmptyTrash();
      const justUnder30Days = NOW - TRASH_EXPIRY_MS + 1;
      trash = addToTrash(
        trash,
        "notebook",
        "nb-1",
        "Note",
        "{}",
        justUnder30Days,
      );
      const result = purgeExpiredItems(trash, NOW);
      expect(result.items).toHaveLength(1);
    });

    it("期限切れアイテムがない場合は同じ参照を返す", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note", "{}", NOW);
      const result = purgeExpiredItems(trash, NOW);
      expect(result).toBe(trash); // 参照等価
    });
  });

  describe("getTrashItemsByKind", () => {
    it("種別でフィルタリングする", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note 1", "{}", NOW);
      trash = addToTrash(trash, "script", "sc-1", "Script 1", "{}", NOW);
      trash = addToTrash(trash, "notebook", "nb-2", "Note 2", "{}", NOW);
      const notebooks = getTrashItemsByKind(trash, "notebook");
      expect(notebooks).toHaveLength(2);
      expect(notebooks.map((i) => i.originalId)).toEqual(["nb-1", "nb-2"]);
    });

    it("該当なしで空配列を返す", () => {
      const trash = createEmptyTrash();
      expect(getTrashItemsByKind(trash, "notebook")).toEqual([]);
    });
  });

  describe("getTrashItemCount", () => {
    it("アイテム数を返す", () => {
      let trash = createEmptyTrash();
      expect(getTrashItemCount(trash)).toBe(0);
      trash = addToTrash(trash, "notebook", "nb-1", "Note", "{}", NOW);
      expect(getTrashItemCount(trash)).toBe(1);
    });
  });

  describe("isExpired", () => {
    it("期限切れアイテムでtrueを返す", () => {
      const item = {
        trashId: "trash-1",
        kind: "notebook" as const,
        originalId: "nb-1",
        displayName: "Note",
        trashedAt: NOW - TRASH_EXPIRY_MS - 1,
        serializedData: "{}",
      };
      expect(isExpired(item, NOW)).toBe(true);
    });

    it("有効なアイテムでfalseを返す", () => {
      const item = {
        trashId: "trash-1",
        kind: "notebook" as const,
        originalId: "nb-1",
        displayName: "Note",
        trashedAt: NOW,
        serializedData: "{}",
      };
      expect(isExpired(item, NOW)).toBe(false);
    });
  });

  describe("getRemainingDays", () => {
    it("残り日数を正しく計算する", () => {
      const item = {
        trashId: "trash-1",
        kind: "notebook" as const,
        originalId: "nb-1",
        displayName: "Note",
        trashedAt: NOW,
        serializedData: "{}",
      };
      expect(getRemainingDays(item, NOW)).toBe(TRASH_EXPIRY_DAYS);
    });

    it("期限切れでは負の値を返す", () => {
      const item = {
        trashId: "trash-1",
        kind: "notebook" as const,
        originalId: "nb-1",
        displayName: "Note",
        trashedAt: NOW - TRASH_EXPIRY_MS - 2 * 24 * 60 * 60 * 1000,
        serializedData: "{}",
      };
      expect(getRemainingDays(item, NOW)).toBeLessThan(0);
    });
  });

  describe("serialization", () => {
    it("シリアライズとデシリアライズが往復する", () => {
      let trash = createEmptyTrash();
      trash = addToTrash(trash, "notebook", "nb-1", "Note 1", '{"a":1}', NOW);
      trash = addToTrash(
        trash,
        "custom-quest",
        "cq-1",
        "Quest 1",
        '{"b":2}',
        NOW + 1000,
      );
      const json = serializeTrashState(trash);
      const restored = deserializeTrashState(json);
      expect(restored).toBeDefined();
      expect(restored!.items).toHaveLength(2);
      expect(restored!.items[0]!.trashId).toBe("trash-1");
      expect(restored!.items[0]!.kind).toBe("notebook");
      expect(restored!.items[0]!.serializedData).toBe('{"a":1}');
      expect(restored!.items[1]!.kind).toBe("custom-quest");
      expect(restored!.nextTrashId).toBe(3);
    });

    it("空のゴミ箱をシリアライズ/デシリアライズできる", () => {
      const trash = createEmptyTrash();
      const json = serializeTrashState(trash);
      const restored = deserializeTrashState(json);
      expect(restored).toEqual(trash);
    });

    it("不正なJSONでundefinedを返す", () => {
      expect(deserializeTrashState("invalid json")).toBeUndefined();
    });

    it("不正な構造でundefinedを返す", () => {
      expect(deserializeTrashState('{"items":null}')).toBeUndefined();
    });
  });
});
