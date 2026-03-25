## 実行中タスク（from tasks/inserted-tasks.md）

- [-] 次にそれらを解消していく形で ul/ol 利用を検討していく。

### コンテキスト

- 10エントリにTODOマーク済み
- 現状のレンダリングは段落ごとに `<p>` + `InlineMarkdown` のみ
- `•` 記号と `<b>N.</b>` パターンが `\n` 区切りで段落文字列内に埋め込まれている
- 対応が必要: body段落文字列のブロックレベル構造（ul/ol）のパースとレンダリング

### 実装方針

1. **段落文字列内のリスト構造をパース**: `\n•` パターンを `<ul><li>` に、`\n1.` パターンを `<ol><li>` に変換
2. **レンダリング層で対応**: ReferenceViewerPageView と ReferenceModal の body レンダリングを拡張
3. **InlineMarkdown は変更不要**: リスト内のテキストは引き続き InlineMarkdown でレンダリング

### テスト計画

- referenceUILogic.test.ts: 段落テキストからリスト構造を検出・パースする関数のテスト
- ReferenceViewerPageView.test.tsx: リスト構造が正しく `<ul>/<ol>/<li>` でレンダリングされることのテスト
- InlineMarkdown.test.tsx: 変更なし

### ストーリー計画

- ReferenceViewerPageView.stories.tsx: リスト構造を含むストーリーを追加
