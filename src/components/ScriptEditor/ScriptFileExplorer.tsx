/**
 * VSCode Explorer風のファイル一覧パネル。
 *
 * 保存済みスクリプトの一覧表示、ダブルクリックで開く、
 * リネーム、削除の操作を提供する。
 *
 * 変更時は scriptFileExplorerLogic.ts, ScriptFileExplorer.stories.tsx, index.ts も同期すること。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { SavedScript } from "./savedScriptsLogic";
import {
  initialFileExplorerState,
  startRename,
  updateRenameValue,
  cancelRename,
  confirmRename,
  startDeleteConfirm,
  cancelDeleteConfirm,
  computeFileExplorerItems,
  formatSavedAt,
} from "./scriptFileExplorerLogic";
import type { FileExplorerState } from "./scriptFileExplorerLogic";

// ── Props ─────────────────────────────────────────────────────

export interface ScriptFileExplorerProps {
  readonly scripts: readonly SavedScript[];
  readonly onOpen: (id: string) => void;
  readonly onRename: (id: string, newTitle: string) => void;
  readonly onDelete: (id: string) => void;
}

// ── Styles (VSCode Explorer風) ────────────────────────────────

const containerStyle: Readonly<CSSProperties> = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: "var(--color-surface, #ffffff)",
  fontSize: "var(--font-size-xs, 11px)",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  userSelect: "none",
};

const headerStyle: Readonly<CSSProperties> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingLeft: "12px",
  paddingRight: "8px",
  paddingTop: "6px",
  paddingBottom: "6px",
  textTransform: "uppercase",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.5px",
  color: "var(--color-text-secondary, #666666)",
  borderBottom: "1px solid var(--color-border, #e2e8f0)",
};

const listStyle: Readonly<CSSProperties> = {
  flex: 1,
  overflowY: "auto",
  padding: 0,
  margin: 0,
  listStyle: "none",
};

const itemBaseStyle: Readonly<CSSProperties> = {
  display: "flex",
  alignItems: "center",
  paddingLeft: "12px",
  paddingRight: "8px",
  paddingTop: "3px",
  paddingBottom: "3px",
  cursor: "pointer",
  transition: "background-color 100ms",
  gap: "6px",
  minHeight: "22px",
};

const itemIconStyle: Readonly<CSSProperties> = {
  flexShrink: 0,
  width: "14px",
  textAlign: "center",
  fontSize: "12px",
};

const itemTitleStyle: Readonly<CSSProperties> = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "var(--color-text-primary, #171717)",
  fontSize: "var(--font-size-xs, 11px)",
};

const itemDateStyle: Readonly<CSSProperties> = {
  flexShrink: 0,
  color: "var(--color-text-secondary, #999999)",
  fontSize: "10px",
  marginLeft: "auto",
};

const actionBtnStyle: Readonly<CSSProperties> = {
  border: "none",
  background: "none",
  cursor: "pointer",
  padding: "1px 4px",
  fontSize: "12px",
  color: "var(--color-text-secondary, #999999)",
  borderRadius: "2px",
  lineHeight: 1,
  opacity: 0.7,
  flexShrink: 0,
  transition: "opacity 100ms",
};

const renameInputStyle: Readonly<CSSProperties> = {
  flex: 1,
  minWidth: 0,
  padding: "1px 4px",
  fontSize: "var(--font-size-xs, 11px)",
  border: "1px solid var(--color-accent, #555ab9)",
  borderRadius: "2px",
  backgroundColor: "var(--color-surface, #ffffff)",
  color: "var(--color-text-primary, #171717)",
  outline: "none",
};

const confirmBarStyle: Readonly<CSSProperties> = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  paddingLeft: "32px",
  paddingRight: "8px",
  paddingTop: "2px",
  paddingBottom: "2px",
  fontSize: "10px",
  color: "var(--color-text-secondary, #666666)",
  backgroundColor: "var(--color-error-bg, #f8d7da)",
};

const confirmBtnStyle: Readonly<CSSProperties> = {
  border: "none",
  cursor: "pointer",
  padding: "1px 6px",
  fontSize: "10px",
  fontWeight: 600,
  borderRadius: "2px",
  lineHeight: 1.4,
};

const emptyStyle: Readonly<CSSProperties> = {
  padding: "20px 12px",
  textAlign: "center",
  color: "var(--color-text-secondary, #999999)",
  fontSize: "var(--font-size-xs, 11px)",
  fontStyle: "italic",
};

// ── Component ─────────────────────────────────────────────────

export function ScriptFileExplorer({
  scripts,
  onOpen,
  onRename,
  onDelete,
}: ScriptFileExplorerProps) {
  const [state, setState] = useState<FileExplorerState>(
    initialFileExplorerState,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const items = computeFileExplorerItems(scripts, state);

  // リネーム入力にフォーカス
  useEffect(() => {
    if (state.renamingId !== null) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [state.renamingId]);

  const handleDoubleClick = useCallback(
    (id: string) => {
      onOpen(id);
    },
    [onOpen],
  );

  const handleStartRename = useCallback((id: string, title: string) => {
    setState((prev) => startRename(prev, id, title));
  }, []);

  const handleRenameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => updateRenameValue(prev, e.target.value));
    },
    [],
  );

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent, currentTitle: string, id: string) => {
      if (e.key === "Enter") {
        const { state: newState, newTitle } = confirmRename(
          state,
          currentTitle,
        );
        setState(newState);
        if (newTitle !== null) {
          onRename(id, newTitle);
        }
      } else if (e.key === "Escape") {
        setState((prev) => cancelRename(prev));
      }
    },
    [state, onRename],
  );

  const handleRenameBlur = useCallback(
    (currentTitle: string, id: string) => {
      const { state: newState, newTitle } = confirmRename(state, currentTitle);
      setState(newState);
      if (newTitle !== null) {
        onRename(id, newTitle);
      }
    },
    [state, onRename],
  );

  const handleStartDelete = useCallback((id: string) => {
    setState((prev) => startDeleteConfirm(prev, id));
  }, []);

  const handleConfirmDelete = useCallback(
    (id: string) => {
      setState((prev) => cancelDeleteConfirm(prev));
      onDelete(id);
    },
    [onDelete],
  );

  const handleCancelDelete = useCallback(() => {
    setState((prev) => cancelDeleteConfirm(prev));
  }, []);

  return (
    <div style={containerStyle} data-testid="script-file-explorer">
      <div style={headerStyle}>
        <span>Saved Scripts</span>
        <span
          style={{
            fontWeight: 400,
            textTransform: "none",
            letterSpacing: "normal",
          }}
        >
          {`${String(scripts.length) satisfies string}`}
        </span>
      </div>

      {items.length === 0 ? (
        <div style={emptyStyle} data-testid="file-explorer-empty">
          No saved scripts
        </div>
      ) : (
        <ul style={listStyle} data-testid="file-explorer-list" role="list">
          {items.map((item) => (
            <li key={item.id}>
              <div
                style={{
                  ...itemBaseStyle,
                  backgroundColor:
                    hoveredId === item.id
                      ? "var(--color-hover-bg, #f0f0f0)"
                      : "transparent",
                }}
                data-testid={`file-explorer-item-${item.id satisfies string}`}
                onDoubleClick={() => handleDoubleClick(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="listitem"
              >
                <span style={itemIconStyle}>📄</span>

                {item.isRenaming ? (
                  <input
                    ref={renameInputRef}
                    type="text"
                    style={renameInputStyle}
                    value={state.renameValue}
                    onChange={handleRenameChange}
                    onKeyDown={(e) =>
                      handleRenameKeyDown(e, item.title, item.id)
                    }
                    onBlur={() => handleRenameBlur(item.title, item.id)}
                    data-testid={`file-explorer-rename-input-${item.id satisfies string}`}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span style={itemTitleStyle} title={item.title}>
                      {item.title}
                    </span>
                    <span style={itemDateStyle}>
                      {formatSavedAt(item.savedAt)}
                    </span>
                  </>
                )}

                {hoveredId === item.id && !item.isRenaming && (
                  <>
                    <button
                      type="button"
                      style={actionBtnStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(item.id, item.title);
                      }}
                      title="Rename"
                      data-testid={`file-explorer-rename-btn-${item.id satisfies string}`}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      style={actionBtnStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartDelete(item.id);
                      }}
                      title="Delete"
                      data-testid={`file-explorer-delete-btn-${item.id satisfies string}`}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>

              {item.isConfirmingDelete && (
                <div
                  style={confirmBarStyle}
                  data-testid={`file-explorer-confirm-delete-${item.id satisfies string}`}
                >
                  <span>Delete?</span>
                  <button
                    type="button"
                    style={{
                      ...confirmBtnStyle,
                      backgroundColor: "var(--color-error-text, #721c24)",
                      color: "white",
                    }}
                    onClick={() => handleConfirmDelete(item.id)}
                    data-testid={`file-explorer-confirm-yes-${item.id satisfies string}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    style={{
                      ...confirmBtnStyle,
                      backgroundColor: "var(--color-surface, #ffffff)",
                      color: "var(--color-text-primary, #171717)",
                      border: "1px solid var(--color-border, #e2e8f0)",
                    }}
                    onClick={handleCancelDelete}
                    data-testid={`file-explorer-confirm-no-${item.id satisfies string}`}
                  >
                    No
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
