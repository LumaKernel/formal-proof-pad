import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent, fn } from "storybook/test";
import { ScriptWorkspaceTabBar } from "./ScriptWorkspaceTabBar";
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

const sampleTabs: readonly WorkspaceTab[] = [
  mkTab({ id: "tab-1", title: "Unnamed-1" }),
  mkTab({
    id: "tab-2",
    source: "library",
    title: "カット除去テンプレート",
    code: "// code",
    originalCode: "// code",
    sourceId: "tpl-1",
    readonly: true,
  }),
  mkTab({
    id: "tab-3",
    source: "saved",
    title: "My Script",
    code: "modified code",
    originalCode: "original code",
    sourceId: "script-1",
  }),
];

const meta = {
  title: "components/ScriptWorkspaceTabBar",
  component: ScriptWorkspaceTabBar,
  args: {
    tabs: sampleTabs,
    activeTabId: "tab-1",
    onSelectTab: fn(),
    onCloseTab: fn(),
    onNewTab: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: "700px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScriptWorkspaceTabBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タブバーが表示される
    await expect(canvas.getByTestId("workspace-tab-bar")).toBeInTheDocument();

    // 3つのタブが表示される
    await expect(canvas.getByTestId("workspace-tab-tab-1")).toBeInTheDocument();
    await expect(canvas.getByTestId("workspace-tab-tab-2")).toBeInTheDocument();
    await expect(canvas.getByTestId("workspace-tab-tab-3")).toBeInTheDocument();

    // 新規タブボタンが表示される
    await expect(
      canvas.getByTestId("workspace-new-tab-btn"),
    ).toBeInTheDocument();

    // 最初のタブがアクティブ
    const firstTab = canvas.getByTestId("workspace-tab-tab-1");
    await expect(firstTab).toHaveAttribute("aria-selected", "true");

    // 2番目はアクティブでない
    const secondTab = canvas.getByTestId("workspace-tab-tab-2");
    await expect(secondTab).toHaveAttribute("aria-selected", "false");
  },
};

export const TabClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 2番目のタブをクリック
    const secondTab = canvas.getByTestId("workspace-tab-tab-2");
    await userEvent.click(secondTab);
    await expect(args.onSelectTab).toHaveBeenCalledWith("tab-2");
  },
};

export const CloseTab: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1番目のタブの閉じるボタンをクリック
    const closeBtn = canvas.getByTestId("workspace-tab-close-tab-1");
    await userEvent.click(closeBtn);
    await expect(args.onCloseTab).toHaveBeenCalledWith("tab-1");

    // onSelectTab は呼ばれない（stopPropagation）
    await expect(args.onSelectTab).not.toHaveBeenCalled();
  },
};

export const NewTab: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 新規タブボタンをクリック
    const newTabBtn = canvas.getByTestId("workspace-new-tab-btn");
    await userEvent.click(newTabBtn);
    await expect(args.onNewTab).toHaveBeenCalledTimes(1);
  },
};

export const ModifiedIndicator: Story = {
  args: {
    tabs: [
      mkTab({ id: "tab-1", title: "Unnamed-1", code: "some code" }),
      mkTab({
        id: "tab-2",
        source: "saved",
        title: "Saved Script",
        code: "modified",
        originalCode: "original",
        sourceId: "s-1",
      }),
    ],
    activeTabId: "tab-1",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 変更されたタブに ● マーカーが表示される
    const tab1 = canvas.getByTestId("workspace-tab-tab-1");
    await expect(tab1.textContent).toContain("\u25CF");

    const tab2 = canvas.getByTestId("workspace-tab-tab-2");
    await expect(tab2.textContent).toContain("\u25CF");
  },
};

export const ReadonlyBadge: Story = {
  args: {
    tabs: [
      mkTab({
        id: "tab-1",
        source: "library",
        title: "Template",
        code: "code",
        originalCode: "code",
        readonly: true,
        sourceId: "tpl-1",
      }),
    ],
    activeTabId: "tab-1",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ライブラリタブに RO バッジが表示される
    const tab = canvas.getByTestId("workspace-tab-tab-1");
    await expect(tab.textContent).toContain("RO");
  },
};

export const EmptyTabs: Story = {
  args: {
    tabs: [],
    activeTabId: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タブバーが表示され、新規タブボタンのみ
    await expect(canvas.getByTestId("workspace-tab-bar")).toBeInTheDocument();
    await expect(
      canvas.getByTestId("workspace-new-tab-btn"),
    ).toBeInTheDocument();
  },
};
