## 現在のタスク: カバレッジ改善

出典: CLAUDE.md指示（「カバレッジが100%でないファイルがあれば、ストーリー実装の前にまずカバレッジ改善を優先してください」）

### 対象ファイル

1. `src/lib/theme/useTheme.ts` — 92% Stmts → 100%目標
2. `src/lib/formula-input/TermInput.tsx` — 93.97% Stmts → 100%目標
3. `src/stories/` — サンプルコードをカバレッジ対象外に

### 周辺情報

- useTheme.ts: SSRガード (`typeof window === "undefined"`) がjsdomで到達不能
- TermInput.tsx: Line 185 が未カバー
- stories/ は Storybook テンプレート（Page.tsx 71.42%、Button.tsx 77.77% Branch）
