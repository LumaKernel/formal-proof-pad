/**
 * ゴミ箱の純粋な状態管理ロジック。
 *
 * ノート・自作クエスト・スクリプト・コレクションエントリの
 * ソフトデリート（ゴミ箱移動）と復元・完全削除・期限切れ管理を提供する。
 *
 * 変更時は trashState.test.ts, index.ts も同期すること。
 */

import { Schema } from "effect";

// --- 型定義 ---

/** ゴミ箱アイテムの種別 */
export type TrashItemKind =
  | "notebook"
  | "custom-quest"
  | "script"
  | "proof-entry";

/** ゴミ箱に入れたアイテム */
export type TrashItem = {
  /** ゴミ箱内での一意ID */
  readonly trashId: string;
  /** アイテム種別 */
  readonly kind: TrashItemKind;
  /** 元のアイテムID */
  readonly originalId: string;
  /** 表示用の名前 */
  readonly displayName: string;
  /** ゴミ箱に入れた日時（Unix ms） */
  readonly trashedAt: number;
  /** シリアライズされた元データ（復元用） */
  readonly serializedData: string;
};

/** ゴミ箱の状態 */
export type TrashState = {
  readonly items: readonly TrashItem[];
  readonly nextTrashId: number;
};

// --- 定数 ---

/** 期限切れまでの日数 */
export const TRASH_EXPIRY_DAYS = 30;

/** 期限切れまでのミリ秒 */
export const TRASH_EXPIRY_MS = TRASH_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// --- 状態操作（純粋関数） ---

/** 空のゴミ箱を作成する */
export function createEmptyTrash(): TrashState {
  return { items: [], nextTrashId: 1 };
}

/** アイテムをゴミ箱に追加する */
export function addToTrash(
  state: TrashState,
  kind: TrashItemKind,
  originalId: string,
  displayName: string,
  serializedData: string,
  now: number,
): TrashState {
  const trashId = `trash-${String(state.nextTrashId) satisfies string}`;
  const item: TrashItem = {
    trashId,
    kind,
    originalId,
    displayName,
    trashedAt: now,
    serializedData,
  };
  return {
    items: [...state.items, item],
    nextTrashId: state.nextTrashId + 1,
  };
}

/** ゴミ箱からアイテムを取得する（復元前の確認用） */
export function getTrashItem(
  state: TrashState,
  trashId: string,
): TrashItem | undefined {
  return state.items.find((item) => item.trashId === trashId);
}

/** ゴミ箱からアイテムを復元する（ゴミ箱から除去して返す） */
export function restoreFromTrash(
  state: TrashState,
  trashId: string,
): { readonly newState: TrashState; readonly item: TrashItem | undefined } {
  const item = state.items.find((i) => i.trashId === trashId);
  if (!item) {
    return { newState: state, item: undefined };
  }
  return {
    newState: {
      ...state,
      items: state.items.filter((i) => i.trashId !== trashId),
    },
    item,
  };
}

/** ゴミ箱からアイテムを完全削除する */
export function permanentlyDelete(
  state: TrashState,
  trashId: string,
): TrashState {
  return {
    ...state,
    items: state.items.filter((item) => item.trashId !== trashId),
  };
}

/** ゴミ箱を空にする（全アイテム完全削除） */
export function emptyTrash(state: TrashState): TrashState {
  return { ...state, items: [] };
}

/** 期限切れアイテムを削除する */
export function purgeExpiredItems(state: TrashState, now: number): TrashState {
  const cutoff = now - TRASH_EXPIRY_MS;
  const remaining = state.items.filter((item) => item.trashedAt > cutoff);
  if (remaining.length === state.items.length) {
    return state;
  }
  return { ...state, items: remaining };
}

/** 種別でフィルタリングしたアイテム一覧を返す */
export function getTrashItemsByKind(
  state: TrashState,
  kind: TrashItemKind,
): readonly TrashItem[] {
  return state.items.filter((item) => item.kind === kind);
}

/** ゴミ箱内のアイテム数を返す */
export function getTrashItemCount(state: TrashState): number {
  return state.items.length;
}

/** 特定のアイテムが期限切れかどうか判定する */
export function isExpired(item: TrashItem, now: number): boolean {
  return now - item.trashedAt > TRASH_EXPIRY_MS;
}

/** アイテムの残り日数を計算する（0未満は期限切れ） */
export function getRemainingDays(item: TrashItem, now: number): number {
  const elapsed = now - item.trashedAt;
  const remaining = TRASH_EXPIRY_MS - elapsed;
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

// --- シリアライゼーション ---

const TrashItemSchema = Schema.Struct({
  trashId: Schema.String,
  kind: Schema.Union(
    Schema.Literal("notebook"),
    Schema.Literal("custom-quest"),
    Schema.Literal("script"),
    Schema.Literal("proof-entry"),
  ),
  originalId: Schema.String,
  displayName: Schema.String,
  trashedAt: Schema.Number,
  serializedData: Schema.String,
});

const TrashStateSchema = Schema.Struct({
  items: Schema.Array(TrashItemSchema),
  nextTrashId: Schema.Number,
});

/** ゴミ箱状態をJSON文字列にシリアライズする */
export function serializeTrashState(state: TrashState): string {
  return JSON.stringify(Schema.encodeUnknownSync(TrashStateSchema)(state));
}

/** JSON文字列からゴミ箱状態をデシリアライズする。失敗時はundefinedを返す */
export function deserializeTrashState(json: string): TrashState | undefined {
  try {
    const parsed: unknown = JSON.parse(json);
    return Schema.decodeUnknownSync(TrashStateSchema)(parsed) as TrashState;
  } catch {
    return undefined;
  }
}
