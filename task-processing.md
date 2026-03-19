## タスク（inserted-tasks.md より）

代入モーダルについて:

1. `visibility: hidden` の隠し div がレイアウトを崩している問題の修正
2. プレースホルダーを "alpha -> beta" から適切なテキストに変更

## テスト計画

- FormulaInput.test.tsx: hidden div 削除後もオーバーレイ高さ確保が機能することを確認（既存テスト通過）
- TermInput.tsx: 同様の修正
- EdgeParameterPopover.test.tsx: placeholder 変更に伴うテスト更新
- proofMessages.test.ts: 新メッセージキー追加時に更新

## ストーリー計画

- EdgeParameterPopover.stories.tsx の既存ストーリーで確認（substitution ストーリー）

## 分析

FormulaInput.tsx の hidden div (line 384-390) は `hasOverlay` 時に input が absolute になるため高さ確保に使われるが、
エラーハイライト div またはシンタックスハイライト div が既にフローに入っているので冗余。
ただし、空文字列 + オーバーレイなしの場合は hasOverlay=false なので hidden div は表示されない。
hasOverlay=true の時は必ずハイライト div がフローにあるため、hidden div を削除しても高さは維持される。
