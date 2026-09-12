# Blog Cards and Index Redesign Plan

## Context

Redesign two reader-discovery surfaces while preserving the approved article reader:

- Homepage blog preview after Projects (`app/page.tsx`)
- Blog index at `/blog` (`app/blog/page.tsx`)

Current discovery UI reuses one generic three-column `BlogCard` in both places. With one published post, `/blog` leaves most of the grid empty and gives the cover, title, metadata, description, and tags equal visual weight. Goal: make writing feel intentional and editorial while staying inside the existing neobrutalist Data + Platform identity.

## Approach

Keep `/blog/[slug]` unchanged. Rebuild only `/blog` as an editorial grid. Replace all current index copy (`WRITING FROM THE CONTROL PLANE`, supporting copy, `LATEST WRITING`, and `All field notes`) with one masthead:

> I LOVE WRITING ABOUT SYSTEMS THAT HAVE TO WORK.
>
> Field notes for engineers building data platforms, Kubernetes infrastructure, and calmer production operations.

Newest post becomes a wide split feature: cover left; date/read time, large title, summary, tags, and read affordance right. Later posts occupy smaller image-led grid cells. With the current single post, the feature fills the available grid rather than showing fake or empty cards.

Homepage keeps only its current cards after Projects; remove the `FIELD NOTES` heading, section title, intro, and `Read All Posts` action. Keep current homepage card markup and appearance unchanged. Keep implementation static and server-rendered. Do not add search, filters, pagination, animation, or backend hooks until multiple posts or backend requirements make them useful.

## Files to modify

- `components/blog/blog-index-card.tsx` — new index-only feature/standard editorial card; one wrapping link avoids nested interactive elements
- `app/page.tsx` — remove homepage blog heading/actions while retaining current `BlogCard` grid after Projects
- `app/blog/page.tsx` — replace current repeated hero/section hierarchy with one masthead and editorial grid
- `app/globals.css` — remove obsolete index styles and add responsive masthead/feature/standard editorial-grid styles

Intentionally unchanged:

- `components/blog/blog-card.tsx` — existing homepage cards
- `app/blog/[slug]/page.tsx` and `components/blog/article-*` — approved article reader

Possible only if content wording changes:

- `content/blog/flink-checkpoints-on-kubernetes.md` — metadata copy only; article body remains untouched

## Reuse

- `getBlogPosts()` and `BlogPostMeta`: `lib/blog.ts`
- Existing cover fallback and local `next/image` handling: `components/blog/blog-card.tsx`
- Existing `Card`, `Badge`, and `Button`: `components/ui/`
- Shared navigation/footer: `components/site-header.tsx`, `components/site-footer.tsx`
- Existing palette, hard borders/shadows, display and mono fonts: `app/globals.css`
- Current cover asset: `public/blog/flink-checkpoints-on-kubernetes/cover.png`

## Steps

- [x] Remove homepage blog heading/copy/button and now-unused `Link` import; retain current `BlogCard` grid and its position after Projects, replacing the removed `aria-labelledby` reference with an `aria-label`.
- [x] Add `BlogIndexCard` with a feature mode for newest post and compact mode for later posts; use one wrapping link per card and preserve cover fallback, metadata, summary, and tags.
- [x] Replace `/blog` current coral hero plus repeated section heading with one editorial masthead using approved personal writing copy.
- [x] Split newest post from remaining posts in `app/blog/page.tsx`; render one wide feature followed by a varied two-column editorial grid, with no fake cards when only one post exists.
- [x] Remove superseded `.blog-index-hero` styles and add restrained index-specific color blocks, hard borders/shadows, stable image crops, and clear hover/focus feedback.
- [x] Add tablet and 390px mobile reflow: split feature becomes vertical, later grid becomes one column, text remains unclipped, and cover ratios stay stable.
- [x] Preserve empty state, published-post ordering, server rendering, and current homepage card UI.

## Verification

- Run LSP diagnostics and focused ESLint on changed TSX files.
- Run `npm run test:blog` and `npm run build`.
- Compare homepage and `/blog` at desktop, tablet, and 390px mobile widths.
- Confirm homepage shows cards only and cards are visually unchanged.
- Verify newest feature plus subsequent-card ordering, one-post, missing-cover, long-title, many-tag, and empty states.
- Verify each index card has one keyboard-focusable destination, visible focus feedback, and no nested interactive elements.
- Confirm `/blog/[slug]`, sticky/active TOC, Markdown lists, and article header remain unchanged.
