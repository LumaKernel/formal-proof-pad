import { describe, it, expect } from "vitest";
import {
  getSourceIcon,
  computeTabDisplay,
  computeAllTabDisplays,
  formatTabLabel,
} from "./tabBarLogic";
import type { WorkspaceTab } from "./scriptWorkspaceState";

const mkTab = (overrides: Partial<WorkspaceTab> = {}): WorkspaceTab => ({
  id: "tab-1",
  source: "unnamed",
  title: "Unnamed-1",
  code: "",
  originalCode: "",
  sourceId: undefined,
  readonly: false,
  ...overrides,
});

describe("tabBarLogic", () => {
  describe("getSourceIcon", () => {
    it("unnamed のアイコンを返す", () => {
      expect(getSourceIcon("unnamed")).toBe("\u{1F4DD}");
    });

    it("library のアイコンを返す", () => {
      expect(getSourceIcon("library")).toBe("\u{1F4DA}");
    });

    it("saved のアイコンを返す", () => {
      expect(getSourceIcon("saved")).toBe("\u{1F4BE}");
    });
  });

  describe("computeTabDisplay", () => {
    it("アクティブタブの表示情報を計算する", () => {
      const tab = mkTab({ id: "tab-1" });
      const info = computeTabDisplay(tab, "tab-1");
      expect(info.id).toBe("tab-1");
      expect(info.label).toBe("Unnamed-1");
      expect(info.source).toBe("unnamed");
      expect(info.isActive).toBe(true);
      expect(info.isModified).toBe(false);
      expect(info.isReadonly).toBe(false);
    });

    it("非アクティブタブの表示情報を計算する", () => {
      const tab = mkTab({ id: "tab-1" });
      const info = computeTabDisplay(tab, "tab-2");
      expect(info.isActive).toBe(false);
    });

    it("変更されたUnnamedタブを検出する", () => {
      const tab = mkTab({ code: "some code" });
      const info = computeTabDisplay(tab, "tab-1");
      expect(info.isModified).toBe(true);
    });

    it("readonlyライブラリタブの表示情報", () => {
      const tab = mkTab({
        source: "library",
        readonly: true,
        code: "code",
        originalCode: "code",
      });
      const info = computeTabDisplay(tab, "tab-1");
      expect(info.isReadonly).toBe(true);
      expect(info.isModified).toBe(false);
      expect(info.sourceIcon).toBe("\u{1F4DA}");
    });

    it("変更されたSavedタブの表示情報", () => {
      const tab = mkTab({
        source: "saved",
        code: "modified",
        originalCode: "original",
        sourceId: "script-1",
      });
      const info = computeTabDisplay(tab, "tab-1");
      expect(info.isModified).toBe(true);
      expect(info.sourceIcon).toBe("\u{1F4BE}");
    });
  });

  describe("computeAllTabDisplays", () => {
    it("全タブの表示情報を計算する", () => {
      const tabs = [
        mkTab({ id: "tab-1", title: "First" }),
        mkTab({
          id: "tab-2",
          title: "Second",
          source: "library",
          readonly: true,
        }),
      ];
      const displays = computeAllTabDisplays(tabs, "tab-1");
      expect(displays).toHaveLength(2);
      expect(displays[0]?.isActive).toBe(true);
      expect(displays[1]?.isActive).toBe(false);
    });

    it("空のタブ一覧では空配列を返す", () => {
      const displays = computeAllTabDisplays([], undefined);
      expect(displays).toEqual([]);
    });
  });

  describe("formatTabLabel", () => {
    it("未変更タブのラベルを表示する", () => {
      const tab = mkTab();
      const info = computeTabDisplay(tab, "tab-1");
      const label = formatTabLabel(info);
      expect(label).toBe("\u{1F4DD} Unnamed-1");
    });

    it("変更されたタブのラベルに ● を付加する", () => {
      const tab = mkTab({ code: "some code" });
      const info = computeTabDisplay(tab, "tab-1");
      const label = formatTabLabel(info);
      expect(label).toBe("\u{1F4DD} Unnamed-1 \u25CF");
    });

    it("ライブラリタブのラベルにライブラリアイコンを表示する", () => {
      const tab = mkTab({
        source: "library",
        title: "Template",
        readonly: true,
        code: "code",
        originalCode: "code",
      });
      const info = computeTabDisplay(tab, "tab-1");
      const label = formatTabLabel(info);
      expect(label).toBe("\u{1F4DA} Template");
    });
  });
});
