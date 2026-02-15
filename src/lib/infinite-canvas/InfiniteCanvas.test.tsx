import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InfiniteCanvas } from "./InfiniteCanvas";

describe("InfiniteCanvas", () => {
  it("renders a container element", () => {
    render(<InfiniteCanvas />);
    const canvas = screen.getByTestId("infinite-canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("fills its parent with 100% width and height", () => {
    render(<InfiniteCanvas />);
    const canvas = screen.getByTestId("infinite-canvas");
    expect(canvas.style.width).toBe("100%");
    expect(canvas.style.height).toBe("100%");
  });

  it("renders an SVG with a dot pattern", () => {
    render(<InfiniteCanvas />);
    const canvas = screen.getByTestId("infinite-canvas");
    const svg = canvas.querySelector("svg");
    expect(svg).not.toBeNull();
    const pattern = svg?.querySelector("pattern");
    expect(pattern).not.toBeNull();
    const circle = pattern?.querySelector("circle");
    expect(circle).not.toBeNull();
  });

  it("uses custom dot color", () => {
    render(<InfiniteCanvas dotColor="#ff0000" />);
    const canvas = screen.getByTestId("infinite-canvas");
    const circle = canvas.querySelector("circle");
    expect(circle?.getAttribute("fill")).toBe("#ff0000");
  });

  it("uses custom background color", () => {
    render(<InfiniteCanvas backgroundColor="rgb(0, 0, 0)" />);
    const canvas = screen.getByTestId("infinite-canvas");
    expect(canvas.style.backgroundColor).toBe("rgb(0, 0, 0)");
  });

  it("renders children", () => {
    render(
      <InfiniteCanvas>
        <div data-testid="child">Hello</div>
      </InfiniteCanvas>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies viewport offset to pattern position", () => {
    render(
      <InfiniteCanvas viewport={{ offsetX: 30, offsetY: 50, scale: 1 }} />,
    );
    const canvas = screen.getByTestId("infinite-canvas");
    const pattern = canvas.querySelector("pattern");
    // 30 % 20 = 10, 50 % 20 = 10
    expect(pattern?.getAttribute("x")).toBe("10");
    expect(pattern?.getAttribute("y")).toBe("10");
  });

  it("applies viewport scale to pattern size", () => {
    render(<InfiniteCanvas viewport={{ offsetX: 0, offsetY: 0, scale: 2 }} />);
    const canvas = screen.getByTestId("infinite-canvas");
    const pattern = canvas.querySelector("pattern");
    // 20 * 2 = 40
    expect(pattern?.getAttribute("width")).toBe("40");
    expect(pattern?.getAttribute("height")).toBe("40");
  });

  it("hides the SVG from accessibility tree", () => {
    render(<InfiniteCanvas />);
    const canvas = screen.getByTestId("infinite-canvas");
    const svg = canvas.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
