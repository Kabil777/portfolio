import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleAnalytics } from "@/components/blog/article-analytics";
import { ArticleHeader } from "@/components/blog/article-header";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { ArticleToc } from "@/components/blog/article-toc";
import { NewsletterSignup } from "@/components/blog/newsletter-signup";
import { ShareButton } from "@/components/blog/share-button";
import { getCachedBlogPost, getCachedBlogPosts } from "@/lib/posts";
import { extractToc } from "@/lib/markdown";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getCachedBlogPosts()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getCachedBlogPost((await params).slug);
  if (!post) return {};

  const url = `/blog/${post.slug}`;
  const images = post.cover ? [{ url: post.cover, alt: "" }] : undefined;

  return {
    title: `${post.title} — Kabil Muthusamy`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.date,
      tags: post.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getCachedBlogPost((await params).slug);
  if (!post) notFound();

  const toc = extractToc(post.content);

  return (
    <main id="content">
      <ArticleAnalytics slug={post.slug} />
      <ShareButton description={post.description} title={post.title} />
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
