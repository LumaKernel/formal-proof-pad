# ui コンポーネント

antd の軽量代替。Button, Tabs, Menu, Icons の自前実装。

## 設計パターン

- `uiStyleLogic.ts`: 純粋スタイル関数（DOM/Reactなし）— dark/light分岐を含む全ロジック
- `Ui*.tsx`: Reactコンポーネント — `useResolvedThemeSafe()` でテーマ取得、スタイル関数を呼ぶだけ
- `index.ts`: バレルエクスポート

## テーマ対応

- `useResolvedThemeSafe()` を使用（ThemeProvider外でもデフォルト "light" で動作）
- テストでThemeProviderラップ不要

## テスト

- `uiStyleLogic.test.ts`: 純粋関数テスト（24テスト）— dark/light全分岐カバー
- `UiButton.test.tsx`: コンポーネントテスト（17テスト）
- `UiTabs.test.tsx`: コンポーネントテスト（7テスト）
- `UiMenu.test.tsx`: コンポーネントテスト（8テスト）
- `UiIcons.test.tsx`: コンポーネントテスト（8テスト）

## 注意事項

- jsdomはCSSカラーをrgb()形式で返す。テストではhex比較不可、純粋関数テストで検証
- UiMenuItem.onClick は `(info: {domEvent}) => void` と `() => void` の union型
