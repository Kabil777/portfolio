import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { parseBlogPost } from "../lib/blog.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const sql = postgres(databaseUrl, { max: 1, prepare: false });
const directory = path.join(process.cwd(), "content/blog");
let imported = 0;

try {
  const files = await readdir(directory);
  for (const filename of files.filter((name) => name.endsWith(".md")).sort()) {
    const source = await readFile(path.join(directory, filename), "utf8");
    const post = parseBlogPost(filename, source);
    const rows = await sql`
      INSERT INTO posts (
        slug, published_source, draft_source, title, description, post_date,
        category, tags, cover, reading_time, published_at
      )
      VALUES (
        ${post.slug},
        ${post.draft ? null : source},
        ${post.draft ? source : null},
        ${post.draft ? null : post.title},
        ${post.draft ? null : post.description},
        ${post.draft ? null : post.date}::date,
        ${post.draft ? null : post.category},
        ${post.draft ? [] : post.tags},
        ${post.draft ? null : (post.cover ?? null)},
        ${post.draft ? null : post.readingTime},
        ${post.draft ? null : new Date().toISOString()}::timestamptz
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING slug
    `;
    imported += rows.length;
  }
  process.stdout.write(
    `Imported ${imported} post(s); existing slugs were left unchanged.\n`,
  );
} finally {
  await sql.end();
}
