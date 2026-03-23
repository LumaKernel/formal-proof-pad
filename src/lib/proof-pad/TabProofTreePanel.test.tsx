/**
 * TabProofTreePanel のテスト。
 *
 * TABタブロー証明木パネルのレンダリングを検証する。
 */

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { InferenceEdge } from "./inferenceEdge";
import type { WorkspaceNode } from "./workspaceState";
import { TabProofTreePanel } from "./TabProofTreePanel";

// ── テストヘルパー ──────────────────────────────────────────

function mkNode(
  id: string,
  formulaText: string,
  formulaTexts?: readonly string[],
): WorkspaceNode {
  return {
    id,
    kind: "axiom",
    label: "",
    formulaText,
    formulaTexts,
    position: { x: 0, y: 0 },
  };
}

// ── テスト ──────────────────────────────────────────

describe("TabProofTreePanel", () => {
  it("エッジなしの場合空メッセージを表示する", () => {
    const nodes: readonly WorkspaceNode[] = [];
    const edges: readonly InferenceEdge[] = [];
    render(
      <TabProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="tab-tree"
      />,
    );

    expect(screen.getByTestId("tab-tree")).toBeDefined();
    expect(screen.getByText("Tableau Tree")).toBeDefined();
    expect(screen.getByText("No proof")).toBeDefined();
    expect(
      screen.getByText(
        "No tableau rules applied yet. Apply rules to build a tableau tree.",
      ),
    ).toBeDefined();
  });

  it("単一規則で子ノードを表示する", () => {
    const nodes = [
      mkNode("n1", "¬P, P ⇒ Q", ["¬P", "P ⇒ Q"]),
      mkNode("n2", "¬P, ¬P, Q", ["¬P", "¬P", "Q"]),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "tab-single",
        ruleId: "implication",
        conclusionNodeId: "n1",
        premiseNodeId: "n2",
        conclusionText: "¬P, ¬P, Q",
      },
    ];
    render(
      <TabProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="tab-tree"
      />,
    );

    expect(screen.getByText("2 nodes, depth 1")).toBeDefined();
  });

  it("分岐規則で二股の子を表示する", () => {
    const nodes = [
      mkNode("n1", "P ∨ Q", ["P ∨ Q"]),
      mkNode("n2", "P", ["P"]),
      mkNode("n3", "Q", ["Q"]),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "tab-branching",
        ruleId: "disjunction",
        conclusionNodeId: "n1",
        leftPremiseNodeId: "n2",
        rightPremiseNodeId: "n3",
        leftConclusionText: "P",
        rightConclusionText: "Q",
        conclusionText: "P",
      },
    ];
    render(
      <TabProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="tab-tree"
      />,
    );

    expect(screen.getByText("3 nodes, depth 1")).toBeDefined();
  });

  it("公理で閉じた枝に×マークを表示する", () => {
    const nodes = [
      mkNode("n1", "P, ¬P", ["P", "¬P"]),
      mkNode("n2", "child", ["child"]),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "tab-single",
        ruleId: "implication",
        conclusionNodeId: "n1",
        premiseNodeId: "n2",
        conclusionText: "child",
      },
      {
        _tag: "tab-axiom",
        ruleId: "bs",
        conclusionNodeId: "n2",
        conclusionText: "child",
      },
    ];
    render(
      <TabProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="tab-tree"
      />,
    );

    expect(screen.getByText("×")).toBeDefined();
  });

  it("開いた枝に○マークを表示する", () => {
    const nodes = [
      mkNode("n1", "P ⇒ Q", ["P ⇒ Q"]),
      mkNode("n2", "P, Q", ["P", "Q"]),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "tab-single",
        ruleId: "implication",
        conclusionNodeId: "n1",
        premiseNodeId: "n2",
        conclusionText: "P, Q",
      },
    ];
    render(
      <TabProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="tab-tree"
      />,
    );

    // n2 は leaf で open
    expect(screen.getByText("○")).toBeDefined();
  });

  it("複数のルートがある場合サイクルボタンが表示される", () => {
    const nodes = [
      mkNode("n1", "P", ["P"]),
      mkNode("n2", "Q", ["Q"]),
      mkNode("n3", "R", ["R"]),
      mkNode("n4", "S", ["S"]),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "tab-single",
        ruleId: "implication",
        conclusionNodeId: "n1",
        premiseNodeId: "n3",
        conclusionText: "R",
      },
      {
        _tag: "tab-single",
        ruleId: "implication",
        conclusionNodeId: "n2",
        premiseNodeId: "n4",
        conclusionText: "S",
      },
    ];
    render(
      <TabProofTreePanel
        nodes={nodes}
        inferenceEdges={edges}
        testId="tab-tree"
      />,
    );

    const cycleButton = screen.getByTestId("tab-tree-cycle-root");
    expect(cycleButton.textContent).toBe("1/2");

    fireEvent.click(cycleButton);
    expect(cycleButton.textContent).toBe("2/2");
  });

  it("testId未指定でもレンダリングできる", () => {
    const nodes = [
      mkNode("n1", "P ⇒ Q", ["P ⇒ Q"]),
      mkNode("n2", "P, Q", ["P", "Q"]),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "tab-single",
        ruleId: "implication",
        conclusionNodeId: "n1",
        premiseNodeId: "n2",
        conclusionText: "P, Q",
      },
    ];
    const { container } = render(
      <TabProofTreePanel nodes={nodes} inferenceEdges={edges} />,
    );
    expect(container.textContent).toContain("Tableau Tree");
  });

  it("testId未指定で閉じた枝を表示できる", () => {
    const nodes = [
      mkNode("n1", "P, ¬P", ["P", "¬P"]),
      mkNode("n2", "child", ["child"]),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "tab-single",
        ruleId: "implication",
        conclusionNodeId: "n1",
        premiseNodeId: "n2",
        conclusionText: "child",
      },
      {
        _tag: "tab-axiom",
        ruleId: "bs",
        conclusionNodeId: "n2",
        conclusionText: "child",
      },
    ];
    const { container } = render(
      <TabProofTreePanel nodes={nodes} inferenceEdges={edges} />,
    );
    expect(container.textContent).toContain("×");
  });

  it("testId未指定で複数ルートを表示できる", () => {
    const nodes = [
      mkNode("n1", "P", ["P"]),
      mkNode("n2", "Q", ["Q"]),
      mkNode("n3", "R", ["R"]),
      mkNode("n4", "S", ["S"]),
    ];
    const edges: readonly InferenceEdge[] = [
      {
        _tag: "tab-single",
        ruleId: "implication",
        conclusionNodeId: "n1",
        premiseNodeId: "n3",
        conclusionText: "R",
      },
      {
        _tag: "tab-single",
        ruleId: "implication",
        conclusionNodeId: "n2",
        premiseNodeId: "n4",
        conclusionText: "S",
      },
    ];
    const { container } = render(
      <TabProofTreePanel nodes={nodes} inferenceEdges={edges} />,
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
        <TabProofTreePanel
          nodes={nodes}
          inferenceEdges={edges}
          testId="tab-tree"
        />
      </div>,
    );

    const panel = screen.getByTestId("tab-tree");
    panel.click();
  });
});
