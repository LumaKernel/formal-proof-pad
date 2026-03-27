## 現在のタスク

**出典:** `tasks/inserted-tasks.md`

> `ラベル pred-01 から pred-06 のクエストでは` ← ドキュメント内でクエストへのこのような言及を見かけるが、これでは分からない
> 専用の言及コンポーネントなどを作成し、RSCなどとして、クエストへの言及として専用のレンダリングをするのがよいだろう。

### テスト計画

- `referenceUILogic.test.ts`: `<quest:id>` タグのパース テスト追加
- `InlineMarkdown.test.tsx`: quest-link のレンダリングテスト追加
- `referenceContent.test.ts`: quest タグが正しくパースされることの検証（既存のcontent validation）

### ストーリー計画

- UI 変更あり: `InlineMarkdown` にクエストリンクが追加される
- 既存の `ReferenceModal` / `ReferencePopover` ストーリーがあれば更新
- なければ `InlineMarkdown` のストーリーでquest-linkの表示を確認

### 実装計画

1. `referenceUILogic.ts`: `InlineElement` に `quest-link` 型追加、`parseInlineMarkdown` に `<quest:id>` パース追加
2. `InlineMarkdown.tsx`: `onQuestNavigate` callback追加、quest-link レンダリング追加
3. `renderContentWithInline`: quest タグのネスト対応
4. `referenceContent.ts`: 既存の `<code>pred-01</code>` 等を `<quest:pred-01>` に置換
5. テスト更新
