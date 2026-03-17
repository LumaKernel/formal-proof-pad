/**
 * スクリプト API リファレンスの純粋ロジック。
 *
 * 3つのブリッジ API 定義を統合し、カテゴリ別のリファレンスデータと
 * 検索フィルタ機能を提供する。
 *
 * 変更時は scriptApiReferenceLogic.test.ts, index.ts も同期すること。
 */

import type { ProofBridgeApiDef } from "@/lib/script-runner";
import {
  PROOF_BRIDGE_API_DEFS,
  WORKSPACE_BRIDGE_API_DEFS,
  CUT_ELIMINATION_BRIDGE_API_DEFS,
} from "@/lib/script-runner";

// ── 型定義 ─────────────────────────────────────────────────────

export type ApiCategory = "proof" | "workspace" | "cutElimination";

export interface ApiCategoryInfo {
  readonly id: ApiCategory;
  readonly label: string;
  readonly description: string;
  readonly apis: readonly ProofBridgeApiDef[];
}

// ── 定数 ─────────────────────────────────────────────────────

export const API_CATEGORIES: readonly ApiCategoryInfo[] = [
  {
    id: "proof",
    label: "Proof API",
    description: "論理式のパース・フォーマット・推論規則適用",
    apis: PROOF_BRIDGE_API_DEFS,
  },
  {
    id: "workspace",
    label: "Workspace API",
    description: "ワークスペース上のノード操作",
    apis: WORKSPACE_BRIDGE_API_DEFS,
  },
  {
    id: "cutElimination",
    label: "Cut Elimination API",
    description: "シーケント計算のカット除去操作",
    apis: CUT_ELIMINATION_BRIDGE_API_DEFS,
  },
];

// ── フィルタ関数 ─────────────────────────────────────────────

/**
 * 検索クエリでAPI定義をフィルタリングする。
 * name, signature, description の部分一致（大文字小文字無視）。
 */
export function filterApis(
  apis: readonly ProofBridgeApiDef[],
  query: string,
): readonly ProofBridgeApiDef[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return apis;
  return apis.filter(
    (api) =>
      api.name.toLowerCase().includes(trimmed) ||
      api.signature.toLowerCase().includes(trimmed) ||
      api.description.toLowerCase().includes(trimmed),
  );
}

/**
 * 全カテゴリにフィルタを適用し、結果が空でないカテゴリのみ返す。
 */
export function filterCategories(
  categories: readonly ApiCategoryInfo[],
  query: string,
): readonly ApiCategoryInfo[] {
  const trimmed = query.trim();
  if (trimmed === "") return categories;
  return categories
    .map((cat) => ({
      ...cat,
      apis: filterApis(cat.apis, trimmed),
    }))
    .filter((cat) => cat.apis.length > 0);
}

/**
 * 全APIの総数を返す。
 */
export function getTotalApiCount(
  categories: readonly ApiCategoryInfo[],
): number {
  return categories.reduce((sum, cat) => sum + cat.apis.length, 0);
}
