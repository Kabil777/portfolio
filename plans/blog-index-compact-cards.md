# Compact `/blog` Index Plan

## Context

Redesign `/blog` only. Homepage is now satisfactory and must remain unchanged.

Current `/blog` is oversized for four posts because it applies two Bamboo home-page patterns that do not fit this portfolio index:

- One newest post becomes a large split banner.
- Remaining posts become full-width horizontal feed rows.

Those choices were intended to create editorial hierarchy, but they reduce scan density and make one post look disproportionately important. User wants the earlier compact card behavior back.

## Approach

Remove featured-post treatment and latest-dispatch rows. Render every published post once, with equal compact image-led cards grouped under visible topic headings. Selected layout: compact title band, three cards per desktop row, and one whole-card link per post.

Recommended card content follows the earlier portfolio version:

1. Fixed-ratio cover on top
2. Date and reading time
3. Strong but bounded title
4. Short description
5. Compact topic badges

Keep neobrutalist borders, hard shadows, existing palette, and one clickable card destination. Replace the current large masthead with a compact band:

> BLOG
>
> I write about systems that must work.

Current cards form two sections:

- **Kubernetes & Platform** — Cilium, Kyverno, KEDA/Volcano
- **Data & Streaming** — Flink

Required free-form `category` frontmatter controls grouping. Any new non-empty category creates another section automatically; no category whitelist or code update is required.

## Files to modify

- `app/blog/page.tsx` — remove newest/rest split and render dynamic topic sections with compact grids
- `components/blog/blog-index-card.tsx` — replace split feature with equal compact vertical card
- `app/globals.css` — remove feature/feed CSS and add compact index masthead/topic/grid/card/responsive rules
- `lib/blog.ts` — add required free-form category metadata and validation
- `lib/blog.test.ts` — add category to fixtures and verify missing categories fail
- `content/blog/*.md` — assign current categories

Intentionally unchanged:

- `app/page.tsx` and `components/blog/blog-card.tsx` — approved homepage blog section/cards
- `app/blog/[slug]/page.tsx` and all `components/blog/article-*` reader UI
- Markdown article bodies, dates, covers, tags, and ordering behavior

## Reuse

- Original compact hierarchy retained in project history and current `BlogPostMeta` fields
- Existing local cover and missing-cover behavior: `components/blog/blog-index-card.tsx`
- `getBlogPosts()` newest-first published list: `lib/blog.ts`
- Existing `Badge` primitive: `components/ui/badge.tsx`
- Portfolio border, shadow, font, and palette tokens: `app/globals.css`

## Steps

- [x] Add required free-form `category` metadata in `lib/blog.ts`; validate it and update the focused parser test.
- [x] Assign `Kubernetes & Platform` or `Data & Streaming` to all four Markdown posts.
- [x] Replace newest/rest branching with dynamic topic sections; keep newest-first order inside each group and preserve empty state.
- [x] Rebuild `BlogIndexCard` as equal vertical cards with fixed cover ratio, bounded copy, tags, and one wrapping link.
- [x] Replace oversized masthead with compact `BLOG / I write about systems that must work.` title band.
- [x] Delete `.blog-feature-*`, `.blog-latest*`, and obsolete index responsive rules.
- [x] Add index-only three-column desktop grid, two-column tablet grid, one-column mobile grid, safe image crops, long-title wrapping, visible keyboard focus, and reduced-motion-safe hover.
- [x] Confirm article reader and homepage remain unchanged.

## Verification

- Run `npm run test:blog`, focused ESLint, TypeScript diagnostics, and `npm run build`.
- Confirm all four posts appear once, grouped under the correct topic and sorted by descending date within each group.
- Check `/blog` at desktop, tablet, and 390px mobile widths.
- Verify compact cover heights, equal card behavior, long titles, many tags, missing covers, empty state, keyboard focus, and no horizontal overflow.
- Confirm homepage and `/blog/[slug]` rendering remain unchanged.
