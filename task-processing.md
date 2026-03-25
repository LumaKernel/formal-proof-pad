## 実行中タスク（from tasks/inserted-tasks.md）

- [-] まず論理式入力モーダルはどうなってる？散乱してない？それぞれで特殊化ばかりしてない？ちゃんと整理して、共通化するプランをしっかりたてて進めよ。

### 調査結果

**現状の論理式入力モーダル一覧:**

| コンポーネント | ファイル | 行数 | 用途 |
|---|---|---|---|
| FormulaExpandedEditor | lib/formula-input/ | ~550行 | 論理式の拡大編集 |
| TermExpandedEditor | lib/formula-input/ | ~550行 | 項の拡大編集 |
| SequentExpandedEditor | lib/formula-input/ | ~340行 | シーケントの拡大編集 |
| RulePromptModal | lib/proof-pad/ | ~小 | テキスト入力プロンプト |
| EdgeParameterPopover | lib/proof-pad/ | ~中 | Gen変数名/置換入力 |

**問題点:**
1. FormulaExpandedEditor と TermExpandedEditor がほぼ同一（~1,100行重複）
2. 3つのExpandedEditor全てが以下を再実装:
   - オーバーレイ描画（createPortal + fixed + rgba overlay）
   - モーダルコンテナスタイル（700px, 80vh, border-radius, shadow）
   - ヘッダーレイアウト（タイトル + 閉じるボタン + 構文ヘルプ）
   - クローズハンドラ（Escape, overlay click, button）
   - プレビューセクション
   - エラー表示セクション
3. 共通のモーダルラッパー抽象化がない

### 共通化プラン

**Phase 1: BaseExpandedEditor抽出**
- `BaseExpandedEditor` コンポーネントを作成
  - オーバーレイ + モーダルコンテナ + ヘッダー + クローズロジック
  - 子コンポーネントとしてエディタ本体をrenderする
  - Props: title, onClose, onOpenSyntaxHelp?, testId?, children
- FormulaExpandedEditor / TermExpandedEditor / SequentExpandedEditor を BaseExpandedEditor を使って書き直す
- 推定削減: ~600行

**Phase 2: ParseState統一型**
- 3つのエディタのparse結果型を統一的に扱う `ParseState<T>` 型を定義
- プレビュー/エラー表示のレンダリングロジックも共通化

**Phase 3: z-index管理**
- モーダルのz-index値を一元管理する定数に（現在は各コンポーネントでハードコード）

### 今回のイテレーションの範囲

Phase 1（BaseExpandedEditor抽出）のみ実施する。

### テスト計画

- BaseExpandedEditor のテスト: オーバーレイ表示、Escape閉じ、overlay click閉じ
- 既存のFormulaExpandedEditor/TermExpandedEditor/SequentExpandedEditorのテストが引き続きパスすること

### ストーリー計画

- 既存のストーリーが引き続き動作することを確認
