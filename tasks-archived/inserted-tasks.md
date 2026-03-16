# 差し込みタスク（アーカイブ）

- [x] ../tasks-archived/prd-replace.md が達成されていない
  - [x] term入力のコンポーネントのストーリー(FormulaDisplay)に phi[tau/x] などがあるべきだろう
    - SubstitutionDisplay（6パターン）とSubstitutionHighlight（3パターン、A4公理全体含む）をplay関数付きで追加
  - [x] UIの公理は (all x. phi) -> phi ではなく (all x. phi) -> phi[τ/x] にする！！
    - axiomA4Template に FormulaSubstitution を追加。dslText は identifyAxiom 互換性のため旧形式維持
