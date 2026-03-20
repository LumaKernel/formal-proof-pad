## タスク: ドラッグ中のエッジ描画を簡易化
- 元ファイル: tasks/inserted-tasks.md (2行目)

### 対応方針
- ドラッグ中のノードに接続するエッジを直線表示にし、ベジェ曲線＋障害物回避計算をスキップ
- ドラッグ中ノードIDをProofWorkspaceで追跡し、connectionElementsに渡す

### テスト計画
- connectionPath.ts: computeStraightConnectionPath関数のユニットテスト
- ProofWorkspace: ドラッグ中のエッジ簡略化はブラウザで目視確認

### ストーリー計画
- 既存ストーリーで確認（新規不要）
