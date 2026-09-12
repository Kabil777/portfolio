# Newsletter + Blog Admin Platform Plan

## Context

Evolve current portfolio into portfolio + newsletter site without replacing its public visual identity. Add private admin panel for publishing Markdown posts, previewing before publish, reading blog analytics, moderating comments, tracking likes, and managing newsletter subscribers.

Current constraints discovered:

- Blog source is build-time Markdown under `content/blog/`.
- `lib/blog.ts` reads local files synchronously and caches published results.
- No database, authentication, API layer, analytics, email service, or admin route exists.
- Current Markdown parser already validates title, description, date, category, tags, cover, draft, slug, and computes reading time.
- Existing article renderer and `/blog` discovery UI should be reused.
- Runtime admin publishing cannot safely persist into deployed local filesystem; posts need durable storage or a Git-backed publishing workflow.

## Approach

Recommended baseline: portable PostgreSQL remains source of truth for posts and application data; Next.js App Router serves public and admin surfaces. Use direct SQL migrations and one thin PostgreSQL driver rather than an ORM. Use native `fetch` for GitHub and Resend APIs rather than provider SDKs. Admin accepts `.md` uploads, runs the existing frontmatter parser, shows the exact public article preview, then saves a draft or publishes.

Research and selected implementation:

- Admin authentication uses standard Ed25519 primitives through browser WebCrypto and Node `crypto`, not a hand-written algorithm. Short-lived, single-use database challenges prevent replay.
- Resend Broadcasts provide API-created/scheduled broadcasts, contact segments, managed unsubscribe URLs, delivery metrics, and contact webhooks. PostgreSQL remains local source of truth while Resend performs delivery and suppression.
- Full post Markdown renders into a dedicated email-safe React template with inline styles, absolute URLs, canonical web link, and Resend unsubscribe placeholder. Open/click tracking remains disabled.

Decisions so far:

- Deployment must remain portable across Vercel and self-hosted Node.
- Posts, raw Markdown, and application data will live in portable PostgreSQL; no Git publish pipeline.
- Post intake is `.md` upload with YAML frontmatter, validation, and exact article preview; no content editor.
- Newsletter v1 must both collect subscribers and send campaigns.
- Analytics are privacy-first basics: views, daily uniques, referrers, top posts, likes, comments, and subscriber growth.
- Reader comments require GitHub sign-in.
- Admin auth uses Ed25519 challenge-response, similar in principle to WireGuard keys: public keys configured server-side; private key files remain with administrator.

Further decisions:

- Admin uses an Ed25519 private-key file. `config.yaml` stores only public key; browser imports private PKCS#8 key transiently and signs a one-time challenge. Server verifies via Node `crypto`; private key is never uploaded or persisted.
- Likes are anonymous and reversible per first-party reader cookie.
- Comments require GitHub OAuth, publish immediately, and can be hidden/deleted or authors blocked from admin.
- Newsletter campaigns derive from a selected published post, render full article, then preview, test-send, and send/schedule through Resend.

Finalized product behavior:

- Post lifecycle: upload as draft, preview, publish, replace an existing slug through a new draft, unpublish, and archive; no hard-delete UI.
- Covers stay URL-based in YAML frontmatter; no media library or object storage in v1.
- Newsletter uses double opt-in and signup appears only at article end.
- Comments are flat, GitHub-authenticated, immediately visible, and admin-hideable.
- Database access is provider-neutral through `DATABASE_URL`; Docker Compose supplies local/self-hosted PostgreSQL.
- Newsletter analytics track delivery, bounce, complaint, and unsubscribe only. Open/click tracking stays disabled.
- `config.yaml` supports named primary and backup Ed25519 public keys; private files remain separate.

- Campaign email contains full article, canonical web link, and unsubscribe footer.

Configuration shape:

```yaml
site:
  url: https://example.com
admin:
  publicKeys:
    - id: primary
      publicKey: |-
        -----BEGIN PUBLIC KEY-----
        ...
        -----END PUBLIC KEY-----
    - id: backup
      publicKey: |-
        -----BEGIN PUBLIC KEY-----
        ...
        -----END PUBLIC KEY-----
newsletter:
  from: Kabil <newsletter@example.com>
```

Secrets stay in environment variables: `DATABASE_URL`, GitHub client secret, Resend API/webhook secrets, session/HMAC secret. Public IDs may also use environment variables where deployment requires them.

## Data model

Use SQL migrations, foreign keys, unique constraints, and timestamps. Keep schema narrow:

- `posts`: slug primary key, current published metadata/body, pending draft source, publication/archive timestamps. Publishing atomically promotes validated draft so editing never exposes half-finished content.
- `post_daily_stats`: post slug/date totals for views and daily uniques.
- `post_daily_visitors`: post/date plus daily HMAC visitor hash, used only to deduplicate uniques. Raw IP and user agent are never stored.
- `post_referrer_daily`: post/date/referrer-host aggregate counts; no full referring paths or query strings.
- `likes`: post slug plus hashed random reader-cookie ID as unique key; insert/delete implements like/unlike.
- `github_users`: GitHub numeric ID, current login/avatar, blocked timestamp.
- `reader_sessions`: GitHub user, opaque session-token hash, expiry.
- `comments`: post slug, GitHub user, plain-text body, visible/hidden state, timestamps. No nesting.
- `admin_challenges`: one-time nonce hash and short expiry for replay-safe Ed25519 login.
- `admin_sessions`: random session-token hash and expiry; secure HTTP-only cookie carries only raw opaque token.
- `subscribers`: normalized email, pending/active/unsubscribed state, consent timestamps, confirmation token hash, Resend contact ID.
- `campaigns`: unique source post, Resend broadcast ID, draft/scheduled/sent state, delivery/bounce/complaint/unsubscribe counters, timestamps. Unique post constraint prevents accidental duplicate newsletter sends.
- `webhook_events`: Resend event ID primary key for idempotent contact/unsubscribe/delivery synchronization.
- `rate_limits`: hashed actor/action/time bucket and request count so limits work across serverless instances.

## Admin and public surfaces

- `/admin/login`: choose named key, select private PKCS#8 file, sign one-time challenge locally, create secure session. Key material is not retained after login.
- `/admin`: 7/30/90-day summary cards, compact CSS bar trend, top posts, recent comments, subscriber growth, recent sends.
- `/admin/posts`: published/draft/archived states and actions.
- `/admin/posts/upload`: native `.md` file input; validate and save draft.
- `/admin/posts/[slug]/preview`: exact `ArticleHeader` + `ArticleRenderer` preview with publish/unpublish/archive actions.
- `/admin/comments`: search/filter, hide/show, delete, block/unblock GitHub user.
- `/admin/subscribers`: status/search, CSV export, manual unsubscribe; no manual subscribe without consent.
- `/admin/campaigns`: select published post, preview email, send test, then send now or schedule.
- Public article footer: anonymous like toggle, GitHub sign-in/comment form, flat comments, then newsletter signup. No signup block is added to homepage or `/blog`.
- `/newsletter/confirm`: activate double-opt-in token.
- `/api/auth/github/*`, `/api/analytics/view`, `/api/resend/webhook`: focused Route Handlers for OAuth, browser beacon, and signed provider events.

## Scope boundaries

Deliberately excluded from v1:

- Rich-text or inline Markdown editor
- Cover upload/media library
- Threaded comments or social profiles
- Hard-delete controls
- Popups or site-wide newsletter signup
- Third-party behavioral analytics, full IP storage, geography/device profiling
- Email open pixels or tracked-link redirects
- Charting, ORM, auth, or provider SDK dependencies when existing React/Node/Web APIs suffice

## Security boundaries

- Generate named primary and backup Ed25519 pairs through a one-shot Node script. Commit only SPKI public keys in `config.yaml`; keep private PKCS#8 files offline and gitignored.
- Browser imports key with WebCrypto and sends signature only. Challenge is random, single-use, origin-bound, and expires within minutes.
- Admin/GitHub sessions use random opaque tokens stored only as hashes, `HttpOnly`, `Secure`, `SameSite=Lax/Strict` as flow permits, with rotation and expiry.
- Protected layouts improve navigation UX but never replace authorization: every Server Action and Route Handler checks session/role server-side. Validate `Origin`, uploaded size/type, Markdown frontmatter, comment length, and email format.
- Add IP-HMAC rate limits for login challenges, GitHub callbacks, comments, likes, and subscriptions; raw IP is never persisted.
- Verify GitHub OAuth state and Resend webhook signature. Escape plain-text comments; never render reader Markdown/HTML.

## Files to modify

Core configuration and persistence:

- `package.json`, `.env.example`, `.gitignore`, `docker-compose.yml` — one PostgreSQL driver, scripts, portable local database, documented secrets, private-key exclusions
- `config.yaml`, `lib/config.ts` — site URL/sender plus named Ed25519 public keys; move current portfolio config parsing behind one validated loader
- `db/migrations/001_newsletter.sql`, `lib/db.ts`, `lib/posts.ts` — schema, pooled connection, narrow parameterized queries
- `scripts/generate-admin-key.mjs`, `scripts/migrate-blog.mjs` — key generation and idempotent import of existing `content/blog/*.md`
- `lib/blog.ts` — retain parser/types; remove filesystem-backed public repository functions after migration
- `app/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` — await PostgreSQL reads; preserve public URLs/content and remove build-time-only static slug generation

Admin:

- `app/admin/login/**`, `app/api/admin-auth/**`, `lib/admin-auth.ts` — Ed25519 challenge login, session creation, logout, route protection
- `app/admin/(protected)/layout.tsx`, `page.tsx`, `posts/**`, `comments/**`, `subscribers/**`, `campaigns/**` — dashboard and management surfaces
- `app/admin/actions.ts` — authorized post, moderation, subscriber, and campaign mutations

Public engagement/newsletter:

- `components/blog/article-engagement.tsx`, `article-analytics.tsx`, `comments.tsx`, `newsletter-signup.tsx` — focused client boundaries beneath article
- `app/api/auth/github/**`, `lib/github-auth.ts` — OAuth state/callback and reader sessions
- `app/api/analytics/view/route.ts`, `app/api/likes/route.ts`, `app/api/comments/route.ts`, `app/api/newsletter/route.ts` — validated/rate-limited public mutations
- `app/newsletter/confirm/page.tsx`, `app/api/resend/webhook/route.ts`, `lib/newsletter.ts` — double opt-in, Resend segment/contact sync, idempotent delivery/unsubscribe events
- `components/email/post-email.tsx` — full-article email-safe renderer; no rich-text editor
- `app/blog/[slug]/page.tsx` — add analytics beacon and article-end engagement/signup

Design and tests:

- `app/privacy/page.tsx`, `components/site-footer.tsx` — concise disclosure of first-party analytics/like cookie, GitHub identity, subscriber data, Resend delivery, retention, and contact route
- `app/globals.css` — brutalist admin shell, data tables, forms, status/error/loading states, compact responsive dashboard, article engagement
- `lib/*.test.ts` and optional PostgreSQL integration test — parser, auth challenge/replay, post promotion, rate limits, likes, comments, opt-in, webhook idempotency, email output

## Reuse

- Frontmatter validation and reading-time logic: `lib/blog.ts`
- Markdown rendering and heading slugging: `lib/markdown.ts`, `components/blog/article-renderer.tsx`
- Article header and TOC: `components/blog/article-header.tsx`, `components/blog/article-toc.tsx`
- Existing `Badge`, `Button`, and `Card` primitives: `components/ui/`
- Existing typography, semantic colors, hard borders, shadows, and focus treatment: `app/globals.css`

## Steps

- [x] Add provider-neutral PostgreSQL foundation: `DATABASE_URL`, Docker Compose, SQL migration, parameterized client, environment validation, and one idempotent migration command.
- [x] Centralize `config.yaml` loading; add canonical site URL, newsletter sender, and named primary/backup Ed25519 SPKI public keys. Add generator script and gitignore private PKCS#8 output.
- [x] Implement replay-safe Ed25519 admin login: issue five-minute one-use challenge, import/sign locally with WebCrypto, verify against selected configured key, rotate opaque session cookie, guard every admin read/mutation, and provide logout.
- [x] Preserve parser and existing `content/blog/*.md` files as migration inputs/backups; implement PostgreSQL post repository and idempotent import for all files. Convert homepage/blog/article reads to async DB access without changing slugs or public visual output; PostgreSQL becomes runtime source of truth.
- [x] Build admin post list and native `.md` upload. Enforce `.md` and 2 MB limit, parse existing frontmatter, store as draft, render exact article preview, then atomically publish/replace, unpublish, or archive. Keep published version live until replacement is approved.
- [x] Add privacy-first analytics beacon and daily aggregate queries. HMAC IP + user agent + UTC date for per-post daily uniqueness; store no raw network/device identifiers or full referrer URLs. Dashboard supports 7/30/90-day totals, trend bars, top posts, engagement, subscriber growth, and latest campaign state without chart dependency.
- [x] Add anonymous reversible likes using random first-party cookie and per-post HMAC identity; transactionally enforce one like per browser/post and rate-limit toggles.
- [x] Add GitHub OAuth reader login and flat plain-text comments. Validate state/origin and 2,000-character limit; publish immediately; admin can search, hide/show, delete, and block/unblock users.
- [x] Add article-only newsletter form with explicit consent text and double opt-in. Hash 24-hour confirmation tokens, normalize/deduplicate email, activate into configured Resend contact segment only after confirmation, and allow admin search/export/manual unsubscribe. Add concise privacy page/footer link covering analytics, essential like cookie, GitHub comments, and email processing.
- [x] Build full-post email template and campaigns. Admin selects published post, previews browser/email versions, sends test to configured owner, then sends now or schedules once. Include canonical and Resend unsubscribe links; consume signed, idempotent Resend webhooks for delivery/bounce/complaint/unsubscribe counts; leave opens/clicks disabled.
- [x] Apply brutalist admin design using existing tokens: cream surface, navy text, coral primary action, gold warnings, blue information, 3 px borders, 5 px hard shadows, 4/8/12/16/24/32 spacing, Darker Grotesque display, Public Sans body, JetBrains Mono only for IDs/metrics. Add semantic table/form markup, touch targets, visible focus, reduced-motion behavior, and 1-column mobile reflow.
- [x] Add focused Node tests plus PostgreSQL integration coverage; document setup/migrate/import/key generation/GitHub/Resend/deploy flow; run full runtime verification.

## Verification

- Run existing `npm run test:blog`; add Node tests for Ed25519 verification/replay/expiry, parser-to-row mapping, draft promotion, anonymous-like dedupe, GitHub comment authorization/blocking, double opt-in expiry/dedupe, Resend webhook signature/idempotency, and full email HTML.
- Run migrations/import against disposable PostgreSQL; confirm reruns are safe and all four posts retain slug, metadata, body, ordering, and cover.
- Test authorization failures directly: missing/expired/replayed challenge, wrong key, expired session, forged OAuth state, blocked commenter, malformed webhook, oversized upload, invalid Markdown, and cross-origin mutation.
- Verify admin flows at desktop/tablet/390 px: login, upload, parser errors, preview, publish replacement, unpublish/archive, analytics ranges, moderation, subscriber export, test send, schedule/send confirmation.
- Verify public `/`, `/blog`, and `/blog/[slug]` stay visually stable except approved article-end analytics/likes/comments/signup; test keyboard, touch, focus-visible, labels, errors, loading, empty states, long content, and WCAG AA contrast.
- Follow `next-dev-loop` exactly: require Next.js 16.3+ Turbopack and agent-browser 0.31.1+, inspect `/_next/mcp` routes/compilation/runtime errors, then drive public and admin behavior in real Chrome with React introspection.
- Run focused ESLint, TypeScript, diagnostics, production build with required environment, and self-hosted `next start` smoke test. Do not reset active dev output while verifying.
