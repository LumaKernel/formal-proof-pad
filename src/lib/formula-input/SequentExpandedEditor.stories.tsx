/**
 * シーケント拡大エディタのストーリー。
 *
 * 前件・後件を FormulaListEditor で編集し、リアルタイムプレビュー付きでシーケントを構成する。
 */

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SequentExpandedEditor } from "./SequentExpandedEditor";

// --- Wrapper ---

function SequentEditorWrapper({
  initialValue = " ⇒ ",
  testId = "sequent-editor",
  onOpenSyntaxHelp,
}: {
  readonly initialValue?: string;
  readonly testId?: string;
  readonly onOpenSyntaxHelp?: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [closed, setClosed] = useState(false);

  if (closed) {
    return (
      <div data-testid="closed-state" style={{ padding: 24 }}>
        エディタは閉じられました（最終値: {value}）
      </div>
    );
  }

  return (
    <SequentExpandedEditor
      value={value}
      onChange={setValue}
      onClose={() => {
        setClosed(true);
      }}
      onOpenSyntaxHelp={onOpenSyntaxHelp}
      testId={testId}
    />
  );
}

const meta = {
  title: "FormulaInput/SequentExpandedEditor",
  component: SequentEditorWrapper,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SequentEditorWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- ストーリー ---

/** 空のシーケント */
export const Empty: Story = {
  render: () => <SequentEditorWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // ⇒ セパレータが表示されている
    await expect(
      canvas.getByTestId("sequent-editor-turnstile"),
    ).toBeInTheDocument();
    // 前件・後件セクションが表示されている
    await expect(
      canvas.getByTestId("sequent-editor-antecedent-label"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId("sequent-editor-succedent-label"),
    ).toBeInTheDocument();
    // プレビューが表示されている
    await expect(
      canvas.getByTestId("sequent-editor-preview"),
    ).toBeInTheDocument();
  },
};

/** 既存のシーケントを編集 */
export const WithExistingSequent: Story = {
  render: () => (
    <SequentEditorWrapper initialValue="phi -> psi, psi -> chi ⇒ phi -> chi" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 前件リストに2つの論理式がある
    await expect(
      canvas.getByTestId("sequent-editor-antecedents-item-0"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId("sequent-editor-antecedents-item-1"),
    ).toBeInTheDocument();
    // 後件リストに1つの論理式がある
    await expect(
      canvas.getByTestId("sequent-editor-succedents-item-0"),
    ).toBeInTheDocument();
  },
};

/** 閉じるボタンで閉じる */
export const CloseButton: Story = {
  render: () => <SequentEditorWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const closeButton = canvas.getByTestId("sequent-editor-close");
    await userEvent.click(closeButton);
    await waitFor(() => {
      expect(canvas.getByTestId("closed-state")).toBeInTheDocument();
    });
  },
};

/** 論理式を追加・編集 */
export const AddAndEditFormula: Story = {
  render: () => <SequentEditorWrapper initialValue=" ⇒ " />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 後件の式をクリックして入力
    const succedentEditor = canvas.getByTestId(
      "sequent-editor-succedents-editor-0",
    );
    await expect(succedentEditor).toBeInTheDocument();
    // 前件に式を追加
    const antecedentAddButton = canvas.getByTestId(
      "sequent-editor-antecedents-add",
    );
    await expect(antecedentAddButton).toBeInTheDocument();
  },
};

/** Escapeキーでモーダルを閉じる */
export const EscapeToClose: Story = {
  render: () => <SequentEditorWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // モーダルが表示されていることを確認
    await expect(
      canvas.getByTestId("sequent-editor-turnstile"),
    ).toBeInTheDocument();
    // Escape キーでモーダルを閉じる
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(canvas.getByTestId("closed-state")).toBeInTheDocument();
    });
  },
};

/** オーバーレイ（モーダル外）クリックで閉じる */
export const OverlayClickToClose: Story = {
  render: () => <SequentEditorWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // オーバーレイ要素をクリック（モーダル外）
    const overlay = canvas.getByTestId("sequent-editor");
    await userEvent.click(overlay);
    await waitFor(() => {
      expect(canvas.getByTestId("closed-state")).toBeInTheDocument();
    });
  },
};

/** 構文ヘルプボタン付き */
export const WithSyntaxHelp: Story = {
  render: () => (
    <SequentEditorWrapper
      onOpenSyntaxHelp={() => {
        /* noop for story */
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 構文ヘルプボタンが表示される
    const syntaxHelpButton = canvas.getByTestId("sequent-editor-syntax-help");
    await expect(syntaxHelpButton).toBeInTheDocument();
    // クリックしてもエラーにならない
    await userEvent.click(syntaxHelpButton);
  },
};

/** testIdなしで描画（ternary の else 分岐カバレッジ） */
export const WithoutTestId: Story = {
  render: () => {
    const [value, setValue] = useState(" ⇒ ");
    return (
      <SequentExpandedEditor
        value={value}
        onChange={setValue}
        onClose={() => {}}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // role="dialog" でモーダルを検出（testIdなし）
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAttribute("aria-label", "シーケントエディタ");
  },
};

/** 複数の前件・後件で、プレビューにカンマ区切りとパース結果が表示される */
export const MultipleFormulasPreview: Story = {
  render: () => (
    <SequentEditorWrapper initialValue="phi, psi -> chi ⇒ phi -> psi, chi" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 前件に2つの論理式がある
    await expect(
      canvas.getByTestId("sequent-editor-antecedents-item-0"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId("sequent-editor-antecedents-item-1"),
    ).toBeInTheDocument();
    // 後件に2つの論理式がある
    await expect(
      canvas.getByTestId("sequent-editor-succedents-item-0"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByTestId("sequent-editor-succedents-item-1"),
    ).toBeInTheDocument();
    // プレビューが表示されている
    await expect(
      canvas.getByTestId("sequent-editor-preview"),
    ).toBeInTheDocument();
  },
};
