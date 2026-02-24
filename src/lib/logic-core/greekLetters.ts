import { Schema } from "effect";

/**
 * 使用可能なギリシャ文字の一覧。
 * ο（オミクロン）は o と紛らわしいため除外。
 *
 * 変更時は greekLetterNames / GreekLetter も同期すること。
 */
export const greekLetters = [
  "α",
  "β",
  "γ",
  "δ",
  "ε",
  "ζ",
  "η",
  "θ",
  "ι",
  "κ",
  "λ",
  "μ",
  "ν",
  "ξ",
  "π",
  "ρ",
  "σ",
  "τ",
  "υ",
  "φ",
  "χ",
  "ψ",
  "ω",
] as const;

export type GreekLetter = (typeof greekLetters)[number];

export const GreekLetter = Schema.Literal(...greekLetters);

/**
 * ASCII名 → ギリシャ文字の対応表。
 * DSL パーサー等で使用。
 */
export const greekLetterNames: ReadonlyMap<string, GreekLetter> = new Map([
  ["alpha", "α"],
  ["beta", "β"],
  ["gamma", "γ"],
  ["delta", "δ"],
  ["epsilon", "ε"],
  ["zeta", "ζ"],
  ["eta", "η"],
  ["theta", "θ"],
  ["iota", "ι"],
  ["kappa", "κ"],
  ["lambda", "λ"],
  ["mu", "μ"],
  ["nu", "ν"],
  ["xi", "ξ"],
  ["pi", "π"],
  ["rho", "ρ"],
  ["sigma", "σ"],
  ["tau", "τ"],
  ["upsilon", "υ"],
  ["phi", "φ"],
  ["chi", "χ"],
  ["psi", "ψ"],
  ["omega", "ω"],
]);

/**
 * 添字のSchema。
 * 添字は文字列として扱い、"01" と "1" は異なる。
 * 1桁(0-9), 2桁(00-99), 3桁(000-999) のみ許可。
 */
export const Subscript = Schema.String.pipe(
  Schema.pattern(/^(?:\d|[0-9]{2}|[0-9]{3})$/),
);

export type Subscript = typeof Subscript.Type;

/**
 * 与えられた文字列が有効な添字かどうか判定する。
 */
export const isValidSubscript = (s: string) =>
  /^(?:\d|[0-9]{2}|[0-9]{3})$/.test(s);

/**
 * 与えられた文字がギリシャ文字かどうか判定する。
 */
export const isGreekLetter = (s: string) =>
  (greekLetters as readonly string[]).includes(s);
