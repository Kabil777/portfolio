import assert from "node:assert/strict";
import { createHmac, generateKeyPairSync, sign } from "node:crypto";
import { after, test } from "node:test";
import { NextRequest } from "next/server";
import { render } from "@react-email/render";
import { createElement } from "react";
import { shouldShowNewsletter } from "@/components/blog/newsletter-signup";
import { PostEmail } from "@/components/email/post-email";
import { POST as recordView } from "@/app/api/analytics/view/route";
import { GET as checkHealth } from "@/app/api/health/route";
import { POST as toggleLike } from "@/app/api/likes/route";
import { POST as resendWebhook } from "@/app/api/resend/webhook/route";
import { issueAdminChallenge, verifyAdminChallenge } from "@/lib/admin-auth";
import type { BlogPost } from "@/lib/blog";
import { getSiteConfig } from "@/lib/config";
import { closeDatabase, getDatabase } from "@/lib/db";
import {
  confirmSubscription,
  getResend,
  normalizeEmail,
} from "@/lib/newsletter";
import { allowRequest } from "@/lib/rate-limit";
import { secretHash } from "@/lib/security";
import {
  getBlogPost,
  getPostPreview,
  publishPost,
  savePostDraft,
  unpublishPost,
} from "@/lib/posts";

process.env.DATABASE_URL ??=
  "postgres://portfolio:portfolio@localhost:5433/portfolio";
process.env.SESSION_SECRET ??=
  "test-session-secret-with-at-least-32-characters";
process.env.ANALYTICS_SECRET ??=
  "test-analytics-secret-with-at-least-32-characters";
process.env.KEEPALIVE_SECRET ??=
  "test-keepalive-secret-with-at-least-32-characters";
process.env.RESEND_API_KEY ??= "re_test";
process.env.RESEND_SEGMENT_ID ??= "test-segment";
process.env.RESEND_WEBHOOK_SECRET ??= "whsec_dGVzdHNlY3JldHRlc3RzZWNyZXQ=";

const slug = "platform-integration-check";
const secondSlug = "second-platform-integration-check";
const subscriberEmail = "platform-check@example.com";
const expiredSubscriberEmail = "expired-platform-check@example.com";
const source = `---
title: Platform integration check
description: Exercises storage without external services.
date: 2026-09-09
category: Tests
tags: [PostgreSQL]
draft: true
---
# Integration

A small **test** article.
`;

function request(url: string, body: Record<string, unknown>, cookie?: string) {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      "User-Agent": "portfolio-test",
      "X-Forwarded-For": "192.0.2.10",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

function signedWebhook(id: string, event: Record<string, unknown>) {
  const payload = JSON.stringify(event);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const key = Buffer.from(
    process.env.RESEND_WEBHOOK_SECRET!.slice(6),
    "base64",
  );
  const signature = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${payload}`)
    .digest("base64");
  return new NextRequest("http://localhost:3000/api/resend/webhook", {
    method: "POST",
    headers: {
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": `v1,${signature}`,
    },
    body: payload,
  });
}

after(async () => {
  try {
    const sql = getDatabase();
    await sql`DELETE FROM admin_sessions WHERE key_id = 'integration-test'`;
    await sql`DELETE FROM admin_challenges WHERE key_id = 'integration-test'`;
    await sql`DELETE FROM webhook_events WHERE id LIKE 'platform-check-%'`;
    await sql`DELETE FROM campaigns WHERE post_slug = ${slug}`;
    await sql`DELETE FROM subscribers WHERE email IN (${subscriberEmail}, ${expiredSubscriberEmail})`;
    await sql`DELETE FROM rate_limits WHERE action = 'platform-check'`;
    await sql`DELETE FROM posts WHERE slug IN (${slug}, ${secondSlug})`;
  } finally {
    await closeDatabase();
  }
});

test("Ed25519 challenge verifies once and rejects replay", async () => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  getSiteConfig().admin.publicKeys.push({
    id: "integration-test",
    publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
  });
  const challenge = await issueAdminChallenge("integration-test");
  assert.ok(challenge);
  const signature = sign(
    null,
    Buffer.from(challenge.message),
    privateKey,
  ).toString("base64url");
  assert.ok(await verifyAdminChallenge({ ...challenge, signature }));
  assert.equal(
    await verifyAdminChallenge({ ...challenge, signature }),
    undefined,
  );

  const expired = await issueAdminChallenge("integration-test");
  assert.ok(expired);
  await getDatabase()`UPDATE admin_challenges SET expires_at = now() - interval '1 second' WHERE id = ${expired.id}`;
  const expiredSignature = sign(
    null,
    Buffer.from(expired.message),
    privateKey,
  ).toString("base64url");
  assert.equal(
    await verifyAdminChallenge({ ...expired, signature: expiredSignature }),
    undefined,
  );
});

test("draft promotion preserves published content until explicit publish", async () => {
  await getDatabase()`DELETE FROM posts WHERE slug = ${slug}`;
  await savePostDraft(`${slug}.md`, source);
  const preview = await getPostPreview(slug);
  assert.equal(preview?.title, "Platform integration check");
  assert.equal(preview?.category, "Tests");
  assert.deepEqual(preview?.tags, ["PostgreSQL"]);
  assert.equal(await getBlogPost(slug), undefined);
  assert.equal(await publishPost(slug), true);
  assert.equal(
    (await getBlogPost(slug))?.content.includes("small **test**"),
    true,
  );
  await unpublishPost(slug);
  assert.equal(await getBlogPost(slug), undefined);
  assert.equal(await publishPost(slug), true);
});

test("analytics deduplicates daily visitors across posts", async () => {
  await savePostDraft(`${secondSlug}.md`, source);
  assert.equal(await publishPost(secondSlug), true);

  const firstLike = await toggleLike(
    request("http://localhost:3000/api/likes", { slug }),
  );
  assert.equal(firstLike.status, 200);
  assert.deepEqual(await firstLike.json(), { count: 1, liked: true });
  const readerCookie = firstLike.cookies.get("blog_reader");
  assert.ok(readerCookie);
  const secondLike = await toggleLike(
    request(
      "http://localhost:3000/api/likes",
      { slug },
      `blog_reader=${readerCookie.value}`,
    ),
  );
  assert.deepEqual(await secondLike.json(), { count: 0, liked: false });

  assert.equal(
    (
      await recordView(
        request("http://localhost:3000/api/analytics/view", {
          slug,
          referrer: "https://example.com/path?q=private",
        }),
      )
    ).status,
    204,
  );
  assert.equal(
    (
      await recordView(
        request("http://localhost:3000/api/analytics/view", {
          slug,
          referrer: "https://example.com/other",
        }),
      )
    ).status,
    204,
  );
  assert.equal(
    (
      await recordView(
        request("http://localhost:3000/api/analytics/view", {
          slug: secondSlug,
        }),
      )
    ).status,
    204,
  );
  const [stats] = await getDatabase()<
    Array<{ views: number; unique_visitors: number }>
  >`
    SELECT views, unique_visitors FROM post_daily_stats
    WHERE post_slug = ${slug} AND day = current_date
  `;
  assert.deepEqual(stats, { views: 2, unique_visitors: 1 });
  const [visitors] = await getDatabase()<Array<{ count: number }>>`
    SELECT count(DISTINCT visitor_hash)::int AS count
    FROM post_daily_visitors
    WHERE post_slug IN (${slug}, ${secondSlug}) AND day = current_date
  `;
  assert.equal(visitors.count, 1);
  const [referrer] = await getDatabase()`
    SELECT referrer_host FROM post_referrer_daily WHERE post_slug = ${slug}
  `;
  assert.equal(referrer.referrer_host, "example.com");
});

test("newsletter popup waits until article midpoint", () => {
  assert.equal(shouldShowNewsletter(440, 2_000, 1_000), false);
  assert.equal(shouldShowNewsletter(450, 2_000, 1_000), true);
});

test("campaign email includes a prose excerpt and web CTA", async () => {
  const post: BlogPost = {
    slug,
    title: "Email check",
    description: "Full article email.",
    date: "2026-09-09",
    category: "Tests",
    tags: ["Email"],
    draft: false,
    readingTime: 1,
    content:
      "## Full body\n\nDelivered with **strong context** and [runbook links](https://example.com/runbook).",
  };
  const html = await render(
    createElement(PostEmail, {
      post,
      siteUrl: "https://example.com",
    }),
  );
  assert.match(html, /<body[^>]*background-color:#FFF7E8/i);
  assert.match(html, /<table/);
  assert.match(html, /Email check/);
  assert.match(html, /Full article email/);
  assert.match(html, /Read full article/);
  assert.match(html, /https:\/\/example.com\/blog\/platform-integration-check/);
  assert.match(html, /<h2[^>]*>Full body<\/h2>/);
  assert.match(html, /Delivered with/);
  assert.match(html, /<strong>strong context<\/strong>/);
  assert.match(html, /href="https:\/\/example.com\/runbook"/);
  assert.match(html, /RESEND_UNSUBSCRIBE_URL/);
  assert.equal(normalizeEmail(" Test@Example.COM "), "test@example.com");
});

test("database health endpoint requires its keepalive secret", async () => {
  const unauthorized = await checkHealth(
    new Request("http://localhost:3000/api/health"),
  );
  assert.equal(unauthorized.status, 401);

  const authorized = await checkHealth(
    new Request("http://localhost:3000/api/health", {
      headers: {
        Authorization: `Bearer ${process.env.KEEPALIVE_SECRET}`,
      },
    }),
  );
  assert.equal(authorized.status, 200);
  assert.deepEqual(await authorized.json(), { ok: true });
});

test("rate limiting rejects requests beyond the configured bucket", async () => {
  const next = () =>
    allowRequest(
      request("http://localhost:3000/test", {}),
      "platform-check",
      2,
      60,
    );
  assert.equal(await next(), true);
  assert.equal(await next(), true);
  assert.equal(await next(), false);
});

test("double opt-in rejects expired and replayed confirmation tokens", async () => {
  const validToken = "v".repeat(43);
  const expiredToken = "x".repeat(43);
  const sql = getDatabase();
  await sql`
    INSERT INTO subscribers (email, status, confirmation_token_hash, confirmation_expires_at)
    VALUES
      (${subscriberEmail}, 'pending', ${secretHash(validToken, "newsletter-confirmation")}, now() + interval '1 hour'),
      (${expiredSubscriberEmail}, 'pending', ${secretHash(expiredToken, "newsletter-confirmation")}, now() - interval '1 second')
    ON CONFLICT (email) DO UPDATE SET status = 'pending', confirmation_token_hash = excluded.confirmation_token_hash,
      confirmation_expires_at = excluded.confirmation_expires_at
  `;
  const contacts = getResend().contacts as unknown as {
    create: (input: unknown) => Promise<{ data: { id: string }; error: null }>;
  };
  contacts.create = async () => ({
    data: { id: "contact-platform-check" },
    error: null,
  });
  assert.equal(await confirmSubscription(expiredToken), false);
  assert.equal(await confirmSubscription(validToken), true);
  assert.equal(await confirmSubscription(validToken), false);
});

test("signed Resend webhooks are idempotent and invalid signatures fail closed", async () => {
  const sql = getDatabase();
  await sql`
    INSERT INTO campaigns (post_slug, resend_broadcast_id, status, sent_at)
    VALUES (${slug}, 'broadcast-platform-check', 'sent', now())
    ON CONFLICT (post_slug) DO UPDATE SET resend_broadcast_id = excluded.resend_broadcast_id,
      status = 'sent', sent_at = now(), delivered = 0, unsubscribed = 0
  `;
  const delivered = {
    type: "email.delivered",
    data: { broadcast_id: "broadcast-platform-check" },
  };
  assert.equal(
    (await resendWebhook(signedWebhook("platform-check-delivered", delivered)))
      .status,
    200,
  );
  assert.equal(
    (await resendWebhook(signedWebhook("platform-check-delivered", delivered)))
      .status,
    200,
  );
  const unsubscribed = {
    type: "contact.updated",
    data: { email: subscriberEmail, unsubscribed: true },
  };
  assert.equal(
    (
      await resendWebhook(
        signedWebhook("platform-check-unsubscribed", unsubscribed),
      )
    ).status,
    200,
  );
  const [campaign] = await sql<
    Array<{ delivered: number; unsubscribed: number }>
  >`SELECT delivered, unsubscribed FROM campaigns WHERE post_slug = ${slug}`;
  assert.deepEqual(campaign, { delivered: 1, unsubscribed: 1 });

  const response = await resendWebhook(
    new NextRequest("http://localhost:3000/api/resend/webhook", {
      method: "POST",
      headers: {
        "svix-id": "platform-check-invalid",
        "svix-timestamp": "1",
        "svix-signature": "v1,bad",
      },
      body: "{}",
    }),
  );
  assert.equal(response.status, 400);
});
