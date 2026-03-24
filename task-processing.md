## タスク (from tasks/inserted-tasks.md line 17)

- [x] `.../_unsafe` のようなフォルダに useEffect をすべき対象を集約する。

### 実施内容

useEffectは`_unsafe`フォルダパターンには適合しない（v8 ignore/eslint-disableと異なりReactの正当なパターン）。
代わりにカスタムフックによる集約を実施:

1. `useNotifyOnParsed` フックを作成（onParsedコールバックのuseEffectパターンを集約）
2. FormulaInput, TermInput, FormulaExpandedEditor, TermExpandedEditor の4箇所で適用
3. FormulaInput, TermInput からは `useEffect` import自体が不要に
4. テスト5件追加（useNotifyOnParsed.test.ts）

### 残りのuseEffectカテゴリの判断

分析結果（84箇所/42ファイル）に基づき:

- **onParsedコールバック 4箇所**: → `useNotifyOnParsed`で集約済み（今回）
- **外部系同期 35箇所**: 正当なuseEffect（DOM API, event listener等）。集約不要
- **focusリセット 18箇所**: key/autoFocusで改善可能だが別タスク
- **ref同期 12箇所**: rAF最適化済み、現状維持
- **localStorage 5箇所**: Layer+Context.Tag DI済み、現状妥当
- **初期化 6箇所**: 現状妥当

→ \_unsafeフォルダへの集約対象なし。カスタムフックパターンで対応完了。
