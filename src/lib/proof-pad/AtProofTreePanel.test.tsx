/**
 * AtProofTreePanel のテスト。
 *
 * AT分析的タブロー証明木パネルのレンダリングを検証する。
 */

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { InferenceEdge } from "./inferenceEdge";
import type { WorkspaceNode } from "./workspaceState";
import { AtProofTreePanel } from "./AtProofTreePanel";

// ── テストヘルパー ──────────────────────────────────────────

function mkNode(id: string, formulaText: string): WorkspaceNode {
  return {
    id,
    kind: "axiom",
    label: "",
    formulaText,
    position: { x: 0, y: 0 },
  };
}

// ── テスト ──────────────────────────────────────────

describe("AtProofTreePanel", () => {
  it("エッジなしの場合空メッセージを表示する", () => {
    const nodes: readonly WorkspaceNode[] = [];
    const edges: readonly InferenceEdge[] = [];
    render(
      <AtProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="at-tree"
      />,
    );

    expect(screen.getByTestId("at-tree")).toBeDefined();
    expect(screen.getByText("Analytic Tableau")).toBeDefined();
    expect(screen.getByText("No proof")).toBeDefined();
    expect(
      screen.getByText(
        "No analytic tableau rules applied yet. Apply rules to build a tableau tree.",
      ),
    ).toBeDefined();
  });

  it("α規則で単一子ノードを表示する", () => {
    const nodes = [mkNode("n1", "T: φ ∧ ψ"), mkNode("n2", "T: φ")];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "at-alpha",
        ruleId: "alpha-conj",
        conclusionNodeId: "n1",
        resultNodeId: "n2",
        secondResultNodeId: undefined,
        conclusionText: "T: φ ∧ ψ",
        resultText: "T: φ",
        secondResultText: undefined,
      },
    ];
    render(
      <AtProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="at-tree"
      />,
    );

    expect(screen.getByText("2 nodes, depth 1")).toBeDefined();
  });

  it("β規則で分岐を表示する", () => {
    const nodes = [
      mkNode("n1", "F: φ ∧ ψ"),
      mkNode("n2", "F: φ"),
      mkNode("n3", "F: ψ"),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "at-beta",
        ruleId: "beta-neg-conj",
        conclusionNodeId: "n1",
        leftResultNodeId: "n2",
        rightResultNodeId: "n3",
        conclusionText: "F: φ ∧ ψ",
        leftResultText: "F: φ",
        rightResultText: "F: ψ",
      },
    ];
    render(
      <AtProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="at-tree"
      />,
    );

    expect(screen.getByText("3 nodes, depth 1")).toBeDefined();
  });

  it("閉じた枝に×マークを表示する", () => {
    const nodes = [mkNode("n1", "T: φ"), mkNode("n2", "F: φ")];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "at-closed",
        ruleId: "closure",
        conclusionNodeId: "n1",
        contradictionNodeId: "n2",
        conclusionText: "T: φ",
      },
    ];
    render(
      <AtProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="at-tree"
      />,
    );

    expect(screen.getByText("×")).toBeDefined();
  });

  it("開いた枝に○マークを表示する", () => {
    // α規則で子ノードを作成、子ノードはエッジなし（= open leaf）
    const nodes = [mkNode("n1", "T: φ ∧ ψ"), mkNode("n2", "T: φ")];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "at-alpha",
        ruleId: "alpha-conj",
        conclusionNodeId: "n1",
        resultNodeId: "n2",
        secondResultNodeId: undefined,
        conclusionText: "T: φ ∧ ψ",
        resultText: "T: φ",
        secondResultText: undefined,
      },
    ];
    render(
      <AtProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="at-tree"
      />,
    );

    // n2 は leaf で open
    expect(screen.getByText("○")).toBeDefined();
  });

  it("署名なしのプレーンテキストをそのまま表示する", () => {
    // "T:" や "F:" プレフィックスなしのテキスト
    const nodes = [mkNode("n1", "plain text"), mkNode("n2", "child text")];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "at-alpha",
        ruleId: "alpha-conj",
        conclusionNodeId: "n1",
        resultNodeId: "n2",
        secondResultNodeId: undefined,
        conclusionText: "plain text",
        resultText: "child text",
        secondResultText: undefined,
      },
    ];
    render(
      <AtProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="at-tree"
      />,
    );

    expect(screen.getByText("plain text")).toBeDefined();
    expect(screen.getByText("child text")).toBeDefined();
  });

  it("複数のルートがある場合サイクルボタンが表示される", () => {
    const nodes = [
      mkNode("n1", "T: φ"),
      mkNode("n2", "T: ψ"),
      mkNode("n3", "T: φ result"),
      mkNode("n4", "T: ψ result"),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "at-alpha",
        ruleId: "alpha-conj",
        conclusionNodeId: "n1",
        resultNodeId: "n3",
        secondResultNodeId: undefined,
        conclusionText: "T: φ",
        resultText: "T: φ result",
        secondResultText: undefined,
      },
      {
        _tag: "at-alpha",
        ruleId: "alpha-conj",
        conclusionNodeId: "n2",
        resultNodeId: "n4",
        secondResultNodeId: undefined,
        conclusionText: "T: ψ",
        resultText: "T: ψ result",
        secondResultText: undefined,
      },
    ];
    render(
      <AtProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="at-tree"
      />,
    );

    const cycleButton = screen.getByTestId("at-tree-cycle-root");
    expect(cycleButton.textContent).toBe("1/2");

    fireEvent.click(cycleButton);
    expect(cycleButton.textContent).toBe("2/2");
  });

  it("testId未指定でもレンダリングできる", () => {
    const nodes = [mkNode("n1", "T: φ"), mkNode("n2", "T: ψ")];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "at-alpha",
        ruleId: "alpha-conj",
        conclusionNodeId: "n1",
        resultNodeId: "n2",
        secondResultNodeId: undefined,
        conclusionText: "T: φ",
        resultText: "T: ψ",
        secondResultText: undefined,
      },
    ];
    const { container } = render(
      <AtProofTreePanel nodes={nodes} inferenceEdges={edges} />,
    );
    expect(container.textContent).toContain("Analytic Tableau");
  });

  it("testId未指定で閉じた枝を表示できる", () => {
    const nodes = [mkNode("n1", "T: φ"), mkNode("n2", "F: φ")];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "at-closed",
        ruleId: "closure",
        conclusionNodeId: "n1",
        contradictionNodeId: "n2",
        conclusionText: "T: φ",
      },
    ];
    const { container } = render(
      <AtProofTreePanel nodes={nodes} inferenceEdges={edges} />,
    );
    expect(container.textContent).toContain("×");
  });

  it("testId未指定で複数ルートを表示できる", () => {
    const nodes = [
      mkNode("n1", "T: φ"),
      mkNode("n2", "T: ψ"),
      mkNode("n3", "T: φ result"),
      mkNode("n4", "T: ψ result"),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "at-alpha",
        ruleId: "alpha-conj",
        conclusionNodeId: "n1",
        resultNodeId: "n3",
        secondResultNodeId: undefined,
        conclusionText: "T: φ",
        resultText: "T: φ result",
        secondResultText: undefined,
      },
      {
        _tag: "at-alpha",
        ruleId: "alpha-conj",
        conclusionNodeId: "n2",
        resultNodeId: "n4",
        secondResultNodeId: undefined,
        conclusionText: "T: ψ",
        resultText: "T: ψ result",
        secondResultText: undefined,
      },
    ];
    const { container } = render(
      <AtProofTreePanel nodes={nodes} inferenceEdges={edges} />,
    );
    expect(container.textContent).toContain("1/2");
  });

  it("パネルのclickがstopPropagationされる", () => {
    const nodes: readonly WorkspaceNode[] = [];
    const edges: readonly InferenceEdge[] = [];
    render(
      <div
        onClick={() => {
          throw new Error("should not propagate");
        }}
      >
        <AtProofTreePanel
          nodes={nodes}
          inferenceEdges={edges}
          testId="at-tree"
        />
      </div>,
    );

    const panel = screen.getByTestId("at-tree");
    panel.click();
  });
});
