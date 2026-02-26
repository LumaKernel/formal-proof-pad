import { describe, expect, it } from "vitest";
import { alignHorizontal, alignVertical, distribute } from "./alignment";
import type { AlignableItem } from "./alignment";

// --- テストヘルパー ---

function makeItem(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
): AlignableItem {
  return { id, position: { x, y }, size: { width, height } };
}

// --- alignHorizontal ---

describe("alignHorizontal", () => {
  const items: readonly AlignableItem[] = [
    makeItem("a", 10, 0, 100, 50),
    makeItem("b", 50, 20, 80, 50),
    makeItem("c", 200, 10, 120, 50),
  ];

  describe("left", () => {
    it("全アイテムの左端を最小左端に揃える", () => {
      const result = alignHorizontal(items, "left");
      // 最小左端は10（item a）
      expect(result.get("a")).toBeUndefined(); // aは既に10
      expect(result.get("b")).toEqual({ x: 10, y: 20 });
      expect(result.get("c")).toEqual({ x: 10, y: 10 });
    });
  });

  describe("right", () => {
    it("全アイテムの右端を最大右端に揃える", () => {
      const result = alignHorizontal(items, "right");
      // 最大右端は200+120=320（item c）
      expect(result.get("a")).toEqual({ x: 220, y: 0 }); // 320 - 100
      expect(result.get("b")).toEqual({ x: 240, y: 20 }); // 320 - 80
      expect(result.get("c")).toBeUndefined(); // cは既に200 (200+120=320)
    });
  });

  describe("center", () => {
    it("全アイテムの中心を平均中心に揃える", () => {
      const result = alignHorizontal(items, "center");
      // 中心: a=60, b=90, c=260 → 平均 = (60+90+260)/3 ≈ 136.67
      const avgCenter = (60 + 90 + 260) / 3;
      const aResult = result.get("a");
      const bResult = result.get("b");
      const cResult = result.get("c");
      expect(aResult).toBeDefined();
      expect(bResult).toBeDefined();
      expect(cResult).toBeDefined();
      // 各アイテムの中心が平均中心に揃う
      expect(aResult!.x + 100 / 2).toBeCloseTo(avgCenter);
      expect(bResult!.x + 80 / 2).toBeCloseTo(avgCenter);
      expect(cResult!.x + 120 / 2).toBeCloseTo(avgCenter);
      // y座標は変わらない
      expect(aResult!.y).toBe(0);
      expect(bResult!.y).toBe(20);
      expect(cResult!.y).toBe(10);
    });
  });

  it("アイテム数が1以下の場合は空のMapを返す", () => {
    expect(alignHorizontal([], "left").size).toBe(0);
    expect(alignHorizontal([makeItem("a", 10, 0, 100, 50)], "left").size).toBe(
      0,
    );
  });

  it("既に揃っているアイテムは結果に含めない", () => {
    const aligned = [
      makeItem("a", 10, 0, 100, 50),
      makeItem("b", 10, 20, 80, 50),
    ];
    const result = alignHorizontal(aligned, "left");
    // 両方とも左端が10なので、移動なし
    expect(result.size).toBe(0);
  });
});

// --- alignVertical ---

describe("alignVertical", () => {
  const items: readonly AlignableItem[] = [
    makeItem("a", 0, 10, 50, 100),
    makeItem("b", 20, 50, 50, 80),
    makeItem("c", 10, 200, 50, 120),
  ];

  describe("top", () => {
    it("全アイテムの上端を最小上端に揃える", () => {
      const result = alignVertical(items, "top");
      // 最小上端は10（item a）
      expect(result.get("a")).toBeUndefined();
      expect(result.get("b")).toEqual({ x: 20, y: 10 });
      expect(result.get("c")).toEqual({ x: 10, y: 10 });
    });
  });

  describe("bottom", () => {
    it("全アイテムの下端を最大下端に揃える", () => {
      const result = alignVertical(items, "bottom");
      // 最大下端は200+120=320（item c）
      expect(result.get("a")).toEqual({ x: 0, y: 220 }); // 320 - 100
      expect(result.get("b")).toEqual({ x: 20, y: 240 }); // 320 - 80
      expect(result.get("c")).toBeUndefined();
    });
  });

  describe("middle", () => {
    it("全アイテムの中央を平均中央に揃える", () => {
      const result = alignVertical(items, "middle");
      // 中央: a=60, b=90, c=260 → 平均 = (60+90+260)/3 ≈ 136.67
      const avgMiddle = (60 + 90 + 260) / 3;
      const aResult = result.get("a");
      const bResult = result.get("b");
      const cResult = result.get("c");
      expect(aResult).toBeDefined();
      expect(bResult).toBeDefined();
      expect(cResult).toBeDefined();
      expect(aResult!.y + 100 / 2).toBeCloseTo(avgMiddle);
      expect(bResult!.y + 80 / 2).toBeCloseTo(avgMiddle);
      expect(cResult!.y + 120 / 2).toBeCloseTo(avgMiddle);
      // x座標は変わらない
      expect(aResult!.x).toBe(0);
      expect(bResult!.x).toBe(20);
      expect(cResult!.x).toBe(10);
    });
  });

  it("アイテム数が1以下の場合は空のMapを返す", () => {
    expect(alignVertical([], "top").size).toBe(0);
    expect(alignVertical([makeItem("a", 0, 10, 50, 100)], "top").size).toBe(0);
  });

  it("既に揃っているアイテムは結果に含めない", () => {
    const aligned = [
      makeItem("a", 0, 10, 50, 100),
      makeItem("b", 20, 10, 50, 80),
    ];
    const result = alignVertical(aligned, "top");
    expect(result.size).toBe(0);
  });
});

// --- distribute ---

describe("distribute", () => {
  describe("horizontal", () => {
    it("3つのアイテムを等間隔に水平分配する", () => {
      const items = [
        makeItem("a", 0, 0, 40, 50),
        makeItem("b", 100, 10, 40, 50),
        makeItem("c", 300, 20, 40, 50),
      ];
      const result = distribute(items, "horizontal");
      // sorted by center: a(center=20), b(center=120), c(center=320)
      // first left = 0, last right = 340
      // totalSpace = 340, totalItemWidth = 120, gap = (340-120)/2 = 110
      // a: 0 (unchanged), b: 0+40+110=150, c: 150+40+110=300 (unchanged)
      expect(result.get("a")).toBeUndefined();
      expect(result.get("b")).toEqual({ x: 150, y: 10 });
      expect(result.get("c")).toBeUndefined();
    });

    it("異なるサイズのアイテムを正しく分配する", () => {
      const items = [
        makeItem("a", 0, 0, 20, 50),
        makeItem("b", 50, 0, 60, 50),
        makeItem("c", 200, 0, 40, 50),
      ];
      const result = distribute(items, "horizontal");
      // sorted by center: a(10), b(80), c(220)
      // first left = 0, last right = 240
      // totalSpace = 240, totalItemWidth = 120, gap = (240-120)/2 = 60
      // a: 0 (unchanged), b: 0+20+60=80, c: 80+60+60=200 (unchanged)
      expect(result.get("a")).toBeUndefined();
      expect(result.get("b")).toEqual({ x: 80, y: 0 });
      expect(result.get("c")).toBeUndefined();
    });

    it("4つのアイテムを等間隔に分配する", () => {
      const items = [
        makeItem("a", 0, 0, 30, 50),
        makeItem("b", 50, 10, 30, 50),
        makeItem("c", 100, 20, 30, 50),
        makeItem("d", 300, 30, 30, 50),
      ];
      const result = distribute(items, "horizontal");
      // sorted by center: a(15), b(65), c(115), d(315)
      // first left = 0, last right = 330
      // totalSpace = 330, totalItemWidth = 120, gap = (330-120)/3 = 70
      // a: 0, b: 0+30+70=100, c: 100+30+70=200, d: 200+30+70=300
      expect(result.get("a")).toBeUndefined();
      expect(result.get("b")).toEqual({ x: 100, y: 10 });
      expect(result.get("c")).toEqual({ x: 200, y: 20 });
      expect(result.get("d")).toBeUndefined();
    });

    it("y座標を変更しない", () => {
      const items = [
        makeItem("a", 0, 100, 30, 50),
        makeItem("b", 50, 200, 30, 50),
        makeItem("c", 300, 300, 30, 50),
      ];
      const result = distribute(items, "horizontal");
      for (const [id, pos] of result) {
        const original = items.find((item) => item.id === id)!;
        expect(pos.y).toBe(original.position.y);
      }
    });
  });

  describe("vertical", () => {
    it("3つのアイテムを等間隔に垂直分配する", () => {
      const items = [
        makeItem("a", 0, 0, 50, 40),
        makeItem("b", 10, 100, 50, 40),
        makeItem("c", 20, 300, 50, 40),
      ];
      const result = distribute(items, "vertical");
      // sorted by center: a(20), b(120), c(320)
      // first top = 0, last bottom = 340
      // totalSpace = 340, totalItemHeight = 120, gap = (340-120)/2 = 110
      // a: 0, b: 0+40+110=150, c: 150+40+110=300
      expect(result.get("a")).toBeUndefined();
      expect(result.get("b")).toEqual({ x: 10, y: 150 });
      expect(result.get("c")).toBeUndefined();
    });

    it("x座標を変更しない", () => {
      const items = [
        makeItem("a", 100, 0, 50, 30),
        makeItem("b", 200, 50, 50, 30),
        makeItem("c", 300, 300, 50, 30),
      ];
      const result = distribute(items, "vertical");
      for (const [id, pos] of result) {
        const original = items.find((item) => item.id === id)!;
        expect(pos.x).toBe(original.position.x);
      }
    });
  });

  it("アイテム数が2以下の場合は空のMapを返す", () => {
    expect(distribute([], "horizontal").size).toBe(0);
    expect(distribute([makeItem("a", 0, 0, 50, 50)], "horizontal").size).toBe(
      0,
    );
    expect(
      distribute(
        [makeItem("a", 0, 0, 50, 50), makeItem("b", 100, 0, 50, 50)],
        "horizontal",
      ).size,
    ).toBe(0);
  });

  it("既に等間隔のアイテムは結果に含めない", () => {
    const items = [
      makeItem("a", 0, 0, 30, 50),
      makeItem("b", 100, 0, 30, 50),
      makeItem("c", 200, 0, 30, 50),
    ];
    const result = distribute(items, "horizontal");
    // gap = (230-90)/2 = 70. a:0, b:0+30+70=100, c:100+30+70=200
    expect(result.size).toBe(0);
  });

  it("ソート順が位置中心で決まる", () => {
    // bの位置は小さいが、幅が大きいため中心が後ろになるケース
    const items = [
      makeItem("a", 0, 0, 20, 50), // center=10
      makeItem("b", 5, 0, 100, 50), // center=55
      makeItem("c", 200, 0, 20, 50), // center=210
    ];
    const result = distribute(items, "horizontal");
    // sorted: a(10), b(55), c(210)
    // first left = 0, last right = 220
    // totalItemWidth = 140, gap = (220-140)/2 = 40
    // a: 0, b: 0+20+40=60, c: 60+100+40=200
    expect(result.get("a")).toBeUndefined();
    expect(result.get("b")).toEqual({ x: 60, y: 0 });
    expect(result.get("c")).toBeUndefined();
  });
});
