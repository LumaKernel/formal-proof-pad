## 現在のタスク

カバレッジ改善: Stmts 99.24% → 100% を目指す（CLAUDE.md指示に基づく優先タスク）

ソース: CLAUDE.md「カバレッジが100%でないファイルがあれば、ストーリー実装の前にまずカバレッジ改善を優先してください。」

### 対応方針

#### v8 ignore 追加（不純/防御コード）

- `TermInput.tsx:96` - スタイル定数
- `MinimapComponent.tsx:31,109` - ブラウザAPI可用性チェック
- `FormulaEditor.tsx:72` - スタイル定数
- `useContextMenu.ts:116` - ref null安全チェック
- `useZoom.ts:139` - ref null安全チェック

#### テスト追加

- `CompletionPopup.tsx` - 空candidates、キー操作、testId
- `FormulaEditor.tsx` - KaTeX表示バリアント、testId
- `ProofWorkspace.tsx` - ゴール達成バナー
- `parser.ts:723,744` - パーサーエラーパス
