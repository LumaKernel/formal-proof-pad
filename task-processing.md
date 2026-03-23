## 現在のタスク

**出典:** `tasks/inserted-tasks.md`

- [-] Next.jsの機能を用いた最適化
  - [x] ロード時間の調査

### コンテキスト

- まずはロード時間の調査を行い、ボトルネックを特定する
- 調査結果に基づいて具体的な最適化タスクをリスト化する

### テスト計画

- 調査フェーズのためテスト変更なし
- 最適化実施後はビルド・テスト通過を確認

### ストーリー計画

- UI変更なし（パフォーマンス最適化のみ）

### 調査結果

#### Core Web Vitals（Vercel本番計測 - 2026-03-23）

| 指標 | Hub (/） | Workspace (/workspace/default) |
|------|---------|-------------------------------|
| LCP | 573ms | 443ms |
| TTFB | 19ms | 11ms |
| CLS | 0.00 | 0.00 |
| Render Delay | 554ms | 432ms |
| Critical Path | 218ms | 218ms |

**結論: Core Web Vitals は良好。明確なボトルネックはない。**

#### バンドルサイズ分析

**Hub page（13スクリプト, 3.2MB raw / ~1.0MB gzip）:**

| チャンク | Raw | Gzip | 内容 |
|---------|-----|------|------|
| Effect.ts | 1,651KB | 345KB | Effect ランタイム |
| antd | 1,009KB | 304KB | antd + rc-components |
| その他 | ~600KB | ~150KB | React, next-intl 等 |

**Workspace追加分（+6スクリプト, +4.1MB raw / ~1.3MB gzip）:**

| チャンク | Raw | Gzip | 内容 |
|---------|-----|------|------|
| Effect.ts (2) | 1,651KB | 344KB | 追加 Effect モジュール |
| antd (2) | 1,009KB | 304KB | 追加 antd コンポーネント |
| Monaco | 985KB | 285KB | Monaco エディタ |
| その他 | ~500KB | ~150KB | reactflow 等 |

#### 現状の最適化状態

- 全ページで `next/dynamic` + `ssr: false` 済み
- CSS は render-blocking だが 3ms のみ（問題なし）
- Brotli 圧縮がVercelで有効（gzipより更に小さい）

#### 特定されたボトルネック・改善候補

1. **Effect.ts が最大** (1.6MB×2 raw) — tree-shaking の改善余地あるか調査
2. **antd が次に大きい** (1.0MB×2 raw) — Button, Tabs, Menu のみ使用だが rc-components 依存で大きい
3. **タブごとの遅延ロード** — Hub の各タブ（quests, reference, scripts, trash 等）を Suspense + lazy で分割可能
4. **Monaco はワークスペースのみ** — 適切に分離されている
