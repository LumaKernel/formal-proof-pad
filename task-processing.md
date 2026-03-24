## 実行中タスク

**出典:** `tasks/inserted-tasks.md` - v8 ignore集約サブタスク

> map系は、 https://github.com/LumaKernel/const-map-ts の makeConstMap を利用できるところは利用する
> 一旦、makeConstMapWithReturnTypeはバグってるので利用しない。

### 対象候補（v8 ignoreが削減できる箇所）

1. `src/lib/quest/questDefinition.ts` sortQuests - categoryOrder Map → makeConstMap（?? 999 fallback削除）
2. `src/lib/reference/referenceBrowserLogic.ts` buildEntryListItems - categoryMetas.find() → makeConstMap
3. `src/lib/script-runner/workspaceBridge.ts` scTagToRuleName - switch 20 cases → makeConstMap（v8 ignore削除）

### 対象外（dynamic Map、makeConstMap不適合）

- referenceBrowserLogic.ts computeCategoryCounts/buildCategoryBadges - 動的カウントMap
- trashPanelLogic.ts buildTrashFilterOptions - 動的カウントMap

### テスト計画

- 既存テストがパスすることを確認（リファクタリングのみ、振る舞い変更なし）
- カバレッジが低下しないことを確認

### ストーリー計画

- UI変更なし。ストーリー追加不要。
