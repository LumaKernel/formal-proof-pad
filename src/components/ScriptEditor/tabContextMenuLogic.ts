/**
 * タブコンテキストメニューの純粋ロジック。
 *
 * メニュー項目の生成と無効化条件を計算する。
 *
 * 変更時は tabContextMenuLogic.test.ts, ScriptWorkspaceTabBar.tsx も同期すること。
 */

import type { ContextMenuItem } from "../../lib/infinite-canvas/contextMenu";

// ── メニューアクションID ──────────────────────────────────────────

export type TabContextMenuAction =
  | "copy-script-name"
  | "duplicate"
  | "close"
  | "close-others"
  | "close-to-right"
  | "close-all";

// ── メニュー項目生成 ──────────────────────────────────────────────

export interface TabContextMenuInput {
  /** 右クリック対象タブのインデックス */
  readonly tabIndex: number;
  /** タブの総数 */
  readonly totalTabs: number;
}

/**
 * タブコンテキストメニューの項目一覧を生成する。
 */
export const computeTabContextMenuItems = (
  input: TabContextMenuInput,
): readonly ContextMenuItem[] => {
  const { tabIndex, totalTabs } = input;
  const hasOtherTabs = totalTabs > 1;
  const hasTabsToRight = tabIndex < totalTabs - 1;

  return [
    {
      id: "copy-script-name" satisfies TabContextMenuAction,
      label: "スクリプト名をコピー",
    },
    { id: "duplicate" satisfies TabContextMenuAction, label: "複製して編集" },
    { id: "close" satisfies TabContextMenuAction, label: "閉じる" },
    {
      id: "close-others" satisfies TabContextMenuAction,
      label: "他のタブをすべて閉じる",
      disabled: !hasOtherTabs,
    },
    {
      id: "close-to-right" satisfies TabContextMenuAction,
      label: "右のタブをすべて閉じる",
      disabled: !hasTabsToRight,
    },
    {
      id: "close-all" satisfies TabContextMenuAction,
      label: "すべてのタブを閉じる",
    },
  ];
};
