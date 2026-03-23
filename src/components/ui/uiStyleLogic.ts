/**
 * 純粋なスタイルロジック（UIコンポーネント共通）。
 * React/DOMに依存しない。
 *
 * 変更時は uiStyleLogic.test.ts も同期すること。
 */

import type { CSSProperties } from "react";
import type { UiButtonType, UiButtonSize } from "./UiButton";

// ── Button ──

export const buttonBaseStyle: Readonly<CSSProperties> = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.375rem",
  border: "1px solid transparent",
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: 500,
  lineHeight: 1.5,
  transition: "background-color 0.15s, border-color 0.15s, opacity 0.15s",
  whiteSpace: "nowrap",
};

export function getButtonTypeStyles(
  type: UiButtonType,
  danger: boolean,
  isDark: boolean,
): CSSProperties {
  if (danger && type === "primary") {
    return {
      backgroundColor: isDark ? "#ff6b6b" : "#e06060",
      color: "#ffffff",
      borderColor: isDark ? "#ff6b6b" : "#e06060",
    };
  }
  if (type === "primary") {
    return {
      backgroundColor: isDark ? "#fafafa" : "#171717",
      color: isDark ? "#141414" : "#ffffff",
      borderColor: isDark ? "#fafafa" : "#171717",
    };
  }
  if (type === "text") {
    return {
      backgroundColor: "transparent",
      color: isDark ? "#e0e0e0" : "#171717",
      border: "none",
    };
  }
  if (type === "link") {
    return {
      backgroundColor: "transparent",
      color: isDark ? "#6eb5ff" : "#1677ff",
      border: "none",
      padding: 0,
    };
  }
  // default
  return {
    backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
    color: isDark ? "#e0e0e0" : "#171717",
    borderColor: isDark ? "#262626" : "#e5e5e5",
  };
}

export function getButtonSizeStyles(
  size: UiButtonSize,
  shape: string,
): CSSProperties {
  const borderRadius = shape === "round" ? "9999px" : "0.5rem";
  if (size === "small") {
    return {
      fontSize: "0.8125rem",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      paddingLeft: "0.5rem",
      paddingRight: "0.5rem",
      borderRadius,
    };
  }
  return {
    fontSize: "0.875rem",
    paddingTop: "0.3125rem",
    paddingBottom: "0.3125rem",
    paddingLeft: "0.9375rem",
    paddingRight: "0.9375rem",
    borderRadius,
  };
}

// ── Tabs ──

export const tabsContainerStyle: Readonly<CSSProperties> = {
  display: "flex",
  gap: "0",
  borderBottom: "1px solid var(--ui-border)",
  overflowX: "auto",
};

export function getTabStyle(isActive: boolean, isDark: boolean): CSSProperties {
  return {
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    fontWeight: isActive ? 600 : 400,
    cursor: "pointer",
    background: "none",
    border: "none",
    borderBottom: isActive
      ? `2px solid ${(isDark ? "#fafafa" : "#171717") satisfies string}`
      : "2px solid transparent",
    color: isActive
      ? isDark
        ? "#fafafa"
        : "#171717"
      : isDark
        ? "#999999"
        : "#666666",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    transition: "color 0.15s, border-color 0.15s",
  };
}

// ── Menu ──

export const menuListStyle: Readonly<CSSProperties> = {
  listStyle: "none",
  margin: 0,
  padding: "0.25rem 0",
};

export function getMenuItemStyle(
  danger: boolean,
  isDark: boolean,
): CSSProperties {
  return {
    display: "block",
    width: "100%",
    padding: "0.375rem 0.75rem",
    fontSize: "0.8125rem",
    textAlign: "left",
    cursor: "pointer",
    background: "none",
    border: "none",
    fontFamily: "inherit",
    color: danger
      ? isDark
        ? "#ff6b6b"
        : "#e06060"
      : isDark
        ? "#e0e0e0"
        : "#171717",
    transition: "background-color 0.1s",
  };
}

// ── Icons ──

export const iconDefaultStyle: Readonly<CSSProperties> = {
  width: "1em",
  height: "1em",
  display: "inline-block",
  verticalAlign: "-0.125em",
  fill: "currentColor",
};

export function mergeIconStyles(style?: CSSProperties): CSSProperties {
  return style !== undefined
    ? { ...iconDefaultStyle, ...style }
    : iconDefaultStyle;
}
