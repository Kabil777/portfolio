import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  cover?: string;
  draft: boolean;
  readingTime: number;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

export function blogExcerptMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block && !/^(#\s|!\[|\|)/.test(block))
    .slice(0, 6)
    .join("\n\n");
}

export function blogExcerpt(content: string): string {
  return blogExcerptMarkdown(content)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fail(filename: string, message: string): never {
  throw new Error(`Invalid blog post ${filename}: ${message}`);
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

export function parseBlogPost(filename: string, source: string): BlogPost {
  const normalized = source.replaceAll("\r\n", "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) fail(filename, "missing YAML frontmatter");

  const data = parse(match[1]) as Record<string, unknown> | null;
  if (!data || typeof data !== "object")
    fail(filename, "frontmatter must be a mapping");
  if (typeof data.title !== "string" || !data.title.trim())
    fail(filename, "title is required");
  if (typeof data.description !== "string" || !data.description.trim()) {
    fail(filename, "description is required");
  }
  if (!isIsoDate(data.date))
    fail(filename, "date must be a valid YYYY-MM-DD value");
  if (typeof data.category !== "string" || !data.category.trim()) {
    fail(filename, "category is required");
  }
  if (
    data.tags !== undefined &&
    (!Array.isArray(data.tags) ||
      data.tags.some((tag) => typeof tag !== "string"))
  ) {
    fail(filename, "tags must be a string array");
  }
  if (data.cover !== undefined) {
    if (typeof data.cover !== "string") {
      fail(filename, "cover must be a string");
    }
    const isLocalPath =
      data.cover.startsWith("/blog/") && !data.cover.includes("..");
    const isRemoteUrl = /^https?:\/\/.+/.test(data.cover);
    if (!isLocalPath && !isRemoteUrl) {
      fail(
        filename,
        "cover must be a local /blog/ path or a full https:// URL",
      );
    }
  }
  if (data.draft !== undefined && typeof data.draft !== "boolean") {
    fail(filename, "draft must be true or false");
  }

  const slug = filename.replace(/\.md$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(filename, "filename must be a lowercase kebab-case .md slug");
  }

  const content = match[2].trim();
  return {
    slug,
    title: data.title.trim(),
    description: data.description.trim(),
    date: data.date,
    category: data.category.trim(),
    tags: (data.tags as string[] | undefined) ?? [],
    cover: data.cover as string | undefined,
    draft: data.draft ?? false,
    readingTime: Math.max(
      1,
      Math.ceil(content.split(/\s+/).filter(Boolean).length / 220),
    ),
    content,
  };
}

export function loadBlogPosts(directory: string): BlogPost[] {
  const seen = new Set<string>();

  return readdirSync(directory)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const post = parseBlogPost(
        filename,
        readFileSync(path.join(directory, filename), "utf8"),
      );
      const key = post.slug.toLowerCase();
      if (seen.has(key)) fail(filename, `duplicate slug ${post.slug}`);
      seen.add(key);
      return post;
    })
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}
