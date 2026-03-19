# 差し込みタスク

- [-] 自然演繹の基礎 → 恒等律 (→I) のクエストを開いても、
  - [x] 体系が Empty non-Hilbert のままだ — notebookSerialization.ts で DeductionSystem の style を保存・復元するよう修正
  - [ ] すべてのセクションの証明を完全にするフローを作ったはずだが、そこに、体系が正しいことのチェックも入れる
    - [ ] また、ノートを開いてからではなく、クエスト一覧から開くところからストーリーを開始する
  - [ ] 他のセクションのクエストもほとんど同様である
  - [x] pw cli で http://localhost:13000 に対しての確認もせよ — 確認済み、修正後は正しく Natural Deduction NM が表示される
- [ ] すべてのクエストのセクションに関するフルのストーリーが揃っていない気がする
- [ ] EN設定でもクエストタイトル、詳細がすべて日本語のままだ。
- [x] MISSING_MESSAGE: Could not resolve `ProofWorkspace.ndBannerSelectNode` in messages for locale `ja`. — en.json/ja.json に ndBannerSelectNode, ndCancel, ndDischargedFormulaPrompt を追加。t() → t.raw() に修正
- [ ] カットの基本: 推移律 のクエストの模範解答
  - ⇒ が Unexpected Characterで怒られてる
  - [ ] エラーになってる状態の論理式ノードがノーマル状態で分かりにくい
  - [ ] エラーになってる状態の論理式ノードがあるなら、フルストーリーは失敗すべきだ
  - [ ] Γ⇒Δのそれぞれの論理式列を、論理式列入力コンポーネントで入れる形にしよう (既存の列を入れるやつを使って、うまく共通化)
- [ ] 論理式入力のカーソルが、シンタックスエラー状態のとき、実際の文字の位置とズレている
- [ ] コンテキストメニューは画面下側で見切れそうなら、上に調整されて出るべき
- [ ] 代入モーダルについて。
      `<div style="visibility: hidden; position: relative; font-family: var(--font-mono); font-size: inherit; white-space: pre; padding: 6px 8px; pointer-events: none; overflow: hidden; line-height: normal;">alpha</div>`
      これが論理式編集中の文字入力の下に隠れてるだけで存在してるせいでレイアウトが崩れてる
  - [ ] あと、プレースホルダーは alpha -> beta ではなくて、 "クリックで論理式を入力" とかでいいのに
- [ ] Fit to content は最大の拡大度が100%になるようにしよう
- [ ] 日本語のときでも、ホバーしたときのヒントが英語のままだ。 Fit to content など
