## 現在のタスク

**出典:** `tasks/inserted-tasks.md` 2行目サブタスク
**タスク:** getDeductionSystemInfo などは結局戻り値がanyだ。anyはすべてAPIから排除されるべきだ

### 根本原因

全ブリッジの `generateXxxTypeDefs` が `declare function name() => ReturnType;` という不正な TS 構文を出力している。
`declare function` では `=>` ではなく `:` を使う必要がある。
結果として Monaco Editor 上で全APIの戻り値が `any` に解決される。

### テスト計画

- `proofBridge.test.ts`: 生成された型定義が `) => ` ではなく `): ` を含むことを検証
- `workspaceBridge.test.ts`: 同上
- `cutEliminationBridge.test.ts`: 同上
- `hilbertProofBridge.test.ts`: 同上
- `scriptBridgeTypes.test.ts`: 変更なし（型定義文字列自体は正しい）

### ストーリー計画

- UI変更なし。Monaco 型定義テキストの生成ロジック修正のみ
