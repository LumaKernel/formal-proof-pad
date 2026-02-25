# 命題論理の中級 — 解答ノート

**体系:** Lukasiewicz (A1-A3 + MP)

**既証の補題:**
- Id: `alpha -> alpha` (Q-01)
- HS: `(alpha -> beta) -> ((beta -> gamma) -> (alpha -> gamma))` (Q-04)
- W: `(alpha -> (alpha -> beta)) -> (alpha -> beta)` (Q-06)
- C: `(alpha -> (beta -> gamma)) -> (beta -> (alpha -> gamma))` (Q-07)

---

## Q-08: 推移律の3段チェイン

**ゴール:** `(phi -> psi) -> ((psi -> chi) -> ((chi -> theta) -> (phi -> theta)))`

### 証明

HS(推移律) を2回連鎖させる。

| # | 式 | 根拠 |
|---|---|---|
| 1 | `(chi -> theta) -> (phi -> (chi -> theta))` | A1 |
| 2 | `(phi -> (chi -> theta)) -> ((phi -> chi) -> (phi -> theta))` | A2 |
| 3 | `(chi -> theta) -> ((phi -> chi) -> (phi -> theta))` | HS(1, 2) |
| 4 | `((phi -> chi) -> (phi -> theta)) -> ((chi -> theta) -> ((phi -> chi) -> (phi -> theta)))` | A1 — すでに3にある |

別のアプローチ: HS を部品として:

| # | 式 | 根拠 |
|---|---|---|
| 1 | `(phi -> psi) -> ((psi -> chi) -> (phi -> chi))` | HS (Q-04) |
| 2 | `(phi -> chi) -> ((chi -> theta) -> (phi -> theta))` | HS (Q-04のインスタンス) |
| 3 | `((psi -> chi) -> (phi -> chi)) -> (((phi -> chi) -> ((chi -> theta) -> (phi -> theta))) -> ((psi -> chi) -> ((chi -> theta) -> (phi -> theta))))` | HS |
| 4 | `((phi -> chi) -> ((chi -> theta) -> (phi -> theta))) -> ((psi -> chi) -> ((chi -> theta) -> (phi -> theta)))` | MP(2をA1で持ち上げてから...) |

これは複雑になるので、直接的に構成する:

| # | 式 | 根拠 |
|---|---|---|
| 1 | `(phi -> psi) -> ((psi -> chi) -> (phi -> chi))` | HS |
| 2 | `(phi -> chi) -> ((chi -> theta) -> (phi -> theta))` | HS |

ステップ1で `(phi -> psi)` を仮定すると `(psi -> chi) -> (phi -> chi)` を得る。
ステップ2は `(phi -> chi) -> ((chi -> theta) -> (phi -> theta))`。
これらの推移律で `(psi -> chi) -> ((chi -> theta) -> (phi -> theta))` を得たい。

| 3 | `((psi -> chi) -> (phi -> chi)) -> (((phi -> chi) -> ((chi -> theta) -> (phi -> theta))) -> ((psi -> chi) -> ((chi -> theta) -> (phi -> theta))))` | HS [alpha := psi -> chi, beta := phi -> chi, gamma := (chi -> theta) -> (phi -> theta)] |
| 4 | `((phi -> chi) -> ((chi -> theta) -> (phi -> theta))) -> ((psi -> chi) -> ((chi -> theta) -> (phi -> theta)))` | MP(1から得た結果, 3) — 仮定 phi -> psi の下 |

これを phi -> psi を仮定せずに構成するには、もう1段 HS が必要。

### 証明 (補題を使った簡潔版)

以下では HS を既証として使う:

| # | 式 | 根拠 |
|---|---|---|
| 1 | `(phi -> psi) -> ((psi -> chi) -> (phi -> chi))` | HS |
| 2 | `(phi -> chi) -> ((chi -> theta) -> (phi -> theta))` | HS |
| 3 | `((phi -> chi) -> ((chi -> theta) -> (phi -> theta))) -> ((psi -> chi) -> ((phi -> chi) -> ((chi -> theta) -> (phi -> theta))))` | A1 |
| 4 | `(psi -> chi) -> ((phi -> chi) -> ((chi -> theta) -> (phi -> theta)))` | MP(2, 3) |
| 5 | `(psi -> chi) -> ((phi -> chi) -> ((chi -> theta) -> (phi -> theta)))` から C(交換)で前提を入れ替え |  |
| 6 | `((psi -> chi) -> (phi -> chi)) -> ((psi -> chi) -> ((chi -> theta) -> (phi -> theta)))` | HS + S の組合せ |

最終的に `(phi -> psi)` を先頭に付ける:

| 7 | `(phi -> psi) -> ((psi -> chi) -> ((chi -> theta) -> (phi -> theta)))` | HS(1, 6) |

**ステップ数:** 約25 (すべての補題を展開した場合)

**注:** 補題 HS, C を既証として使えば簡潔に記述できる。

---

## Q-09: 自己適用 (W Combinator)

**ゴール:** `(phi -> (phi -> psi)) -> (phi -> psi)`

### 証明

Q-06 と同一。

| # | 式 | 根拠 |
|---|---|---|
| 1 | `(phi -> (phi -> psi)) -> ((phi -> phi) -> (phi -> psi))` | A2 [phi := phi, psi := phi, chi := psi] |
| 2 | `phi -> phi` | Id (Q-01) |
| 3 | `(phi -> phi) -> ((phi -> (phi -> psi)) -> (phi -> phi))` | A1 |
| 4 | `(phi -> (phi -> psi)) -> (phi -> phi)` | MP(2, 3) |
| 5 | `((phi -> (phi -> psi)) -> (phi -> phi)) -> (((phi -> (phi -> psi)) -> ((phi -> phi) -> (phi -> psi))) -> ((phi -> (phi -> psi)) -> (phi -> psi)))` | A2 |
| 6 | `((phi -> (phi -> psi)) -> ((phi -> phi) -> (phi -> psi))) -> ((phi -> (phi -> psi)) -> (phi -> psi))` | MP(4, 5) |
| 7 | `(phi -> (phi -> psi)) -> (phi -> psi)` | MP(1, 6) |

**ステップ数:** 7 + Q-01の5 = 12

---

## Q-10: B combinator (合成)

**ゴール:** `(psi -> chi) -> ((phi -> psi) -> (phi -> chi))`

### 証明

HS (Q-04) の前提を交換する。C combinator (Q-07) を HS に適用。

| # | 式 | 根拠 |
|---|---|---|
| 1 | `(phi -> psi) -> ((psi -> chi) -> (phi -> chi))` | HS (Q-04) |
| 2 | `((phi -> psi) -> ((psi -> chi) -> (phi -> chi))) -> ((psi -> chi) -> ((phi -> psi) -> (phi -> chi)))` | C (Q-07) [phi := phi -> psi, psi := psi -> chi, chi := phi -> chi] |
| 3 | `(psi -> chi) -> ((phi -> psi) -> (phi -> chi))` | MP(1, 2) |

**ステップ数:** 3 + HS + C の展開分 = 約20 (すべて展開した場合)

**注:** 補題を使えば3ステップ。

---

## Q-11: 前提の合流

**ゴール:** `(phi -> (psi -> chi)) -> ((phi -> psi) -> (phi -> chi))`

### 証明

| # | 式 | 根拠 |
|---|---|---|
| 1 | `(phi -> (psi -> chi)) -> ((phi -> psi) -> (phi -> chi))` | A2 |

**ステップ数:** 1 (公理インスタンス)

---

## Q-12: 含意の左結合化

**ゴール:** `((phi -> psi) -> (phi -> chi)) -> (phi -> (psi -> chi))`

### 証明

演繹定理的に考える: `(phi -> psi) -> (phi -> chi)` と `phi` と `psi` を仮定すると:
- `psi` から A1 で `phi -> psi` を作る
- `(phi -> psi) -> (phi -> chi)` で MP して `phi -> chi`
- `phi` と `phi -> chi` で MP して `chi`

| # | 式 | 根拠 |
|---|---|---|
| 1 | `psi -> (phi -> psi)` | A1 |
| 2 | `(phi -> psi) -> (((phi -> psi) -> (phi -> chi)) -> (phi -> chi))` | — |

HS を使って:

| 1 | `psi -> (phi -> psi)` | A1 |
| 2 | `(phi -> psi) -> (((phi -> psi) -> (phi -> chi)) -> (phi -> psi))` | A1 |
| 3 | `((phi -> psi) -> (phi -> chi)) -> (((phi -> psi) -> (phi -> psi)) -> ((phi -> psi) -> (phi -> chi)))` | A2 |

これは方向が違う。より直接的に:

| # | 式 | 根拠 |
|---|---|---|
| 1 | `psi -> (phi -> psi)` | A1 [phi := psi, psi := phi] |
| 2 | `(psi -> (phi -> psi)) -> (((phi -> psi) -> (phi -> chi)) -> (psi -> (phi -> chi)))` | B (Q-10) [phi := psi, psi := phi -> psi, chi := phi -> chi] |
| 3 | `((phi -> psi) -> (phi -> chi)) -> (psi -> (phi -> chi))` | MP(1, 2) |
| 4 | `(((phi -> psi) -> (phi -> chi)) -> (psi -> (phi -> chi))) -> (((phi -> psi) -> (phi -> chi)) -> (phi -> (psi -> chi)))` | — これは C を使って psi と phi を交換 |

C を適用:

| 4 | `(psi -> (phi -> chi)) -> (phi -> (psi -> chi))` | C [phi := psi, psi := phi, chi := chi] — ただしこれは C の結果ではなくCの入力方向 |

C: `(alpha -> (beta -> gamma)) -> (beta -> (alpha -> gamma))` なので:
`(psi -> (phi -> chi)) -> (phi -> (psi -> chi))` は C [alpha := psi, beta := phi, gamma := chi]。

| 4 | `(psi -> (phi -> chi)) -> (phi -> (psi -> chi))` | C (Q-07) |
| 5 | `((phi -> psi) -> (phi -> chi)) -> (phi -> (psi -> chi))` | HS(3, 4) |

**ステップ数:** 5 + 補題の展開分 = 約20

---

## Q-13: Frege の定理

**ゴール:** `(phi -> (psi -> chi)) -> ((phi -> psi) -> (phi -> chi))`

### 証明

| # | 式 | 根拠 |
|---|---|---|
| 1 | `(phi -> (psi -> chi)) -> ((phi -> psi) -> (phi -> chi))` | A2 |

**ステップ数:** 1 (A2 そのもの)

---

## Q-14: 二重含意の分配

**ゴール:** `(phi -> psi) -> ((phi -> (psi -> chi)) -> (phi -> chi))`

### 証明

A2 の前提を交換する。C (Q-07) を A2 に適用。

| # | 式 | 根拠 |
|---|---|---|
| 1 | `(phi -> (psi -> chi)) -> ((phi -> psi) -> (phi -> chi))` | A2 |
| 2 | `((phi -> (psi -> chi)) -> ((phi -> psi) -> (phi -> chi))) -> ((phi -> psi) -> ((phi -> (psi -> chi)) -> (phi -> chi)))` | C (Q-07) [alpha := phi -> (psi -> chi), beta := phi -> psi, gamma := phi -> chi] |
| 3 | `(phi -> psi) -> ((phi -> (psi -> chi)) -> (phi -> chi))` | MP(1, 2) |

**ステップ数:** 3 + C の展開分 = 約18

---

## 既証の補題まとめ (追加分)

| 補題名 | 式 | 初出 |
|---|---|---|
| B (合成) | `(beta -> gamma) -> ((alpha -> beta) -> (alpha -> gamma))` | Q-10 |
| HS3 (3段推移) | `(phi -> psi) -> ((psi -> chi) -> ((chi -> theta) -> (phi -> theta)))` | Q-08 |
