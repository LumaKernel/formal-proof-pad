## 現在のタスク

**出典:** `tasks/inserted-tasks.md`

> - [ ] 一度タブ画面に移動していたら、ノートが一個もないときのLP画面は出さないようにしよう。(リロードなどしない限り)

### テスト計画

- `landingPageLogic.test.ts` に `hasNavigatedInSession` パラメータ追加分のテストを追加
- 既存テストは新パラメータ `false` で互換維持

### ストーリー計画

- UI変更なし（表示/非表示の条件変更のみ）。既存ストーリーで動作確認

### 実装方針

1. `landingPageLogic.ts`: `shouldShowLandingPage` に `hasNavigatedInSession: boolean` パラメータ追加。`true` なら常に LP 非表示
2. `landingPageLogic.test.ts`: 新パラメータのテスト追加
3. `HubContent.tsx`: sessionStorage でフラグ管理。`initialTab !== "notebooks"` またはタブ遷移時にフラグを設定
   - sessionStorage はリロードでクリアされるため、タスク要件「リロードなどしない限り」を満たす
