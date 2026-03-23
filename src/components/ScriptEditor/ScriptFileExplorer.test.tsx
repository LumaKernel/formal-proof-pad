import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScriptFileExplorer } from "./ScriptFileExplorer";
import type { SavedScript } from "./savedScriptsLogic";

const sampleScripts: readonly SavedScript[] = [
  {
    id: "s1",
    title: "Hello World",
    code: 'console.log("hello")',
    savedAt: 1718_441_400_000,
  },
  {
    id: "s2",
    title: "Proof Demo",
    code: 'parseFormula("phi -> psi")',
    savedAt: 1718_540_400_000,
  },
];

describe("ScriptFileExplorer", () => {
  describe("リネーム Enter で元と同じタイトル → onRename 未呼出", () => {
    it("newTitle === null パスを通る", async () => {
      const onRename = vi.fn();
      const onOpen = vi.fn();
      const onDelete = vi.fn();
      render(
        <ScriptFileExplorer
          scripts={sampleScripts}
          onOpen={onOpen}
          onRename={onRename}
          onDelete={onDelete}
        />,
      );

      // ホバーしてリネームボタン表示
      const item = screen.getByTestId("file-explorer-item-s1");
      await userEvent.hover(item);

      // リネームモードに入る
      const renameBtn = screen.getByTestId("file-explorer-rename-btn-s1");
      await userEvent.click(renameBtn);

      // 入力欄で元のタイトルのまま Enter
      const input = screen.getByTestId("file-explorer-rename-input-s1");
      await userEvent.keyboard("{Enter}");

      // 元のタイトルと同じなので onRename は呼ばれない
      expect(onRename).not.toHaveBeenCalled();

      // リネームモードが解除されている
      expect(input).not.toBeInTheDocument();
    });
  });

  describe("リネーム blur で元と同じタイトル → onRename 未呼出", () => {
    it("blur ハンドラの newTitle === null パスを通る", async () => {
      const onRename = vi.fn();
      const onOpen = vi.fn();
      const onDelete = vi.fn();
      render(
        <ScriptFileExplorer
          scripts={sampleScripts}
          onOpen={onOpen}
          onRename={onRename}
          onDelete={onDelete}
        />,
      );

      // ホバーしてリネームボタン表示
      const item = screen.getByTestId("file-explorer-item-s1");
      await userEvent.hover(item);

      // リネームモードに入る
      const renameBtn = screen.getByTestId("file-explorer-rename-btn-s1");
      await userEvent.click(renameBtn);

      // 元のタイトルのまま Tab でフォーカスを外す
      await userEvent.tab();

      // 元のタイトルと同じなので onRename は呼ばれない
      expect(onRename).not.toHaveBeenCalled();
    });
  });

  describe("空の状態", () => {
    it("スクリプトが0件の場合に空メッセージが表示される", () => {
      render(
        <ScriptFileExplorer
          scripts={[]}
          onOpen={vi.fn()}
          onRename={vi.fn()}
          onDelete={vi.fn()}
        />,
      );

      expect(screen.getByTestId("file-explorer-empty")).toHaveTextContent(
        "No saved scripts",
      );
      expect(
        screen.queryByTestId("file-explorer-list"),
      ).not.toBeInTheDocument();
    });
  });
});
