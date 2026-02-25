/**
 * ビルトインクエスト問題の定義。
 *
 * dev/quest-problems/ のドキュメントをコード化したもの。
 * 新しいクエストを追加する場合はここに追記し、テストも同期すること。
 *
 * 変更時は builtinQuests.test.ts も同期すること。
 */

import type { QuestDefinition } from "./questDefinition";

// --- Level 1: 公理のインスタンス化とMP入門 ---

const q01Identity: QuestDefinition = {
  id: "prop-01",
  category: "propositional-basics",
  title: "恒等律 (Identity)",
  description: "φ → φ を証明せよ。SKK = I の対応を体験する。",
  difficulty: 1,
  systemPresetId: "lukasiewicz",
  goals: [
    {
      formulaText: "phi -> phi",
      label: "Goal: φ → φ",
      position: { x: 400, y: 500 },
    },
  ],
  hints: [
    "A1とA2の具体的なインスタンスを組み合わせます。",
    "A1: φ → ((φ → φ) → φ) のインスタンスを作ってみましょう。",
    "A2: 上の結果と組み合わせて (φ → (φ → φ)) → (φ → φ) を導きましょう。",
  ],
  estimatedSteps: 5,
  learningPoint:
    "A2 (S公理) は「関数適用の分配」に相当する。この証明はSKK = I の対応。",
  order: 1,
};

const q02ConstantComposition: QuestDefinition = {
  id: "prop-02",
  category: "propositional-basics",
  title: "定数関数の合成",
  description: "ψ → (φ → φ) を証明せよ。A1で既知の定理を「持ち上げる」。",
  difficulty: 1,
  systemPresetId: "lukasiewicz",
  goals: [
    {
      formulaText: "psi -> (phi -> phi)",
      label: "Goal: ψ → (φ → φ)",
      position: { x: 400, y: 500 },
    },
  ],
  hints: [
    "まずQ-01と同じ手順で φ → φ を導出しましょう。",
    "A1: (φ → φ) → (ψ → (φ → φ)) のインスタンスを作りましょう。",
    "MPで組み合わせれば完成です。",
  ],
  estimatedSteps: 7,
  learningPoint:
    "A1 (K公理) は「結論を前提で持ち上げる」。既に証明した定理は再利用できる。",
  order: 2,
};

const q03TransitivityPrep: QuestDefinition = {
  id: "prop-03",
  category: "propositional-basics",
  title: "推移律の準備",
  description:
    "(φ → ψ) → ((ψ → χ) → (φ → ψ)) を証明せよ。A1の直接のインスタンス。",
  difficulty: 1,
  systemPresetId: "lukasiewicz",
  goals: [
    {
      formulaText: "(phi -> psi) -> ((psi -> chi) -> (phi -> psi))",
      label: "Goal",
      position: { x: 400, y: 500 },
    },
  ],
  hints: [
    "この式はA1のインスタンスです。",
    "A1のφに「φ → ψ」、ψに「ψ → χ」を代入してみましょう。",
  ],
  estimatedSteps: 1,
  learningPoint:
    "公理のメタ変数にはどんな式でも代入できる。単純な式だけでなく、含意式も代入可能。",
  order: 3,
};

// --- Level 2: MPチェインの基本 ---

const q04HypotheticalSyllogism: QuestDefinition = {
  id: "prop-04",
  category: "propositional-basics",
  title: "推移律 (Hypothetical Syllogism)",
  description:
    "(φ → ψ) → ((ψ → χ) → (φ → χ)) を証明せよ。Hilbert系で最も基本かつ頻出の補題。",
  difficulty: 2,
  systemPresetId: "lukasiewicz",
  goals: [
    {
      formulaText: "(phi -> psi) -> ((psi -> chi) -> (phi -> chi))",
      label: "Goal",
      position: { x: 400, y: 600 },
    },
  ],
  hints: [
    "A2でφ→(ψ→χ)の形を作り、A1で前提を持ち上げます。",
    "A2: (φ → (ψ → χ)) → ((φ → ψ) → (φ → χ)) をそのまま使いましょう。",
    "A1でψ→χをφの前提に持ち上げ、S公理で分配します。",
  ],
  estimatedSteps: 11,
  learningPoint:
    "推移律はHilbert系で最も基本的かつ頻出の補題。以降の証明で多用する。",
  order: 4,
};

const q05ImplicationWeakening: QuestDefinition = {
  id: "prop-05",
  category: "propositional-basics",
  title: "含意の弱化",
  description: "φ → (ψ → (χ → ψ)) を証明せよ。K公理の2重適用。",
  difficulty: 2,
  systemPresetId: "lukasiewicz",
  goals: [
    {
      formulaText: "phi -> (psi -> (chi -> psi))",
      label: "Goal",
      position: { x: 400, y: 500 },
    },
  ],
  hints: [
    "A1のインスタンスをA1で持ち上げます。",
    "A1: ψ → (χ → ψ) をまず作りましょう。",
    "A1: (ψ → (χ → ψ)) → (φ → (ψ → (χ → ψ))) で持ち上げます。",
  ],
  estimatedSteps: 3,
  learningPoint: "K公理の2重適用。「不要な前提を追加する」操作。",
  order: 5,
};

const q06SSpecialCase: QuestDefinition = {
  id: "prop-06",
  category: "propositional-basics",
  title: "S公理の特殊ケース",
  description:
    "(φ → (φ → ψ)) → (φ → ψ) を証明せよ。「φが2回必要な含意」を1回に圧縮。",
  difficulty: 2,
  systemPresetId: "lukasiewicz",
  goals: [
    {
      formulaText: "(phi -> (phi -> psi)) -> (phi -> psi)",
      label: "Goal",
      position: { x: 400, y: 600 },
    },
  ],
  hints: [
    "A2でψをφに置き換えてみましょう。",
    "A2: (φ → (φ → ψ)) → ((φ → φ) → (φ → ψ)) を使います。",
    "Q-01の手順で φ → φ を導出し、推移律的に組み合わせます。",
  ],
  estimatedSteps: 12,
  learningPoint:
    "「φ → (φ → ψ)」は「φが2回必要な含意」。S公理で1回分に圧縮できる。",
  order: 6,
};

const q07Permutation: QuestDefinition = {
  id: "prop-07",
  category: "propositional-basics",
  title: "含意の交換 (C Combinator)",
  description:
    "(φ → (ψ → χ)) → (ψ → (φ → χ)) を証明せよ。前提の順序を入れ替える。",
  difficulty: 2,
  systemPresetId: "lukasiewicz",
  goals: [
    {
      formulaText: "(phi -> (psi -> chi)) -> (psi -> (phi -> chi))",
      label: "Goal",
      position: { x: 400, y: 600 },
    },
  ],
  hints: [
    "A1でψをφ → ...の中に持ち上げ、A2で分配します。",
    "A1: ψ → (φ → ψ) をまず使います。",
    "推移律で接続して完成させます。",
  ],
  estimatedSteps: 15,
  learningPoint:
    "C combinator に対応。前提の順序は自由に入れ替えられる（ただし手間がかかる）。",
  order: 7,
};

// --- 全ビルトインクエスト ---

/** 全ビルトインクエスト定義 */
export const builtinQuests: readonly QuestDefinition[] = [
  q01Identity,
  q02ConstantComposition,
  q03TransitivityPrep,
  q04HypotheticalSyllogism,
  q05ImplicationWeakening,
  q06SSpecialCase,
  q07Permutation,
];
