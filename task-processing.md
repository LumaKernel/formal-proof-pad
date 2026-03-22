## 現在のタスク

**出典:** `tasks/inserted-tasks.md` - アルゴリズム可視化API

### 集中タスク

- [ ] **アルゴリズム可視化API - サブタスク1: VisualizationState 純粋ロジック + VisualizationBridge**

### タスク分解（全体像）

PRD要件:

1. ノードIDを指定して内部ステート表示 → 対応ノードの情報表示
2. ノードハイライト（光らせる、色を変える等）
3. disposableな吹き出し解説の表示
4. ログシステム（実行トレースの出力）→ console.log で既に実現済み
5. ユーザーによるdispose操作

サブタスク分解:

1. **[今回] VisualizationState 純粋ロジック + VisualizationBridge** (foundation)
   - `src/lib/proof-pad/visualizationState.ts` - VisualizationState 型、NodeHighlight 型、Annotation 型
   - 純粋関数: addHighlight, removeHighlight, addAnnotation, removeAnnotation, clearAll
   - `src/lib/script-runner/visualizationBridge.ts` - VisualizationCommandHandler インターフェース、ブリッジ関数
   - `builtin-api.d.ts` に型定義追加
   - テスト: visualizationState.test.ts, visualizationBridge.test.ts

2. **[次回] UI統合: ハイライト描画**
   - ProofWorkspace に VisualizationState を統合
   - ハイライトされたノードの視覚的表現（CSS glow/border）
   - ScriptEditorComponent にブリッジ接続

3. **[将来] UI統合: 吹き出しアノテーション描画**
   - アノテーション用オーバーレイコンポーネント
   - ユーザーdispose UI（閉じるボタン等）

4. **[将来] ノード内部ステート表示**
   - ノードIDから詳細情報パネルを表示

### テスト計画

- `src/lib/proof-pad/visualizationState.test.ts` - 純粋ロジックの全関数テスト
  - addHighlight / removeHighlight / clearHighlights
  - addAnnotation / removeAnnotation / clearAnnotations
  - clearAll
  - 不正なnodeIdのハンドリング
- `src/lib/script-runner/visualizationBridge.test.ts` - ブリッジ関数テスト
  - 各ブリッジ関数が handler を正しく呼ぶか
  - 型定義テスト（generateVisualizationTypeDefs の構文正しさ）

### ストーリー計画

- UI変更なし（純粋ロジック+ブリッジのみ）→ ストーリー不要
