from: tasks/inserted-tasks.md
task: いくらかネイティブの prompt(confirm?) が使われていそうだが、それらはすべて、カスタムのモーダルにする
sub-task: たとえば、ヒルベルト以外の規則適用でも使われているが、代入適用と同じように、専用のモーダルが出るべきだ

## スコープ（今回のイテレーション）

全13箇所のglobalThis.prompt()のうち、まず **汎用的なRuleParameterModal** コンポーネントを作成し、
**SC（Sequent Calculus）系の6箇所** を置き換える。

残りのTAB(4), AT(2), ND(1) は次のイテレーションで対応。

## 調査結果

globalThis.prompt使用箇所:
- ND: 1箇所 (implication-intro discharged formula)
- TAB: 4箇所 (exchange position, position, term, eigen variable)
- AT: 2箇所 (term, eigen variable)
- SC: 6箇所 (exchange position, cut formula, position, component index, term, eigen variable)

テストでは vi.spyOn(globalThis, "prompt") で約50箇所モック。

## テスト計画

- RuleParameterModal.test.tsx: 新規コンポーネントの単体テスト
- ProofWorkspace.test.tsx: SC規則のpromptMockをカスタムモーダル操作に置換
- ruleParameterModalLogic.test.ts: 純粋ロジック（パラメータ収集）のテスト

## ストーリー計画

- RuleParameterModal.stories.tsx: モーダルの基本表示確認

## 実装計画

1. RuleParameterModal.tsx — 汎用的な規則パラメータ入力モーダル
2. ruleParameterModalLogic.ts — SC規則からパラメータフィールドを導出する純粋ロジック
3. ProofWorkspace.tsx — useRef+Promise パターンでshowRulePromptを実装、SC handler変更
4. テスト・ストーリー更新
