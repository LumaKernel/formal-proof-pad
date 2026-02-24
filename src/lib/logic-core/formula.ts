import { Schema } from "effect";
import { GreekLetter } from "./greekLetters";
import { Term, TermVariable } from "./term";

// ── Formula AST ノード ───────────────────────────────────

/**
 * 論理式メタ変数 (φ, ψ, χ, ...)
 * ギリシャ文字 + オプション添字。
 */
export class MetaVariable extends Schema.TaggedClass<MetaVariable>()(
  "MetaVariable",
  {
    name: GreekLetter,
    subscript: Schema.String.pipe(Schema.optional),
  },
) {}

/**
 * 否定 ¬φ
 */
export class Negation extends Schema.TaggedClass<Negation>()("Negation", {
  formula: Schema.suspend((): Schema.Schema<Formula> => Formula),
}) {}

/**
 * 含意 φ→ψ
 */
export class Implication extends Schema.TaggedClass<Implication>()(
  "Implication",
  {
    left: Schema.suspend((): Schema.Schema<Formula> => Formula),
    right: Schema.suspend((): Schema.Schema<Formula> => Formula),
  },
) {}

/**
 * 連言 φ∧ψ
 */
export class Conjunction extends Schema.TaggedClass<Conjunction>()(
  "Conjunction",
  {
    left: Schema.suspend((): Schema.Schema<Formula> => Formula),
    right: Schema.suspend((): Schema.Schema<Formula> => Formula),
  },
) {}

/**
 * 選言 φ∨ψ
 */
export class Disjunction extends Schema.TaggedClass<Disjunction>()(
  "Disjunction",
  {
    left: Schema.suspend((): Schema.Schema<Formula> => Formula),
    right: Schema.suspend((): Schema.Schema<Formula> => Formula),
  },
) {}

/**
 * 双条件 φ↔ψ
 */
export class Biconditional extends Schema.TaggedClass<Biconditional>()(
  "Biconditional",
  {
    left: Schema.suspend((): Schema.Schema<Formula> => Formula),
    right: Schema.suspend((): Schema.Schema<Formula> => Formula),
  },
) {}

/**
 * 全称量化 ∀x.φ
 */
export class Universal extends Schema.TaggedClass<Universal>()("Universal", {
  variable: TermVariable,
  formula: Schema.suspend((): Schema.Schema<Formula> => Formula),
}) {}

/**
 * 存在量化 ∃x.φ
 */
export class Existential extends Schema.TaggedClass<Existential>()(
  "Existential",
  {
    variable: TermVariable,
    formula: Schema.suspend((): Schema.Schema<Formula> => Formula),
  },
) {}

/**
 * 述語適用 P(t1, t2, ...)
 */
export class Predicate extends Schema.TaggedClass<Predicate>()("Predicate", {
  name: Schema.String,
  args: Schema.Array(Term),
}) {}

/**
 * 等号 t1 = t2
 * 等号付き論理はオプション機能。体系設定で有効/無効を選択。
 */
export class Equality extends Schema.TaggedClass<Equality>()("Equality", {
  left: Term,
  right: Term,
}) {}

// ── Formula Union ────────────────────────────────────────

/**
 * 論理式（Formula）の discriminated union。
 * _tag でパターンマッチ可能。
 */
export type Formula =
  | MetaVariable
  | Negation
  | Implication
  | Conjunction
  | Disjunction
  | Biconditional
  | Universal
  | Existential
  | Predicate
  | Equality;

export const Formula = Schema.Union(
  MetaVariable,
  Negation,
  Implication,
  Conjunction,
  Disjunction,
  Biconditional,
  Universal,
  Existential,
  Predicate,
  Equality,
);

// ── ファクトリ関数 ───────────────────────────────────────

export const metaVariable = (
  name: MetaVariable["name"],
  subscript?: string,
): MetaVariable =>
  new MetaVariable({ name, ...(subscript !== undefined ? { subscript } : {}) });

export const negation = (formula: Formula): Negation =>
  new Negation({ formula });

export const implication = (left: Formula, right: Formula): Implication =>
  new Implication({ left, right });

export const conjunction = (left: Formula, right: Formula): Conjunction =>
  new Conjunction({ left, right });

export const disjunction = (left: Formula, right: Formula): Disjunction =>
  new Disjunction({ left, right });

export const biconditional = (left: Formula, right: Formula): Biconditional =>
  new Biconditional({ left, right });

export const universal = (
  variable: TermVariable,
  formula: Formula,
): Universal => new Universal({ variable, formula });

export const existential = (
  variable: TermVariable,
  formula: Formula,
): Existential => new Existential({ variable, formula });

export const predicate = (name: string, args: readonly Term[]): Predicate =>
  new Predicate({ name, args: [...args] });

export const equality = (left: Term, right: Term): Equality =>
  new Equality({ left, right });
