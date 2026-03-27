/**
 * インラインHTMLタグ・数式レンダラー。
 *
 * <b>bold</b>, <i>italic</i>, <code>code</code>, $math$, _subscript テキストをReact要素に変換する。
 * リファレンスのbody/summaryテキスト表示に使用。
 *
 * 変更時は referenceUILogic.test.ts（parseInlineMarkdown）も同期すること。
 */

import { useMemo } from "react";
import katex from "katex";
import { parseInlineMarkdown } from "./referenceUILogic";

export interface InlineMarkdownProps {
  /** レンダリングするテキスト */
  readonly text: string;
  /** リファレンスリンククリック時のコールバック */
  readonly onNavigate?: (entryId: string) => void;
  /** 参考文献リンククリック時のコールバック */
  readonly onCiteClick?: (citeKey: string) => void;
  /** クエストリンククリック時のコールバック */
  readonly onQuestNavigate?: (questId: string) => void;
}

/** KaTeX でインライン数式をHTMLに変換する（純粋関数） */
function renderMathToHtml(tex: string): string {
  return katex.renderToString(tex, {
    displayMode: false,
    throwOnError: false,
    output: "htmlAndMathml",
  });
}

/**
 * テキスト中の $...$, <ref:id>, <cite:key> をReact要素に変換する。
 * bold/italic/text要素の内部でインライン要素を使えるようにするためのヘルパー。
 *
 * 変更時は InlineMarkdown.test.tsx も同期すること。
 */
function renderContentWithInline(
  content: string,
  keyPrefix: string,
  onNavigate?: (entryId: string) => void,
  onCiteClick?: (citeKey: string) => void,
  onQuestNavigate?: (questId: string) => void,
): React.ReactNode {
  // $...$, <ref:...>, <cite:...>, <quest:...> のいずれも含まない場合はテキストそのまま
  if (
    !content.includes("$") &&
    !content.includes("<ref:") &&
    !content.includes("<cite:") &&
    !content.includes("<quest:")
  ) {
    return content;
  }
  // $...$, <ref:id />, <ref:id>text</ref>, <cite:key>text</cite>, <quest:id />, <quest:id>text</quest> で分割
  const inlineTokenRegex =
    /(\$[^$]+?\$|<ref:[a-z0-9-]+\s*\/>|<ref:[a-z0-9-]+>[^<]*<\/ref>|<cite:[a-z0-9-]+>[^<]*<\/cite>|<quest:[a-z0-9-]+\s*\/>|<quest:[a-z0-9-]+>[^<]*<\/quest>)/g;
  const parts = content.split(inlineTokenRegex);
  if (parts.length === 1) {
    return content;
  }
  const refSelfCloseRegex = /^<ref:([a-z0-9-]+)\s*\/>$/;
  const refOpenRegex = /^<ref:([a-z0-9-]+)>([^<]*)<\/ref>$/;
  const citeRegex = /^<cite:([a-z0-9-]+)>([^<]*)<\/cite>$/;
  const questSelfCloseRegex = /^<quest:([a-z0-9-]+)\s*\/>$/;
  const questOpenRegex = /^<quest:([a-z0-9-]+)>([^<]*)<\/quest>$/;
  return parts.map((part, j) => {
    const pk = `${keyPrefix satisfies string}-i${String(j) satisfies string}`;
    // $...$ 数式
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const tex = part.slice(1, -1);
      return (
        <span
          key={pk}
          dangerouslySetInnerHTML={{ __html: renderMathToHtml(tex) }}
        />
      );
    }
    // <ref:id /> self-closing
    const refSelfMatch = refSelfCloseRegex.exec(part);
    if (refSelfMatch !== null) {
      const refId = refSelfMatch[1];
      const refContent = refId;
      return (
        <a
          key={pk}
          role="button"
          tabIndex={0}
          style={refLinkStyle}
          data-ref-id={refId}
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.(refId);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigate?.(refId);
            }
          }}
        >
          {refContent}
        </a>
      );
    }
    // <ref:id>text</ref>
    const refOpenMatch = refOpenRegex.exec(part);
    if (refOpenMatch !== null) {
      const refId = refOpenMatch[1];
      const refContent = refOpenMatch[2].length > 0 ? refOpenMatch[2] : refId;
      return (
        <a
          key={pk}
          role="button"
          tabIndex={0}
          style={refLinkStyle}
          data-ref-id={refId}
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.(refId);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigate?.(refId);
            }
          }}
        >
          {refContent}
        </a>
      );
    }
    // <cite:key>text</cite>
    const citeMatch = citeRegex.exec(part);
    if (citeMatch !== null) {
      const citeKey = citeMatch[1];
      const citeContent = citeMatch[2].length > 0 ? citeMatch[2] : citeKey;
      return (
        <a
          key={pk}
          role="button"
          tabIndex={0}
          style={citeLinkStyle}
          data-cite-key={citeKey}
          id={`cite-ref-${citeKey satisfies string}`}
          onClick={(e) => {
            e.preventDefault();
            onCiteClick?.(citeKey);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCiteClick?.(citeKey);
            }
          }}
        >
          [{citeContent}]
        </a>
      );
    }
    // <quest:id /> self-closing
    const questSelfMatch = questSelfCloseRegex.exec(part);
    if (questSelfMatch !== null) {
      const questId = questSelfMatch[1];
      return (
        <a
          key={pk}
          role="button"
          tabIndex={0}
          style={questLinkStyle}
          data-quest-id={questId}
          onClick={(e) => {
            e.preventDefault();
            onQuestNavigate?.(questId);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onQuestNavigate?.(questId);
            }
          }}
        >
          {questId}
        </a>
      );
    }
    // <quest:id>text</quest>
    const questOpenMatch = questOpenRegex.exec(part);
    if (questOpenMatch !== null) {
      const questId = questOpenMatch[1];
      const questContent =
        questOpenMatch[2].length > 0 ? questOpenMatch[2] : questId;
      return (
        <a
          key={pk}
          role="button"
          tabIndex={0}
          style={questLinkStyle}
          data-quest-id={questId}
          onClick={(e) => {
            e.preventDefault();
            onQuestNavigate?.(questId);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onQuestNavigate?.(questId);
            }
          }}
        >
          {questContent}
        </a>
      );
    }
    return part === "" ? null : part;
  });
}

/** リファレンスリンクのスタイル */
const refLinkStyle: React.CSSProperties = {
  color: "var(--color-link, #0066cc)",
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationStyle: "dotted",
  textUnderlineOffset: "2px",
};

/** 参考文献リンク（上付き）のスタイル */
const citeLinkStyle: React.CSSProperties = {
  color: "var(--color-link, #0066cc)",
  cursor: "pointer",
  textDecoration: "none",
  fontSize: "0.75em",
  verticalAlign: "super",
  lineHeight: 1,
};

/** クエストリンクのスタイル */
const questLinkStyle: React.CSSProperties = {
  color: "var(--color-link, #0066cc)",
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationStyle: "solid",
  textUnderlineOffset: "2px",
  fontFamily: "monospace",
  fontSize: "0.9em",
};

export function InlineMarkdown({
  text,
  onNavigate,
  onCiteClick,
  onQuestNavigate,
}: InlineMarkdownProps) {
  const elements = useMemo(() => parseInlineMarkdown(text), [text]);

  return (
    <>
      {elements.map((el, i) => {
        const key = `${el.type satisfies string}-${String(i) satisfies string}`;
        if (el.type === "bold") {
          return (
            <strong key={key}>
              {renderContentWithInline(
                el.content,
                key,
                onNavigate,
                onCiteClick,
                onQuestNavigate,
              )}
            </strong>
          );
        }
        if (el.type === "italic") {
          return (
            <em key={key}>
              {renderContentWithInline(
                el.content,
                key,
                onNavigate,
                onCiteClick,
                onQuestNavigate,
              )}
            </em>
          );
        }
        if (el.type === "code") {
          return <code key={key}>{el.content}</code>;
        }
        if (el.type === "subscript") {
          return <sub key={key}>{el.content}</sub>;
        }
        if (el.type === "math") {
          return (
            <span
              key={key}
              dangerouslySetInnerHTML={{ __html: renderMathToHtml(el.content) }}
            />
          );
        }
        if (el.type === "ref-link") {
          return (
            <a
              key={key}
              role="button"
              tabIndex={0}
              style={refLinkStyle}
              data-ref-id={el.refId}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(el.refId);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onNavigate?.(el.refId);
                }
              }}
            >
              {el.content}
            </a>
          );
        }
        if (el.type === "cite-link") {
          return (
            <a
              key={key}
              role="button"
              tabIndex={0}
              style={citeLinkStyle}
              data-cite-key={el.citeKey}
              id={`cite-ref-${el.citeKey satisfies string}`}
              onClick={(e) => {
                e.preventDefault();
                onCiteClick?.(el.citeKey);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCiteClick?.(el.citeKey);
                }
              }}
            >
              [{el.content}]
            </a>
          );
        }
        if (el.type === "quest-link") {
          return (
            <a
              key={key}
              role="button"
              tabIndex={0}
              style={questLinkStyle}
              data-quest-id={el.questId}
              onClick={(e) => {
                e.preventDefault();
                onQuestNavigate?.(el.questId);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onQuestNavigate?.(el.questId);
                }
              }}
            >
              {el.content}
            </a>
          );
        }
        return (
          <span key={key}>
            {renderContentWithInline(
              el.content,
              key,
              onNavigate,
              onCiteClick,
              onQuestNavigate,
            )}
          </span>
        );
      })}
    </>
  );
}
