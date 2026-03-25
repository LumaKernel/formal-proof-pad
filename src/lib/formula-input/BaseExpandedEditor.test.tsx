import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BaseExpandedEditor } from "./BaseExpandedEditor";

// --- 基本表示テスト ---

describe("BaseExpandedEditor - 基本表示", () => {
  it("role=dialogとaria-modal=trueを持つ", () => {
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テストエディタ"
        onClose={vi.fn()}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    const dialog = screen.getByTestId("base");
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "テストエディタ");
  });

  it("タイトルが表示される", () => {
    render(
      <BaseExpandedEditor
        title="論理式エディタ"
        ariaLabel="論理式エディタ"
        onClose={vi.fn()}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    expect(screen.getByText("論理式エディタ")).toBeInTheDocument();
  });

  it("閉じるボタンが表示される", () => {
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={vi.fn()}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    expect(screen.getByTestId("base-close")).toBeInTheDocument();
    expect(screen.getByTestId("base-close")).toHaveAttribute(
      "aria-label",
      "閉じる",
    );
  });

  it("childrenがレンダリングされる", () => {
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={vi.fn()}
        testId="base"
      >
        <div data-testid="child">子要素</div>
      </BaseExpandedEditor>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

// --- 閉じる操作テスト ---

describe("BaseExpandedEditor - 閉じる操作", () => {
  it("閉じるボタンクリックでonCloseが呼ばれる", () => {
    const onClose = vi.fn();
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={onClose}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    fireEvent.click(screen.getByTestId("base-close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("モーダル外（オーバーレイ）クリックでonCloseが呼ばれる", () => {
    const onClose = vi.fn();
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={onClose}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    fireEvent.click(screen.getByTestId("base"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("モーダル内クリックではonCloseが呼ばれない", () => {
    const onClose = vi.fn();
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={onClose}
        testId="base"
      >
        <div data-testid="child">子要素</div>
      </BaseExpandedEditor>,
    );

    fireEvent.click(screen.getByTestId("child"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Escapeキーで閉じる", () => {
    const onClose = vi.fn();
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={onClose}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("Escape以外のキーでは閉じない", () => {
    const onClose = vi.fn();
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={onClose}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

// --- 構文ヘルプボタンテスト ---

describe("BaseExpandedEditor - 構文ヘルプ", () => {
  it("onOpenSyntaxHelp指定時にヘルプボタンが表示される", () => {
    const handleHelp = vi.fn();
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={vi.fn()}
        onOpenSyntaxHelp={handleHelp}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    expect(screen.getByTestId("base-syntax-help")).toBeInTheDocument();
  });

  it("onOpenSyntaxHelp未指定時にヘルプボタンが表示されない", () => {
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={vi.fn()}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    expect(
      screen.queryByTestId("base-syntax-help"),
    ).not.toBeInTheDocument();
  });

  it("ヘルプボタンクリックでonOpenSyntaxHelpが呼ばれる", () => {
    const handleHelp = vi.fn();
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={vi.fn()}
        onOpenSyntaxHelp={handleHelp}
        testId="base"
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );

    fireEvent.click(screen.getByTestId("base-syntax-help"));
    expect(handleHelp).toHaveBeenCalledOnce();
  });
});

// --- testId未指定テスト ---

describe("BaseExpandedEditor - testId未指定", () => {
  it("testIdがundefinedでもエラーなくレンダリングできる", () => {
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={vi.fn()}
        testId={undefined}
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );
    expect(document.querySelector("[role='dialog']")).toBeInTheDocument();
  });

  it("testIdがundefined + onOpenSyntaxHelpありでレンダリングできる", () => {
    render(
      <BaseExpandedEditor
        title="テスト"
        ariaLabel="テスト"
        onClose={vi.fn()}
        onOpenSyntaxHelp={vi.fn()}
        testId={undefined}
      >
        <div>子要素</div>
      </BaseExpandedEditor>,
    );
    expect(document.querySelector("[role='dialog']")).toBeInTheDocument();
  });
});
