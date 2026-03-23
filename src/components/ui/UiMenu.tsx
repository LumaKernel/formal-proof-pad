/**
 * 軽量 Menu コンポーネント（antd Menu の代替）。
 * ドロップダウンメニュー用途。
 *
 * 変更時は UiMenu.test.tsx も同期すること。
 */

import type { CSSProperties, ReactNode, MouseEvent } from "react";
import { useResolvedThemeSafe } from "../../lib/theme/ThemeProvider";
import { menuListStyle, getMenuItemStyle } from "./uiStyleLogic";

export type UiMenuItem = {
  readonly key: string;
  readonly label: ReactNode;
  readonly danger?: boolean;
  readonly onClick?:
    | ((info: { readonly domEvent: MouseEvent }) => void)
    | (() => void);
};

export type UiMenuProps = {
  readonly items: readonly UiMenuItem[] | undefined;
  readonly selectable?: boolean;
  readonly style?: CSSProperties;
};

export function UiMenu({ items, style }: UiMenuProps): ReactNode {
  const resolved = useResolvedThemeSafe();
  const isDark = resolved === "dark";

  return (
    <ul style={{ ...menuListStyle, ...style }} role="menu">
      {items?.map((item) => (
        <li key={item.key} role="none">
          <button
            type="button"
            role="menuitem"
            style={getMenuItemStyle(item.danger === true, isDark)}
            onClick={(e) => item.onClick?.({ domEvent: e })}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
