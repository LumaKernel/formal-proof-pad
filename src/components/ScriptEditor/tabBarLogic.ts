/**
 * ワークスペースタブバーの純粋表示ロジック。
 *
 * タブの表示情報（ラベル、アイコン表示、modified 状態等）を計算する。
 *
 * 変更時は tabBarLogic.test.ts, ScriptWorkspaceTabBar.tsx も同期すること。
 */

import type { WorkspaceTab, TabSource } from "./scriptWorkspaceState";
import { isTabModified } from "./scriptWorkspaceState";

// ── タブ表示情報 ────────────────────────────────────────────────

export interface TabDisplayInfo {
  readonly id: string;
  readonly label: string;
  readonly source: TabSource;
  readonly isActive: boolean;
  readonly isModified: boolean;
  readonly isReadonly: boolean;
  /** タブラベルの接頭アイコン文字 */
  readonly sourceIcon: string;
}

// ── ソースアイコン ──────────────────────────────────────────────

const SOURCE_ICONS: Readonly<Record<TabSource, string>> = {
  unnamed: "\u{1F4DD}",
  library: "\u{1F4DA}",
  saved: "\u{1F4BE}",
};

export const getSourceIcon = (source: TabSource): string =>
  SOURCE_ICONS[source];

// ── タブ表示情報の計算 ──────────────────────────────────────────

export const computeTabDisplay = (
  tab: WorkspaceTab,
  activeTabId: string | undefined,
): TabDisplayInfo => ({
  id: tab.id,
  label: tab.title,
  source: tab.source,
  isActive: tab.id === activeTabId,
  isModified: isTabModified(tab),
  isReadonly: tab.readonly,
  sourceIcon: getSourceIcon(tab.source),
});

export const computeAllTabDisplays = (
  tabs: readonly WorkspaceTab[],
  activeTabId: string | undefined,
): readonly TabDisplayInfo[] =>
  tabs.map((tab) => computeTabDisplay(tab, activeTabId));

// ── タブラベルの表示テキスト ────────────────────────────────────

/**
 * タブに表示する完全なラベルを計算する。
 * 変更されたタブには末尾に "●" を付加する。
 */
export const formatTabLabel = (info: TabDisplayInfo): string =>
  info.isModified
    ? `${info.sourceIcon satisfies string} ${info.label satisfies string} \u25CF`
    : `${info.sourceIcon satisfies string} ${info.label satisfies string}`;
