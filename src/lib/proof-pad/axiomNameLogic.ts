/**
 * 公理名自動判別の純粋ロジック。
 *
 * ノードの論理式がどの有名公理のテンプレートと構造的に等しいかを判定し、
 * 表示名（例: "A1 (K)"）を返す。
 *
 * 公理として識別されるのは、公理テンプレートと完全一致する場合のみ。
 * メタ変数に具体的な式を代入して得られたインスタンス（例: φ→(φ→φ)）は識別しない。
 *
 * 変更時は axiomNameLogic.test.ts, EditableProofNode.tsx, ProofWorkspace.tsx, index.ts も同期すること。
 */

import type { Formula } from "../logic-core/formula";
import type { AxiomId, LogicSystem } from "../logic-core/inferenceRule";
import {
  matchAxiomTemplateByEquality,
  matchTheoryAxiomTemplateByEquality,
} from "../logic-core/inferenceRule";

// --- 公理IDから表示名へのマッピング ---

/**
 * 公理IDに対応する表示名。
 * axiomPaletteLogic.ts と整合を保つこと。
 *
 * 新しい公理を追加する場合はこのマップとaxiomPaletteLogicの両方を更新する。
 */
const axiomDisplayNames: Readonly<Record<AxiomId, string>> = {
  A1: "A1 (K)",
  A2: "A2 (S)",
  A3: "A3",
  M3: "M3",
  EFQ: "EFQ",
  DNE: "DNE",
  "CONJ-DEF": "∧-Def",
  "DISJ-DEF": "∨-Def",
  A4: "A4 (UI)",
  A5: "A5 (∀-Dist)",
  "EX-DEF": "∃-Def",
  E1: "E1 (Refl)",
  E2: "E2 (Sym)",
  E3: "E3 (Trans)",
  E4: "E4",
  E5: "E5",
};

// --- 公理名判定結果 ---

/**
 * 公理名判定の結果。
 *
 * Identified: 標準公理テンプレートと構造的に一致
 * TheoryAxiomIdentified: 理論公理テンプレートと構造的に一致
 * NotIdentified: いずれの公理テンプレートとも一致しない
 */
export type AxiomNameResult =
  | {
      readonly _tag: "Identified";
      readonly axiomId: AxiomId;
      readonly displayName: string;
    }
  | {
      readonly _tag: "TheoryAxiomIdentified";
      readonly theoryAxiomId: string;
      readonly displayName: string;
    }
  | { readonly _tag: "NotIdentified" };

/**
 * 論理式がシステムで有効な公理テンプレートと構造的に等しいかを判定し、
 * マッチした場合は公理IDと表示名を返す。
 *
 * equalFormula による構造的等価性チェックのみを行う。
 * メタ変数のリネームや代入インスタンスは識別しない。
 *
 * @param formula パース済みの論理式
 * @param system 論理体系設定
 * @returns 公理名判定結果
 */
export function identifyAxiomName(
  formula: Formula,
  system: LogicSystem,
): AxiomNameResult {
  // 標準公理テンプレートとの構造的一致
  const axiomId = matchAxiomTemplateByEquality(formula, system);
  if (axiomId !== undefined) {
    return {
      _tag: "Identified",
      axiomId,
      displayName: axiomDisplayNames[axiomId],
    };
  }

  // 理論公理テンプレートとの構造的一致
  const theoryMatch = matchTheoryAxiomTemplateByEquality(formula, system);
  if (theoryMatch !== undefined) {
    return {
      _tag: "TheoryAxiomIdentified",
      theoryAxiomId: theoryMatch.theoryAxiomId,
      displayName: theoryMatch.displayName,
    };
  }

  return { _tag: "NotIdentified" };
}

/**
 * 公理IDから表示名を取得する。
 */
export function getAxiomDisplayName(axiomId: AxiomId): string {
  return axiomDisplayNames[axiomId];
}
