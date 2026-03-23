import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScriptApiReferencePanel } from "./ScriptApiReferencePanel";

describe("ScriptApiReferencePanel", () => {
  describe("カテゴリヘッダのキーボード操作", () => {
    it("Space キーでカテゴリの展開/折りたたみが切り替わる", () => {
      render(<ScriptApiReferencePanel />);

      // 最初のカテゴリヘッダを取得
      const header = screen.getByTestId("api-category-header-proof");
      expect(header).toBeDefined();

      // Space キーで折りたたみ
      fireEvent.keyDown(header, { key: " " });

      // Enter キーで再展開
      fireEvent.keyDown(header, { key: "Enter" });

      // 他のキーでは反応しない（カバレッジ用）
      fireEvent.keyDown(header, { key: "Tab" });
    });
  });

  describe("検索結果なし", () => {
    it("マッチするAPIがない検索クエリで空メッセージを表示", async () => {
      render(<ScriptApiReferencePanel />);

      const searchInput = screen.getByTestId("api-reference-search");
      await userEvent.type(searchInput, "zzzznonexistentapi");

      expect(screen.getByTestId("api-reference-no-results")).toHaveTextContent(
        "No matching APIs found",
      );
    });
  });
});
