import Image from "next/image";
import Link from "next/link";
import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { createHeadingSlugger } from "@/lib/markdown";

function textFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (isValidElement<{ children?: ReactNode }>(node))
    return textFromNode(node.props.children);
  return "";
}

export function ArticleRenderer({ content }: { content: string }) {
  const slug = createHeadingSlugger();
  const heading = (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") =>
    function ArticleHeading({ children }: { children?: ReactNode }) {
      return <Tag id={slug(textFromNode(children))}>{children}</Tag>;
    };

  const components: Components = {
    h1: heading("h1"),
    h2: heading("h2"),
    h3: heading("h3"),
    h4: heading("h4"),
    h5: heading("h5"),
    h6: heading("h6"),
    a({ href = "", children }) {
      if (href.startsWith("/") || href.startsWith("#")) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} rel="noreferrer" target="_blank">
          {children}
        </a>
      );
    },
    img({ src = "", alt = "" }) {
      if (
        typeof src !== "string" ||
        !src.startsWith("/blog/") ||
        src.includes("..")
      ) {
        throw new Error(`Blog image must use a local /blog/ path: ${src}`);
      }
      return (
        <Image
          alt={alt}
          className="article-image"
          height={675}
          src={src}
          width={1200}
        />
      );
    },
    pre({ children }) {
      return <pre className="article-code-block">{children}</pre>;
    },
    table({ children }) {
      return (
        <div className="article-table-wrap">
          <table>{children}</table>
        </div>
      );
    },
  };

  return (
    <div className="article-content">
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeHighlight]}
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
