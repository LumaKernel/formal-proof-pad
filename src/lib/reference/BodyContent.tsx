/**
 * ブロックレベルコンテンツレンダラー。
 *
 * 段落テキストをブロック要素（段落、順序なしリスト、順序ありリスト）に分解して描画する。
 * InlineMarkdown を内部で利用し、リスト内のインライン要素も正しくレンダリングする。
 *
 * 変更時は referenceUILogic.test.ts（parseBlockContent）, BodyContent.test.tsx も同期すること。
 */

import { useMemo, type CSSProperties } from "react";
import { InlineMarkdown, type InlineMarkdownProps } from "./InlineMarkdown";
import { parseBlockContent } from "./referenceUILogic";

/** BodyContent のプロパティ */
export interface BodyContentProps {
  /** レンダリングする段落テキスト */
  readonly text: string;
  /** 段落のスタイル */
  readonly paragraphStyle?: CSSProperties;
  /** リストのスタイル */
  readonly listStyle?: CSSProperties;
  /** InlineMarkdown へ透過するリファレンスリンクコールバック */
  readonly onNavigate?: InlineMarkdownProps["onNavigate"];
  /** InlineMarkdown へ透過する参考文献リンクコールバック */
  readonly onCiteClick?: InlineMarkdownProps["onCiteClick"];
  /** InlineMarkdown へ透過するクエストリンクコールバック */
  readonly onQuestNavigate?: InlineMarkdownProps["onQuestNavigate"];
}

/** リストアイテムのスタイル */
const listItemStyle: CSSProperties = {
  marginBottom: "0.25em",
};

/** 番号埋め込み式 ol のスタイル（<b>N.</b> パターン：番号はコンテンツ内に含まれるため非表示） */
const numberedByContentOlStyle: CSSProperties = {
  listStyleType: "none",
  paddingLeft: "0.5em",
};

export function BodyContent({
  text,
  paragraphStyle,
  listStyle,
  onNavigate,
  onCiteClick,
  onQuestNavigate,
}: BodyContentProps) {
  const blocks = useMemo(() => parseBlockContent(text), [text]);

  return (
    <>
      {blocks.map((block, i) => {
        const key = `block-${String(i) satisfies string}`;

        if (block.type === "paragraph") {
          return (
            <p key={key} style={paragraphStyle}>
              <InlineMarkdown
                text={block.text}
                onNavigate={onNavigate}
                onCiteClick={onCiteClick}
                onQuestNavigate={onQuestNavigate}
              />
            </p>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={key} style={listStyle}>
              {block.items.map((item, j) => (
                <li
                  key={`${key satisfies string}-${String(j) satisfies string}`}
                  style={listItemStyle}
                >
                  <InlineMarkdown
                    text={item}
                    onNavigate={onNavigate}
                    onCiteClick={onCiteClick}
                  />
                </li>
              ))}
            </ul>
          );
        }

        // block.type === "ordered-list"
        const olStyle = block.numberedByContent
          ? { ...listStyle, ...numberedByContentOlStyle }
          : listStyle;

        return (
          <ol key={key} style={olStyle}>
            {block.items.map((item, j) => (
              <li
                key={`${key satisfies string}-${String(j) satisfies string}`}
                style={listItemStyle}
              >
                <InlineMarkdown
                  text={item}
                  onNavigate={onNavigate}
                  onCiteClick={onCiteClick}
                />
              </li>
            ))}
          </ol>
        );
      })}
    </>
  );
}
