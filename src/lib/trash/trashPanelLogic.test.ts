import { describe, it, expect } from "vitest";
import type { TrashItem } from "./trashState";
import {
  toTrashDisplayItem,
  toTrashDisplayItems,
  filterTrashDisplayItems,
  buildTrashFilterOptions,
  formatRemainingDays,
  type TrashKindLabels,
} from "./trashPanelLogic";

const kindLabels: TrashKindLabels = {
  notebook: "Notebook",
  "custom-quest": "Custom Quest",
  script: "Script",
  "proof-entry": "Proof Entry",
};

const baseNow = 1_000_000_000;

const sampleItems: readonly TrashItem[] = [
  {
    trashId: "trash-1",
    kind: "notebook",
    originalId: "nb-1",
    displayName: "テストノート",
    trashedAt: baseNow - 1000,
    serializedData: "{}",
  },
  {
    trashId: "trash-2",
    kind: "script",
    originalId: "s-1",
    displayName: "テストスクリプト",
    trashedAt: baseNow - 2000,
    serializedData: "{}",
  },
  {
    trashId: "trash-3",
    kind: "notebook",
    originalId: "nb-2",
    displayName: "別のノート",
    trashedAt: baseNow - 500,
    serializedData: "{}",
  },
];

describe("toTrashDisplayItem", () => {
  it("TrashItemを表示用に変換できる", () => {
    const result = toTrashDisplayItem(sampleItems[0]!, baseNow, kindLabels);
    expect(result.trashId).toBe("trash-1");
    expect(result.kind).toBe("notebook");
    expect(result.displayName).toBe("テストノート");
    expect(result.kindLabel).toBe("Notebook");
    expect(result.remainingDays).toBe(30);
  });
});

describe("toTrashDisplayItems", () => {
  it("新しいものが先にソートされる", () => {
    const result = toTrashDisplayItems(sampleItems, baseNow, kindLabels);
    expect(result.map((i) => i.trashId)).toEqual([
      "trash-3",
      "trash-1",
      "trash-2",
    ]);
  });

  it("空配列に対して空配列を返す", () => {
    const result = toTrashDisplayItems([], baseNow, kindLabels);
    expect(result).toEqual([]);
  });
});

describe("filterTrashDisplayItems", () => {
  const displayItems = toTrashDisplayItems(sampleItems, baseNow, kindLabels);

  it("nullフィルタは全件を返す", () => {
    const result = filterTrashDisplayItems(displayItems, null);
    expect(result.length).toBe(3);
  });

  it("種別でフィルタリングできる", () => {
    const result = filterTrashDisplayItems(displayItems, "notebook");
    expect(result.length).toBe(2);
    expect(result.every((i) => i.kind === "notebook")).toBe(true);
  });

  it("該当なしの種別は空配列を返す", () => {
    const result = filterTrashDisplayItems(displayItems, "custom-quest");
    expect(result.length).toBe(0);
  });
});

describe("buildTrashFilterOptions", () => {
  const displayItems = toTrashDisplayItems(sampleItems, baseNow, kindLabels);

  it("全体と存在する種別のみのフィルタ選択肢を返す", () => {
    const options = buildTrashFilterOptions(displayItems, kindLabels, "All");
    expect(options.length).toBe(3); // All + notebook + script
    expect(options[0]).toEqual({ kind: null, label: "All", count: 3 });
    expect(options[1]).toEqual({
      kind: "notebook",
      label: "Notebook",
      count: 2,
    });
    expect(options[2]).toEqual({ kind: "script", label: "Script", count: 1 });
  });

  it("空配列では全体のみを返す", () => {
    const options = buildTrashFilterOptions([], kindLabels, "All");
    expect(options.length).toBe(1);
    expect(options[0]).toEqual({ kind: null, label: "All", count: 0 });
  });
});

describe("formatRemainingDays", () => {
  it("テンプレートに日数を埋め込む", () => {
    expect(formatRemainingDays(15, "{days} days left")).toBe("15 days left");
  });

  it("日本語テンプレートでも動作する", () => {
    expect(formatRemainingDays(7, "あと{days}日")).toBe("あと7日");
  });
});
