# 実行中タスク

**ソース:** tasks/prd-inserted-tasks.md 行35-36

> スクリプトエディタで、alertとかのweb apiとか、使えないものも出てきてしまう。それらは抑制してほしい。
> searchやcontext7, 特に、github mcpで根拠のある対処法を調べて進めて。

## 調査計画

- Monaco EditorのTypeScript補完でブラウザグローバルAPI（alert, confirm, fetch等）が表示される問題
- Monaco Editorの`compilerOptions`や`extraLibs`でDOM型定義を除外する方法を調査
- context7やGitHub MCPで根拠のある対処法を確認

## テスト計画

- ScriptEditorComponentのテストで、補完候補にalert等が含まれないことを確認
- 既存のスクリプト実行テストが壊れないことを確認

## ストーリー計画

- 既存のScriptEditorストーリーで動作確認
