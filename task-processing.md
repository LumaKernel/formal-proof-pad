## カバレッジ改善: scriptEditorKeyboardShortcuts.ts (自発タスク)

**対象ファイル:** `src/components/ScriptEditor/scriptEditorKeyboardShortcuts.ts`
**問題:** Lines 88.88% — line 62 未カバー
**原因:** `TabSource = "unnamed" | "library" | "saved"` のうち、`library` + `readonly: false` のケースが未テスト

### テスト計画

- `scriptEditorKeyboardShortcuts.test.ts` に `library` タブ (readonly: false) での Ctrl+S テストを追加
- line 62 の `return { type: "none" }` がカバーされることを確認

### ストーリー計画

- UI変更なし。ストーリー追加不要。
