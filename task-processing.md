## 実行中タスク

**出典**: `tasks/prd-inserted-tasks.md` 行9

> ノートの種類としてクエスト(ゴール)付きがあって、ビルトインで消すことや変更ができないノードがゴールとして存在している、みたいなモードは作れそうだ。

### 周辺情報
- `tasks/prd-next-tasks.md`: 「クエスト用ノート(ゴール付き)はあくまでも永続的に特殊モードなノートだが、自由帳モード的なのに変換はできる、という扱いにすると良さそうだ。」
- 現在の実装: `workspaceState.ts` に `WorkspaceState` 型、`nodeRoleLogic.ts` にノード分類ロジック、`ProofWorkspace.tsx` にUI
- 公理/ゴールのマーク機能は既に実装済み（0a560a3）
