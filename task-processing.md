## 実行中タスク

**出典:** `tasks/inserted-tasks.md` line 18

**タスク:** 代入モーダル系の各論理式入力の拡張エディタは小さく開きすぎる。拡張なのだから、他と同様により画面いっぱい使って大きく開くべきである

### 原因分析

- FormulaExpandedEditor/TermExpandedEditorは`position: fixed`のoverlayでフルスクリーンモーダルを表示
- ただし、InfiniteCanvasが`isolation: isolate`を使っているため、`position: fixed`のcontaining blockがcanvas要素に限定される
- 代入ポップオーバー内のFormulaEditor/TermEditorのビルトイン拡張エディタはcanvas内にレンダリングされるため小さくなる

### 修正方針

- FormulaExpandedEditor / TermExpandedEditor のreturn文をReact `createPortal(jsx, document.body)` でラップ
- これにより`position: fixed`が正しくviewportを基準にする

### テスト計画

- FormulaExpandedEditor.test.tsx, TermExpandedEditor.test.tsx: 既存テストがportal経由でも通ることを確認
- PortalのcleanupでDOMリークがないことを確認

### ストーリー計画

- 既存ストーリーで確認
