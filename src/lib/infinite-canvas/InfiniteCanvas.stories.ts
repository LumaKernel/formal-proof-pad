import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InfiniteCanvas } from "./InfiniteCanvas";

const meta = {
  title: "InfiniteCanvas/InfiniteCanvas",
  component: InfiniteCanvas,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    dotColor: { control: "color" },
    backgroundColor: { control: "color" },
    dotSpacing: { control: { type: "range", min: 5, max: 100, step: 1 } },
  },
} satisfies Meta<typeof InfiniteCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ZoomedIn: Story = {
  args: {
    viewport: { offsetX: 0, offsetY: 0, scale: 2 },
  },
};

export const ZoomedOut: Story = {
  args: {
    viewport: { offsetX: 0, offsetY: 0, scale: 0.5 },
  },
};

export const Panned: Story = {
  args: {
    viewport: { offsetX: 150, offsetY: 75, scale: 1 },
  },
};

export const CustomColors: Story = {
  args: {
    dotColor: "#4a90d9",
    backgroundColor: "#1a1a2e",
  },
};

export const DenseGrid: Story = {
  args: {
    dotSpacing: 10,
  },
};

export const SparseGrid: Story = {
  args: {
    dotSpacing: 50,
  },
};
