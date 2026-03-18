## 実行中タスク

**出典:** `tasks/prd-inserted-tasks.md` line 10-11 (継続)

> - [-] スクリプトエディタは、作業中のファイルワークスペースみたいな概念を導入しよう (VSCodeのような)
>   - [-] 新規のファイルはUnnamedのような扱いで、ライブラリを開くと、immutableなファイルとして別で開いて、変更を破壊しない

### 今回のスコープ

ワークスペースタブバーの純粋ロジック + UIコンポーネントを作成する:

- タブバーの表示ロジック（tabBarLogic.ts）
- ScriptWorkspaceTabBar コンポーネント（タブの表示・切替・閉じる）
- Storybook ストーリー

### テスト計画

- `tabBarLogic.test.ts` にタブ表示ロジックのテスト
- Storybook play関数でインタラクションテスト

### ストーリー計画

- ScriptWorkspaceTabBar.stories.tsx: タブバーの各状態をストーリー化
