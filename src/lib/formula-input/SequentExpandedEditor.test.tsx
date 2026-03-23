import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SequentExpandedEditor } from "./SequentExpandedEditor";

// --- ヘルパー: 制御コンポーネントラッパー ---

function SequentEditorWrapper({
  initialValue = " ⇒ ",
  onClose = vi.fn(),
  onOpenSyntaxHelp,
  testId = "seq-editor",
}: {
  readonly initialValue?: string;
  readonly onClose?: () => void;
  readonly onOpenSyntaxHelp?: () => void;
  readonly testId?: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <SequentExpandedEditor
      value={value}
      onChange={setValue}
      onClose={onClose}
      onOpenSyntaxHelp={onOpenSyntaxHelp}
      testId={testId}
    />
  );
}

// --- 基本表示テスト ---

describe("SequentExpandedEditor - 基本表示", () => {
  it("モーダルが開くとrole=dialogが表示される", () => {
    render(<SequentEditorWrapper />);

    const dialog = screen.getByTestId("seq-editor");
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "シーケントエディタ");
  });

  it("閉じるボタンが表示される", () => {
    render(<SequentEditorWrapper />);

    expect(screen.getByTestId("seq-editor-close")).toBeInTheDocument();
    expect(screen.getByTestId("seq-editor-close")).toHaveAttribute(
      "aria-label",
      "閉じる",
    );
  });

  it("前件・後件ラベルとターンスタイルが表示される", () => {
    render(<SequentEditorWrapper />);

    expect(screen.getByTestId("seq-editor-antecedent-label")).toHaveTextContent(
      "前件 (Γ)",
    );
    expect(screen.getByTestId("seq-editor-succedent-label")).toHaveTextContent(
      "後件 (Δ)",
    );
    expect(screen.getByTestId("seq-editor-turnstile")).toHaveTextContent("⇒");
  });

  it("プレビューが表示される", () => {
    render(<SequentEditorWrapper />);

    expect(screen.getByTestId("seq-editor-preview")).toBeInTheDocument();
  });

  it("初期値がシーケントテキストとしてパースされる", () => {
    render(<SequentEditorWrapper initialValue="φ, ψ ⇒ χ" />);

    // 前件に2つ、後件に1つの式があるはず
    expect(screen.getByTestId("seq-editor-antecedents")).toBeInTheDocument();
    expect(screen.getByTestId("seq-editor-succedents")).toBeInTheDocument();
  });
});

// --- 閉じる操作テスト ---

describe("SequentExpandedEditor - 閉じる操作", () => {
  it("閉じるボタンクリックでonCloseが呼ばれる", () => {
    const onClose = vi.fn();
    render(<SequentEditorWrapper onClose={onClose} />);

    fireEvent.click(screen.getByTestId("seq-editor-close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("モーダル外（オーバーレイ）クリックでonCloseが呼ばれる", () => {
    const onClose = vi.fn();
    render(<SequentEditorWrapper onClose={onClose} />);

    fireEvent.click(screen.getByTestId("seq-editor"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("モーダル内クリックではonCloseが呼ばれない", () => {
    const onClose = vi.fn();
    render(<SequentEditorWrapper onClose={onClose} />);

    // 前件ラベル（モーダル内）をクリック
    fireEvent.click(screen.getByTestId("seq-editor-antecedent-label"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Escapeキーで閉じる", () => {
    const onClose = vi.fn();
    render(<SequentEditorWrapper onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("Escape以外のキーでは閉じない", () => {
    const onClose = vi.fn();
    render(<SequentEditorWrapper onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

// --- 構文ヘルプテスト ---

describe("SequentExpandedEditor - 構文ヘルプ", () => {
  it("onOpenSyntaxHelp指定時にヘルプボタンが表示される", () => {
    const handleHelp = vi.fn();
    render(<SequentEditorWrapper onOpenSyntaxHelp={handleHelp} />);

    expect(screen.getByTestId("seq-editor-syntax-help")).toBeInTheDocument();
  });

  it("onOpenSyntaxHelp未指定時にヘルプボタンが表示されない", () => {
    render(<SequentEditorWrapper />);

    expect(
      screen.queryByTestId("seq-editor-syntax-help"),
    ).not.toBeInTheDocument();
  });

  it("ヘルプボタンクリックでonOpenSyntaxHelpが呼ばれる", () => {
    const handleHelp = vi.fn();
    render(<SequentEditorWrapper onOpenSyntaxHelp={handleHelp} />);

    fireEvent.click(screen.getByTestId("seq-editor-syntax-help"));
    expect(handleHelp).toHaveBeenCalledOnce();
  });
});

// --- 前件・後件操作テスト ---

describe("SequentExpandedEditor - 前件・後件操作", () => {
  it("前件に式を追加するとonChangeが反映される", async () => {
    const onChange = vi.fn();
    render(
      <SequentExpandedEditor
        value=" ⇒ "
        onChange={onChange}
        onClose={vi.fn()}
        testId="seq-editor"
      />,
    );

    // 前件の追加ボタンをクリック
    const addButton = screen.getByTestId("seq-editor-antecedents-add");
    fireEvent.click(addButton);

    await waitFor(() => {
      // onChangeが呼ばれたことを確認（composeSequentTextの結果）
      expect(onChange).toHaveBeenCalled();
    });
  });

  it("後件に式を追加するとonChangeが反映される", async () => {
    const onChange = vi.fn();
    render(
      <SequentExpandedEditor
        value=" ⇒ "
        onChange={onChange}
        onClose={vi.fn()}
        testId="seq-editor"
      />,
    );

    // 後件の追加ボタンをクリック
    const addButton = screen.getByTestId("seq-editor-succedents-add");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it("初期値の前件が正しくパースされる", () => {
    render(<SequentEditorWrapper initialValue="φ ⇒ ψ" />);

    // 前件と後件それぞれにFormulaListEditorがレンダリングされる
    expect(screen.getByTestId("seq-editor-antecedents")).toBeInTheDocument();
    expect(screen.getByTestId("seq-editor-succedents")).toBeInTheDocument();
  });
});

// --- testId未指定テスト ---

describe("SequentExpandedEditor - testId未指定", () => {
  it("testIdがundefinedでもエラーなくレンダリングできる", () => {
    render(
      <SequentExpandedEditor
        value=" ⇒ "
        onChange={vi.fn()}
        onClose={vi.fn()}
        testId={undefined}
      />,
    );
    expect(document.querySelector("[role='dialog']")).toBeInTheDocument();
  });

  it("testIdがundefined + onOpenSyntaxHelpありでレンダリングできる", () => {
    render(
      <SequentExpandedEditor
        value="φ ⇒ ψ"
        onChange={vi.fn()}
        onClose={vi.fn()}
        onOpenSyntaxHelp={vi.fn()}
        testId={undefined}
      />,
    );
    expect(document.querySelector("[role='dialog']")).toBeInTheDocument();
  });
});
