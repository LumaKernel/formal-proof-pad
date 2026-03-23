# 差し込みタスク

- [-] Next.jsの機能を用いた最適化
  - [x] ロード時間の調査（LCP 443-573ms, CLS 0.00 — Core Web Vitals良好）
  - [ ] Hubページのタブコンテンツ遅延ロード（Suspense + React.lazy でタブごとに分割）
  - [ ] Effect.ts tree-shaking 改善調査（1.6MB×2チャンク）
  - [ ] antd → 軽量代替またはheadless UI検討（1.0MB×2チャンク、Button/Tabs/Menuのみ使用）
  - [ ] スクリプトに関連する要素(コンポーネントやライブラリ)の遅延ロード
  - [ ] ドキュメントの遅延ロード、Suspense利用?
