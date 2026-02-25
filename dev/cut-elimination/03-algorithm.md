# カット除去アルゴリズム

本ドキュメントでは、カット除去定理の証明を構成するアルゴリズムを TypeScript 風の疑似コードで記述する。各変換ケースにはreasoning（なぜその変換が正しいか）をコメントで付記し、具体例を添える。

> **前提知識:**
>
> - シーケント計算（LK）の基本: [01-sequent-calculus.md](./01-sequent-calculus.md)
> - カット規則とカット除去定理の主張・意義: [02-cut-elimination-theorem.md](./02-cut-elimination-theorem.md)

## 1. データ構造の定義

### 1.1 論理式

```typescript
type Formula =
  | {
      readonly tag: "Atom";
      readonly name: string;
      readonly terms: readonly Term[];
    }
  | { readonly tag: "Negation"; readonly body: Formula }
  | {
      readonly tag: "Implication";
      readonly left: Formula;
      readonly right: Formula;
    }
  | {
      readonly tag: "Conjunction";
      readonly left: Formula;
      readonly right: Formula;
    }
  | {
      readonly tag: "Disjunction";
      readonly left: Formula;
      readonly right: Formula;
    }
  | {
      readonly tag: "Universal";
      readonly variable: string;
      readonly body: Formula;
    }
  | {
      readonly tag: "Existential";
      readonly variable: string;
      readonly body: Formula;
    };
```

### 1.2 項

```typescript
type Term =
  | { readonly tag: "Variable"; readonly name: string }
  | {
      readonly tag: "Function";
      readonly name: string;
      readonly args: readonly Term[];
    };
```

### 1.3 シーケント

```typescript
// 多重集合は配列で表現（順序は問わない）
type Sequent = {
  readonly antecedent: readonly Formula[]; // Γ（前件）
  readonly succedent: readonly Formula[]; // Δ（後件）
};
```

### 1.4 証明木

```typescript
type Proof =
  | { readonly tag: "Axiom"; readonly formula: Formula }
  // 構造規則
  | {
      readonly tag: "WeakeningL";
      readonly added: Formula;
      readonly premise: Proof;
    }
  | {
      readonly tag: "WeakeningR";
      readonly added: Formula;
      readonly premise: Proof;
    }
  | {
      readonly tag: "ContractionL";
      readonly formula: Formula;
      readonly premise: Proof;
    }
  | {
      readonly tag: "ContractionR";
      readonly formula: Formula;
      readonly premise: Proof;
    }
  // 否定
  | {
      readonly tag: "NegationL";
      readonly formula: Formula;
      readonly premise: Proof;
    }
  | {
      readonly tag: "NegationR";
      readonly formula: Formula;
      readonly premise: Proof;
    }
  // 含意
  | {
      readonly tag: "ImplicationL";
      readonly formula: Formula;
      readonly leftPremise: Proof;
      readonly rightPremise: Proof;
    }
  | {
      readonly tag: "ImplicationR";
      readonly formula: Formula;
      readonly premise: Proof;
    }
  // 連言
  | {
      readonly tag: "ConjunctionL1";
      readonly formula: Formula;
      readonly premise: Proof;
    }
  | {
      readonly tag: "ConjunctionL2";
      readonly formula: Formula;
      readonly premise: Proof;
    }
  | {
      readonly tag: "ConjunctionR";
      readonly formula: Formula;
      readonly leftPremise: Proof;
      readonly rightPremise: Proof;
    }
  // 選言
  | {
      readonly tag: "DisjunctionL";
      readonly formula: Formula;
      readonly leftPremise: Proof;
      readonly rightPremise: Proof;
    }
  | {
      readonly tag: "DisjunctionR1";
      readonly formula: Formula;
      readonly premise: Proof;
    }
  | {
      readonly tag: "DisjunctionR2";
      readonly formula: Formula;
      readonly premise: Proof;
    }
  // 全称量化
  | {
      readonly tag: "UniversalL";
      readonly formula: Formula;
      readonly term: Term;
      readonly premise: Proof;
    }
  | {
      readonly tag: "UniversalR";
      readonly formula: Formula;
      readonly eigenvariable: string;
      readonly premise: Proof;
    }
  // 存在量化
  | {
      readonly tag: "ExistentialL";
      readonly formula: Formula;
      readonly eigenvariable: string;
      readonly premise: Proof;
    }
  | {
      readonly tag: "ExistentialR";
      readonly formula: Formula;
      readonly term: Term;
      readonly premise: Proof;
    }
  // カット規則
  | {
      readonly tag: "Cut";
      readonly cutFormula: Formula;
      readonly leftPremise: Proof;
      readonly rightPremise: Proof;
    };
```

### 1.5 補助関数

```typescript
// 論理式の複雑度（論理結合子の深さ）
function complexity(f: Formula): number {
  switch (f.tag) {
    case "Atom":
      return 0;
    case "Negation":
      return complexity(f.body) + 1;
    case "Implication":
      return Math.max(complexity(f.left), complexity(f.right)) + 1;
    case "Conjunction":
      return Math.max(complexity(f.left), complexity(f.right)) + 1;
    case "Disjunction":
      return Math.max(complexity(f.left), complexity(f.right)) + 1;
    case "Universal":
      return complexity(f.body) + 1;
    case "Existential":
      return complexity(f.body) + 1;
  }
}

// 証明の結論シーケントを取得
function conclusion(proof: Proof): Sequent {
  /* ... */
}

// 論理式中の変数 x を項 t で置換: A[t/x]
function substituteVar(
  formula: Formula,
  variable: string,
  term: Term,
): Formula {
  /* ... */
}

// 証明中のカット式の最大複雑度（カット階数）
function cutRank(proof: Proof): number {
  /* ... */
}
```

## 2. カット除去アルゴリズムの全体構造

### 2.1 メインエントリーポイント

```typescript
/**
 * カット除去アルゴリズム: 証明からすべてのカット規則を除去する。
 *
 * 【戦略】二重帰納法（Gentzen のオリジナル手法）:
 *   - 外側: 証明中のカット式の最大複雑度 c に関する帰納法
 *   - 内側: 最大複雑度 c のカットに注目し、その段数に関する帰納法
 *
 * 【停止性の保証】
 *   各変換は以下のいずれかを厳密に減少させる:
 *   (1) カット式の最大複雑度（外側の帰納法の指標）
 *   (2) 同じ複雑度のカットの段数（内側の帰納法の指標）
 *   自然数の整列性により、有限回で停止する。
 */
function eliminateCuts(proof: Proof): Proof {
  // 証明木を再帰的に走査し、カットノードを見つけたら除去を試みる
  // ボトムアップ（葉から根に向かって）で処理する

  // カットが存在しなくなるまで繰り返す
  // Reasoning: 各反復でカット階数が厳密に減少するか、同じ階数のカット数が減少する
  // よって、有限回で停止する

  let current = proof;
  while (cutRank(current) > 0) {
    current = reduceTopCut(current);
  }
  return current;
}
```

### 2.2 最も深いカットの削減

```typescript
/**
 * 証明木中の「最も上にある」（葉に近い）カットを1つ選び、変換する。
 *
 * Reasoning: カットが入れ子になっている場合、最も上のカットは
 * その前提にカットを含まない（または含んでいてもそれは先に処理される）。
 * ボトムアップで処理することで、前提を「クリーン」にしてから
 * 外側のカットを処理できる。
 */
function reduceTopCut(proof: Proof): Proof {
  switch (proof.tag) {
    case "Cut": {
      // まず前提を再帰的に処理
      const left = reduceTopCut(proof.leftPremise);
      const right = reduceTopCut(proof.rightPremise);
      // 前提が処理済みなら、このカットを変換
      return reduceCut(proof.cutFormula, left, right);
    }
    // 他のすべての規則は前提を再帰的に処理するだけ
    case "Axiom":
      return proof;
    case "WeakeningL":
      return { ...proof, premise: reduceTopCut(proof.premise) };
    case "WeakeningR":
      return { ...proof, premise: reduceTopCut(proof.premise) };
    // ... 他の規則も同様（すべての前提を再帰的に処理）
    default:
      // 各規則の前提を再帰的に走査
      return mapPremises(proof, reduceTopCut);
  }
}
```

### 2.3 カット1つの削減（核心）

```typescript
/**
 * 単一のカットを削減する。
 *
 *   leftProof: Γ ⊢ Δ, A を証明
 *   rightProof: A, Σ ⊢ Π を証明
 *   cutFormula: A（カット式）
 *
 * 結果: Γ, Σ ⊢ Δ, Π のカットなし（または複雑度の低いカット）証明
 *
 * 【場合分けの構造】
 * 左前提と右前提の「最後の規則」に応じて4つのケースに分かれる:
 *   Case 1: 左 or 右が公理 → カットを即座に除去
 *   Case 2: A がどちらかの前提で非主式 → カットを上に持ち上げ（段数減少）
 *   Case 3: A が両方で主式 → カット式を分解（複雑度減少）
 *   Case 4: 構造規則との相互作用 → 特別な処理
 */
function reduceCut(
  cutFormula: Formula,
  leftProof: Proof,
  rightProof: Proof,
): Proof {
  // ── Case 1: 公理とのカット ──
  if (leftProof.tag === "Axiom") {
    return reduceCutAxiomLeft(cutFormula, leftProof, rightProof);
  }
  if (rightProof.tag === "Axiom") {
    return reduceCutAxiomRight(cutFormula, leftProof, rightProof);
  }

  // ── Case 4: 構造規則との相互作用 ──
  // 弱化・縮約は非主式ケースより先に処理する
  // （弱化でカット式が導入された場合は特殊処理が必要なため）
  if (isWeakeningOnCutFormula(leftProof, cutFormula)) {
    return reduceCutWeakeningLeft(cutFormula, leftProof, rightProof);
  }
  if (isWeakeningOnCutFormula(rightProof, cutFormula)) {
    return reduceCutWeakeningRight(cutFormula, leftProof, rightProof);
  }
  if (isContractionOnCutFormula(leftProof, cutFormula)) {
    return reduceCutContractionLeft(cutFormula, leftProof, rightProof);
  }
  if (isContractionOnCutFormula(rightProof, cutFormula)) {
    return reduceCutContractionRight(cutFormula, leftProof, rightProof);
  }

  // ── Case 3: 両方で主式 (Principal Case) ──
  if (
    isPrincipal(leftProof, cutFormula) &&
    isPrincipal(rightProof, cutFormula)
  ) {
    return reducePrincipalCut(cutFormula, leftProof, rightProof);
  }

  // ── Case 2: 非主式 (Non-principal Case) ──
  // カット式がどちらかで非主式 → カットを上に持ち上げる
  if (!isPrincipal(leftProof, cutFormula)) {
    return pushCutUpLeft(cutFormula, leftProof, rightProof);
  }
  return pushCutUpRight(cutFormula, leftProof, rightProof);
}
```

## 3. Case 1: 公理とのカット（Axiom Case）

### 3.1 疑似コード

```typescript
/**
 * Case 1a: 左前提が公理 A ⊢ A の場合
 *
 *     A ⊢ A     A, Σ ⊢ Π
 *   ──────────────────────── (Cut)    ⟹    A, Σ ⊢ Π
 *        A, Σ ⊢ Π
 *
 * Reasoning:
 *   公理 A ⊢ A は「A が成り立つなら A が成り立つ」という自明な主張。
 *   左前提が公理の場合、カットの結論 A, Σ ⊢ Π は右前提そのものに一致する。
 *   （カット規則の定義: Γ=A, Δ=∅ なので、結論は A, Σ ⊢ Π。）
 *   よってカットは不要であり、右前提をそのまま返せばよい。
 */
function reduceCutAxiomLeft(
  cutFormula: Formula,
  leftProof: Proof, // Axiom: A ⊢ A
  rightProof: Proof, // A, Σ ⊢ Π
): Proof {
  // 右前提がそのまま答え
  return rightProof;
}

/**
 * Case 1b: 右前提が公理 A ⊢ A の場合
 *
 *   Γ ⊢ Δ, A     A ⊢ A
 *   ──────────────────── (Cut)    ⟹    Γ ⊢ Δ, A
 *       Γ ⊢ Δ, A
 *
 * Reasoning:
 *   右前提が公理 A ⊢ A の場合、Σ=∅, Π=A なので、
 *   カットの結論は Γ ⊢ Δ, A（弱化で A を後件に追加したもの）。
 *   しかし左前提が既に Γ ⊢ Δ, A を証明しているので、カットは不要。
 */
function reduceCutAxiomRight(
  cutFormula: Formula,
  leftProof: Proof, // Γ ⊢ Δ, A
  rightProof: Proof, // Axiom: A ⊢ A
): Proof {
  // 左前提がそのまま答え
  return leftProof;
}
```

### 3.2 具体例

**例: 左前提が公理**

```
変換前:
    P ⊢ P     P, Q ⊢ R
  ────────────────────── (Cut on P)
       P, Q ⊢ R

変換後:
    P, Q ⊢ R
```

カットの結論 `P, Q ⊢ R` は右前提そのものなので、カットを除去しても証明は成立する。

**例: 右前提が公理**

```
変換前:
  P → Q ⊢ P, P → Q     P → Q ⊢ P → Q
  ──────────────────────────────────── (Cut on P → Q)
         P → Q ⊢ P, P → Q

変換後:
  P → Q ⊢ P, P → Q
```

## 4. Case 2: 非主式ケース（Non-principal Case）

カット式 `A` が直前の規則で導入された式（主式）ではなく、コンテキストとして受け継がれただけの場合。

### 4.1 基本的なアイデア

カットを「上に持ち上げる」（pushing up）。直前の規則をカットの下に移動し、カットを前提の位置に押し上げる。

**効果:** カットの段数（カットの上にある証明の深さ）が減少する。内側の帰納法の指標が減少するため、有限回で公理ケースに到達する。

### 4.2 左前提が非主式の場合

```typescript
/**
 * Case 2a: カット式 A が左前提の最後の規則の非主式である場合
 *
 * 左前提の最後の規則 R が前提1つの場合の一般形:
 *
 *        π₁
 *     ─────────── (R)      π₂
 *    Γ ⊢ Δ, A          A, Σ ⊢ Π
 *   ──────────────────────────── (Cut)
 *           Γ', Σ ⊢ Δ', Π
 *
 * ここで R は A を主式として導入していない（A はコンテキストの一部）。
 *
 * 変換後:
 *
 *      π₁           π₂
 *    ─────────  A, Σ ⊢ Π
 *   ──────────────────── (Cut)    ← カットの段数が減少
 *        ...
 *   ─────────── (R)
 *    Γ', Σ ⊢ Δ', Π
 *
 * Reasoning:
 *   規則 R は A を操作していないので、R をカットの下に「降ろす」ことができる。
 *   カットは R の前提に対して行われるため、段数が 1 減少する。
 *   内側の帰納法により、いずれ Case 1 か Case 3 に到達する。
 */
function pushCutUpLeft(
  cutFormula: Formula,
  leftProof: Proof,
  rightProof: Proof,
): Proof {
  switch (leftProof.tag) {
    // ── 1前提の論理規則（A が非主式） ──

    case "NegationR": {
      // 左前提:
      //     π: B, Γ ⊢ Δ, A
      //   ──────────────────── (¬R)
      //    Γ ⊢ Δ, ¬B, A        （A は ¬B ではない = 非主式）
      //
      // 変換: カットを π の位置に持ち上げる
      //     π: B, Γ ⊢ Δ, A     A, Σ ⊢ Π
      //   ──────────────────────────────── (Cut on A)
      //          B, Γ, Σ ⊢ Δ, Π
      //   ──────────────────────── (¬R)
      //        Γ, Σ ⊢ Δ, Π, ¬B
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return { tag: "NegationR", formula: leftProof.formula, premise: newCut };
    }

    case "ImplicationR": {
      // 左前提:
      //     π: B, Γ ⊢ Δ, C, A
      //   ──────────────────────── (→R)
      //    Γ ⊢ Δ, B → C, A        （A は B → C ではない = 非主式）
      //
      // 変換: カットを π に持ち上げ
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "ImplicationR",
        formula: leftProof.formula,
        premise: newCut,
      };
    }

    case "ImplicationL": {
      // 左前提:
      //     π₁: Γ₁ ⊢ Δ₁, B, A     π₂: C, Γ₂ ⊢ Δ₂, A
      //   ──────────────────────────────────────────────── (→L)
      //        B → C, Γ₁, Γ₂ ⊢ Δ₁, Δ₂, A
      //
      // A が非主式 = A は B → C ではない
      // A は π₁ と π₂ の両方に出現しうる
      //
      // 変換: 両方の前提でカットを行う
      //     π₁: Γ₁ ⊢ Δ₁, B, A     A, Σ ⊢ Π
      //   ────────────────────────────────── (Cut)
      //        Γ₁, Σ ⊢ Δ₁, B, Π
      //
      //     π₂: C, Γ₂ ⊢ Δ₂, A     A, Σ ⊢ Π
      //   ────────────────────────────────── (Cut)
      //        C, Γ₂, Σ ⊢ Δ₂, Π
      //
      //   ──────────────────────────────── (→L)
      //     B → C, Γ₁, Γ₂, Σ, Σ ⊢ Δ₁, Δ₂, B, Π, Π
      //
      // Reasoning:
      //   2前提規則の場合、A は両前提に出現しうる。
      //   各前提でカットを行い、元の規則を再適用する。
      //   注意: Σ と Π が重複するが、必要に応じて縮約で整理できる。
      //   段数はいずれの場合も減少する。
      const newLeft = reduceCut(cutFormula, leftProof.leftPremise, rightProof);
      const newRight = reduceCut(
        cutFormula,
        leftProof.rightPremise,
        rightProof,
      );
      return {
        tag: "ImplicationL",
        formula: leftProof.formula,
        leftPremise: newLeft,
        rightPremise: newRight,
      };
    }

    // ── 連言 ──
    case "ConjunctionL1": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "ConjunctionL1",
        formula: leftProof.formula,
        premise: newCut,
      };
    }
    case "ConjunctionL2": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "ConjunctionL2",
        formula: leftProof.formula,
        premise: newCut,
      };
    }
    case "ConjunctionR": {
      const newLeft = reduceCut(cutFormula, leftProof.leftPremise, rightProof);
      const newRight = reduceCut(
        cutFormula,
        leftProof.rightPremise,
        rightProof,
      );
      return {
        tag: "ConjunctionR",
        formula: leftProof.formula,
        leftPremise: newLeft,
        rightPremise: newRight,
      };
    }

    // ── 選言 ──
    case "DisjunctionL": {
      const newLeft = reduceCut(cutFormula, leftProof.leftPremise, rightProof);
      const newRight = reduceCut(
        cutFormula,
        leftProof.rightPremise,
        rightProof,
      );
      return {
        tag: "DisjunctionL",
        formula: leftProof.formula,
        leftPremise: newLeft,
        rightPremise: newRight,
      };
    }
    case "DisjunctionR1": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "DisjunctionR1",
        formula: leftProof.formula,
        premise: newCut,
      };
    }
    case "DisjunctionR2": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "DisjunctionR2",
        formula: leftProof.formula,
        premise: newCut,
      };
    }

    // ── 否定 ──
    case "NegationL": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return { tag: "NegationL", formula: leftProof.formula, premise: newCut };
    }

    // ── 量化子 ──
    case "UniversalL": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "UniversalL",
        formula: leftProof.formula,
        term: leftProof.term,
        premise: newCut,
      };
    }
    case "UniversalR": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "UniversalR",
        formula: leftProof.formula,
        eigenvariable: leftProof.eigenvariable,
        premise: newCut,
      };
    }
    case "ExistentialL": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "ExistentialL",
        formula: leftProof.formula,
        eigenvariable: leftProof.eigenvariable,
        premise: newCut,
      };
    }
    case "ExistentialR": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "ExistentialR",
        formula: leftProof.formula,
        term: leftProof.term,
        premise: newCut,
      };
    }

    // ── 構造規則（A が非主式の場合）──
    case "WeakeningL": {
      // 弱化で追加されたのは A ではない（A が非主式）
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return { tag: "WeakeningL", added: leftProof.added, premise: newCut };
    }
    case "WeakeningR": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return { tag: "WeakeningR", added: leftProof.added, premise: newCut };
    }
    case "ContractionL": {
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "ContractionL",
        formula: leftProof.formula,
        premise: newCut,
      };
    }
    case "ContractionR": {
      // 縮約されたのは A ではない（A が非主式）
      const newCut = reduceCut(cutFormula, leftProof.premise, rightProof);
      return {
        tag: "ContractionR",
        formula: leftProof.formula,
        premise: newCut,
      };
    }

    default:
      throw new Error("Unexpected proof structure");
  }
}
```

### 4.3 右前提が非主式の場合

```typescript
/**
 * Case 2b: カット式 A が右前提の最後の規則の非主式である場合
 *
 * 左前提と完全に対称的。右前提の規則をカットの下に降ろす。
 *
 * 一般形:
 *
 *    π₁                 π₂
 *   Γ ⊢ Δ, A        ─────── (R)
 *                   A, Σ ⊢ Π
 *   ──────────────────────── (Cut)
 *        Γ, Σ' ⊢ Δ, Π'
 *
 * 変換後:
 *
 *   π₁            π₂
 *   Γ ⊢ Δ, A    ─────
 *   ──────────────── (Cut)    ← 段数減少
 *        ...
 *   ─────── (R)
 *   Γ, Σ' ⊢ Δ, Π'
 */
function pushCutUpRight(
  cutFormula: Formula,
  leftProof: Proof,
  rightProof: Proof,
): Proof {
  // pushCutUpLeft と対称的な処理
  // 右前提の各規則について、その前提でカットを行い、規則を再適用する
  // 実装は pushCutUpLeft の左右対称版
  // ...（省略: 構造は pushCutUpLeft と同一）
  switch (rightProof.tag) {
    case "NegationL": {
      // 右前提:
      //     π: Γ₂ ⊢ Δ₂, B
      //   ──────────────── (¬L)
      //    A, ¬B, Γ₂ ⊢ Δ₂       （A は ¬B ではない）
      //
      // 変換:
      //   Γ ⊢ Δ, A     π: Γ₂ ⊢ Δ₂, B
      //   ... ここで A が π の前件に出現する場合はカットを行う ...
      //   ──────────── (¬L)
      const newCut = reduceCut(cutFormula, leftProof, rightProof.premise);
      return { tag: "NegationL", formula: rightProof.formula, premise: newCut };
    }

    // ... 他の規則も pushCutUpLeft と対称的に処理
    // （左前提の場合の鏡像）

    default:
      throw new Error("Unexpected proof structure");
  }
}
```

### 4.4 具体例

**例: 左前提で弱化（非主式）後にカット**

```
変換前:
       P ⊢ P        (Ax)
    ──────────── (WL)           P, Q ⊢ R
     Q, P ⊢ P
  ──────────────────────── (Cut on P)
        Q, P, Q ⊢ R

変換後:
    P ⊢ P     P, Q ⊢ R
  ──────────────────────── (Cut on P)     ← 段数 1 減少
        P, Q ⊢ R
  ──────────────── (WL)
     Q, P, Q ⊢ R
```

弱化規則 (WL) はカット式 `P` を操作していない（`Q` を追加しただけ）ので、カットを弱化の前提に持ち上げることができる。

**例: 左前提で →R（非主式）後にカット**

```
変換前:
       B, Γ ⊢ Δ, C, A
    ────────────────────── (→R)         A, Σ ⊢ Π
     Γ ⊢ Δ, B → C, A
  ──────────────────────────────── (Cut on A)
        Γ, Σ ⊢ Δ, B → C, Π

変換後:
    B, Γ ⊢ Δ, C, A     A, Σ ⊢ Π
  ──────────────────────────────── (Cut on A)     ← 段数 1 減少
        B, Γ, Σ ⊢ Δ, C, Π
  ──────────────────────── (→R)
     Γ, Σ ⊢ Δ, B → C, Π
```

## 5. Case 3: 主式ケース（Principal Case / Key Case）

**最も重要なケース。** カット式 `A` が左前提でも右前提でも主式（その規則で導入された式）である場合。

### 5.1 基本方針

カット式 `A` の構造（最外の論理結合子）に応じた変換を行う。変換後のカット式は元のカット式の**真部分式**であるため、複雑度が厳密に減少する。

これが外側の帰納法の進む部分であり、カット除去アルゴリズムの核心である。

```typescript
/**
 * Principal Cut の削減
 *
 * 【前提条件】
 * - leftProof の最後の規則は cutFormula を右に導入する規則
 * - rightProof の最後の規則は cutFormula を左に導入する規則
 *
 * 【保証】
 * 変換後のカット式の複雑度は cutFormula より厳密に小さい
 * （真部分式に対するカットに置き換わるため）
 */
function reducePrincipalCut(
  cutFormula: Formula,
  leftProof: Proof,
  rightProof: Proof,
): Proof {
  switch (cutFormula.tag) {
    case "Negation":
      return reducePrincipalNegation(cutFormula, leftProof, rightProof);
    case "Implication":
      return reducePrincipalImplication(cutFormula, leftProof, rightProof);
    case "Conjunction":
      return reducePrincipalConjunction(cutFormula, leftProof, rightProof);
    case "Disjunction":
      return reducePrincipalDisjunction(cutFormula, leftProof, rightProof);
    case "Universal":
      return reducePrincipalUniversal(cutFormula, leftProof, rightProof);
    case "Existential":
      return reducePrincipalExistential(cutFormula, leftProof, rightProof);
    case "Atom":
      // 原子式のカットでは、両方が主式であることは公理ケース（Case 1）でのみ生じる。
      // ここに到達することはない。
      throw new Error(
        "Atomic principal cut should have been handled by axiom case",
      );
  }
}
```

### 5.2 否定のケース: A = ¬B

```typescript
/**
 * 否定の Principal Cut
 *
 * 左前提（¬R を適用）:         右前提（¬L を適用）:
 *
 *     Γ ⊢ Δ, B                   B, Σ ⊢ Π
 *   ────────────── (¬R)        ──────────── (¬L)
 *    Γ ⊢ Δ, ¬B                 ¬B, Σ ⊢ Π
 *
 * カット（変換前）:
 *
 *    Γ ⊢ Δ, ¬B     ¬B, Σ ⊢ Π
 *   ──────────────────────────── (Cut on ¬B)
 *         Γ, Σ ⊢ Δ, Π
 *
 * 変換後:
 *
 *    Γ ⊢ Δ, B     B, Σ ⊢ Π
 *   ──────────────────────────── (Cut on B)
 *         Γ, Σ ⊢ Δ, Π
 *
 * Reasoning:
 *   ¬R は「Γ ⊢ Δ, B を証明して ¬B を後件に導入」する規則。
 *   ¬L は「B, Σ ⊢ Π を証明して ¬B を前件に導入」する規則。
 *   つまり、¬B を介さずとも B で直接カットできる。
 *   新しいカット式 B は ¬B の真部分式なので、
 *   complexity(B) < complexity(¬B) = complexity(B) + 1。
 *   外側の帰納法の指標が 1 減少する。
 */
function reducePrincipalNegation(
  cutFormula: Formula & { readonly tag: "Negation" },
  leftProof: Proof, // tag === "NegationR"
  rightProof: Proof, // tag === "NegationL"
): Proof {
  // leftProof.premise: Γ ⊢ Δ, B を証明
  // rightProof.premise: B, Σ ⊢ Π を証明
  const innerCutFormula = cutFormula.body; // B
  return reduceCut(
    innerCutFormula,
    (leftProof as { readonly premise: Proof }).premise, // Γ ⊢ Δ, B
    (rightProof as { readonly premise: Proof }).premise, // B, Σ ⊢ Π
  );
}
```

**具体例:**

```
変換前:
       P ⊢ P, Q    (WR)             Q, R ⊢ R    (WL)
    ──────────────── (¬R)          ──────────── (¬L)
     P ⊢ P, ¬Q                    ¬Q, R ⊢ R
  ──────────────────────────────── (Cut on ¬Q)
           P, R ⊢ P, R

変換後:
    P ⊢ P, Q     Q, R ⊢ R
  ────────────────────────── (Cut on Q)     ← complexity: 1 → 0
         P, R ⊢ P, R
```

### 5.3 含意のケース: A = B → C

```typescript
/**
 * 含意の Principal Cut
 *
 * 左前提（→R を適用）:         右前提（→L を適用）:
 *
 *     B, Γ ⊢ Δ, C                Σ₁ ⊢ Π₁, B     C, Σ₂ ⊢ Π₂
 *   ──────────────── (→R)      ──────────────────────────────── (→L)
 *    Γ ⊢ Δ, B → C              B → C, Σ₁, Σ₂ ⊢ Π₁, Π₂
 *
 * カット（変換前）:
 *
 *    Γ ⊢ Δ, B → C     B → C, Σ₁, Σ₂ ⊢ Π₁, Π₂
 *   ──────────────────────────────────────────── (Cut on B → C)
 *              Γ, Σ₁, Σ₂ ⊢ Δ, Π₁, Π₂
 *
 * 変換後:
 *
 *                          Σ₁ ⊢ Π₁, B     B, Γ ⊢ Δ, C
 *                         ────────────────────────────── (Cut on B)
 *                              Σ₁, Γ ⊢ Π₁, Δ, C
 *                                                        C, Σ₂ ⊢ Π₂
 *                         ──────────────────────────────────────── (Cut on C)
 *                              Σ₁, Γ, Σ₂ ⊢ Π₁, Δ, Π₂
 *
 * Reasoning:
 *   →R は「B を仮定して C を証明」することで B → C を導入。
 *   →L は「B を証明する部分」と「C を仮定して使う部分」に分解。
 *
 *   B → C を介さず、直接:
 *   (1) →L の左前提 Σ₁ ⊢ Π₁, B で得られる B を、
 *       →R の前提 B, Γ ⊢ Δ, C と B でカットして C を得る
 *   (2) 得られた C を、→L の右前提 C, Σ₂ ⊢ Π₂ とカットする
 *
 *   新しいカット式 B と C はそれぞれ B → C の真部分式:
 *     complexity(B) < complexity(B → C)
 *     complexity(C) < complexity(B → C)
 *   外側の帰納法の指標が厳密に減少する。
 */
function reducePrincipalImplication(
  cutFormula: Formula & { readonly tag: "Implication" },
  leftProof: Proof, // tag === "ImplicationR"
  rightProof: Proof, // tag === "ImplicationL"
): Proof {
  const B = cutFormula.left;
  const C = cutFormula.right;

  // leftProof.premise: B, Γ ⊢ Δ, C
  // rightProof.leftPremise: Σ₁ ⊢ Π₁, B
  // rightProof.rightPremise: C, Σ₂ ⊢ Π₂
  const leftInner = (leftProof as { readonly premise: Proof }).premise;
  const rightLeft = (rightProof as { readonly leftPremise: Proof }).leftPremise;
  const rightRight = (rightProof as { readonly rightPremise: Proof })
    .rightPremise;

  // Step 1: B でカット
  //   rightLeft: Σ₁ ⊢ Π₁, B  と  leftInner: B, Γ ⊢ Δ, C
  const cutOnB = reduceCut(B, rightLeft, leftInner);
  // 結果: Σ₁, Γ ⊢ Π₁, Δ, C

  // Step 2: C でカット
  //   cutOnB: Σ₁, Γ ⊢ Π₁, Δ, C  と  rightRight: C, Σ₂ ⊢ Π₂
  const cutOnC = reduceCut(C, cutOnB, rightRight);
  // 結果: Σ₁, Γ, Σ₂ ⊢ Π₁, Δ, Π₂

  return cutOnC;
}
```

**具体例:**

```
変換前:

     A, P ⊢ Q, B         (π₁)
  ──────────────────── (→R)            R ⊢ S, A    (π₂)    B, T ⊢ U    (π₃)
   P ⊢ Q, A → B                     ─────────────────────────────── (→L)
                                       A → B, R, T ⊢ S, U
  ──────────────────────────────────────────────────────── (Cut on A → B)
                    P, R, T ⊢ Q, S, U

変換後:

                     R ⊢ S, A    (π₂)    A, P ⊢ Q, B    (π₁)
                    ──────────────────────────────────── (Cut on A)
                           R, P ⊢ S, Q, B
                                                  B, T ⊢ U    (π₃)
                    ──────────────────────────────────── (Cut on B)
                           R, P, T ⊢ S, Q, U

complexity(A) < complexity(A → B), complexity(B) < complexity(A → B)
```

### 5.4 連言のケース: A = B ∧ C

```typescript
/**
 * 連言の Principal Cut
 *
 * 左前提（∧R を適用）:
 *
 *   Γ ⊢ Δ, B     Γ ⊢ Δ, C
 *  ────────────────────────── (∧R)
 *       Γ ⊢ Δ, B ∧ C
 *
 * 右前提（∧L₁ を適用した場合）:
 *
 *     B, Σ ⊢ Π
 *   ────────────── (∧L₁)
 *    B ∧ C, Σ ⊢ Π
 *
 * 変換後:
 *
 *   Γ ⊢ Δ, B     B, Σ ⊢ Π
 *  ──────────────────────────── (Cut on B)
 *        Γ, Σ ⊢ Δ, Π
 *
 * Reasoning:
 *   ∧R は B と C の両方を証明して B ∧ C を導入。
 *   ∧L₁ は B ∧ C から B だけを取り出す。
 *   よって B の証明（∧R の左前提）を直接使えばよい。
 *   C の証明（∧R の右前提）は使われない。
 *   新カット式 B は B ∧ C の真部分式なので複雑度が減少。
 *
 * 右前提が ∧L₂ の場合は対称的に C でカットする。
 */
function reducePrincipalConjunction(
  cutFormula: Formula & { readonly tag: "Conjunction" },
  leftProof: Proof, // tag === "ConjunctionR"
  rightProof: Proof, // tag === "ConjunctionL1" or "ConjunctionL2"
): Proof {
  const leftL = (leftProof as { readonly leftPremise: Proof }).leftPremise; // Γ ⊢ Δ, B
  const leftR = (leftProof as { readonly rightPremise: Proof }).rightPremise; // Γ ⊢ Δ, C
  const rightInner = (rightProof as { readonly premise: Proof }).premise;

  if (rightProof.tag === "ConjunctionL1") {
    // ∧L₁: B, Σ ⊢ Π
    return reduceCut(cutFormula.left, leftL, rightInner); // Cut on B
  } else {
    // ∧L₂: C, Σ ⊢ Π
    return reduceCut(cutFormula.right, leftR, rightInner); // Cut on C
  }
}
```

**具体例 (∧L₁):**

```
変換前:
   P ⊢ P, Q    (WR)     P ⊢ P, R    (WR)
  ────────────────────────────────── (∧R)       Q, S ⊢ T   (π₃)
       P ⊢ P, Q ∧ R                          ──────────── (∧L₁)
                                               Q ∧ R, S ⊢ T
  ──────────────────────────────────────────── (Cut on Q ∧ R)
              P, S ⊢ P, T

変換後:
   P ⊢ P, Q     Q, S ⊢ T
  ────────────────────────── (Cut on Q)     ← complexity 減少
        P, S ⊢ P, T
```

### 5.5 選言のケース: A = B ∨ C

```typescript
/**
 * 選言の Principal Cut
 *
 * 左前提（∨R₁ を適用した場合）:
 *
 *    Γ ⊢ Δ, B
 *   ────────────── (∨R₁)
 *    Γ ⊢ Δ, B ∨ C
 *
 * 右前提（∨L を適用）:
 *
 *   B, Σ₁ ⊢ Π₁     C, Σ₂ ⊢ Π₂
 *  ──────────────────────────────── (∨L)
 *      B ∨ C, Σ₁, Σ₂ ⊢ Π₁, Π₂
 *
 * 変換後:
 *
 *   Γ ⊢ Δ, B     B, Σ₁ ⊢ Π₁
 *  ──────────────────────────── (Cut on B)
 *        Γ, Σ₁ ⊢ Δ, Π₁
 *  （Σ₂, Π₂ の分は弱化で補う）
 *
 * Reasoning:
 *   ∨R₁ は B を証明して B ∨ C を導入。
 *   ∨L は B のケースと C のケースに場合分け。
 *   左前提で B が証明されているので、B のケース（∨L の左前提）のみが関連。
 *   C のケース（∨L の右前提）は使われない。
 *   新カット式 B は B ∨ C の真部分式なので複雑度が減少。
 *
 * ∨R₂ の場合は対称的に C でカットする。
 */
function reducePrincipalDisjunction(
  cutFormula: Formula & { readonly tag: "Disjunction" },
  leftProof: Proof, // tag === "DisjunctionR1" or "DisjunctionR2"
  rightProof: Proof, // tag === "DisjunctionL"
): Proof {
  const rightL = (rightProof as { readonly leftPremise: Proof }).leftPremise; // B, Σ₁ ⊢ Π₁
  const rightR = (rightProof as { readonly rightPremise: Proof }).rightPremise; // C, Σ₂ ⊢ Π₂

  if (leftProof.tag === "DisjunctionR1") {
    // ∨R₁: Γ ⊢ Δ, B
    const leftInner = (leftProof as { readonly premise: Proof }).premise;
    return reduceCut(cutFormula.left, leftInner, rightL); // Cut on B
  } else {
    // ∨R₂: Γ ⊢ Δ, C
    const leftInner = (leftProof as { readonly premise: Proof }).premise;
    return reduceCut(cutFormula.right, leftInner, rightR); // Cut on C
  }
}
```

**具体例 (∨R₁):**

```
変換前:
     P ⊢ P          (Ax)
  ──────────── (∨R₁)            P, Q ⊢ R    (π₂)    S, T ⊢ U    (π₃)
   P ⊢ P ∨ S                  ──────────────────────────────── (∨L)
                                P ∨ S, Q, T ⊢ R, U
  ──────────────────────────────────────────────── (Cut on P ∨ S)
              P, Q, T ⊢ P, R, U

変換後:
   P ⊢ P     P, Q ⊢ R
  ──────────────────── (Cut on P)     ← complexity 減少
       P, Q ⊢ P, R
  （T, U の分は弱化で補う）
```

### 5.6 全称量化のケース: A = ∀x.B

```typescript
/**
 * 全称量化の Principal Cut
 *
 * 左前提（∀R を適用）:           右前提（∀L を適用）:
 *
 *    Γ ⊢ Δ, B[y/x]                B[t/x], Σ ⊢ Π
 *   ──────────────── (∀R)       ──────────────── (∀L)
 *    Γ ⊢ Δ, ∀x.B                ∀x.B, Σ ⊢ Π
 *
 * ここで y は ∀R の固有変数（Γ, Δ に自由に出現しない）
 *
 * 変換後:
 *
 *   Γ ⊢ Δ, B[t/x]     B[t/x], Σ ⊢ Π
 *  ──────────────────────────────────── (Cut on B[t/x])
 *           Γ, Σ ⊢ Δ, Π
 *
 * Reasoning:
 *   ∀R は固有変数 y で B[y/x] を証明し、∀x.B を導入。
 *   ∀L は項 t で例化して B[t/x] を前件に入れる。
 *
 *   y は固有変数（Γ, Δ に自由に出現しない）なので、
 *   左前提の証明 π₁ 中の y を t で置き換えても証明は有効。
 *   これにより π₁ は Γ ⊢ Δ, B[t/x] の証明になる。
 *
 *   新カット式 B[t/x] は ∀x.B の真部分式（の代入例）:
 *     complexity(B[t/x]) = complexity(B) < complexity(∀x.B) = complexity(B) + 1
 *   （代入は複雑度を変えない — 構造的な深さは同じ。）
 *   外側の帰納法の指標が 1 減少する。
 *
 * 注意:
 *   固有変数条件が y の t による置換を正当化する。
 *   y が Γ, Δ に出現しないため、置換は証明の他の部分に影響しない。
 */
function reducePrincipalUniversal(
  cutFormula: Formula & { readonly tag: "Universal" },
  leftProof: Proof, // tag === "UniversalR"
  rightProof: Proof, // tag === "UniversalL"
): Proof {
  const x = cutFormula.variable;
  const B = cutFormula.body;
  const y = (leftProof as { readonly eigenvariable: string }).eigenvariable;
  const t = (rightProof as { readonly term: Term }).term;

  // 左前提の証明で y を t に置換
  // leftProof.premise は Γ ⊢ Δ, B[y/x] を証明
  // y → t の置換で Γ ⊢ Δ, B[t/x] の証明になる
  const leftSubstituted = substituteInProof(
    (leftProof as { readonly premise: Proof }).premise,
    y,
    t,
  );

  // 右前提の前提: B[t/x], Σ ⊢ Π
  const rightInner = (rightProof as { readonly premise: Proof }).premise;

  // B[t/x] でカット
  const newCutFormula = substituteVar(B, x, t);
  return reduceCut(newCutFormula, leftSubstituted, rightInner);
}
```

**具体例:**

```
変換前:
       P(y) ⊢ P(y)       (Ax)
    ──────────────────── (∀R)     y は固有変数        P(f(a)), Q ⊢ R    (π₂)
     ⊢ ∀x.P(x)                                     ──────────────── (∀L, t=f(a))
                                                     ∀x.P(x), Q ⊢ R
  ──────────────────────────────────────────── (Cut on ∀x.P(x))
                  Q ⊢ R

変換後:

    P(f(a)) ⊢ P(f(a))     (Ax, y→f(a) 置換)     P(f(a)), Q ⊢ R    (π₂)
  ──────────────────────────────────────────── (Cut on P(f(a)))
                  Q ⊢ R

（P(f(a)) は ∀x.P(x) より complexity が 1 小さい）
```

### 5.7 存在量化のケース: A = ∃x.B

```typescript
/**
 * 存在量化の Principal Cut
 *
 * 全称のケースと対称的。
 *
 * 左前提（∃R を適用）:           右前提（∃L を適用）:
 *
 *    Γ ⊢ Δ, B[t/x]                B[y/x], Σ ⊢ Π
 *   ──────────────── (∃R)       ──────────────── (∃L)
 *    Γ ⊢ Δ, ∃x.B                ∃x.B, Σ ⊢ Π
 *
 * ここで y は ∃L の固有変数（Σ, Π に自由に出現しない）
 *
 * 変換後:
 *
 *   Γ ⊢ Δ, B[t/x]     B[t/x], Σ ⊢ Π
 *  ──────────────────────────────────── (Cut on B[t/x])
 *           Γ, Σ ⊢ Δ, Π
 *
 * Reasoning:
 *   ∃R は項 t で B[t/x] を証明し、∃x.B を導入。
 *   ∃L は固有変数 y で展開して B[y/x] を前件に入れる。
 *   y は固有変数なので、右前提の証明中の y を t で置換しても有効。
 *   これにより B[t/x] で直接カットできる。
 *   複雑度は全称のケースと同様に 1 減少する。
 */
function reducePrincipalExistential(
  cutFormula: Formula & { readonly tag: "Existential" },
  leftProof: Proof, // tag === "ExistentialR"
  rightProof: Proof, // tag === "ExistentialL"
): Proof {
  const x = cutFormula.variable;
  const B = cutFormula.body;
  const t = (leftProof as { readonly term: Term }).term;
  const y = (rightProof as { readonly eigenvariable: string }).eigenvariable;

  // 右前提の証明で y を t に置換
  const rightSubstituted = substituteInProof(
    (rightProof as { readonly premise: Proof }).premise,
    y,
    t,
  );

  // 左前提の前提: Γ ⊢ Δ, B[t/x]
  const leftInner = (leftProof as { readonly premise: Proof }).premise;

  // B[t/x] でカット
  const newCutFormula = substituteVar(B, x, t);
  return reduceCut(newCutFormula, leftInner, rightSubstituted);
}
```

## 6. Case 4: 構造規則との相互作用

### 6.1 弱化とカット

カット式が弱化で導入された場合、カット式は実際には証明に「使われていない」ため、カットを即座に除去できる。

```typescript
/**
 * Case 4a: 左前提の弱化でカット式 A が後件に追加された場合
 *
 *       Γ ⊢ Δ
 *   ──────────── (WR)          A, Σ ⊢ Π
 *    Γ ⊢ Δ, A
 *   ─────────────────────── (Cut on A)
 *        Γ, Σ ⊢ Δ, Π
 *
 * 変換後:
 *
 *    Γ ⊢ Δ                    Σ ⊢ Π
 *   ──── (WL×|Σ|, WR×|Π|)    ──── (WL×|Γ|, WR×|Δ|)
 *    Γ, Σ ⊢ Δ, Π             （弱化で拡張）
 *
 * Reasoning:
 *   左前提で A は弱化により追加されただけ — 実際に証明されていない。
 *   右前提では A を仮定として使っているが、A は「使われていない仮定」
 *   であるため、右前提から A を除去（= 右前提の A なしバージョンを構築）
 *   するか、あるいは左前提のカット式なし証明に弱化を適用して結論に到達する。
 *
 *   より正確には:
 *   - Γ ⊢ Δ の証明が存在する（弱化の前提）
 *   - 結論 Γ, Σ ⊢ Δ, Π は弱化を繰り返し適用することで得られる
 *   カットは完全に除去される（新しいカットは生じない）。
 */
function reduceCutWeakeningLeft(
  cutFormula: Formula,
  leftProof: Proof, // tag === "WeakeningR", added === cutFormula
  rightProof: Proof,
): Proof {
  // leftProof.premise: Γ ⊢ Δ を証明
  // 結論 Γ, Σ ⊢ Δ, Π を弱化で構築
  const basePremise = (leftProof as { readonly premise: Proof }).premise;
  const rightConclusion = conclusion(rightProof);

  // Σ の各式を WL で追加し、Π の各式を WR で追加
  let result = basePremise;
  for (const formula of rightConclusion.antecedent) {
    if (!formulaEquals(formula, cutFormula)) {
      result = { tag: "WeakeningL", added: formula, premise: result };
    }
  }
  for (const formula of rightConclusion.succedent) {
    result = { tag: "WeakeningR", added: formula, premise: result };
  }
  return result;
}

/**
 * Case 4b: 右前提の弱化でカット式 A が前件に追加された場合
 *
 *                         Σ ⊢ Π
 *   Γ ⊢ Δ, A         ──────────── (WL)
 *                      A, Σ ⊢ Π
 *   ─────────────────────────── (Cut on A)
 *        Γ, Σ ⊢ Δ, Π
 *
 * 変換後: 右前提 Σ ⊢ Π に弱化を適用して Γ, Σ ⊢ Δ, Π を構築
 *
 * Reasoning: Case 4a と対称的。
 */
function reduceCutWeakeningRight(
  cutFormula: Formula,
  leftProof: Proof,
  rightProof: Proof, // tag === "WeakeningL", added === cutFormula
): Proof {
  const basePremise = (rightProof as { readonly premise: Proof }).premise;
  const leftConclusion = conclusion(leftProof);

  let result = basePremise;
  for (const formula of leftConclusion.antecedent) {
    result = { tag: "WeakeningL", added: formula, premise: result };
  }
  for (const formula of leftConclusion.succedent) {
    if (!formulaEquals(formula, cutFormula)) {
      result = { tag: "WeakeningR", added: formula, premise: result };
    }
  }
  return result;
}
```

**具体例:**

```
変換前:
      P ⊢ Q
   ──────────── (WR)          P → Q, R ⊢ S    (π₂)
    P ⊢ Q, P → Q
  ──────────────────────────────────── (Cut on P → Q)
        P, R ⊢ Q, S

変換後:
    P ⊢ Q
  ──────── (WL)
   P, R ⊢ Q
  ──────── (WR)
   P, R ⊢ Q, S

カットは完全に除去された（新しいカットなし）。
```

### 6.2 縮約とカット

```typescript
/**
 * Case 4c: 左前提の縮約でカット式 A が後件で縮約された場合
 *
 *   Γ ⊢ Δ, A, A
 *  ────────────── (CR)          A, Σ ⊢ Π
 *    Γ ⊢ Δ, A
 *  ────────────────────────── (Cut on A)
 *       Γ, Σ ⊢ Δ, Π
 *
 * 変換後:
 *
 *   Γ ⊢ Δ, A, A     A, Σ ⊢ Π
 *  ──────────────────────────── (Cut on first A)    ← 段数減少
 *       Γ, Σ ⊢ Δ, A, Π
 *                        A, Σ ⊢ Π
 *  ──────────────────────────────── (Cut on remaining A)    ← 段数減少
 *       Γ, Σ, Σ ⊢ Δ, Π, Π
 *  (縮約で整理)
 *       Γ, Σ ⊢ Δ, Π
 *
 * Reasoning:
 *   縮約前の前提 Γ ⊢ Δ, A, A には A が2回出現。
 *   1回目のカットで A を1つ消費し、2回目のカットで残りを消費。
 *   各カットの段数は元のカットより小さい（縮約を飛ばしたため）。
 *   内側の帰納法により処理可能。
 *
 *   注意: Σ と Π が重複するが、縮約規則で整理できる。
 *   これが証明サイズ増大の一因である（証明が複製される）。
 */
function reduceCutContractionLeft(
  cutFormula: Formula,
  leftProof: Proof, // tag === "ContractionR", formula === cutFormula
  rightProof: Proof,
): Proof {
  // leftProof.premise: Γ ⊢ Δ, A, A
  const innerPremise = (leftProof as { readonly premise: Proof }).premise;

  // 1回目のカット: A を1つ消す（A がまだ1つ残る）
  const firstCut = reduceCut(cutFormula, innerPremise, rightProof);
  // 結果: Γ, Σ ⊢ Δ, Π, A   (A が1つ残っている)

  // 2回目のカット: 残りの A を消す
  const secondCut = reduceCut(cutFormula, firstCut, rightProof);
  // 結果: Γ, Σ, Σ ⊢ Δ, Π, Π

  // 必要なら Σ と Π の重複を縮約で整理
  return applyContractions(secondCut);
}

/**
 * Case 4d: 右前提の縮約でカット式 A が前件で縮約された場合
 *
 * 対称的な処理。
 */
function reduceCutContractionRight(
  cutFormula: Formula,
  leftProof: Proof,
  rightProof: Proof, // tag === "ContractionL", formula === cutFormula
): Proof {
  const innerPremise = (rightProof as { readonly premise: Proof }).premise;
  // innerPremise: A, A, Σ ⊢ Π

  const firstCut = reduceCut(cutFormula, leftProof, innerPremise);
  const secondCut = reduceCut(cutFormula, leftProof, firstCut);
  return applyContractions(secondCut);
}
```

**具体例:**

```
変換前:
   P ⊢ P, P           (π₁)
  ────────── (CR)              P, Q ⊢ R    (π₂)
   P ⊢ P
  ──────────────────── (Cut on P)
       P, Q ⊢ R

変換後:
   P ⊢ P, P     P, Q ⊢ R
  ────────────────────────── (Cut on P)     ← 段数減少
       P, Q ⊢ P, R
                     P, Q ⊢ R
  ──────────────────────────── (Cut on P)     ← 段数減少
       P, Q, Q ⊢ R, R
  ────── (CL)
   P, Q ⊢ R, R
  ────── (CR)
   P, Q ⊢ R
```

## 7. Mix 規則による代替アプローチ

縮約とカットの相互作用（Case 4c, 4d）は複雑であり、証明サイズの爆発の主因でもある。**Mix 規則**を使うと、この問題をよりエレガントに扱える。

### 7.1 Mix 規則の定義（再掲）

```
  Γ ⊢ Δ, A, ..., A     A, ..., A, Σ ⊢ Π
──────────────────────────────────────────── (Mix)
              Γ, Σ ⊢ Δ, Π
```

Mix はカット式 `A` の**すべての出現**を一度に除去する。

### 7.2 Mix 除去のメリット

```typescript
/**
 * Mix 除去の場合、縮約との相互作用が不要になる。
 *
 * 縮約ケース（Case 4c）でカットを2回行う必要があったが、
 * Mix なら1回で A のすべての出現を除去できる。
 *
 * これにより:
 * - 場合分けが簡素化される
 * - 証明はよりクリーンになる
 * - ただし、証明サイズの爆発は本質的には変わらない
 *
 * Troelstra & Schwichtenberg (2000) はこのアプローチを推奨している。
 */
```

## 8. 停止性の議論

### 8.1 減少する指標

カット除去アルゴリズムの停止性は、各変換で以下の辞書式順序 `(c, d)` が厳密に減少することで保証される:

| 指標 | 定義                        | 値域       |
| ---- | --------------------------- | ---------- |
| `c`  | カット式の複雑度（外側）    | 自然数 ≥ 0 |
| `d`  | カットの段数 / 深さ（内側） | 自然数 ≥ 0 |

辞書式順序: `(c₁, d₁) < (c₂, d₂)` ⟺ `c₁ < c₂` または（`c₁ = c₂` かつ `d₁ < d₂`）

### 8.2 各ケースの指標変化

| ケース          | c（複雑度） | d（段数）        | 辞書式順序                     |
| --------------- | ----------- | ---------------- | ------------------------------ |
| Case 1: 公理    | —           | —                | カット除去完了                 |
| Case 2: 非主式  | 不変        | 減少             | (c, d) → (c, d') where d' < d  |
| Case 3: 主式    | 減少        | 増加の可能性あり | (c, d) → (c', d') where c' < c |
| Case 4a/b: 弱化 | —           | —                | カット除去完了                 |
| Case 4c/d: 縮約 | 不変        | 減少             | (c, d) → (c, d') where d' < d  |

### 8.3 厳密な停止性証明の概略

**定理:** `reduceCut(A, π₁, π₂)` は有限回の再帰呼び出しで停止する。

**証明:** ペア `(complexity(A), depth(π₁) + depth(π₂))` に辞書式順序を入れた整列帰納法による。

1. **Case 1（公理）:** 即座に停止。再帰呼び出しなし。

2. **Case 2（非主式）:** 再帰呼び出し `reduceCut(A, π₁', π₂)` または `reduceCut(A, π₁, π₂')` では、`complexity(A)` は不変だが、`depth(π₁')` < `depth(π₁)` または `depth(π₂')` < `depth(π₂)`。よって辞書式順序が減少。

3. **Case 3（主式）:** 再帰呼び出し `reduceCut(A', ...)` では `complexity(A')` < `complexity(A)`。外側の指標が減少するため、内側の指標は任意でよい。

4. **Case 4a/b（弱化）:** 即座に停止。新しいカットは生じない。

5. **Case 4c/d（縮約）:** 再帰呼び出し `reduceCut(A, innerPremise, π₂)` では `complexity(A)` は不変だが、縮約規則を飛ばした分だけ段数が減少。

いずれのケースでも辞書式順序 `(complexity, depth)` が厳密に減少する。自然数の辞書式順序は整列的であるから、有限回で停止する。 ∎

### 8.4 計算量に関する注意

**命題論理の場合:**

- 入力の証明サイズ $n$ に対し、カット除去後の証明サイズの上界:
  $2_n(1)$ （高さ $n$ の2の塔 = $2^{2^{2^{\cdots}}}$, $n$ 段）
- 下界: Statman (1979) により、この非初等的爆発は避けられないことが証明されている

**主な爆発の原因:**

1. **Case 3（含意）:** 1つのカットが2つのカットに分裂 → 指数的増大
2. **Case 4c/d（縮約）:** 証明が複製される → 指数的増大
3. **これらの組み合わせ:** 非初等的な爆発

**一階述語論理の場合:** さらに悪化する。項の代入により複雑度は変わらないが、証明の構造が変わりうるため、上界はさらに大きくなる。

## 9. 補助関数

### 9.1 主式判定

```typescript
/**
 * 証明の最後の規則でカット式 A が主式（導入された式）かを判定
 *
 * 主式とは: その規則によって新たに導入された（構築された）論理式。
 * 例: →R の主式は B → C、∧L₁ の主式は B ∧ C
 */
function isPrincipal(proof: Proof, cutFormula: Formula): boolean {
  switch (proof.tag) {
    case "NegationR":
      // ¬R の主式は ¬B（後件に導入）
      return formulaEquals(
        { tag: "Negation", body: extractBodyFromNegationR(proof) },
        cutFormula,
      );
    case "NegationL":
      // ¬L の主式は ¬B（前件に導入）
      return formulaEquals(
        { tag: "Negation", body: extractBodyFromNegationL(proof) },
        cutFormula,
      );
    case "ImplicationR":
      return formulaEquals(proof.formula, cutFormula);
    case "ImplicationL":
      return formulaEquals(proof.formula, cutFormula);
    case "ConjunctionR":
      return formulaEquals(proof.formula, cutFormula);
    case "ConjunctionL1":
    case "ConjunctionL2":
      return formulaEquals(proof.formula, cutFormula);
    case "DisjunctionR1":
    case "DisjunctionR2":
      return formulaEquals(proof.formula, cutFormula);
    case "DisjunctionL":
      return formulaEquals(proof.formula, cutFormula);
    case "UniversalR":
      return formulaEquals(proof.formula, cutFormula);
    case "UniversalL":
      return formulaEquals(proof.formula, cutFormula);
    case "ExistentialR":
      return formulaEquals(proof.formula, cutFormula);
    case "ExistentialL":
      return formulaEquals(proof.formula, cutFormula);
    default:
      // 公理、構造規則には「主式」の概念が（この意味では）ない
      return false;
  }
}
```

### 9.2 証明中の変数置換

```typescript
/**
 * 証明中のすべての変数出現を置換する。
 * 量化子の Principal Cut（Case 3.6, 3.7）で使用。
 *
 * Reasoning: 固有変数条件により、置換対象の変数は
 * 証明中で「自由に」使われていないことが保証されている。
 * よって置換は証明の正当性を保つ。
 */
function substituteInProof(proof: Proof, variable: string, term: Term): Proof {
  // 証明木を再帰的に走査し、各シーケント中の論理式の
  // variable を term で置換する
  // ...
}
```

## 10. まとめ: アルゴリズムの流れ

```
eliminateCuts(proof)
  │
  ├─ カット階数 = 0 → 完了
  │
  └─ カット階数 > 0 → reduceTopCut(proof)
       │
       └─ 最も上のカットを見つける
            │
            └─ reduceCut(A, π_L, π_R)
                 │
                 ├─ Case 1: 公理 → π_L or π_R をそのまま返す
                 │
                 ├─ Case 4a/b: 弱化 → 弱化で結論を構築（カット除去完了）
                 │
                 ├─ Case 4c/d: 縮約 → 2回カット + 縮約（段数減少）
                 │
                 ├─ Case 3: Principal → 論理結合子ごとの分解
                 │   ├─ ¬: Cut(¬B) → Cut(B)
                 │   ├─ →: Cut(B→C) → Cut(B) + Cut(C)
                 │   ├─ ∧: Cut(B∧C) → Cut(B) or Cut(C)
                 │   ├─ ∨: Cut(B∨C) → Cut(B) or Cut(C)
                 │   ├─ ∀: Cut(∀x.B) → Cut(B[t/x])
                 │   └─ ∃: Cut(∃x.B) → Cut(B[t/x])
                 │
                 └─ Case 2: Non-principal → カットを上に持ち上げ（段数減少）
```

## 参考文献

- **Gentzen, G.** "Untersuchungen über das logische Schließen" _Mathematische Zeitschrift_ 39, 176-210, 405-431 (1935)
  — カット除去定理の原典。本ドキュメントの疑似コードはGentzenのオリジナル証明に基づく

- **Troelstra, A.S. & Schwichtenberg, H.** _Basic Proof Theory_ (2nd ed., Cambridge University Press, 2000)
  — Chapter 4 でカット除去の詳細な証明。Mix除去に基づくアプローチを推奨。本ドキュメントのCase 4（縮約）の代替としてSection 7で紹介

- **Girard, J.-Y., Lafont, Y. & Taylor, P.** _Proofs and Types_ (Cambridge University Press, 1989)
  — Chapter 13 でカット除去を解説。カリー＝ハワード対応の視点を含む

- **Takeuti, G.** _Proof Theory_ (2nd ed., North-Holland, 1987)
  — カット除去の包括的な扱い

- **Buss, S.R.** "An Introduction to Proof Theory" in _Handbook of Proof Theory_ (Elsevier, 1998)
  — カット除去の現代的入門。疑似コード的な記述が豊富

- **Statman, R.** "Lower bounds on Herbrand's theorem" _Proceedings of the American Mathematical Society_ 75(1), 104-107 (1979)
  — カット除去による証明サイズの非初等的爆発の下界を証明

- **nLab** "cut elimination" — <https://ncatlab.org/nlab/show/cut+elimination>
  — オンラインリファレンス
