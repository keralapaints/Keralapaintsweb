import type { ReactNode } from "react";

/** `[label](target)` links and `**bold**` inside a line of copy. */
const MARKUP = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

type RichTextProps = {
  text: string;
  /** Product page addresses by product id, for `[label](product:<id>)` links. */
  paths?: Record<string, string>;
};

/**
 * A line of copy with its links and bold words drawn. A link to a product without a page stays plain text; a link
 * to another site opens in a new tab.
 */
export function RichText({ text, paths = {} }: RichTextProps) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(MARKUP)) {
    const index = match.index ?? 0;
    parts.push(text.slice(last, index));
    const [whole, label, target, bold] = match;
    if (bold) parts.push(<strong key={index}>{bold}</strong>);
    else {
      const href = target.startsWith("product:") ? paths[target.slice("product:".length)] : target;
      const external = href?.startsWith("http");
      parts.push(href ? <a key={index} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a> : label);
    }
    last = index + whole.length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}