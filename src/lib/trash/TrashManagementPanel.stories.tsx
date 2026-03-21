/**
 * TrashManagementPanel のストーリー。
 *
 * 変更時は TrashManagementPanel.tsx, trashPanelLogic.ts も同期すること。
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn, expect, within, userEvent } from "storybook/test";
import type { TrashItem } from "./trashState";
import {
  TrashManagementPanel,
  type TrashPanelMessages,
} from "./TrashManagementPanel";

const defaultMessages: TrashPanelMessages = {
  emptyTitle: "Trash is empty",
  emptyDescription:
    "Deleted items will appear here for 30 days before being permanently removed.",
  restoreButton: "Restore",
  deleteButton: "Delete",
  emptyTrashButton: "Empty Trash",
  remainingDaysTemplate: "{days} days left",
  filterAll: "All",
  kindLabels: {
    notebook: "Notebook",
    "custom-quest": "Custom Quest",
    script: "Script",
    "proof-entry": "Proof Entry",
  },
  confirmEmptyTitle: "Empty Trash?",
  confirmEmptyDescription:
    "All items in the trash will be permanently deleted. This action cannot be undone.",
  confirmEmptyOk: "Empty Trash",
  confirmEmptyCancel: "Cancel",
};

const baseNow = 1_700_000_000_000;

const sampleItems: readonly TrashItem[] = [
  {
    trashId: "trash-1",
    kind: "notebook",
    originalId: "nb-1",
    displayName: "My First Proof",
    trashedAt: baseNow - 2 * 24 * 60 * 60 * 1000,
    serializedData: "{}",
  },
  {
    trashId: "trash-2",
    kind: "custom-quest",
    originalId: "cq-1",
    displayName: "Intro to Modus Ponens",
    trashedAt: baseNow - 5 * 24 * 60 * 60 * 1000,
    serializedData: "{}",
  },
  {
    trashId: "trash-3",
    kind: "script",
    originalId: "s-1",
    displayName: "Auto-prove helper",
    trashedAt: baseNow - 10 * 24 * 60 * 60 * 1000,
    serializedData: "{}",
  },
  {
    trashId: "trash-4",
    kind: "proof-entry",
    originalId: "pe-1",
    displayName: "Proof of A -> A",
    trashedAt: baseNow - 1 * 24 * 60 * 60 * 1000,
    serializedData: "{}",
  },
  {
    trashId: "trash-5",
    kind: "notebook",
    originalId: "nb-2",
    displayName: "Sequent Calculus Practice",
    trashedAt: baseNow - 15 * 24 * 60 * 60 * 1000,
    serializedData: "{}",
  },
];

const meta = {
  title: "Trash/TrashManagementPanel",
  component: TrashManagementPanel,
  args: {
    now: baseNow,
    messages: defaultMessages,
    onRestore: fn(),
    onDeletePermanently: fn(),
    onEmptyTrash: fn(),
    testId: "trash-panel",
  },
} satisfies Meta<typeof TrashManagementPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Trash is empty")).toBeVisible();
  },
};

export const WithItems: Story = {
  args: { items: sampleItems },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // All items are visible
    await expect(canvas.getByText("My First Proof")).toBeVisible();
    await expect(canvas.getByText("Intro to Modus Ponens")).toBeVisible();
    await expect(canvas.getByText("Auto-prove helper")).toBeVisible();
    // Filter bar visible
    await expect(canvas.getByTestId("trash-filter-bar")).toBeVisible();
  },
};

export const FilterByKind: Story = {
  args: { items: sampleItems },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Click notebook filter
    const notebookFilter = canvas.getByTestId("trash-filter-notebook");
    await userEvent.click(notebookFilter);
    // Only notebook items visible
    await expect(canvas.getByText("My First Proof")).toBeVisible();
    await expect(canvas.getByText("Sequent Calculus Practice")).toBeVisible();
    // Non-notebook items hidden
    await expect(
      canvas.queryByText("Auto-prove helper"),
    ).not.toBeInTheDocument();
  },
};

export const RestoreItem: Story = {
  args: { items: sampleItems },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const restoreBtn = canvas.getByTestId("trash-restore-trash-1");
    await userEvent.click(restoreBtn);
    await expect(args.onRestore).toHaveBeenCalledWith("trash-1");
  },
};

export const DeleteItem: Story = {
  args: { items: sampleItems },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteBtn = canvas.getByTestId("trash-delete-trash-2");
    await userEvent.click(deleteBtn);
    await expect(args.onDeletePermanently).toHaveBeenCalledWith("trash-2");
  },
};

export const EmptyTrashConfirm: Story = {
  args: { items: sampleItems },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Click empty trash button
    const emptyBtn = canvas.getByTestId("trash-empty-btn");
    await userEvent.click(emptyBtn);
    // Confirm dialog appears
    await expect(
      canvas.getByTestId("trash-confirm-empty-dialog"),
    ).toBeVisible();
    // Cancel
    const cancelBtn = canvas.getByTestId("trash-confirm-empty-cancel");
    await userEvent.click(cancelBtn);
    // Dialog disappears
    await expect(
      canvas.queryByTestId("trash-confirm-empty-dialog"),
    ).not.toBeInTheDocument();
    await expect(args.onEmptyTrash).not.toHaveBeenCalled();
  },
};

export const EmptyTrashExecute: Story = {
  args: { items: sampleItems },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const emptyBtn = canvas.getByTestId("trash-empty-btn");
    await userEvent.click(emptyBtn);
    // Confirm
    const okBtn = canvas.getByTestId("trash-confirm-empty-ok");
    await userEvent.click(okBtn);
    await expect(args.onEmptyTrash).toHaveBeenCalled();
  },
};
