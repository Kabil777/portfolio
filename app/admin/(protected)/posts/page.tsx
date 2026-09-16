import Link from "next/link";
import { DeletePostForm } from "@/components/admin/delete-post-form";
import { FlashToasts } from "@/components/admin/flash-toasts";
import { getAdminPosts } from "@/lib/posts";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const [posts, result] = await Promise.all([getAdminPosts(), searchParams]);

  return (
    <section aria-labelledby="posts-title">
      <FlashToasts error={result.error} success={result.success} />
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">PUBLISHING</p>
          <h1 id="posts-title">Posts.</h1>
        </div>
        <Link
          className="admin-button"
          href="/admin/posts/upload"
          prefetch={false}
        >
          Upload Markdown
        </Link>
      </div>
      {posts.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Status</th>
                <th>Draft</th>
                <th>Updated</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.slug}>
                  <td>
                    <strong>{post.title}</strong>
                    <small>{post.slug}</small>
                  </td>
                  <td>
                    <span
                      className={`admin-status admin-status-${post.status}`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td>{post.hasDraft ? "Ready" : "—"}</td>
                  <td>
                    {post.updatedAt.toLocaleDateString("en", {
                      dateStyle: "medium",
                    })}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <Link
                        href={`/admin/posts/${post.slug}/preview`}
                        prefetch={false}
                      >
                        Preview
                      </Link>
                      <DeletePostForm slug={post.slug} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="admin-empty">No posts yet.</p>
      )}
    </section>
  );
}
