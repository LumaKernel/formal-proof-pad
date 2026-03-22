## 実行中タスク

**出典:** 自発的カバレッジ改善（タスクファイルなし）

**タスク:** SequentExpandedEditor.tsx（Branch 47%）および SequentPreview.tsx（Branch 54%）のカバレッジ改善

### テスト計画

Storybook ストーリーを追加して未カバー分岐をカバーする:

**SequentExpandedEditor.stories.tsx に追加:**

1. `EscapeToClose` - Escape キーでモーダルを閉じる（handleKeyDown の Escape 分岐）
2. `OverlayClickToClose` - オーバーレイ（モーダル外）クリックで閉じる（handleOverlayClick）
3. `WithSyntaxHelp` - onOpenSyntaxHelp を渡して構文ヘルプボタン表示＋クリック
4. `WithoutTestId` - testId を渡さない場合（ternary の else 分岐）
5. `WithPrefilledFormulas` - 前件・後件に複数式を入れてプレビューのカンマ区切り＋パース成功表示

**SequentPreview のカバレッジ向上:**

- 上記ストーリーの play 関数で SequentPreview の各分岐も間接的にカバーされる
- 空の前件/後件 → Empty ストーリーで ∅ 表示確認
- パースエラー → 不正な式テキスト入力でエラー表示確認

### ストーリー計画

- SequentExpandedEditor.stories.tsx に 4-5 個のストーリーを追加
