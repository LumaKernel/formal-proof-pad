/**
 * 軽量 Button コンポーネント（antd Button の代替）。
 *
 * 変更時は UiButton.test.tsx も同期すること。
 */

import type { CSSProperties, ReactNode, MouseEventHandler } from "react";
import { useMemo } from "react";
import { useResolvedThemeSafe } from "../../lib/theme/ThemeProvider";
import {
  buttonBaseStyle,
  getButtonTypeStyles,
  getButtonSizeStyles,
} from "./uiStyleLogic";

export type UiButtonType = "primary" | "default" | "text" | "link";
export type UiButtonSize = "small" | "middle";

export type UiButtonProps = {
  readonly type?: UiButtonType;
  readonly size?: UiButtonSize;
  readonly shape?: "default" | "round";
  readonly danger?: boolean;
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
  readonly htmlType?: "button" | "submit" | "reset";
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
  readonly children?: ReactNode;
  readonly style?: CSSProperties;
  readonly "data-testid"?: string;
  readonly title?: string;
  readonly "aria-label"?: string;
  readonly "aria-expanded"?: boolean;
};

export function UiButton({
  type = "default",
  size = "middle",
  shape = "default",
  danger = false,
  disabled = false,
  icon,
  htmlType = "button",
  onClick,
  children,
  style,
  ...restProps
}: UiButtonProps): ReactNode {
  const resolved = useResolvedThemeSafe();
  const isDark = resolved === "dark";

  const mergedStyle = useMemo(
    (): CSSProperties => ({
      ...buttonBaseStyle,
      ...getButtonTypeStyles(type, danger, isDark),
      ...getButtonSizeStyles(size, shape),
      ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
      ...style,
    }),
    [type, danger, isDark, size, shape, disabled, style],
  );

  return (
    <button
      type={htmlType}
      disabled={disabled}
      onClick={onClick}
      style={mergedStyle}
      title={restProps.title}
      data-testid={restProps["data-testid"]}
      aria-label={restProps["aria-label"]}
      aria-expanded={restProps["aria-expanded"]}
    >
      {icon}
      {children}
    </button>
  );
}
