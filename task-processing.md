## 実行タスク

**出典:** `tasks/prd-inserted-tasks.md` — 整理接続の置換正規化テストケース群

```
- [ ] y[/x]はyに繋げられる
- [ ] x[/x]はxに繋げられない
- [ ] x[y/x]はyに繋げられる
- [ ] (x+x)[y/x]は(x[y/x]+x[y/x])に繋げられる
- [ ] (x+x)[y/x]は(y+x[y/x])に繋げられる
- [ ] (x+x)[y/x]は(y+y)に繋げられる
```

## 調査結果

### 既にテスト済み（alphaEquivalence.test.ts lines 268-312）

- `P(y)[/x] ≡ P(y)` → y[/x]はyに繋げられる ✅
- `P(x)[/x] ≢ P(x)` → x[/x]はxに繋げられない ✅
- `(x=x)[y/x] ≡ (y=y)` → x[y/x]はyに繋げられる ✅
- `((x+x)=a)[y/x] ≡ ((y+y)=a)` → (x+x)[y/x]は(y+y)に繋げられる ✅

### 表現不可（TermSubstitution AST ノードが存在しない）

- `(x+x)[y/x]は(x[y/x]+x[y/x])に繋げられる` — term-level substitution構文が必要
- `(x+x)[y/x]は(y+x[y/x])に繋げられる` — 同上

FormulaSubstitutionは正規化時に項レベルまで原子的に分配されるため、「部分適用」の中間形を表現する TermSubstitution ノードが現在のASTにない。

## テスト計画

1. **workspaceState.test.ts** に `connectSimplification` のE2Eテストを追加:
   - `P(x)[a/x]` と `P(a)` → 接続成功（置換解決）
   - `P(y)[/x]` と `P(y)` → 接続成功（FreeVariableAbsence解決）
   - `P(x)[/x]` と `P(x)` → 接続失敗（xが自由変数）
   - `(all x. P(x))[a/x]` と `all x. P(x)` → 接続成功（束縛変数への置換は無効果）
2. タスクファイル更新: 4項目を [x] に、2項目はアーキテクチャ制約として注記

## ストーリー計画

UI変更なし。テスト追加のみ。
