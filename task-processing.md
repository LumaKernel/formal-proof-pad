## タスク（from tasks/inserted-tasks.md）

- [ ] 自然演繹の基礎 → 恒等律 (→I) のクエストを開いても、すべてのセクションの証明を完全にするフローを作ったはずだが、そこに、体系が正しいことのチェックも入れる

### 背景

QuestCompleteNd01Interactive ストーリーは体系名の検証をしていない。
他のデプロイ系ストーリー（HilbertSystem, NaturalDeductionSystem等）では `workspace-system` testIdで体系バッジを検証している。

### 方針

既存のクエスト完了ストーリー（QuestCompleteProp01FullFlow, QuestCompleteNd01Interactive, QuestCompleteNd01, QuestCompleteTab01, QuestCompleteSc01等）に体系名バッジの検証を追加する。

### テスト計画

- WorkspacePageView.stories.tsx: 各クエスト完了ストーリーのplay関数に `workspace-system` の体系名検証を追加
