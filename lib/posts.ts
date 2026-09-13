import { unstable_cache } from "next/cache";
import type { BlogPost, BlogPostMeta } from "@/lib/blog";
import { parseBlogPost } from "@/lib/blog";
import { getDatabase } from "@/lib/db";

type PostRow = {
  slug: string;
  title: string;
  description: string;
  post_date: Date;
  category: string;
  tags: string[];
  cover: string | null;
  reading_time: number;
};

function rowToMeta(row: PostRow): BlogPostMeta {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.post_date.toISOString().slice(0, 10),
    category: row.category,
    tags: row.tags,
    cover: row.cover ?? undefined,
    draft: false,
    readingTime: row.reading_time,
  };
}

export async function getBlogPosts(limit?: number): Promise<BlogPostMeta[]> {
  try {
    const sql = getDatabase();
    const rows = limit
      ? await sql<PostRow[]>`
          SELECT slug, title, description, post_date, category, tags, cover, reading_time
          FROM posts
          WHERE published_at IS NOT NULL AND archived_at IS NULL
          ORDER BY post_date DESC
          LIMIT ${limit}
        `
      : await sql<PostRow[]>`
          SELECT slug, title, description, post_date, category, tags, cover, reading_time
          FROM posts
          WHERE published_at IS NOT NULL AND archived_at IS NULL
          ORDER BY post_date DESC
        `;
    return rows.map(rowToMeta);
  } catch (error) {
    const errors = error instanceof AggregateError ? error.errors : [error];
    if (
      errors.every(
        (item) => (item as NodeJS.ErrnoException).code === "ECONNREFUSED",
      )
    )
      return [];
    throw error;
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const [row] = await getDatabase()<Array<{ published_source: string }>>`
    SELECT published_source
    FROM posts
    WHERE slug = ${slug} AND published_at IS NOT NULL AND archived_at IS NULL
  `;
  return row ? parseBlogPost(`${slug}.md`, row.published_source) : undefined;
}

export const getCachedBlogPosts = unstable_cache(
  getBlogPosts,
  ["published-posts"],
  { revalidate: 60, tags: ["posts"] },
);

export const getCachedBlogPost = unstable_cache(
  getBlogPost,
  ["published-post"],
  { revalidate: 60, tags: ["posts"] },
);

export type AdminPostSummary = {
  slug: string;
  title: string;
  status: "published" | "draft" | "unpublished" | "archived";
  hasDraft: boolean;
  updatedAt: Date;
};

export async function getAdminPosts(): Promise<AdminPostSummary[]> {
  const rows = await getDatabase()<
    Array<{
      slug: string;
      title: string | null;
      draft_source: string | null;
      published_source: string | null;
      published_at: Date | null;
      archived_at: Date | null;
      updated_at: Date;
    }>
  >`
    SELECT slug, title, draft_source, published_source, published_at, archived_at, updated_at
    FROM posts
    ORDER BY updated_at DESC
  `;

  return rows.map((row) => ({
    slug: row.slug,
    title:
      row.title ??
      (row.draft_source
        ? parseBlogPost(`${row.slug}.md`, row.draft_source).title
        : row.slug),
    status: row.archived_at
      ? "archived"
      : row.published_at
        ? "published"
        : row.published_source
          ? "unpublished"
          : "draft",
    hasDraft: Boolean(row.draft_source),
    updatedAt: row.updated_at,
  }));
}

export async function savePostDraft(
  filename: string,
  source: string,
): Promise<BlogPost> {
  const post = parseBlogPost(filename, source);
  await getDatabase()`
    INSERT INTO posts (slug, draft_source)
    VALUES (${post.slug}, ${source})
    ON CONFLICT (slug) DO UPDATE
    SET draft_source = excluded.draft_source, updated_at = now()
  `;
  return post;
}

export async function getPostPreview(
  slug: string,
): Promise<BlogPost | undefined> {
  const [row] = await getDatabase()<
    Array<{ draft_source: string | null; published_source: string | null }>
  >`
    SELECT draft_source, published_source FROM posts WHERE slug = ${slug}
  `;
  const source = row?.draft_source ?? row?.published_source;
  return source ? parseBlogPost(`${slug}.md`, source) : undefined;
}

export async function publishPost(slug: string): Promise<boolean> {
  const sql = getDatabase();
  return sql.begin(async (transaction) => {
    const [row] = await transaction<
      Array<{ draft_source: string | null; published_source: string | null }>
    >`
      SELECT draft_source, published_source FROM posts WHERE slug = ${slug} FOR UPDATE
    `;
    const source = row?.draft_source ?? row?.published_source;
    if (!source) return false;

    const post = parseBlogPost(`${slug}.md`, source);
    await transaction`
      UPDATE posts
      SET published_source = ${source}, draft_source = NULL, title = ${post.title},
          description = ${post.description}, post_date = ${post.date}::date,
          category = ${post.category}, tags = ${post.tags}, cover = ${post.cover ?? null},
          reading_time = ${post.readingTime}, published_at = now(), archived_at = NULL,
          updated_at = now()
      WHERE slug = ${slug}
    `;
    return true;
  });
}

export async function unpublishPost(slug: string): Promise<void> {
  await getDatabase()`
    UPDATE posts SET published_at = NULL, updated_at = now() WHERE slug = ${slug}
  `;
}

export async function archivePost(slug: string): Promise<void> {
  await getDatabase()`
    UPDATE posts
    SET published_at = NULL, archived_at = now(), updated_at = now()
    WHERE slug = ${slug}
  `;
}
