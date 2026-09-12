# Blog Feature Plan

## Context

Add a filesystem-backed blog to this Next.js portfolio, keeping the current neobrutalist theme. Posts will be new local Markdown files; no Bamboo backend, authentication, editor, Redux, comments, or migration.

Bamboo Graphify findings (`~/bamboo-single-backend/frontend/graphify-out/GRAPH_REPORT.md`):

- Blog detail route is only a thin wrapper around `BlogRenderPage`.
- Graphify isolates article rendering as its own community: `ArticleRender`, `ArticleHeader`, TOC, mobile TOC, and previous/next navigation.
- API/Redux, collaborative editor, comments, bookmarks, AI actions, and private routing are separate communities and are not needed here.
- Bamboo content is Markdown rendered through `react-markdown`, `remark-gfm`, and `remark-breaks`. For this portfolio, “same content blocks” means its core reader set: headings/anchors, paragraphs, images, fenced and inline code, ordered/unordered/task lists, tables, links, blockquotes, emphasis/strikethrough, and horizontal rules.

## Approach

Use static local Markdown under `content/blog/` with YAML frontmatter parsed by the already-installed `yaml` package. Add `react-markdown`, `remark-gfm`, `remark-breaks`, `rehype-highlight`, and `highlight.js`; do not port Bamboo's editor or application state.

Render the full reader as server components. Recreate Bamboo's useful core flow—article metadata, deterministic heading anchors, a static desktop TOC, a native mobile TOC disclosure, rich Markdown blocks, local images, and build-time syntax highlighting—but omit code-copy, whole-post actions, previous/next navigation, active-scroll tracking, comments, bookmarks, and AI. Restyle every surface with existing portfolio tokens, thick borders, hard shadows, display type, and mono metadata.

Recommended post frontmatter:

```yaml
---
title: Reliable Flink Checkpoints on Kubernetes
description: Practical recovery patterns for stateful streaming jobs.
date: 2026-09-07
tags: [Flink, Kubernetes, Kafka]
cover: /blog/flink-checkpoints/cover.webp
draft: false
---
```

Slug comes from filename (`reliable-flink-checkpoints.md`), avoiding duplicate IDs.

## Files to modify

- `package.json` — add minimal Markdown renderer dependencies and blog test command
- `app/page.tsx` — use shared site shell and add three latest posts after Projects
- `app/globals.css` — scope hero-only heading rules, then add blog cards, article typography, TOC, highlighted code, table, image, and responsive styles using existing tokens
- `components/site-header.tsx` and `components/site-footer.tsx` — reuse current portfolio navigation/footer on blog routes
- `app/blog/page.tsx` — published-post index
- `app/blog/[slug]/page.tsx` — static params, per-post metadata, article, and not-found handling
- `app/blog/[slug]/not-found.tsx` — themed missing-post state
- `lib/blog.ts` — frontmatter parsing, validation, sorting, reading time, slug lookup, adjacent-post lookup
- `lib/markdown.ts` — shared heading slug/TOC extraction used by renderer and TOC
- `components/blog/article-renderer.tsx` — Markdown element mapping
- `components/blog/blog-card.tsx` — shared homepage/index card
- `components/blog/article-toc.tsx` — static desktop TOC and native mobile disclosure
- `content/blog/flink-checkpoints-on-kubernetes.md` — first published post covering checkpoints, recovery, Kafka, and Iceberg
- `public/blog/flink-checkpoints-on-kubernetes/` — optional local cover/body images
- `lib/blog.test.ts` — focused Node tests for frontmatter validation, sorting, draft filtering, and stable TOC IDs

## Reuse

Portfolio:

- Theme tokens, fonts, section shells, responsive conventions: `app/globals.css`
- Header/navigation and server-side filesystem pattern: `app/page.tsx`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`: `components/ui/card.tsx`
- `Badge`, `Button`, `Separator`: `components/ui/`
- Existing YAML parser dependency: `yaml`
- Existing Public Sans, Darker Grotesque, and JetBrains Mono variables: `app/layout.tsx`

Bamboo behavior references:

- Route/render flow: `src/app/(private-route)/(layout)/blog/[id]/page.tsx`, `src/components/ui/blogRender/index.tsx`
- Markdown mappings: `src/components/atomsComponents/Article/articleRender/index.tsx`
- Heading extraction: `src/lib/utils.ts`
- Header metadata: `src/components/atomsComponents/Article/ArticleHeader.tsx`
- TOC behavior: `src/components/atomsComponents/Article/articleTableContent/index.tsx`, `ArticleMobileToc.tsx`
- Previous/next flow: `src/components/atomsComponents/Article/ArticleNavigation.tsx`

Reuse behavior, not Bamboo's heavy dependencies or soft visual style. Specifically avoid `framer-motion`, Redux, TipTap, Sonner, Lucide, `react-syntax-highlighter`, dialogs, sidebar primitives, and API clients. `rehype-highlight` performs build-time highlighting without a client component.

## Steps

- [x] Add `react-markdown`, `remark-gfm`, `remark-breaks`, `rehype-highlight`, and `highlight.js`; add a Node test script using Node 26's TypeScript support.
- [x] Define and validate frontmatter fields; reject malformed dates, missing titles/descriptions, duplicate slugs, and non-local cover paths during build.
- [x] Implement cached post listing/lookup, published filtering, descending date sort, and reading-time estimate. Previous/next remains omitted by the approved “TOC only” selection.
- [x] Implement shared deterministic heading slugging and fenced-code-aware TOC extraction; test renderer/TOC ID agreement.
- [x] Scope the existing global hero `h1` size, width, and line-height rules to `.hero h1`, preventing them from constraining article titles.
- [x] Build themed Markdown mappings for headings, paragraphs, links, local images, inline/fenced code, ordered/unordered/task lists, tables, blockquotes, emphasis/strikethrough, and horizontal rules.
- [x] Apply `rehype-highlight` at build time and style generated `.hljs-*` spans with the existing palette; keep code horizontally scrollable on mobile.
- [x] Build article header with cover, title, description, tags, publication date, and reading time.
- [x] Add desktop sticky TOC and a native `<details>` mobile disclosure; do not add scroll listeners or animation.
- [x] Add themed not-found state.
- [x] Build `/blog` index and shared blog cards; handle missing covers without layout shift.
- [x] Extract the current header/footer into shared server components, add `Blog` to navigation, and render the three latest posts directly after Projects without changing hero alignment.
- [x] Publish `flink-checkpoints-on-kubernetes.md` as the starter post. Cover checkpoint configuration, failure recovery, Kafka offsets, Iceberg writes, and Kubernetes operations while exercising headings, links, lists, a task list, blockquote, table, fenced YAML/code, inline code, horizontal rule, and optional local image.

## Verification

Automated:

- Run `node --experimental-strip-types --test lib/blog.test.ts`.
- Run LSP diagnostics on all TypeScript/TSX files.
- Run focused ESLint excluding archived `por/`.
- Run `npm run build`; confirm `/blog` and every published `/blog/[slug]` route generate, while drafts do not.

Manual:

- Check homepage cards, blog index, valid post, invalid slug, metadata, static desktop/mobile TOC links, and direct anchor links.
- Check long titles, missing cover, long unbroken links, wide tables, highlighted fenced code, and images at desktop and 390px mobile widths.
- Confirm existing homepage hero typography and mobile alignment remain visually unchanged after scoping its `h1` rules.
- Verify keyboard access to navigation, mobile TOC disclosure, and article links.
- Verify heading hierarchy, alt text, focus visibility, contrast, no horizontal overflow, and reduced-motion behavior.
