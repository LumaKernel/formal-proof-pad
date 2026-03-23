## 現在のタスク

カバレッジ改善: ProofTreePanel系ファイルのブランチカバレッジ向上

- ScProofTreePanel.tsx: 85.71% → 100% (line 182)
- AtProofTreePanel.tsx: 88.88% → 改善
- TabProofTreePanel.tsx: 89.65% → 改善
- NdProofTreePanel.tsx: 96.87% → 改善

（タスクファイルが空のため、カバレッジ改善を自主タスクとして実施）

### テスト計画

- 各TreePanelの未カバーブランチを特定し、テストを追加
- 既存のテストファイルがあればそこに追加、なければ新規作成
- ストーリーのplay関数で未カバーブランチをトリガーできるか検討

### ストーリー計画

- 既存ストーリーのplay関数改善で対応可能な場合はそちらを優先
