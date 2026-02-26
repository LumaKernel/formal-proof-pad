/**
 * 演繹体系の統一的管理モジュール。
 *
 * Hilbert流・自然演繹・シーケント計算など、異なる証明スタイルを
 * 統一的に扱う型と定義を提供する。
 *
 * 戸次大介『数理論理学』に基づく体系分類:
 * - 第7章: Hilbert流証明論 (SK, HM, HJ, HK)
 * - 第8章: 自然演繹 (NM, NJ, NK)
 * - 第10章: ゲンツェン流シーケント計算 (LM, LJ, LK)
 *
 * 変更時は deductionSystem.test.ts, notebookCreateLogic.ts,
 * questDefinition.ts の SystemPresetId も同期すること。
 *
 * @see inferenceRule.ts Hilbert流の体系定義 (LogicSystem)
 * @see naturalDeduction.ts 自然演繹のピュアロジック
 */

import type { LogicSystem } from "./inferenceRule";

// ── 証明スタイル ─────────────────────────────────────────

/**
 * 証明スタイルの分類。
 *
 * - "hilbert": Hilbert流（公理 + MP + Gen）
 * - "natural-deduction": 自然演繹（推論規則のペア + 仮定の打ち消し）
 * - "sequent-calculus": シーケント計算（将来追加予定）
 *
 * 新しいスタイル追加時はすべての switch 文を更新すること
 * （satisfies never でコンパイル時に検出される）。
 */
export type DeductionStyle = "hilbert" | "natural-deduction";
// 将来: | "sequent-calculus"

// ── 自然演繹の体系設定 ─────────────────────────────────────

/**
 * 自然演繹の推論規則ID。
 *
 * NM（最小論理）で使える基本規則:
 * - implication-intro, implication-elim (→I, →E)
 * - conjunction-intro, conjunction-elim-left, conjunction-elim-right (∧I, ∧E)
 * - disjunction-intro-left, disjunction-intro-right, disjunction-elim (∨I, ∨E)
 * - weakening (弱化)
 *
 * NJ（直観主義論理）で追加:
 * - efq (爆発律: ⊥→任意)
 *
 * NK（古典論理）で追加:
 * - dne (二重否定除去: ¬¬φ→φ)
 */
export type NdRuleId =
  | "implication-intro"
  | "implication-elim"
  | "conjunction-intro"
  | "conjunction-elim-left"
  | "conjunction-elim-right"
  | "disjunction-intro-left"
  | "disjunction-intro-right"
  | "disjunction-elim"
  | "weakening"
  | "efq"
  | "dne";

/** NM（最小論理）の基本規則セット */
const nmBaseRules: ReadonlySet<NdRuleId> = new Set([
  "implication-intro",
  "implication-elim",
  "conjunction-intro",
  "conjunction-elim-left",
  "conjunction-elim-right",
  "disjunction-intro-left",
  "disjunction-intro-right",
  "disjunction-elim",
  "weakening",
]);

/**
 * 自然演繹の体系設定。
 *
 * どの推論規則を有効にするかを指定する。
 */
export type NaturalDeductionSystem = {
  /** 体系名 */
  readonly name: string;
  /** 有効な推論規則 */
  readonly rules: ReadonlySet<NdRuleId>;
};

/**
 * NM: 自然演繹の最小論理。
 * 基本規則のみ。EFQ/DNEなし。
 * 戸次『数理論理学』§8.2
 */
export const nmSystem: NaturalDeductionSystem = {
  name: "Natural Deduction NM",
  rules: nmBaseRules,
};

/**
 * NJ: 自然演繹の直観主義論理。
 * NM + EFQ（爆発律）。
 * 戸次『数理論理学』§8.3
 */
export const njSystem: NaturalDeductionSystem = {
  name: "Natural Deduction NJ",
  rules: new Set([...nmBaseRules, "efq"]),
};

/**
 * NK: 自然演繹の古典論理。
 * NM + DNE（二重否定除去）。
 * 戸次『数理論理学』§8.3
 *
 * 注: NK = NM + DNE であり、EFQ は NK で証明可能なため明示的に含めない。
 * ただし、EFQを「自明な規則」として使いたい場合は拡張可能。
 */
export const nkSystem: NaturalDeductionSystem = {
  name: "Natural Deduction NK",
  rules: new Set([...nmBaseRules, "dne"]),
};

// ── 演繹体系（統一型） ──────────────────────────────────────

/**
 * 統一された演繹体系の定義。
 *
 * Hilbert流と自然演繹を discriminated union で管理する。
 * 将来のシーケント計算追加時はここにバリアントを追加する。
 */
export type DeductionSystem =
  | {
      readonly style: "hilbert";
      readonly system: LogicSystem;
    }
  | {
      readonly style: "natural-deduction";
      readonly system: NaturalDeductionSystem;
    };

// ── ファクトリ関数 ──────────────────────────────────────────

/** Hilbert流の演繹体系を作成する */
export function hilbertDeduction(system: LogicSystem): DeductionSystem {
  return { style: "hilbert", system };
}

/** 自然演繹の演繹体系を作成する */
export function naturalDeduction(
  system: NaturalDeductionSystem,
): DeductionSystem {
  return { style: "natural-deduction", system };
}

// ── ユーティリティ ──────────────────────────────────────────

/** 演繹体系の名前を取得する */
export function getDeductionSystemName(ds: DeductionSystem): string {
  switch (ds.style) {
    case "hilbert":
      return ds.system.name;
    case "natural-deduction":
      return ds.system.name;
    default: {
      /* v8 ignore start */
      const _exhaustive: never = ds;
      return _exhaustive;
      /* v8 ignore stop */
    }
  }
}

/** 演繹体系の証明スタイルの表示名を取得する */
export function getDeductionStyleLabel(style: DeductionStyle): string {
  switch (style) {
    case "hilbert":
      return "Hilbert流";
    case "natural-deduction":
      return "自然演繹";
    default: {
      /* v8 ignore start */
      const _exhaustive: never = style;
      return _exhaustive;
      /* v8 ignore stop */
    }
  }
}

/** 自然演繹体系で特定の規則が有効かどうかを判定する */
export function isNdRuleEnabled(
  system: NaturalDeductionSystem,
  ruleId: NdRuleId,
): boolean {
  return system.rules.has(ruleId);
}

/** 全NdRuleIdの一覧（テスト・UI用） */
export const allNdRuleIds: readonly NdRuleId[] = [
  "implication-intro",
  "implication-elim",
  "conjunction-intro",
  "conjunction-elim-left",
  "conjunction-elim-right",
  "disjunction-intro-left",
  "disjunction-intro-right",
  "disjunction-elim",
  "weakening",
  "efq",
  "dne",
];

/** NdRuleIdの表示名 */
export function getNdRuleDisplayName(ruleId: NdRuleId): string {
  switch (ruleId) {
    case "implication-intro":
      return "→導入 (→I)";
    case "implication-elim":
      return "→除去 (→E)";
    case "conjunction-intro":
      return "∧導入 (∧I)";
    case "conjunction-elim-left":
      return "∧除去左 (∧E_L)";
    case "conjunction-elim-right":
      return "∧除去右 (∧E_R)";
    case "disjunction-intro-left":
      return "∨導入左 (∨I_L)";
    case "disjunction-intro-right":
      return "∨導入右 (∨I_R)";
    case "disjunction-elim":
      return "∨除去 (∨E)";
    case "weakening":
      return "弱化 (w)";
    case "efq":
      return "爆発律 (EFQ)";
    case "dne":
      return "二重否定除去 (DNE)";
    default: {
      /* v8 ignore start */
      const _exhaustive: never = ruleId;
      return _exhaustive;
      /* v8 ignore stop */
    }
  }
}
