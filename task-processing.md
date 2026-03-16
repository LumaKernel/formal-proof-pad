## 実行中タスク

**出典:** `tasks/prd-inserted-tasks.md`

### タスク

- [-] トップページのタブ切り替え、タブ自体 — antd Tabs コンポーネントに置き換え

### 周辺情報

- HubPageView.tsx に6タブの自作タブバー（button要素 + inline styles）
- HubTab type: "notebooks" | "quests" | "custom-quests" | "collection" | "reference" | "scripts"
- タブはURL/routeベース（HubContent.tsxでrouter.push）
- AntDesignThemeProvider は既に存在（src/lib/theme/AntDesignThemeProvider.tsx）
- antd v6 + @ant-design/icons v6 はインストール済み

### テスト計画

- HubPageView.stories.tsx の既存テスト（TabSwitch等）が引き続きパスすることを確認
- antd Tabs のレンダリングを既存テストで検証（data-testid等の調整が必要な場合あり）
- 新規テスト追加は不要（既存のplay関数が十分カバー）

### ストーリー計画

- 既存ストーリーの修正のみ（antd Tabs に合わせてセレクタ調整）
- 新規ストーリー追加は不要
