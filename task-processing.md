## 現在のタスク

**出典:** `tasks/play-function-enhancement.md` PLAY-WS-03

- [-] PLAY-WS-03: `EmptyPredicateLogic` — 公理パレットから公理追加→ノード追加確認

### コンテキスト

- inserted-tasks.md の「恒等律の反駁ストーリー」のサブタスク（play関数強化）の一環
- PLAY-WS-01 (EmptyLukasiewicz) と同パターン: workspaceTestId追加、公理パレットからクリック→ノード追加確認
- predicateLogicSystem は A1, A2, A3, CONJ-DEF, DISJ-DEF + A4, A5, EX-DEF を含む

### テスト計画

- WorkspacePageView.stories.tsx の EmptyPredicateLogic ストーリーの play 関数を強化
- workspaceTestId="workspace" を追加
- 公理パレットから A4 (述語論理固有) をクリック → ノード追加確認

### ストーリー計画

- 既存の EmptyPredicateLogic ストーリーを修正（新規作成なし）
