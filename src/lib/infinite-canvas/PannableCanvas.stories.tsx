import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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

export const Interactive: Story = {};
