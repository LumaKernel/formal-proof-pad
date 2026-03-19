from: tasks/inserted-tasks.md line 15

- [ ] コンテキストメニューは画面下側で見切れそうなら、上に調整されて出るべき

## テスト計画

- contextMenu.test.ts: clampMenuPosition は既にテスト済み
- useClampedMenuPosition.test.ts: 新しいフックのテスト（必要であれば）
- 実装はProofWorkspace内の3つのメニュー(node, line, canvas)にuseEffect+refでclampMenuPosition適用

## ストーリー計画

- ブラウザで画面下部付近で右クリックして確認

## 実装方針

- ProofWorkspaceの3つのコンテキストメニュー(node, line, canvas)がclampMenuPositionを使っていない
- 各メニューのrefを使い、useEffectでDOMサイズを測定→clampMenuPositionでスタイル更新
- ContextMenuComponent.tsxの既存パターンを踏襲
