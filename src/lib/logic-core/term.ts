import { Schema } from "effect";
import { GreekLetter } from "./greekLetters";

// ── 二項演算子 ───────────────────────────────────────────

/**
 * 項の二項演算子。意味は与えられていない（純粋に構文的）。
 */
export const binaryOperators = ["+", "-", "*", "/", "^"] as const;
export type BinaryOperator = (typeof binaryOperators)[number];
export const BinaryOperator = Schema.Literal(...binaryOperators);

// ── Term AST ノード ──────────────────────────────────────

/**
 * 項変数 (x, y, z, ...)
 * 小文字英字で始まる識別子。
 */
export class TermVariable extends Schema.TaggedClass<TermVariable>()(
  "TermVariable",
  {
    name: Schema.String,
  },
) {}

/**
 * 項メタ変数 (τ, σ, ...)
 * ギリシャ文字 + オプション添字。
 * subscript は Option.none() で添字なし、Option.some("1") で添字 "1"。
 */
export class TermMetaVariable extends Schema.TaggedClass<TermMetaVariable>()(
  "TermMetaVariable",
  {
    name: GreekLetter,
    subscript: Schema.String.pipe(Schema.optional),
  },
) {}

/**
 * 定数 (0, 1, a, b, ...)
 */
export class Constant extends Schema.TaggedClass<Constant>()("Constant", {
  name: Schema.String,
}) {}

/**
 * 関数適用 f(t1, t2, ...)
 */
export class FunctionApplication extends Schema.TaggedClass<FunctionApplication>()(
  "FunctionApplication",
  {
    name: Schema.String,
    args: Schema.Array(Schema.suspend((): Schema.Schema<Term> => Term)),
  },
) {}

/**
 * 二項演算 (t1 + t2, t1 * t2, ...)
 * 演算子に意味は与えられていない。
 */
export class BinaryOperation extends Schema.TaggedClass<BinaryOperation>()(
  "BinaryOperation",
  {
    operator: BinaryOperator,
    left: Schema.suspend((): Schema.Schema<Term> => Term),
    right: Schema.suspend((): Schema.Schema<Term> => Term),
  },
) {}

// ── Term Union ───────────────────────────────────────────

/**
 * 項（Term）の discriminated union。
 * _tag でパターンマッチ可能。
 */
export type Term =
  | TermVariable
  | TermMetaVariable
  | Constant
  | FunctionApplication
  | BinaryOperation;

export const Term = Schema.Union(
  TermVariable,
  TermMetaVariable,
  Constant,
  FunctionApplication,
  BinaryOperation,
);

// ── ファクトリ関数 ───────────────────────────────────────

export const termVariable = (name: string): TermVariable =>
  new TermVariable({ name });

export const termMetaVariable = (
  name: TermMetaVariable["name"],
  subscript?: string,
): TermMetaVariable =>
  new TermMetaVariable({
    name,
    ...(subscript !== undefined ? { subscript } : {}),
  });

export const constant = (name: string): Constant => new Constant({ name });

export const functionApplication = (
  name: string,
  args: readonly Term[],
): FunctionApplication => new FunctionApplication({ name, args: [...args] });

export const binaryOperation = (
  operator: BinaryOperator,
  left: Term,
  right: Term,
): BinaryOperation => new BinaryOperation({ operator, left, right });
