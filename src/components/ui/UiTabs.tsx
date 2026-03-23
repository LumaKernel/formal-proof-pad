/**
 * 軽量 Tabs コンポーネント（antd Tabs の代替）。
 *
 * 変更時は UiTabs.test.tsx も同期すること。
 */

import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { useResolvedThemeSafe } from "../../lib/theme/ThemeProvider";
import { tabsContainerStyle, getTabStyle } from "./uiStyleLogic";

export type UiTabItem = {
  readonly key: string;
  readonly label: string;
};

export type UiTabsProps = {
  readonly activeKey: string;
  readonly onChange: (key: string) => void;
  readonly items: readonly UiTabItem[];
  readonly style?: CSSProperties;
};

export function UiTabs({
  activeKey,
  onChange,
  items,
  style,
}: UiTabsProps): ReactNode {
  const resolved = useResolvedThemeSafe();
  const isDark = resolved === "dark";

  const mergedStyle = useMemo(
    (): CSSProperties => ({
      ...tabsContainerStyle,
      ...style,
    }),
    [style],
  );

  return (
    <div style={mergedStyle} role="tablist">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={item.key === activeKey}
          style={getTabStyle(item.key === activeKey, isDark)}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
