# Blog Discovery Surfaces Redesign V2

## Context

Previous redesign made two wrong calls:

1. Homepage blog cards lost their visible section title and context, unlike every other portfolio section.
2. `/blog` became a generic editorial grid instead of adapting useful structure from Bamboo's home route.

This revision restores portfolio rhythm and deliberately translates Bamboo's content hierarchy—not its soft visual style, app state, carousel dependency, sidebar, or backend.

### Bamboo home-route findings

Reference: `~/bamboo-single-backend/frontend/src/app/(private-route)/(layout)/page.tsx`

- Page establishes hierarchy before cards: featured story first, then a clearly labeled **Latest dispatches / Fresh writing from the network** feed.
- `FeaturedCarousel` uses a strong split composition: copy and metadata on one side, large cover on the other, tags and direct read action beneath.
- Regular `BlogCard` is a horizontal, text-first story row: title/description/tags/author on left and bounded thumbnail on right.
- Thin separators create reading rhythm without turning every story into an identical floating card.
- Topic chips, carousel controls, docs shelf, and sticky sidebar solve Bamboo's multi-author/many-item product needs. They are unnecessary for this static, single-author portfolio now.

### Portfolio design findings

- Every major homepage section has context before content: poster-scale title, concise lede, and often a subject-specific visual (`PipelineBot`, `DatabaseBlock`, `PagerBird`). Cards alone break this established rhythm.
- Portfolio identity comes from thick dark borders, hard offset shadows, square geometry, bold Darker Grotesque display type, JetBrains Mono metadata, and the coral/gold/blue/cream palette.
- Project cards use asymmetric spans and strong hierarchy rather than a generic equal-card grid.
- Blog discovery should therefore use Bamboo's information hierarchy with portfolio's neobrutalist surfaces.

## Approach

### Homepage

Restore this visible blog section heading, supporting sentence, and `/blog` action above cards:

> NOTES FROM PRODUCTION.
>
> Field-tested ideas on data systems, Kubernetes, and reliable platforms.
>
> View all writing

Redesign `BlogCard` as a neobrutalist version of Bamboo's horizontal story row:

- Text-first content block with date/read time, strong title, short description, tags, and explicit read cue
- Cover thumbnail on right at desktop, above copy on mobile
- Thick outline and hard shadow rather than Bamboo's borderless/soft styling
- One clickable destination per card
- Homepage uses portfolio's asymmetric 12-column rhythm: one post spans all 12 columns; with two posts they span 7/5; with three posts the final card spans all 12 so no grid hole remains

### `/blog`

Use Bamboo's hierarchy in static form:

1. Compact route masthead retaining: **I LOVE WRITING ABOUT SYSTEMS THAT HAVE TO WORK.** with the approved engineer-focused supporting sentence
2. Newest post as one static split feature inspired by `FeaturedCarousel`—no carousel or client state
3. If more posts exist, a labeled **Latest dispatches** feed using the same horizontal `BlogCard`
4. No duplicate post between feature and feed; no empty feed heading when only one post exists

Keep `/blog/[slug]` article reader, cover beside title, sticky/active TOC, and Markdown styling unchanged.

## Files to modify

- `app/page.tsx` — restore blog heading/lede/action and keep latest posts after Projects
- `components/blog/blog-card.tsx` — replace vertical generic card with reusable horizontal story card
- `components/blog/blog-index-card.tsx` — simplify to newest-post feature only; remove unused compact mode
- `app/blog/page.tsx` — replace editorial grid with masthead, static feature, and conditional latest-dispatch feed
- `app/globals.css` — remove failed V2 editorial-grid styles; add homepage section rhythm, horizontal story cards, static feature, and responsive rules
- `plans/blog-index-redesign.md` — no code impact; retain as historical approved plan

No changes:

- `lib/blog.ts` and Markdown content loading
- `app/blog/[slug]/page.tsx`
- `components/blog/article-*`
- Blog article content or cover asset

## Reuse

Portfolio:

- `getBlogPosts(3)` / newest-first ordering: `lib/blog.ts`
- Existing `BlogPostMeta`, date, reading-time, tags, and cover metadata: `lib/blog.ts`
- Existing `Badge`, `Button`, and `Card` primitives: `components/ui/`
- Section-heading pattern and palette tokens: `app/page.tsx`, `app/globals.css`
- Existing cover fallback pattern: `components/blog/blog-card.tsx`

Bamboo behavior references:

- Home hierarchy and conditional sections: `src/app/(private-route)/(layout)/page.tsx`
- Static split-feature inspiration: `src/components/atomsComponents/featuredCarousel/index.tsx`
- Horizontal row inspiration: `src/components/atomsComponents/blogCard/index.tsx`
- Indexed reading-stack rhythm: `src/components/ui/homePage/WhatToReadNext.tsx`

Do not port Bamboo's Redux loading, Embla carousel, autoplay, Framer Motion, skeleton state, author controls, tag filtering, docs shelf, or sidebar.

## Steps

- [x] Restore homepage heading `Notes from production.`, approved lede, and `View all writing` action with valid heading association.
- [x] Rebuild `BlogCard` as one-link horizontal story card and preserve missing-cover fallback, metadata, description, and tags.
- [x] Build homepage blog cards on a 12-column grid: one card spans 12; two cards span 7/5; a third spans 12, with no empty one-third slot.
- [x] Simplify `BlogIndexCard` to a static newest-post feature: copy left and supplied cover right, matching Bamboo's feature hierarchy in portfolio styling.
- [x] Replace `/blog` editorial grid with compact masthead, newest feature, and conditional `Latest dispatches` horizontal feed for remaining posts.
- [x] Delete unused editorial-grid CSS and add thick-border/hard-shadow, hover/focus, long-text, missing-cover, tablet, and 390px mobile states.
- [x] Confirm article detail route and homepage sections outside blog remain unchanged.

## Verification

- Run `npm run test:blog`.
- Run LSP/TypeScript diagnostics and focused ESLint on changed files.
- Run `npm run build`; confirm `/`, `/blog`, and static article route generate.
- Inspect homepage at desktop/tablet/390px: visible approved heading/lede/action, 12 then 7/5 span behavior, no empty columns, and no horizontal overflow.
- Inspect `/blog`: newest post appears once, feature has clear hierarchy, latest-feed heading appears only when later posts exist.
- Verify one-post, several-post, missing-cover, long-title, many-tag, keyboard-focus, and reduced-motion states.
- Confirm `/blog/[slug]`, cover beside article title, TOC active underline, Markdown bullets, and syntax highlighting remain unchanged.
