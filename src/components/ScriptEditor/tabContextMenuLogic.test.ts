import { describe, it, expect } from "vitest";
import { computeTabContextMenuItems } from "./tabContextMenuLogic";

describe("tabContextMenuLogic", () => {
  describe("computeTabContextMenuItems", () => {
    it("基本的なメニュー項目を6つ返す", () => {
      const items = computeTabContextMenuItems({ tabIndex: 0, totalTabs: 3 });
      expect(items).toHaveLength(6);
      expect(items.map((i) => i.id)).toEqual([
        "copy-script-name",
        "duplicate",
        "close",
        "close-others",
        "close-to-right",
        "close-all",
      ]);
    });

    it("タブが1つのみの場合、close-othersが無効", () => {
      const items = computeTabContextMenuItems({ tabIndex: 0, totalTabs: 1 });
      const closeOthers = items.find((i) => i.id === "close-others");
      expect(closeOthers?.disabled).toBe(true);
    });

    it("タブが複数の場合、close-othersが有効", () => {
      const items = computeTabContextMenuItems({ tabIndex: 0, totalTabs: 2 });
      const closeOthers = items.find((i) => i.id === "close-others");
      expect(closeOthers?.disabled).not.toBe(true);
    });

    it("最後のタブではclose-to-rightが無効", () => {
      const items = computeTabContextMenuItems({ tabIndex: 2, totalTabs: 3 });
      const closeToRight = items.find((i) => i.id === "close-to-right");
      expect(closeToRight?.disabled).toBe(true);
    });

    it("最後でないタブではclose-to-rightが有効", () => {
      const items = computeTabContextMenuItems({ tabIndex: 1, totalTabs: 3 });
      const closeToRight = items.find((i) => i.id === "close-to-right");
      expect(closeToRight?.disabled).not.toBe(true);
    });

    it("close, duplicate, copy-script-name, close-allは常に有効", () => {
      const items = computeTabContextMenuItems({ tabIndex: 0, totalTabs: 1 });
      const alwaysEnabled = [
        "copy-script-name",
        "duplicate",
        "close",
        "close-all",
      ];
      for (const id of alwaysEnabled) {
        const item = items.find((i) => i.id === id);
        expect(item?.disabled).not.toBe(true);
      }
    });
  });
});
