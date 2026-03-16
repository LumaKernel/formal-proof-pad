## 実行中タスク

**出典:** `tasks/prd-inserted-tasks.md`

**タスク:** FormulaEditorに拡張編集（FormulaExpandedEditor）を内蔵し、すべてのFormulaEditor利用箇所で拡張編集を利用可能にする

### 背景

- 現在FormulaEditorは `onOpenExpanded` propが提供された場合のみ拡張編集ボタン（⤢）を表示
- EditableProofNode→ProofWorkspaceでは提供されているが、EdgeParameterPopoverなど他の利用箇所では未提供
- ユーザーの指摘: 「拡張編集があるかないかをコンポーネントごとに分けられるようになってる？統一が足りてなさそう」
- FormulaEditor自体が拡張編集モーダルを内蔵すべき

### テスト計画

- `FormulaEditor.test.tsx` に拡張編集の内蔵動作テストを追加
  - `onOpenExpanded` 未指定時に⤢ボタンが表示されること
  - ⤢ボタンクリックで内蔵FormulaExpandedEditorが表示されること
  - 内蔵モーダルでの編集が親のvalueに反映されること
  - 内蔵モーダルを閉じると編集モードに戻ること
  - `onOpenExpanded` 指定時は従来通り外部ハンドラが呼ばれること（後方互換）

### ストーリー計画

- `FormulaEditor.stories.tsx` の `with-parsed-callback` ストーリーで拡張編集が動作することを確認
- 必要に応じて内蔵拡張編集の専用ストーリーを追加
