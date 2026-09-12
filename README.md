# Kabil Portfolio + Newsletter

Next.js portfolio, PostgreSQL-backed Markdown blog, private publishing panel, privacy-first article analytics, likes, and Resend newsletters.

## Local setup

Requirements: Node.js, npm, Docker, Next.js 16.3+ with Turbopack, and `agent-browser` 0.31.1+ for runtime verification.

```bash
cp .env.example .env.local
docker compose up -d --wait postgres
npm run db:migrate
npm run db:import-blog
npm run dev
```

Local PostgreSQL listens on `5433` because `5432` is commonly occupied. Change both `docker-compose.yml` and `DATABASE_URL` if needed.

## Admin keys

Admin login uses Ed25519 challenge-response. Browser reads the selected PKCS#8 private key only long enough to sign one five-minute challenge; private bytes are never uploaded or stored by the app.

Generate named primary and backup keys:

```bash
npm run admin:keygen -- primary
npm run admin:keygen -- backup
```

Each command writes `admin-keys/<id>.pk8.pem` with mode `0600` and prints the matching SPKI public-key YAML. Put public keys under `admin.publicKeys` in `config.yaml`. Keep private files outside the repository and back them up separately. Deploying a config change revokes or adds a key.

Current checkout already has locally generated primary/backup private files and matching public config. Move backups to secure storage before deployment.

## Blog publishing

Open `/admin`, sign in, then upload a `.md` file. Upload always creates a draft; preview uses the same article renderer as the public route. Publishing atomically promotes the draft, so an existing article remains unchanged until approval.

Maximum file size: 2 MB. Filename becomes slug and must be lowercase kebab case.

```md
---
title: Post title
description: Short summary
date: 2026-09-08
category: Kubernetes & Platform
tags: [Kubernetes, Cilium]
cover: https://example.com/cover.png
draft: true
---

Markdown content.
```

`cover` accepts local `/blog/...` assets or full HTTP(S) URLs. PostgreSQL is runtime source of truth; `content/blog/*.md` remains migration input/backup. `npm run db:import-blog` never overwrites an existing slug.

## Newsletter and Resend

1. Verify sender domain in Resend.
2. Create one Segment for confirmed subscribers.
3. Set `NEWSLETTER_FROM`, `NEWSLETTER_OWNER_EMAIL`, `RESEND_API_KEY`, and `RESEND_SEGMENT_ID`.
4. Add webhook endpoint `SITE_URL/api/resend/webhook` and set `RESEND_WEBHOOK_SECRET`.
5. Subscribe webhook events: `contact.updated`, `contact.deleted`, `email.delivered`, `email.bounced`, and `email.complained`.

Signup appears only after articles and uses 24-hour double opt-in. Campaigns send a selected published post as full email-safe HTML. Admin must test-send before the final send workflow. One campaign is allowed per post. Resend manages broadcast unsubscribe links; contact webhooks synchronize local status. Open and click tracking should remain disabled on the Resend domain.

Replace placeholder site/sender values in `config.yaml` or use `SITE_URL`, `NEWSLETTER_FROM`, and `NEWSLETTER_OWNER_EMAIL` environment overrides.

## Privacy-first analytics

Article browser beacon stores daily aggregate views, daily HMAC-deduplicated visitors, and referring hostname only. Raw IP, user agent, full referrer URL, geography, and cross-site profile are not stored. Anonymous likes use one essential HTTP-only first-party cookie. Details live at `/privacy`.

## Deployment

### Vercel

Use any Vercel-reachable PostgreSQL provider and set all `.env.example` variables in project settings. Run migrations and blog import once against production `DATABASE_URL` before traffic. Set `SITE_URL` to canonical HTTPS origin.

`.github/workflows/aiven-keepalive.yml` calls the authenticated database health endpoint hourly. Set the same `KEEPALIVE_SECRET` in Vercel and GitHub Actions, plus `KEEPALIVE_URL` in GitHub Actions to the production origin. This is best-effort for Aiven Free Tier; use a paid tier when guaranteed uptime matters.

### Self-hosted Node

Run PostgreSQL through included Compose service or point `DATABASE_URL` at another PostgreSQL instance, then:

```bash
npm run db:migrate
npm run db:import-blog
npm run build
npm start
```

Terminate TLS at reverse proxy and forward original host/protocol headers. Admin key login and WebCrypto require HTTPS outside localhost.

## Checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

For runtime changes, follow `next-dev-loop`: verify `/_next/mcp` compilation/errors/routes and cross-check behavior through a worktree-scoped `agent-browser` session.
