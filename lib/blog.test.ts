import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { loadBlogPosts, parseBlogPost } from "./blog.ts";
import { createHeadingSlugger, extractToc } from "./markdown.ts";

function post(date: string, extra = ""): string {
  return `---
title: Test post
description: Test description
date: ${date}
category: Kubernetes & Platform
tags: [Kubernetes]
${extra}---
# Intro

Post body.
`;
}

test("frontmatter validation rejects invalid dates, categories, and bad covers", () => {
  assert.throws(
    () => parseBlogPost("bad.md", post("2026-02-31")),
    /date must be/,
  );
  assert.throws(
    () =>
      parseBlogPost(
        "bad.md",
        post("2026-09-07").replace("category: Kubernetes & Platform\n", ""),
      ),
    /category is required/,
  );
  // Relative path (not /blog/ and not https://) must be rejected
  assert.throws(
    () =>
      parseBlogPost(
        "bad.md",
        post("2026-09-07", "cover: ../sneaky/path.png\n"),
      ),
    /local \/blog\/ path or a full https/,
  );
  // Bare hostname without protocol must be rejected
  assert.throws(
    () =>
      parseBlogPost(
        "bad.md",
        post("2026-09-07", "cover: example.com/a.png\n"),
      ),
    /local \/blog\/ path or a full https/,
  );
  // Valid remote https:// URL must be accepted
  assert.doesNotThrow(() =>
    parseBlogPost(
      "ok.md",
      post("2026-09-07", "cover: https://example.com/cover.png\n"),
    ),
  );
});

test("post loader filters drafts and sorts newest first", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "portfolio-blog-"));
  try {
    writeFileSync(path.join(directory, "older.md"), post("2026-09-01"));
    writeFileSync(path.join(directory, "newer.md"), post("2026-09-07"));
    writeFileSync(
      path.join(directory, "draft.md"),
      post("2026-09-08", "draft: true\n"),
    );

    assert.deepEqual(
      loadBlogPosts(directory).map(({ slug }) => slug),
      ["newer", "older"],
    );
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test("TOC IDs match renderer slugging and ignore fenced headings", () => {
  const markdown = `# Flink **Recovery**
## Checkpoints
\`\`\`md
# Not a heading
\`\`\`
## Checkpoints`;
  const toc = extractToc(markdown);
  const slug = createHeadingSlugger();

  assert.deepEqual(toc, [
    { id: slug("Flink Recovery"), title: "Flink Recovery", depth: 1 },
    { id: slug("Checkpoints"), title: "Checkpoints", depth: 2 },
    { id: slug("Checkpoints"), title: "Checkpoints", depth: 2 },
  ]);
});
