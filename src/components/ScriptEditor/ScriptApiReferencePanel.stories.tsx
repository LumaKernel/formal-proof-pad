import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, fn } from "storybook/test";
import { ScriptApiReferencePanel } from "./ScriptApiReferencePanel";

const meta = {
  title: "components/ScriptApiReferencePanel",
  component: ScriptApiReferencePanel,
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: "500px", width: "340px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: {
      config: {
        rules: [
          // Dark code panel uses CSS variable backgrounds that axe cannot resolve,
          // causing false-positive color-contrast violations.
          { id: "color-contrast", enabled: false },
          // --- Inherited global disables (story rules replace, not merge) ---
          { id: "nested-interactive", enabled: false },
          { id: "aria-required-parent", enabled: false },
          { id: "aria-required-children", enabled: false },
          { id: "select-name", enabled: false },
          { id: "label", enabled: false },
          { id: "aria-input-field-name", enabled: false },
          { id: "label-title-only", enabled: false },
        ],
      },
    },
  },
} satisfies Meta<typeof ScriptApiReferencePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // パネルが表示される
    await expect(canvas.getByTestId("api-reference-panel")).toBeInTheDocument();

    // 検索フィールドが存在する
    await expect(
      canvas.getByTestId("api-reference-search"),
    ).toBeInTheDocument();

    // 3つのカテゴリが表示される
    await expect(canvas.getByTestId("api-category-proof")).toBeInTheDocument();
    await expect(
      canvas.getByTestId("api-category-workspace"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId("api-category-cutElimination"),
    ).toBeInTheDocument();

    // API数が表示される（"N APIs" 形式）
    const content = canvas.getByTestId("api-reference-content");
    await expect(content).toBeInTheDocument();

    // 閉じるボタンはonClose未指定で非表示
    await expect(
      canvas.queryByTestId("api-reference-close"),
    ).not.toBeInTheDocument();
  },
};

export const WithClose: Story = {
  args: {
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 閉じるボタンが表示される
    const closeBtn = canvas.getByTestId("api-reference-close");
    await expect(closeBtn).toBeInTheDocument();

    // クリックでonCloseが呼ばれる
    await userEvent.click(closeBtn);
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const WithSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 検索で絞り込む
    const searchInput = canvas.getByTestId("api-reference-search");
    await userEvent.type(searchInput, "parseFormula");

    // フィルタ結果カウントが表示される（"N/M" 形式）
    const panel = canvas.getByTestId("api-reference-panel");
    await expect(panel.textContent).toContain("/");

    // parseFormula を含むカテゴリが表示される
    await expect(canvas.getByTestId("api-category-proof")).toBeInTheDocument();
  },
};

export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 存在しないAPIを検索
    const searchInput = canvas.getByTestId("api-reference-search");
    await userEvent.type(searchInput, "xyznonexistent123");

    // "No matching APIs found" が表示される
    await expect(
      canvas.getByTestId("api-reference-no-results"),
    ).toBeInTheDocument();
  },
};

export const CategoryToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 初期状態でカテゴリが展開されている（3カテゴリ以下なので）
    const proofHeader = canvas.getByTestId("api-category-header-proof");
    await expect(proofHeader.textContent).toContain("▼");

    // API アイテムが表示されている
    await expect(
      canvas.getByTestId("api-item-parseFormula"),
    ).toBeInTheDocument();

    // カテゴリヘッダーをクリックで折りたたみ
    await userEvent.click(proofHeader);
    await expect(proofHeader.textContent).toContain("▶");

    // 折りたたむとAPI アイテムが非表示になる
    await expect(
      canvas.queryByTestId("api-item-parseFormula"),
    ).not.toBeInTheDocument();

    // 再クリックで展開
    await userEvent.click(proofHeader);
    await expect(proofHeader.textContent).toContain("▼");
    await expect(
      canvas.getByTestId("api-item-parseFormula"),
    ).toBeInTheDocument();
  },
};

export const KeyboardToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // キーボードでカテゴリ展開/折りたたみ
    const proofHeader = canvas.getByTestId("api-category-header-proof");
    await expect(proofHeader.textContent).toContain("▼");

    // フォーカスしてEnterキーで折りたたみ
    proofHeader.focus();
    await userEvent.keyboard("{Enter}");
    await expect(proofHeader.textContent).toContain("▶");

    // Spaceキーで展開
    await userEvent.keyboard(" ");
    await expect(proofHeader.textContent).toContain("▼");
  },
};
