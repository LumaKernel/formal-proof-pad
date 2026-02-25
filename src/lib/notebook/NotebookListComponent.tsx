/**
 * ノートブック一覧UIコンポーネント。
 *
 * ノートブックの一覧表示、削除、複製、名前変更を提供する。
 * 制御コンポーネント: 状態は外部（useNotebookCollection）で管理する。
 *
 * 変更時は NotebookListComponent.test.tsx, NotebookListComponent.stories.tsx も同期すること。
 */

import { useState, type CSSProperties } from "react";
import type { NotebookListItem } from "./notebookListLogic";
import { validateNotebookName } from "./notebookListLogic";

// --- Props ---

export type NotebookListProps = {
  readonly items: readonly NotebookListItem[];
  readonly onOpen: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onDuplicate: (id: string) => void;
  readonly onRename: (id: string, newName: string) => void;
  readonly onConvertToFree?: (id: string) => void;
};

// --- Styles ---

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 16,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const emptyStyle: CSSProperties = {
  textAlign: "center",
  padding: 40,
  color: "var(--color-text-secondary, #666)",
  fontSize: 14,
};

const itemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  borderRadius: 8,
  border: "1px solid var(--color-border, #e0e0e0)",
  background: "var(--color-surface, #fff)",
  cursor: "pointer",
  transition: "background 0.15s",
  gap: 12,
};

const itemHoverStyle: CSSProperties = {
  ...itemStyle,
  background: "var(--color-surface-hover, #f5f5f5)",
};

const itemInfoStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const itemNameStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "var(--color-text-primary, #333)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const itemMetaStyle: CSSProperties = {
  fontSize: 12,
  color: "var(--color-text-secondary, #888)",
  marginTop: 2,
  display: "flex",
  gap: 8,
};

const badgeStyle: CSSProperties = {
  display: "inline-block",
  fontSize: 10,
  padding: "2px 6px",
  borderRadius: 4,
  fontWeight: 600,
};

const freeBadgeStyle: CSSProperties = {
  ...badgeStyle,
  background: "var(--color-badge-free-bg, #e8f5e9)",
  color: "var(--color-badge-free-text, #2e7d32)",
};

const questBadgeStyle: CSSProperties = {
  ...badgeStyle,
  background: "var(--color-badge-quest-bg, #fff3e0)",
  color: "var(--color-badge-quest-text, #e65100)",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 4,
  flexShrink: 0,
};

const actionButtonStyle: CSSProperties = {
  padding: "4px 8px",
  fontSize: 12,
  borderRadius: 4,
  border: "1px solid var(--color-border, #ccc)",
  background: "var(--color-surface, #fff)",
  color: "var(--color-text-primary, #333)",
  cursor: "pointer",
};

const deleteButtonStyle: CSSProperties = {
  ...actionButtonStyle,
  color: "var(--color-danger, #d32f2f)",
  borderColor: "var(--color-danger-border, #ffcdd2)",
};

const renameInputStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  padding: "2px 4px",
  border: "1px solid var(--color-primary, #1976d2)",
  borderRadius: 4,
  outline: "none",
  width: "100%",
};

const renameErrorStyle: CSSProperties = {
  fontSize: 11,
  color: "var(--color-danger, #d32f2f)",
  marginTop: 2,
};

// --- Sub-components ---

function ModeBadge({ mode }: { readonly mode: "free" | "quest" }) {
  return (
    <span style={mode === "quest" ? questBadgeStyle : freeBadgeStyle}>
      {mode === "quest" ? "クエスト" : "自由帳"}
    </span>
  );
}

function NotebookItem({
  item,
  onOpen,
  onDelete,
  onDuplicate,
  onRename,
  onConvertToFree,
}: {
  readonly item: NotebookListItem;
  readonly onOpen: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onDuplicate: (id: string) => void;
  readonly onRename: (id: string, newName: string) => void;
  readonly onConvertToFree?: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editError, setEditError] = useState<string | null>(null);

  const handleRenameStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(item.name);
    setEditError(null);
    setIsEditing(true);
  };

  const handleRenameSubmit = () => {
    const validation = validateNotebookName(editName);
    if (!validation.valid) {
      setEditError(validation.reason);
      return;
    }
    onRename(item.id, editName.trim());
    setIsEditing(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(item.id);
  };

  const handleConvertToFree = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConvertToFree?.(item.id);
  };

  return (
    <div
      data-testid={`notebook-item-${item.id satisfies string}`}
      style={isHovered ? itemHoverStyle : itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen(item.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onOpen(item.id);
        }
      }}
    >
      <div style={itemInfoStyle}>
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              data-testid="rename-input"
              style={renameInputStyle}
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditError(null);
              }}
              onBlur={handleRenameSubmit}
              onKeyDown={handleRenameKeyDown}
              autoFocus
            />
            {editError !== null && (
              <div style={renameErrorStyle}>{editError}</div>
            )}
          </div>
        ) : (
          <>
            <div style={itemNameStyle}>{item.name}</div>
            <div style={itemMetaStyle}>
              <span>{item.systemName}</span>
              <ModeBadge mode={item.mode} />
              <span>更新: {item.updatedAtLabel}</span>
            </div>
          </>
        )}
      </div>
      <div style={actionsStyle} onClick={(e) => e.stopPropagation()}>
        <button
          data-testid={`rename-btn-${item.id satisfies string}`}
          style={actionButtonStyle}
          onClick={handleRenameStart}
          title="名前変更"
        >
          名前変更
        </button>
        <button
          data-testid={`duplicate-btn-${item.id satisfies string}`}
          style={actionButtonStyle}
          onClick={handleDuplicate}
          title="複製"
        >
          複製
        </button>
        {item.mode === "quest" && onConvertToFree !== undefined && (
          <button
            data-testid={`convert-btn-${item.id satisfies string}`}
            style={actionButtonStyle}
            onClick={handleConvertToFree}
            title="自由帳に変換"
          >
            自由帳化
          </button>
        )}
        <button
          data-testid={`delete-btn-${item.id satisfies string}`}
          style={deleteButtonStyle}
          onClick={handleDelete}
          title="削除"
        >
          削除
        </button>
      </div>
    </div>
  );
}

// --- Main component ---

export function NotebookList({
  items,
  onOpen,
  onDelete,
  onDuplicate,
  onRename,
  onConvertToFree,
}: NotebookListProps) {
  if (items.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyStyle} data-testid="notebook-list-empty">
          ノートがありません。新しいノートを作成してください。
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} data-testid="notebook-list">
      {items.map((item) => (
        <NotebookItem
          key={item.id}
          item={item}
          onOpen={onOpen}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onRename={onRename}
          onConvertToFree={onConvertToFree}
        />
      ))}
    </div>
  );
}
