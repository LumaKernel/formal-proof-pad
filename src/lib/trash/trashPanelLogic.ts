/**
 * ゴミ箱管理パネルの純粋ロジック。
 *
 * 表示用アイテムの生成、フィルタリング、ラベル解決を提供する。
 * UIコンポーネント(TrashManagementPanel)から利用される。
 *
 * 変更時は trashPanelLogic.test.ts, TrashManagementPanel.tsx も同期すること。
 */

import type { TrashItem, TrashItemKind } from "./trashState";
import { getRemainingDays } from "./trashState";

// --- 表示用アイテム ---

/** 表示用ゴミ箱アイテム */
export type TrashDisplayItem = {
  readonly trashId: string;
  readonly kind: TrashItemKind;
  readonly displayName: string;
  readonly trashedAt: number;
  readonly remainingDays: number;
  readonly kindLabel: string;
};

/** 種別ラベルのマッピング（i18n対応のため外部から注入） */
export type TrashKindLabels = {
  readonly notebook: string;
  readonly "custom-quest": string;
  readonly script: string;
  readonly "proof-entry": string;
};

/** TrashItem を表示用に変換する */
export function toTrashDisplayItem(
  item: TrashItem,
  now: number,
  kindLabels: TrashKindLabels,
): TrashDisplayItem {
  return {
    trashId: item.trashId,
    kind: item.kind,
    displayName: item.displayName,
    trashedAt: item.trashedAt,
    remainingDays: getRemainingDays(item, now),
    kindLabel: kindLabels[item.kind],
  };
}

/** TrashItem 一覧を表示用に変換する（新しいものが先） */
export function toTrashDisplayItems(
  items: readonly TrashItem[],
  now: number,
  kindLabels: TrashKindLabels,
): readonly TrashDisplayItem[] {
  return items
    .map((item) => toTrashDisplayItem(item, now, kindLabels))
    .sort((a, b) => b.trashedAt - a.trashedAt);
}

/** 種別でフィルタリングする */
export function filterTrashDisplayItems(
  items: readonly TrashDisplayItem[],
  kind: TrashItemKind | null,
): readonly TrashDisplayItem[] {
  if (kind === null) return items;
  return items.filter((item) => item.kind === kind);
}

/** フィルタ選択肢の一覧を生成する */
export type TrashFilterOption = {
  readonly kind: TrashItemKind | null;
  readonly label: string;
  readonly count: number;
};

export function buildTrashFilterOptions(
  items: readonly TrashDisplayItem[],
  kindLabels: TrashKindLabels,
  allLabel: string,
): readonly TrashFilterOption[] {
  const allOption: TrashFilterOption = {
    kind: null,
    label: allLabel,
    count: items.length,
  };

  const kindCounts = new Map<TrashItemKind, number>();
  for (const item of items) {
    kindCounts.set(item.kind, (kindCounts.get(item.kind) ?? 0) + 1);
  }

  const kindOptions: readonly TrashFilterOption[] = (
    ["notebook", "custom-quest", "script", "proof-entry"] as const
  )
    .filter((kind) => kindCounts.has(kind))
    .map((kind) => ({
      kind,
      label: kindLabels[kind],
      /* v8 ignore start */ // .filter(has) で存在保証済みだが型上 undefined の可能性あり
      count: kindCounts.get(kind) ?? 0,
      /* v8 ignore stop */
    }));

  return [allOption, ...kindOptions];
}

/** 残り日数の表示テキストを生成する */
export function formatRemainingDays(
  remainingDays: number,
  template: string,
): string {
  return template.replace("{days}", String(remainingDays));
}
