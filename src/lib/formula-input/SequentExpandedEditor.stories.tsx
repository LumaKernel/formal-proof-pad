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
}: {
  readonly initialValue?: string;
  readonly testId?: string;
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
