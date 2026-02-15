import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { useState } from "react";
import { InfiniteCanvas } from "./InfiniteCanvas";
import type { ViewportState } from "./types";

function PannableCanvasDemo() {
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <InfiniteCanvas viewport={viewport} onViewportChange={setViewport} />
    </div>
  );
}

const meta = {
  title: "InfiniteCanvas/PannableCanvas",
  component: PannableCanvasDemo,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PannableCanvasDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the infinite canvas is rendered
    const infiniteCanvas = canvas.getByTestId("infinite-canvas");
    await expect(infiniteCanvas).toBeInTheDocument();

    // Verify canvas has grab cursor (pannable)
    await expect(infiniteCanvas).toHaveStyle({ cursor: "grab" });
  },
};
