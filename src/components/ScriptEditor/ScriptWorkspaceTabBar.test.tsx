import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScriptWorkspaceTabBar } from "./ScriptWorkspaceTabBar";
import type { WorkspaceTab } from "./scriptWorkspaceState";

const sampleTabs: readonly WorkspaceTab[] = [
  {
    id: "tab-1",
    source: "unnamed",
    title: "Unnamed-1",
    code: "",
    originalCode: "",
    sourceId: undefined,
    readonly: false,
  },
  {
    id: "tab-2",
    source: "library",
    title: "Template",
    code: "// code",
    originalCode: "// code",
    sourceId: "tpl-1",
    readonly: true,
  },
];

describe("ScriptWorkspaceTabBar", () => {
  describe("コンテキストメニュー onTabContextMenuAction 未指定", () => {
    it("メニュー項目クリックでアクションは呼ばれずメニューが閉じる", async () => {
      // onTabContextMenuAction を渡さない
      render(
        <ScriptWorkspaceTabBar
          tabs={sampleTabs}
          activeTabId="tab-1"
          onSelectTab={vi.fn()}
          onCloseTab={vi.fn()}
          onNewTab={vi.fn()}
        />,
      );

      // コンテキストメニューを右クリックで開く
      const tab = screen.getByTestId("workspace-tab-tab-1");
      fireEvent.contextMenu(tab);

      // メニューが表示される
      const menuItem = screen.getByTestId("context-menu-item-close");
      expect(menuItem).toBeInTheDocument();

      // メニュー項目をクリック → onTabContextMenuAction がないので何も起きずclose
      await userEvent.click(menuItem);

      // メニューが閉じる
      expect(
        screen.queryByTestId("context-menu-item-close"),
      ).not.toBeInTheDocument();
    });
  });
});
