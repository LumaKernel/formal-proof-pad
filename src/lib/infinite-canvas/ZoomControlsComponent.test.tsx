import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ZoomControlsComponent } from "./ZoomControlsComponent";
import { MAX_SCALE, MIN_SCALE } from "./zoom";

afterEach(cleanup);

const defaultProps = {
  viewport: { offsetX: 0, offsetY: 0, scale: 1 },
  containerSize: { width: 800, height: 600 },
} as const;

describe("ZoomControlsComponent", () => {
  it("renders zoom controls", () => {
    render(<ZoomControlsComponent {...defaultProps} />);
    expect(screen.getByTestId("zoom-controls")).toBeTruthy();
    expect(screen.getByTestId("zoom-in-button")).toBeTruthy();
    expect(screen.getByTestId("zoom-out-button")).toBeTruthy();
    expect(screen.getByTestId("zoom-percentage")).toBeTruthy();
  });

  it("displays current zoom percentage", () => {
    render(<ZoomControlsComponent {...defaultProps} />);
    expect(screen.getByTestId("zoom-percentage").textContent).toBe("100%");
  });

  it("displays 50% when scale is 0.5", () => {
    render(
      <ZoomControlsComponent
        {...defaultProps}
        viewport={{ offsetX: 0, offsetY: 0, scale: 0.5 }}
      />,
    );
    expect(screen.getByTestId("zoom-percentage").textContent).toBe("50%");
  });

  it("calls onViewportChange with zoomed-in viewport on zoom in click", () => {
    const onViewportChange = vi.fn();
    render(
      <ZoomControlsComponent
        {...defaultProps}
        onViewportChange={onViewportChange}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-in-button"));
    expect(onViewportChange).toHaveBeenCalledOnce();
    const newViewport = onViewportChange.mock.calls[0]![0]!;
    expect(newViewport.scale).toBeGreaterThan(1);
  });

  it("calls onViewportChange with zoomed-out viewport on zoom out click", () => {
    const onViewportChange = vi.fn();
    render(
      <ZoomControlsComponent
        {...defaultProps}
        onViewportChange={onViewportChange}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-out-button"));
    expect(onViewportChange).toHaveBeenCalledOnce();
    const newViewport = onViewportChange.mock.calls[0]![0]!;
    expect(newViewport.scale).toBeLessThan(1);
  });

  it("disables zoom in button at max scale", () => {
    render(
      <ZoomControlsComponent
        {...defaultProps}
        viewport={{ offsetX: 0, offsetY: 0, scale: MAX_SCALE }}
      />,
    );
    const button = screen.getByTestId("zoom-in-button");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("disables zoom out button at min scale", () => {
    render(
      <ZoomControlsComponent
        {...defaultProps}
        viewport={{ offsetX: 0, offsetY: 0, scale: MIN_SCALE }}
      />,
    );
    const button = screen.getByTestId("zoom-out-button");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("does not call onViewportChange when zoom in is disabled", () => {
    const onViewportChange = vi.fn();
    render(
      <ZoomControlsComponent
        {...defaultProps}
        viewport={{ offsetX: 0, offsetY: 0, scale: MAX_SCALE }}
        onViewportChange={onViewportChange}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-in-button"));
    expect(onViewportChange).not.toHaveBeenCalled();
  });

  it("does not call onViewportChange when zoom out is disabled", () => {
    const onViewportChange = vi.fn();
    render(
      <ZoomControlsComponent
        {...defaultProps}
        viewport={{ offsetX: 0, offsetY: 0, scale: MIN_SCALE }}
        onViewportChange={onViewportChange}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-out-button"));
    expect(onViewportChange).not.toHaveBeenCalled();
  });

  it("resets viewport on reset button click", () => {
    const onViewportChange = vi.fn();
    render(
      <ZoomControlsComponent
        {...defaultProps}
        viewport={{ offsetX: 100, offsetY: 50, scale: 2 }}
        onViewportChange={onViewportChange}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-reset-button"));
    expect(onViewportChange).toHaveBeenCalledWith({
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    });
  });

  it("fits to content on fit button click", () => {
    const onViewportChange = vi.fn();
    const items = [{ x: 100, y: 100, width: 200, height: 150 }];
    render(
      <ZoomControlsComponent
        {...defaultProps}
        items={items}
        onViewportChange={onViewportChange}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-fit-button"));
    expect(onViewportChange).toHaveBeenCalledOnce();
    const newViewport = onViewportChange.mock.calls[0]![0]!;
    expect(newViewport.scale).toBeGreaterThan(0);
  });

  it("hides when visible is false", () => {
    render(<ZoomControlsComponent {...defaultProps} visible={false} />);
    expect(screen.queryByTestId("zoom-controls")).toBeNull();
  });

  it("hides fit button when showFitButton is false", () => {
    render(<ZoomControlsComponent {...defaultProps} showFitButton={false} />);
    expect(screen.queryByTestId("zoom-fit-button")).toBeNull();
  });

  it("hides reset button when showResetButton is false", () => {
    render(
      <ZoomControlsComponent {...defaultProps} showResetButton={false} />,
    );
    expect(screen.queryByTestId("zoom-reset-button")).toBeNull();
  });

  it("opens preset dropdown on percentage click", () => {
    render(<ZoomControlsComponent {...defaultProps} />);
    expect(screen.queryByTestId("zoom-preset-dropdown")).toBeNull();
    fireEvent.click(screen.getByTestId("zoom-percentage"));
    expect(screen.getByTestId("zoom-preset-dropdown")).toBeTruthy();
  });

  it("closes preset dropdown on backdrop click", () => {
    render(<ZoomControlsComponent {...defaultProps} />);
    fireEvent.click(screen.getByTestId("zoom-percentage"));
    expect(screen.getByTestId("zoom-preset-dropdown")).toBeTruthy();
    fireEvent.click(screen.getByTestId("zoom-preset-backdrop"));
    expect(screen.queryByTestId("zoom-preset-dropdown")).toBeNull();
  });

  it("selects a preset and calls onViewportChange", () => {
    const onViewportChange = vi.fn();
    render(
      <ZoomControlsComponent
        {...defaultProps}
        onViewportChange={onViewportChange}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-percentage"));
    fireEvent.click(screen.getByTestId("zoom-preset-200"));
    expect(onViewportChange).toHaveBeenCalledOnce();
    const newViewport = onViewportChange.mock.calls[0]![0]!;
    expect(newViewport.scale).toBe(2);
  });

  it("closes dropdown after selecting a preset", () => {
    render(
      <ZoomControlsComponent
        {...defaultProps}
        onViewportChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-percentage"));
    fireEvent.click(screen.getByTestId("zoom-preset-100"));
    expect(screen.queryByTestId("zoom-preset-dropdown")).toBeNull();
  });

  it("does not open dropdown when showPresets is false", () => {
    render(
      <ZoomControlsComponent {...defaultProps} showPresets={false} />,
    );
    fireEvent.click(screen.getByTestId("zoom-percentage"));
    expect(screen.queryByTestId("zoom-preset-dropdown")).toBeNull();
  });

  it("renders show reset and fit buttons by default", () => {
    render(<ZoomControlsComponent {...defaultProps} />);
    expect(screen.getByTestId("zoom-reset-button")).toBeTruthy();
    expect(screen.getByTestId("zoom-fit-button")).toBeTruthy();
  });

  it("stops pointer events from propagating to canvas", () => {
    render(<ZoomControlsComponent {...defaultProps} />);
    const controls = screen.getByTestId("zoom-controls");
    const event = new PointerEvent("pointerdown", { bubbles: true });
    const stopPropagation = vi.spyOn(event, "stopPropagation");
    controls.dispatchEvent(event);
    expect(stopPropagation).toHaveBeenCalled();
  });
});
