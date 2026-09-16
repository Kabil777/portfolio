import type { Metadata } from "next";
import { BlogIndexCard } from "@/components/blog/blog-index-card";
import { getCachedBlogPosts } from "@/lib/posts";

const title = "Blog — Kabil Muthusamy";
const description =
  "Posts on reliable data systems, Kubernetes, platform engineering, and SRE.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", url: "/blog", title, description },
  twitter: { card: "summary_large_image", title, description },
};

export default async function BlogPage() {
  const posts = await getCachedBlogPosts();
  const categories = [...new Set(posts.map((post) => post.category))];

  return (
    <main id="content">
      <section
        className="blog-index-masthead"
        aria-labelledby="blog-index-title"
      >
        <h1 id="blog-index-title">BLOG</h1>
        <p>I share what I learn while building systems people can rely on.</p>
      </section>
      <section className="blog-index" aria-label="Published posts">
        {posts.length ? (
          categories.map((category) => {
            const categoryPosts = posts.filter(
              (post) => post.category === category,
            );
            return (
              <section
                className="blog-topic"
                aria-label={`${category} posts`}
                key={category}
              >
                <div className="blog-topic-heading">
                  <h2>{category}</h2>
                  <span>
                    {categoryPosts.length}{" "}
                    {categoryPosts.length === 1 ? "post" : "posts"}
                  </span>
                </div>
                <div className="blog-index-grid">
                  {categoryPosts.map((post) => (
                    <BlogIndexCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <p className="blog-empty">No published posts yet.</p>
        )}
      </section>
    </main>
  );
}
