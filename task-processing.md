# 実行中タスク

**出典:** `tasks/inserted-tasks.md`

**タスク:** 順番関係があるドキュメント(ガイド)は、前後の移動をするための専用の構造管理とUIを提供しよう

## コンテキスト

- `buildCategoryNavigation` / `buildGlobalNavigation` ロジックは `referenceViewerLogic.ts` に既に存在
- しかし、これらは `ReferenceViewerPageView`（フルページ表示）でのみ使用されている
- `ReferenceFloatingWindow`（ワークスペース内フローティング）と `ReferenceModal` にはナビゲーションUIがない
- ガイド（guide カテゴリ）は order フィールドで順序付けされており、順番に読むことが想定される

## テスト計画

- `referenceViewerLogic.test.ts`: 既存の `buildCategoryNavigation` テストが guide カテゴリでも動作することを確認（既にカバー済みの可能性あり）
- `guideNavigationLogic.test.ts`: ガイド専用ナビゲーションロジックのテスト（もし新規ロジックが必要なら）
- `ReferenceFloatingWindow.test.tsx`: prev/next ボタンの表示・クリック時のナビゲーションテスト
- `ReferenceModal.test.tsx`: 同上

## ストーリー計画

- `ReferenceFloatingWindow.stories.tsx`: ガイドエントリを表示してprev/nextナビゲーションが見えるストーリーを追加/更新
- `ReferenceModal.stories.tsx`: 同上

## 実装方針

1. `ReferenceFloatingWindow` と `ReferenceModal` に `NavigationData` (prev/next) を受け取るpropsを追加
2. ナビゲーションUI（prev/nextボタン）をガイドカテゴリのエントリ表示時にフッターまたはヘッダーに配置
3. 呼び出し元で `buildCategoryNavigation` を使ってデータを提供
