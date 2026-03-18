import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, userEvent } from "storybook/test";
import { NdProofTreePanel } from "./NdProofTreePanel";
import type { InferenceEdge } from "./inferenceEdge";
import type { WorkspaceNode } from "./workspaceState";

// --- テスト用ヘルパー ---

function mkNode(id: string, formulaText: string): WorkspaceNode {
  return {
    id,
    kind: "axiom",
    label: "",
    formulaText,
    position: { x: 0, y: 0 },
  };
}

// --- テスト用データ ---

function makeEmptyData(): {
  readonly nodes: readonly WorkspaceNode[];
  readonly inferenceEdges: readonly InferenceEdge[];
} {
  return { nodes: [mkNode("n1", "φ")], inferenceEdges: [] };
}

function makeImplicationIntroData(): {
  readonly nodes: readonly WorkspaceNode[];
  readonly inferenceEdges: readonly InferenceEdge[];
} {
  return {
    nodes: [mkNode("n1", "φ"), mkNode("n2", "φ → φ")],
    inferenceEdges: [
      {
        _tag: "nd-implication-intro",
        conclusionNodeId: "n2",
        premiseNodeId: "n1",
        dischargedFormulaText: "φ",
        dischargedAssumptionId: 1,
        conclusionText: "φ → φ",
      },
    ],
  };
}

function makeImplicationElimData(): {
  readonly nodes: readonly WorkspaceNode[];
  readonly inferenceEdges: readonly InferenceEdge[];
} {
  return {
    nodes: [mkNode("n1", "φ"), mkNode("n2", "φ → ψ"), mkNode("n3", "ψ")],
    inferenceEdges: [
      {
        _tag: "nd-implication-elim",
        conclusionNodeId: "n3",
        leftPremiseNodeId: "n1",
        rightPremiseNodeId: "n2",
        conclusionText: "ψ",
      },
    ],
  };
}

function makeDeepChainData(): {
  readonly nodes: readonly WorkspaceNode[];
  readonly inferenceEdges: readonly InferenceEdge[];
} {
  return {
    nodes: [
      mkNode("n1", "φ"),
      mkNode("n2", "φ → φ"),
      mkNode("n3", "φ"),
      mkNode("n4", "φ"),
    ],
    inferenceEdges: [
      {
        _tag: "nd-implication-intro",
        conclusionNodeId: "n2",
        premiseNodeId: "n1",
        dischargedFormulaText: "φ",
        dischargedAssumptionId: 1,
        conclusionText: "φ → φ",
      },
      {
        _tag: "nd-implication-elim",
        conclusionNodeId: "n4",
        leftPremiseNodeId: "n3",
        rightPremiseNodeId: "n2",
        conclusionText: "φ",
      },
    ],
  };
}

function makeMultiRootData(): {
  readonly nodes: readonly WorkspaceNode[];
  readonly inferenceEdges: readonly InferenceEdge[];
} {
  return {
    nodes: [
      mkNode("n1", "φ"),
      mkNode("n2", "φ → φ"),
      mkNode("n3", "ψ"),
      mkNode("n4", "ψ → ψ"),
    ],
    inferenceEdges: [
      {
        _tag: "nd-implication-intro",
        conclusionNodeId: "n2",
        premiseNodeId: "n1",
        dischargedFormulaText: "φ",
        dischargedAssumptionId: 1,
        conclusionText: "φ → φ",
      },
      {
        _tag: "nd-implication-intro",
        conclusionNodeId: "n4",
        premiseNodeId: "n3",
        dischargedFormulaText: "ψ",
        dischargedAssumptionId: 2,
        conclusionText: "ψ → ψ",
      },
    ],
  };
}

function makeConjunctionData(): {
  readonly nodes: readonly WorkspaceNode[];
  readonly inferenceEdges: readonly InferenceEdge[];
} {
  return {
    nodes: [mkNode("n1", "φ"), mkNode("n2", "ψ"), mkNode("n3", "φ ∧ ψ")],
    inferenceEdges: [
      {
        _tag: "nd-conjunction-intro",
        conclusionNodeId: "n3",
        leftPremiseNodeId: "n1",
        rightPremiseNodeId: "n2",
        conclusionText: "φ ∧ ψ",
      },
    ],
  };
}

// --- メタ ---

const meta: Meta<typeof NdProofTreePanel> = {
  title: "proof-pad/NdProofTreePanel",
  component: NdProofTreePanel,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof NdProofTreePanel>;

// --- ストーリー ---

export const Empty: Story = {
  args: {
    ...makeEmptyData(),
    testId: "nd-tree",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("ND Proof Tree")).toBeInTheDocument();
    await expect(canvas.getByText("No proof")).toBeInTheDocument();
    await expect(
      canvas.getByText(
        "No inference edges yet. Apply rules to build a proof tree.",
      ),
    ).toBeInTheDocument();
  },
};

export const ImplicationIntro: Story = {
  args: {
    ...makeImplicationIntroData(),
    testId: "nd-tree",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2 nodes, depth 1")).toBeInTheDocument();
    const allRules = canvas.getAllByText(/^(→I \[1\]|Asm)$/);
    const ruleTexts = allRules.map((el) => el.textContent);
    await expect(ruleTexts).toContain("→I [1]");
    await expect(ruleTexts).toContain("Asm");
  },
};

export const ImplicationElim: Story = {
  args: {
    ...makeImplicationElimData(),
    testId: "nd-tree",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("3 nodes, depth 1")).toBeInTheDocument();
    const allRules = canvas.getAllByText(/^(→E|Asm)$/);
    const ruleTexts = allRules.map((el) => el.textContent);
    await expect(ruleTexts).toContain("→E");
    await expect(ruleTexts.filter((t) => t === "Asm")).toHaveLength(2);
  },
};

export const DeepChain: Story = {
  args: {
    ...makeDeepChainData(),
    testId: "nd-tree",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("4 nodes, depth 2")).toBeInTheDocument();
    const allRules = canvas.getAllByText(/^(→I \[1\]|→E|Asm)$/);
    const ruleTexts = allRules.map((el) => el.textContent);
    await expect(ruleTexts).toContain("→I [1]");
    await expect(ruleTexts).toContain("→E");
  },
};

export const MultiRoot: Story = {
  args: {
    ...makeMultiRootData(),
    testId: "nd-tree",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2 nodes, depth 1")).toBeInTheDocument();
    const cycleButton = canvas.getByTestId("nd-tree-cycle-root");
    await expect(cycleButton).toHaveTextContent("1/2");
    await userEvent.click(cycleButton);
    await expect(cycleButton).toHaveTextContent("2/2");
    await userEvent.click(cycleButton);
    await expect(cycleButton).toHaveTextContent("1/2");
  },
};

export const ConjunctionIntro: Story = {
  args: {
    ...makeConjunctionData(),
    testId: "nd-tree",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("3 nodes, depth 1")).toBeInTheDocument();
    const allRules = canvas.getAllByText(/^(∧I|Asm)$/);
    const ruleTexts = allRules.map((el) => el.textContent);
    await expect(ruleTexts).toContain("∧I");
    await expect(ruleTexts.filter((t) => t === "Asm")).toHaveLength(2);
  },
};
