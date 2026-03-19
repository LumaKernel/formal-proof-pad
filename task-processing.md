## 実行中タスク

**出典:** `tasks/inserted-tasks.md`

> - [ ] EN設定でもクエストタイトル、詳細がすべて日本語のままだ。

### テスト計画

- `questDefinition.test.ts` に `getLocalizedCategory` のテストを追加
- `questLocalization.test.ts` を新規作成し、ローカライズ関数のテストを追加
- 既存の `builtinQuests.test.ts` にローカライズデータの整合性テストを追加

### ストーリー計画

- `QuestCatalogComponent.stories.tsx` に英語ロケールでのストーリーを追加（あれば更新）
- `HubPageView.stories.tsx` の既存ストーリーでロケール切り替えを確認

### 実装方針

- `QuestDefinition` に `titleEn`, `descriptionEn`, `learningPointEn`, `hintsEn` フィールドを追加
- `QuestCategoryMeta` に `labelEn`, `descriptionEn` を追加
- `questLocalization.ts` に `getLocalizedQuest(quest, locale)` / `getLocalizedCategory(category, locale)` 純粋関数を作成
- UI層（QuestCatalogComponent等）でロケールを受け取り、ローカライズ関数経由で表示
- 171+クエストの英語翻訳をbuiltinQuests.tsに追加
