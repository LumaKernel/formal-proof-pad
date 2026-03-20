import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RulePromptModal } from "./RulePromptModal";

describe("RulePromptModal", () => {
  it("renders with message and default value", () => {
    render(
      <RulePromptModal
        message="Enter position"
        defaultValue="0"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        testId="prompt"
      />,
    );

    expect(screen.getByText("Enter position")).toBeInTheDocument();
    const input = screen.getByTestId("prompt-input");
    expect(input).toHaveValue("0");
  });

  it("calls onConfirm with typed value on OK click", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <RulePromptModal
        message="Enter term"
        defaultValue=""
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        testId="prompt"
      />,
    );

    await user.type(screen.getByTestId("prompt-input"), "abc");
    await user.click(screen.getByTestId("prompt-confirm"));

    expect(onConfirm).toHaveBeenCalledWith("abc");
  });

  it("calls onConfirm with default value if not changed", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <RulePromptModal
        message="Enter position"
        defaultValue="42"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        testId="prompt"
      />,
    );

    await user.click(screen.getByTestId("prompt-confirm"));

    expect(onConfirm).toHaveBeenCalledWith("42");
  });

  it("calls onCancel on Cancel click", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <RulePromptModal
        message="Enter value"
        defaultValue=""
        onConfirm={vi.fn()}
        onCancel={onCancel}
        testId="prompt"
      />,
    );

    await user.click(screen.getByTestId("prompt-cancel"));

    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onConfirm on Enter key", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <RulePromptModal
        message="Enter"
        defaultValue="x"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        testId="prompt"
      />,
    );

    await user.keyboard("{Enter}");

    expect(onConfirm).toHaveBeenCalledWith("x");
  });

  it("calls onCancel on Escape key", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <RulePromptModal
        message="Enter"
        defaultValue=""
        onConfirm={vi.fn()}
        onCancel={onCancel}
        testId="prompt"
      />,
    );

    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onCancel when clicking overlay background", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <RulePromptModal
        message="Enter"
        defaultValue=""
        onConfirm={vi.fn()}
        onCancel={onCancel}
        testId="prompt"
      />,
    );

    // Click the overlay (parent div)
    await user.click(screen.getByTestId("prompt"));

    expect(onCancel).toHaveBeenCalled();
  });

  it("uses default testId when testId is not provided", () => {
    render(
      <RulePromptModal
        message="Enter"
        defaultValue=""
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByTestId("rule-prompt-input")).toBeInTheDocument();
    expect(screen.getByTestId("rule-prompt-cancel")).toBeInTheDocument();
    expect(screen.getByTestId("rule-prompt-confirm")).toBeInTheDocument();
  });
});
