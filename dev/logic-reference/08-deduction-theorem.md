# 演繹定理（Deduction Theorem）の構成的証明

演繹定理の構成的証明アルゴリズムと、それをスクリプトで明示的に実装する方法を解説する。

## 1. 演繹定理とは

### 定理の主張

$$\Gamma \cup \{A\} \vdash B \implies \Gamma \vdash A \to B$$

仮定の集合 $\Gamma$ に $A$ を加えて $B$ が証明できるならば、$\Gamma$ のみから $A \to B$ が証明できる。

### なぜ重要か

Hilbert系では「仮定のもとで推論する」仕組みがない。すべての推論は公理とMPのみで行う。演繹定理は「仮定つきの証明」を「仮定なしの証明」に機械的に変換する手段を提供する。

自然演繹の「→導入規則」（仮定を discharge する操作）に対応するが、Hilbert系ではこれをメタ定理として外部から証明する。

### 実装上の位置づけ

本プロジェクトでは `applyDeductionTheorem()` が組込み関数として提供されているが、本ドキュメントではこのブラックボックスの中身を解説し、同等の処理をスクリプトで明示的に行う方法を示す。

## 2. 証明の構造: 帰納法による場合分け

元の証明木 $\Gamma \cup \{A\} \vdash B$ の各ノードについて、結論 $C$ を $A \to C$ に変換する。変換は**証明木の構造に関する帰納法**で行う。

3つのケースがある:

### ケース1: 公理ノード（AxiomNode）— 仮定 $A$ と一致する場合

元の証明木のノードが仮定 $A$ そのものである場合、$A \to A$ を証明する必要がある。

**構成（A→A の恒等証明、5ステップ）:**

| ステップ | 式                                                                | 根拠                    |
| -------- | ----------------------------------------------------------------- | ----------------------- |
| 1        | $(A \to ((A \to A) \to A)) \to ((A \to (A \to A)) \to (A \to A))$ | A2($A$, $A \to A$, $A$) |
| 2        | $A \to ((A \to A) \to A)$                                         | A1($A$, $A \to A$)      |
| 3        | $(A \to (A \to A)) \to (A \to A)$                                 | MP(2, 1)                |
| 4        | $A \to (A \to A)$                                                 | A1($A$, $A$)            |
| 5        | $A \to A$                                                         | MP(4, 3)                |

**直感:** $A \to A$ は自明に思えるが、A1とA2は「$p \to p$」の形を直接含まない。SKコンビネータ基底から $I = S K K$ を構成することに対応する。

**証明図:**

```
  A2(A, A→A, A)                  A1(A, A→A)
─────────────────────── (公理)  ──────────────── (公理)
(A→((A→A)→A))→((A→(A→A))→(A→A))    A→((A→A)→A)          A1(A, A)
───────────────────────────────────────── (MP)   ──────────── (公理)
          (A→(A→A)) → (A→A)                      A→(A→A)
          ─────────────────────────────────────── (MP)
                            A → A
```

### ケース2: 公理ノード（AxiomNode）— 仮定 $A$ と一致しない場合

元の証明木のノードが公理 $C$（$A$ 以外の公理や仮定）である場合、$A \to C$ を証明する。

**構成（3ステップ）:**

| ステップ | 式                | 根拠                 |
| -------- | ----------------- | -------------------- |
| 1        | $C \to (A \to C)$ | A1($C$, $A$)         |
| 2        | $C$               | 公理（元の証明から） |
| 3        | $A \to C$         | MP(2, 1)             |

**直感:** $C$ が既知なら、「$A$ が何であっても $C$」は自明。A1 がまさにこれを表現する。

**証明図:**

```
  A1(C, A)            C
─────────── (公理)  ───── (公理)
  C→(A→C)             C
  ────────────────── (MP)
        A → C
```

### ケース3: MPノード（ModusPonensNode）

元の証明木で $D$ と $D \to E$ からMP で $E$ を導出していた場合。

再帰的に:

- $D$ の部分木を変換して $A \to D$ の証明を得る
- $D \to E$ の部分木を変換して $A \to (D \to E)$ の証明を得る

これらから $A \to E$ を導出する。

**構成（A2 + MP2回）:**

| ステップ | 式                                                | 根拠                             |
| -------- | ------------------------------------------------- | -------------------------------- |
| 再帰1    | $A \to D$                                         | （$D$ の部分木を再帰変換）       |
| 再帰2    | $A \to (D \to E)$                                 | （$D \to E$ の部分木を再帰変換） |
| 1        | $(A \to (D \to E)) \to ((A \to D) \to (A \to E))$ | A2($A$, $D$, $E$)                |
| 2        | $(A \to D) \to (A \to E)$                         | MP(再帰2, 1)                     |
| 3        | $A \to E$                                         | MP(再帰1, 2)                     |

**直感:** A2 は「含意の分配」。「$A$ から $D \to E$」と「$A$ から $D$」を組み合わせて「$A$ から $E$」を得る。

**証明図:**

```
     [A→(D→E) の証明]     A2(A, D, E)
     ─────────────── (再帰) ───────────────────── (公理)
        A→(D→E)       (A→(D→E))→((A→D)→(A→E))
        ──────────────────────────────────── (MP)
  [A→D の証明]              (A→D)→(A→E)
  ────────── (再帰)  ───────────────────
     A→D                  (A→D)→(A→E)
     ──────────────────────────── (MP)
                  A→E
```

### ケース4: 汎化ノード（GeneralizationNode）— 述語論理のみ

元の証明木で $D$ から Gen($x$) で $\forall x. D$ を導出していた場合。

**前提条件:** 変数 $x$ が仮定 $A$ に自由に出現してはならない。

再帰的に $D$ の部分木を変換して $A \to D$ の証明を得た後:

| ステップ | 式                                              | 根拠                                                      |
| -------- | ----------------------------------------------- | --------------------------------------------------------- |
| 再帰     | $A \to D$                                       | （$D$ の部分木を再帰変換）                                |
| 1        | $\forall x. (A \to D)$                          | Gen($x$, $A \to D$) — $x$ は $A$ に自由でないため適用可能 |
| 2        | $\forall x. (A \to D) \to (A \to \forall x. D)$ | A5                                                        |
| 3        | $A \to \forall x. D$                            | MP(1, 2)                                                  |

## 3. 例: 三段論法 $\{p, p \to q\} \vdash q$ → $\vdash p \to ((p \to q) \to q)$

### 元の証明

```
  p (仮定)    p→q (仮定)
  ────────────────── (MP)
          q
```

### 演繹定理の適用（1回目: 仮定 $p \to q$ を除去）

$\{p, p \to q\} \vdash q$ → $\{p\} \vdash (p \to q) \to q$

元の証明木を根から再帰的に変換する。根は MP($p$, $p \to q$) = $q$。

**ステップ1:** 左の子 $p$ を変換（ケース2: 公理 $p$、仮定 $p \to q$ ではない）

```
A1(p, p→q)        p
──────────── (公理) ── (公理)
p→((p→q)→p)        p
──────────────── (MP)
   (p→q)→p
```

**ステップ2:** 右の子 $p \to q$ を変換（ケース1: 仮定 $(p \to q)$ と一致）

→ $(p \to q) \to (p \to q)$ の恒等証明（5ステップ、上記ケース1参照）

**ステップ3:** 両方の結果を A2 + MP で結合（ケース3の構成）

```
[(p→q)→(p→q) の証明]    A2(p→q, p, q)
────────────────── (再帰) ───────────── (公理)
  (p→q)→(p→q)    ((p→q)→(p→q))→(((p→q)→p)→((p→q)→q))
  ────────────────────────────────────── (MP)
[(p→q)→p の証明]    ((p→q)→p)→((p→q)→q)
──────────── (再帰) ───────────────────
   (p→q)→p          ((p→q)→p)→((p→q)→q)
   ──────────────────────────── (MP)
              (p→q)→q
```

## 4. スクリプトでの明示的実装

### 利用する API

演繹定理の明示的実装に必要な API は**すべて既存のもの**で足りる:

| API                              | 用途                                               |
| -------------------------------- | -------------------------------------------------- |
| `parseFormula(text)`             | 公理スキーマの構築                                 |
| `formatFormula(formula)`         | 論理式の表示（デバッグ・ログ用）                   |
| `equalFormula(a, b)`             | 仮定との一致判定                                   |
| `substituteFormula(schema, map)` | A1/A2 スキーマにメタ変数を代入してインスタンス生成 |
| `extractHilbertProof()`          | ワークスペースから証明木を抽出                     |
| `displayHilbertProof(proof)`     | 変換後の証明木をワークスペースに表示               |

### ProofNodeJson の手動構築

スクリプト内で証明木ノードを直接 JSON として構築できる。`displayHilbertProof()` は内部で `decodeProofNode()` を呼ぶため、正しい構造であれば受け入れられる:

```javascript
// 公理ノード
{ _tag: "AxiomNode", formula: formulaJson }

// MPノード（antecedent: φ の証明、conditional: φ→ψ の証明）
{ _tag: "ModusPonensNode", formula: conclusionJson,
  antecedent: antecedentProof, conditional: conditionalProof }

// 汎化ノード（述語論理）
{ _tag: "GeneralizationNode", formula: forallFormulaJson,
  variable: { _tag: "TermVariable", name: "x" }, premise: premiseProof }
```

### 完全な実装（命題論理用）

以下は命題論理の演繹定理を明示的に実装する完全なスクリプトコードである。

```javascript
// ── テンプレート定数（一度だけパース）──────────────────────
var A1_SCHEMA = parseFormula("phi -> (psi -> phi)");
var A2_SCHEMA = parseFormula(
  "(phi -> (psi -> chi)) -> ((phi -> psi) -> (phi -> chi))",
);
var IMPL_SCHEMA = parseFormula("phi -> psi");

// ── ヘルパー関数 ─────────────────────────────────────────

// 含意 a → b を構築
function impl(a, b) {
  return substituteFormula(IMPL_SCHEMA, { φ: a, ψ: b });
}

// A1(p, q) = p → (q → p) の公理ノードを構築
function makeA1(p, q) {
  var formula = substituteFormula(A1_SCHEMA, { φ: p, ψ: q });
  return { _tag: "AxiomNode", formula: formula };
}

// A2(p, q, r) = (p→(q→r)) → ((p→q) → (p→r)) の公理ノードを構築
function makeA2(p, q, r) {
  var formula = substituteFormula(A2_SCHEMA, { φ: p, ψ: q, χ: r });
  return { _tag: "AxiomNode", formula: formula };
}

// MP(antecedentProof, conditionalProof) の証明ノードを構築
// antecedentProof は φ の証明木、conditionalProof は φ→ψ の証明木
function makeMP(antecedentProof, conditionalProof, conclusion) {
  return {
    _tag: "ModusPonensNode",
    formula: conclusion,
    antecedent: antecedentProof,
    conditional: conditionalProof,
  };
}

// ── ケース1: A → A の恒等証明（5ステップ）─────────────────

function buildIdentityProof(a) {
  // B→A where B=A
  var bImplA = impl(a, a);

  // step1: A2(A, A→A, A)
  var step1 = makeA2(a, bImplA, a);

  // step2: A1(A, A→A) = A → ((A→A) → A)
  var step2 = makeA1(a, bImplA);

  // step3: MP(step2, step1) = (A→(A→A)) → (A→A)
  var step3Conclusion = impl(impl(a, bImplA), impl(a, a));
  var step3 = makeMP(step2, step1, step3Conclusion);

  // step4: A1(A, A) = A → (A→A)
  var step4 = makeA1(a, a);

  // step5: MP(step4, step3) = A→A
  var step5Conclusion = impl(a, a);
  return makeMP(step4, step3, step5Conclusion);
}

// ── メイン変換関数 ───────────────────────────────────────

function deductionTransform(proof, hypothesis) {
  switch (proof._tag) {
    case "AxiomNode":
      if (equalFormula(proof.formula, hypothesis)) {
        // ケース1: 仮定 A → A→A の恒等証明
        console.log("  [ケース1] 仮定一致: " + formatFormula(hypothesis));
        return buildIdentityProof(hypothesis);
      } else {
        // ケース2: 公理 C → A1(C,A) + MP で A→C
        var c = proof.formula;
        console.log("  [ケース2] 公理: " + formatFormula(c));
        var a1Node = makeA1(c, hypothesis);
        var cNode = { _tag: "AxiomNode", formula: c };
        var aImplC = impl(hypothesis, c);
        return makeMP(cNode, a1Node, aImplC);
      }

    case "ModusPonensNode":
      // ケース3: 再帰 + A2 + MP×2
      var d = proof.antecedent.formula;
      var e = proof.formula;
      console.log(
        "  [ケース3] MP: " +
          formatFormula(d) +
          " + " +
          formatFormula(impl(d, e)) +
          " → " +
          formatFormula(e),
      );

      // 再帰: A→D と A→(D→E) の証明を構築
      var aImplDProof = deductionTransform(proof.antecedent, hypothesis);
      var aImplDEProof = deductionTransform(proof.conditional, hypothesis);

      // A2(A, D, E)
      var a2Node = makeA2(hypothesis, d, e);

      // MP(A→(D→E), A2) = (A→D) → (A→E)
      var adToAE = impl(impl(hypothesis, d), impl(hypothesis, e));
      var mp1 = makeMP(aImplDEProof, a2Node, adToAE);

      // MP(A→D, (A→D)→(A→E)) = A→E
      var aImplE = impl(hypothesis, e);
      return makeMP(aImplDProof, mp1, aImplE);

    default:
      throw new Error("未対応のノード型: " + proof._tag);
  }
}
```

### 使用例（ワークスペース連携）

```javascript
// ワークスペースから証明木を抽出
var proof = extractHilbertProof();
console.log("元の結論: " + formatFormula(proof.formula));

// 仮定の論理式を指定（選択ノードから取得）
var selectedIds = getSelectedNodeIds();
var allNodes = getNodes();
var hypothesisText = null;
for (var i = 0; i < allNodes.length; i++) {
  if (allNodes[i].id === selectedIds[0]) {
    hypothesisText = allNodes[i].formulaText;
  }
}
var hypothesis = parseFormula(hypothesisText);

// 演繹定理を明示的に適用
console.log("=== 演繹定理の適用 ===");
console.log("仮定: " + formatFormula(hypothesis));
var transformed = deductionTransform(proof, hypothesis);
console.log("変換後の結論: " + formatFormula(transformed.formula));

// 結果をワークスペースに表示
displayHilbertProof(transformed);
```

## 5. 計算量と証明サイズの増大

演繹定理の変換は証明のサイズを**指数的に増大**させうる。

| 元のノード型          | 変換後の追加ノード数         |
| --------------------- | ---------------------------- |
| AxiomNode（仮定一致） | +4（恒等証明 5ステップ）     |
| AxiomNode（公理）     | +2（A1 + MP）                |
| ModusPonensNode       | +2（A2 + MP×2）+ 再帰2回     |
| GeneralizationNode    | +2（Gen + A5 + MP）+ 再帰1回 |

MPノードの場合、2つの部分木それぞれを再帰的に変換するため、変換後のサイズは最悪 $O(2^n)$（$n$ は元の証明の深さ）になりうる。

ただし、**共有される部分木がない場合**（木構造が真の木である場合）は、線形に近い増大になる。

## 6. 逆演繹定理

### 定理の主張

$$\Gamma \vdash A \to B \implies \Gamma \cup \{A\} \vdash B$$

$A \to B$ が証明できるならば、$A$ を仮定に加えることで $B$ が証明できる。

### なぜ重要か

演繹定理と逆演繹定理を組み合わせることで、「$\Gamma \cup \{A\} \vdash B$」と「$\Gamma \vdash A \to B$」が同値であることが示される。これにより:

- **証明の分解:** 複雑な含意 $A \to B$ の証明を、「$A$ を仮定して $B$ を示す」問題に帰着できる
- **仮定の再利用:** 既に証明された定理（含意の形）から、仮定付きの証明木を復元できる
- **演繹定理との往復:** 逆方向は「仮定を追加する」だけなので、演繹定理で除去した仮定を元に戻す操作に使える

### 変換アルゴリズム

逆方向は演繹定理と比べて非常にシンプル。場合分けなし、再帰なし。

**前提条件:** 証明木の結論が含意 $A \to B$ の形であること。

**構成（2ステップ）:**

| ステップ | 式  | 根拠                       |
| -------- | --- | -------------------------- |
| 1        | $A$ | 公理（新たに追加する仮定） |
| 2        | $B$ | MP(1, 元の証明)            |

**証明図:**

```
  A (仮定)     [A→B の証明]
  ────── (公理) ──────────── (元の証明)
    A              A→B
    ────────────────── (MP)
            B
```

### 例: $\vdash p \to p$ → $\{p\} \vdash p$

$p \to p$ の証明（5ステップ、セクション2ケース1参照）があるとする。

逆演繹定理を適用すると:

1. $p$ を仮定として追加
2. MP($p$, $p \to p$) = $p$

結果: 仮定 $\{p\}$ のもとで $p$ が証明できる（自明だが、正しい）。

### スクリプトでの明示的実装

```javascript
// ── ヘルパー ────────────────────────────────────────────

// MP(antecedentProof, conditionalProof) の証明ノードを構築
function makeMP(antecedentProof, conditionalProof, conclusion) {
  return {
    _tag: "ModusPonensNode",
    formula: conclusion,
    antecedent: antecedentProof,
    conditional: conditionalProof,
  };
}

// ── 逆演繹定理の変換 ───────────────────────────────────

function reverseDeductionTransform(proof) {
  // 結論が A→B の形であることを確認
  // ProofNodeJson の formula は FormulaJson（内部は encode 済み）
  // formula._tag でノード型を判定できる
  var conclusion = proof.formula;
  if (conclusion._tag !== "Implication") {
    throw new Error(
      "結論が含意の形ではありません: " + formatFormula(conclusion),
    );
  }
  var a = conclusion.left; // 仮定 A
  var b = conclusion.right; // 結論 B
  console.log("仮定として追加: " + formatFormula(a));
  console.log("導出される結論: " + formatFormula(b));
  // A を公理（仮定）として追加
  var aNode = { _tag: "AxiomNode", formula: a };
  // MP(A, A→B) = B
  return makeMP(aNode, proof, b);
}

// ── 使用例（ワークスペース連携）────────────────────────

// var proof = extractHilbertProof();
// console.log("元の結論: " + formatFormula(proof.formula));
// var transformed = reverseDeductionTransform(proof);
// console.log("変換後の結論: " + formatFormula(transformed.formula));
// displayHilbertProof(transformed);
```

### 計算量

逆演繹定理の変換は**定数時間**。元の証明木はそのまま保持され、新しく追加されるノードは AxiomNode($A$) と ModusPonensNode($B$) の2つのみ。

演繹定理の変換（最悪 $O(2^n)$）と対照的に、逆方向は常に $O(1)$ で完了する。

## 7. 実装リファレンス

- `src/lib/logic-core/deductionTheorem.ts` — 演繹定理の本体実装
- `src/lib/logic-core/deductionTheorem.test.ts` — テストケース
- `src/lib/script-runner/hilbertProofBridge.ts` — スクリプトブリッジ（組込み版）
- `src/lib/script-runner/templates.ts` — 既存テンプレート（組込み版）
- `dev/logic-reference/02-propositional-logic.md` — A1/A2/A3 公理の定義
