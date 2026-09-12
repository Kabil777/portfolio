# Blog Feature Plan

## Context

Add a blog to the existing Next.js portfolio while preserving its current neobrutalist visual system. Reuse the article-rendering behavior from `~/bamboo-single-backend/frontend` as reference, but keep this implementation Next.js-only and avoid bringing over that app's private-route, Redux, or backend architecture unless required.

Initial findings:

- Portfolio uses Next.js App Router, server-rendered `app/page.tsx`, local `config.yaml`, and existing shadcn-style `Card`, `Badge`, `Button`, and `Separator` components.
- Portfolio currently has no content/MDX dependency or blog routes.
- Reference app exposes blog detail at `src/app/(private-route)/(layout)/blog/[id]/page.tsx` and rendering primitives under `src/components/ui/blogRender/`.

## Approach

Recommended baseline: filesystem-backed posts rendered by Next.js server components, with a themed blog index and dynamic post route. Mirror only the useful rendering rules from the reference app; use existing portfolio tokens/components for all presentation.

Final content format, URL scheme, authoring workflow, and exact renderer scope remain pending user decisions.

## Files to modify

Expected paths (to confirm after deeper inspection):

- `app/page.tsx` — blog navigation/preview entry point
- `app/globals.css` — blog index/article styles using existing tokens
- `app/blog/page.tsx` — blog index
- `app/blog/[slug]/page.tsx` — article rendering and metadata
- `content/blog/*` — local post source files
- `lib/blog.ts` — minimal filesystem loading, sorting, and lookup
- `package.json` — only if chosen source format needs an already-unavailable parser

## Reuse

- Existing theme tokens and responsive rules: `app/globals.css`
- Existing header/navigation and tool-logo patterns: `app/page.tsx`
- Existing shadcn card primitives: `components/ui/card.tsx`
- Reference rendering flow to inspect: `~/bamboo-single-backend/frontend/src/app/(private-route)/(layout)/blog/[id]/page.tsx`
- Reference renderer primitives to inspect: `~/bamboo-single-backend/frontend/src/components/ui/blogRender/`

## Steps

- [ ] Confirm blog requirements and authoring model.
- [ ] Trace reference blog fetch → state → renderer flow and identify reusable rendering behavior.
- [ ] Define local post schema and filesystem loader.
- [ ] Add blog index with current neobrutalist card language.
- [ ] Add dynamic article route, metadata, and not-found behavior.
- [ ] Add article renderer matching required reference block types.
- [ ] Link blog from portfolio navigation/home without disrupting mobile alignment.
- [ ] Add one representative post fixture covering supported content blocks.
- [ ] Verify desktop/mobile rendering, accessibility, static generation, lint, and production build.

## Verification

- Run TypeScript/LSP diagnostics for all added/changed files.
- Run focused ESLint excluding archived `por/` copy.
- Run `npm run build` and confirm blog routes generate successfully.
- Manually verify blog index, valid post, invalid slug, metadata, internal links, long code blocks, images, and mobile overflow.
- Verify keyboard focus, heading hierarchy, readable contrast, and reduced-motion behavior.
