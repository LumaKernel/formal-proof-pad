## 実行中タスク

**出典:** `tasks/inserted-tasks.md` → `/reference/guide-hilbert-proof-method` → サブタスク

**タスク:** `[[ref:...]]`/`[[cite:...]]` をHTMLタグ形式 `<ref id="...">text</ref>` / `<cite key="...">text</cite>` に統一し、旧形式を禁止する

### 方針

既存のHTMLタグパーサー（`<b>`, `<i>`, `<code>`）と一貫した形式にする:

- `[[ref:axiom-a1|A1]]` → `<ref id="axiom-a1">A1</ref>`
- `[[ref:axiom-a1]]` → `<ref id="axiom-a1" />`（self-closing、表示テキスト=id）
- `[[cite:bekki2012|Bekki, Ch. 8]]` → `<cite key="bekki2012">Bekki, Ch. 8</cite>`

### テスト計画

- `referenceUILogic.test.ts`: 新形式のパーステスト追加、旧形式のテストを新形式に書き換え
- `InlineMarkdown.test.tsx`: 新形式のレンダリングテスト（既存テストの入力を新形式に更新）
- `BodyContent.test.tsx`: 必要に応じて更新

### ストーリー計画

- 既存ストーリーの入力データを新形式に更新（WithBibliography等）
