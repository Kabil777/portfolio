/* eslint-disable @next/next/no-head-element, @next/next/no-img-element */
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { blogExcerptMarkdown, type BlogPost } from "@/lib/blog";

const colors = {
  ink: "#111827",
  coral: "#DD614C",
  gold: "#DAA144",
  cream: "#FFF7E8",
  white: "#FFFFFF",
};

function absoluteUrl(value: string, siteUrl: string): string {
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return siteUrl;
  }
}

export function PostEmail({
  post,
  siteUrl,
  unsubscribeUrl = "{{{RESEND_UNSUBSCRIBE_URL}}}",
}: {
  post: BlogPost;
  siteUrl: string;
  unsubscribeUrl?: string;
}) {
  const articleUrl = `${siteUrl}/blog/${post.slug}`;
  const excerpt = blogExcerptMarkdown(post.content);
  const excerptComponents: Components = {
    h2: ({ children }) => (
      <h2
        style={{
          borderBottom: `3px solid ${colors.ink}`,
          fontSize: 26,
          lineHeight: 1.05,
          margin: "26px 0 12px",
          paddingBottom: 7,
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: 21, lineHeight: 1.1, margin: "22px 0 10px" }}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 style={{ fontSize: 18, lineHeight: 1.2, margin: "18px 0 8px" }}>
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p style={{ fontSize: 17, lineHeight: 1.65, margin: "0 0 16px" }}>
        {children}
      </p>
    ),
    a: ({ href = "", children }) => (
      <a
        href={absoluteUrl(href, siteUrl)}
        style={{ color: colors.ink, fontWeight: 800 }}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: `6px solid ${colors.coral}`,
          margin: "0 0 18px",
          padding: "2px 16px",
        }}
      >
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code
        style={{
          background: colors.gold,
          border: `1px solid ${colors.ink}`,
          fontFamily: "Courier New, monospace",
          padding: "1px 4px",
        }}
      >
        {children}
      </code>
    ),
    ul: ({ children }) => (
      <ul style={{ fontSize: 16, lineHeight: 1.6, paddingLeft: 22 }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ fontSize: 16, lineHeight: 1.6, paddingLeft: 22 }}>
        {children}
      </ol>
    ),
  };

  return (
    <html lang="en">
      <head>
        <meta content="light" name="color-scheme" />
        <meta content="light" name="supported-color-schemes" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>{post.title}</title>
      </head>
      <body
        style={{
          backgroundColor: colors.cream,
          color: colors.ink,
          fontFamily: "Arial, Helvetica, sans-serif",
          margin: 0,
        }}
      >
        <table
          cellPadding={0}
          cellSpacing={0}
          role="presentation"
          style={{ backgroundColor: colors.cream, width: "100%" }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "28px 16px 36px" }}>
                <table
                  cellPadding={0}
                  cellSpacing={0}
                  role="presentation"
                  style={{
                    backgroundColor: colors.white,
                    border: `4px solid ${colors.ink}`,
                    maxWidth: 640,
                    width: "100%",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "28px 24px 30px" }}>
                        <h1
                          style={{
                            fontSize: 44,
                            fontWeight: 900,
                            letterSpacing: -2,
                            lineHeight: 0.95,
                            margin: "0 0 14px",
                          }}
                        >
                          {post.title}
                        </h1>
                        <p
                          style={{
                            background: colors.gold,
                            border: `2px solid ${colors.ink}`,
                            display: "inline-block",
                            fontFamily: "Courier New, monospace",
                            fontSize: 12,
                            fontWeight: 700,
                            margin: "0 0 20px",
                            padding: "6px 9px",
                            textTransform: "uppercase",
                          }}
                        >
                          {post.category}
                        </p>
                        <p
                          style={{
                            fontSize: 19,
                            fontWeight: 700,
                            lineHeight: 1.45,
                            margin: "0 0 20px",
                          }}
                        >
                          {post.description}
                        </p>

                        <p
                          style={{
                            borderBottom: `3px solid ${colors.ink}`,
                            borderTop: `3px solid ${colors.ink}`,
                            fontFamily: "Courier New, monospace",
                            fontSize: 12,
                            fontWeight: 700,
                            margin: "0 0 24px",
                            padding: "10px 0",
                            textTransform: "uppercase",
                          }}
                        >
                          {new Date(`${post.date}T00:00:00`).toLocaleDateString(
                            "en",
                            {
                              dateStyle: "medium",
                            },
                          )}{" "}
                          {" / "}
                          {post.readingTime} min read
                        </p>

                        {post.cover && (
                          <img
                            alt=""
                            src={absoluteUrl(post.cover, siteUrl)}
                            style={{
                              border: `3px solid ${colors.ink}`,
                              display: "block",
                              height: "auto",
                              margin: "0 0 24px",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                          />
                        )}

                        <div style={{ marginBottom: 26 }}>
                          <ReactMarkdown
                            components={excerptComponents}
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                          >
                            {excerpt}
                          </ReactMarkdown>
                        </div>

                        <a
                          href={articleUrl}
                          style={{
                            background: colors.coral,
                            border: `3px solid ${colors.ink}`,
                            color: colors.ink,
                            display: "inline-block",
                            fontSize: 16,
                            fontWeight: 900,
                            padding: "12px 16px",
                            textDecoration: "none",
                          }}
                        >
                          Read full article
                        </a>

                        <p
                          style={{
                            fontFamily: "Courier New, monospace",
                            fontSize: 12,
                            lineHeight: 1.6,
                            margin: "28px 0 0",
                          }}
                        >
                          {post.tags.join(" · ")}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          borderTop: `3px solid ${colors.ink}`,
                          fontSize: 12,
                          lineHeight: 1.5,
                          padding: "16px 24px",
                          textAlign: "left",
                        }}
                      >
                        You confirmed a subscription to Kabil&apos;s posts.{" "}
                        <a
                          href={unsubscribeUrl}
                          style={{ color: colors.ink, fontWeight: 700 }}
                        >
                          Unsubscribe
                        </a>
                        .
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
