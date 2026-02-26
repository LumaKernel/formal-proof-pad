## 現在のタスク

from: `tasks/prd-theories.md`

- [ ] 自然数論を開始できるセットアップを提供しよう
  - まず第一歩: Theory(理論)の抽象化を logic-core に追加し、ペアノ算術(PA)の公理テンプレートを定義・テストする
  - LogicSystem に非論理的公理(TheoryAxiom)のサポートを追加
  - ペアノ公理スキーマ(PA1-PA7 + 帰納法スキーマ)を定義
  - テストで各公理テンプレートの正しさを検証
  - axiomPaletteLogic, notebookCreateLogic 等のUI統合は次のイテレーションに持ち越し
