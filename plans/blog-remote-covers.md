# Blog Remote Cover URLs

## Context

User asked whether Markdown `cover` can reference any public URL.

Current implementation already supports this:

- `lib/blog.ts` accepts full `http://` and `https://` cover URLs, plus local `/blog/...` paths.
- `next.config.ts` allows remote Next.js images from any HTTP(S) hostname.
- `BlogIndexCard` and `ArticleHeader` pass the cover directly to `next/image`.
- `lib/blog.test.ts` already proves an HTTPS URL is accepted and malformed relative paths are rejected.

Frontmatter delimiters must begin at column 1. YAML fields may be indented consistently, but no indentation is needed:

```md
---
title: Post title
description: Short summary
date: 2026-09-08
category: Kubernetes & Platform
tags: [Kubernetes, Cilium]
cover: https://example.com/cover.png
draft: false
---

Article content.
```

## Approach

No implementation requested. Leave current behavior unchanged. User supplied skills for future work only.

## Files to modify

None.

## Reuse

- Existing cover validator: `lib/blog.ts`
- Existing Next.js remote image configuration: `next.config.ts`
- Existing cover rendering: `components/blog/blog-index-card.tsx`, `components/blog/article-header.tsx`

## Steps

- [x] Confirm existing behavior from source.
- [x] Make no implementation changes.

## Verification

No verification run needed because code remains unchanged.
