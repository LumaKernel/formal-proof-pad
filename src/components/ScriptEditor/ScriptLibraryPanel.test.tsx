import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScriptLibraryPanel } from "./ScriptLibraryPanel";
import type { ScriptTemplate } from "@/lib/script-runner/templates";
import type { SavedScript } from "./savedScriptsLogic";

const sampleTemplates: readonly ScriptTemplate[] = [
  {
    id: "cut-elim",
    title: "カット除去: 単純な例",
    description: "テスト用テンプレート",
    code: "// code",
    compatibleStyles: ["sequent-calculus"],
  },
];

const sampleSaved: readonly SavedScript[] = [
  {
    id: "saved-1",
    title: "My Script",
    code: "console.log('hello')",
    savedAt: 1710000000000,
  },
];

describe("ScriptLibraryPanel", () => {
  describe("検索結果なし時のメッセージ分岐", () => {
    it("検索クエリありで結果なし → 'No scripts found.' を表示", async () => {
      render(
        <ScriptLibraryPanel
          templates={sampleTemplates}
          savedScripts={sampleSaved}
          onSelect={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      // 存在しない文字列で検索
      const searchInput = screen.getByTestId("script-library-search");
      await userEvent.type(searchInput, "zzzznonexistent");

      const empty = screen.getByTestId("script-library-empty");
      expect(empty).toHaveTextContent("No scripts found.");
    });

    it("検索クエリなしで結果なし → 'No scripts available.' を表示", () => {
      render(
        <ScriptLibraryPanel
          templates={[]}
          savedScripts={[]}
          onSelect={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      const empty = screen.getByTestId("script-library-empty");
      expect(empty).toHaveTextContent("No scripts available.");
    });
  });
});
