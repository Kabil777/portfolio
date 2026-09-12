import { notFound } from "next/navigation";
import {
  archivePostAction,
  publishPostAction,
  unpublishPostAction,
} from "@/app/admin/actions";
import { ArticleHeader } from "@/components/blog/article-header";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { getAdminPosts, getPostPreview } from "@/lib/posts";

export default async function PostPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([
    getPostPreview(slug),
    getAdminPosts(),
  ]);
  const summary = posts.find((item) => item.slug === slug);
  if (!post || !summary) notFound();

  return (
    <section aria-labelledby="preview-title">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">
            {summary.hasDraft ? "DRAFT PREVIEW" : "PUBLISHED PREVIEW"}
          </p>
          <h1 id="preview-title">{post.title}</h1>
        </div>
        <div className="admin-actions">
          <form action={publishPostAction}>
            <input name="slug" type="hidden" value={slug} />
            <button className="admin-button" type="submit">
              Publish
            </button>
          </form>
          {summary.status === "published" && (
            <form action={unpublishPostAction}>
              <input name="slug" type="hidden" value={slug} />
              <button
                className="admin-button admin-button-secondary"
                type="submit"
              >
                Unpublish
              </button>
            </form>
          )}
          <form action={archivePostAction}>
            <input name="slug" type="hidden" value={slug} />
            <button className="admin-button admin-button-danger" type="submit">
              Archive
            </button>
          </form>
        </div>
      </div>
      <div className="admin-preview">
        <ArticleHeader post={post} />
        <article className="article-layout article-layout-no-toc">
          <ArticleRenderer content={post.content} />
        </article>
      </div>
    </section>
  );
}
