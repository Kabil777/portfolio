import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleAnalytics } from "@/components/blog/article-analytics";
import { ArticleHeader } from "@/components/blog/article-header";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { ArticleToc } from "@/components/blog/article-toc";
import { NewsletterSignup } from "@/components/blog/newsletter-signup";
import { getBlogPost } from "@/lib/posts";
import { extractToc } from "@/lib/markdown";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost((await params).slug);
  if (!post) return {};

  return {
    title: `${post.title} — Kabil Muthusamy`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost((await params).slug);
  if (!post) notFound();

  const toc = extractToc(post.content);

  return (
    <main id="content">
      <ArticleAnalytics slug={post.slug} />
      <ArticleHeader post={post} showLike />
      <NewsletterSignup />
      <div
        className={`article-layout${toc.length ? "" : " article-layout-no-toc"}`}
      >
        <ArticleToc items={toc} />
        <article>
          <ArticleRenderer content={post.content} />
        </article>
      </div>
    </main>
  );
}
