import { describe, it, expect } from "vitest";
import {
  getButtonTypeStyles,
  getButtonSizeStyles,
  getTabStyle,
  getMenuItemStyle,
  mergeIconStyles,
  iconDefaultStyle,
} from "./uiStyleLogic";

describe("getButtonTypeStyles", () => {
  it("returns danger primary light styles", () => {
    const s = getButtonTypeStyles("primary", true, false);
    expect(s.backgroundColor).toBe("#e06060");
    expect(s.color).toBe("#ffffff");
  });

  it("returns danger primary dark styles", () => {
    const s = getButtonTypeStyles("primary", true, true);
    expect(s.backgroundColor).toBe("#ff6b6b");
  });

  it("returns primary light styles", () => {
    const s = getButtonTypeStyles("primary", false, false);
    expect(s.backgroundColor).toBe("#171717");
    expect(s.color).toBe("#ffffff");
  });

  it("returns primary dark styles", () => {
    const s = getButtonTypeStyles("primary", false, true);
    expect(s.backgroundColor).toBe("#fafafa");
    expect(s.color).toBe("#141414");
  });

  it("returns text light styles", () => {
    const s = getButtonTypeStyles("text", false, false);
    expect(s.backgroundColor).toBe("transparent");
    expect(s.color).toBe("#171717");
  });

  it("returns text dark styles", () => {
    const s = getButtonTypeStyles("text", false, true);
    expect(s.color).toBe("#e0e0e0");
  });

  it("returns link light styles", () => {
    const s = getButtonTypeStyles("link", false, false);
    expect(s.backgroundColor).toBe("transparent");
    expect(s.color).toBe("#1677ff");
    expect(s.padding).toBe(0);
  });

  it("returns link dark styles", () => {
    const s = getButtonTypeStyles("link", false, true);
    expect(s.color).toBe("#6eb5ff");
  });

  it("returns default light styles", () => {
    const s = getButtonTypeStyles("default", false, false);
    expect(s.backgroundColor).toBe("#ffffff");
    expect(s.color).toBe("#171717");
    expect(s.borderColor).toBe("#e5e5e5");
  });

  it("returns default dark styles", () => {
    const s = getButtonTypeStyles("default", false, true);
    expect(s.backgroundColor).toBe("#0a0a0a");
    expect(s.color).toBe("#e0e0e0");
    expect(s.borderColor).toBe("#262626");
  });
});

describe("getButtonSizeStyles", () => {
  it("returns small with default shape", () => {
    const s = getButtonSizeStyles("small", "default");
    expect(s.fontSize).toBe("0.8125rem");
    expect(s.borderRadius).toBe("0.5rem");
  });

  it("returns small with round shape", () => {
    const s = getButtonSizeStyles("small", "round");
    expect(s.borderRadius).toBe("9999px");
  });

  it("returns middle size", () => {
    const s = getButtonSizeStyles("middle", "default");
    expect(s.fontSize).toBe("0.875rem");
  });
});

describe("getTabStyle", () => {
  it("returns active light styles", () => {
    const s = getTabStyle(true, false);
    expect(s.fontWeight).toBe(600);
    expect(s.borderBottom).toBe("2px solid #171717");
    expect(s.color).toBe("#171717");
  });

  it("returns active dark styles", () => {
    const s = getTabStyle(true, true);
    expect(s.borderBottom).toBe("2px solid #fafafa");
    expect(s.color).toBe("#fafafa");
  });

  it("returns inactive light styles", () => {
    const s = getTabStyle(false, false);
    expect(s.fontWeight).toBe(400);
    expect(s.borderBottom).toBe("2px solid transparent");
    expect(s.color).toBe("#666666");
  });

  it("returns inactive dark styles", () => {
    const s = getTabStyle(false, true);
    expect(s.color).toBe("#999999");
  });
});

describe("getMenuItemStyle", () => {
  it("returns normal light styles", () => {
    const s = getMenuItemStyle(false, false);
    expect(s.color).toBe("#171717");
  });

  it("returns normal dark styles", () => {
    const s = getMenuItemStyle(false, true);
    expect(s.color).toBe("#e0e0e0");
  });

  it("returns danger light styles", () => {
    const s = getMenuItemStyle(true, false);
    expect(s.color).toBe("#e06060");
  });

  it("returns danger dark styles", () => {
    const s = getMenuItemStyle(true, true);
    expect(s.color).toBe("#ff6b6b");
  });
});

describe("mergeIconStyles", () => {
  it("returns default style when no custom style", () => {
    expect(mergeIconStyles()).toBe(iconDefaultStyle);
  });

  it("returns default style when undefined", () => {
    expect(mergeIconStyles(undefined)).toBe(iconDefaultStyle);
  });

  it("merges custom style over defaults", () => {
    const s = mergeIconStyles({ width: "2em" });
    expect(s.width).toBe("2em");
    expect(s.height).toBe("1em");
  });
});
