## 実行中タスク

**出典:** `tasks/inserted-tasks.md` 6行目

> スクリプトエディタの上のほうにあるものをホバーすると、ホバー結果のウィンドウが、スクリプトエディタのウィンドウの範囲で見切れてしまう。見切れないように、はみ出してもトップに見えるようにするか、はみ出さないようにできないか。

### 原因分析

Monaco editorのホバーウィジェットは、親コンテナの `overflow: hidden` によってクリップされている。

### 修正方針

Monaco editorの `fixedOverflowWidgets: true` オプションを有効にする。

### テスト計画

- `scriptEditorLogic.ts` の `defaultEditorOptions` に `fixedOverflowWidgets: true` を追加
- ブラウザ確認: Playwright MCPでスクリーンショット撮影

### ストーリー計画

- UI変更なし（Monaco内部の挙動変更のみ）、ストーリー追加不要
