import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { allowRequest } from "@/lib/rate-limit";
import { analyticsHash, hasSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

function referrerHost(value: unknown, ownHost: string): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const url = new URL(value);
    return url.host && url.host !== ownHost
      ? url.host.slice(0, 255)
      : undefined;
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return new NextResponse(null, { status: 403 });
  if (!(await allowRequest(request, "analytics-view", 120, 3600))) {
    return new NextResponse(null, { status: 429 });
  }

  let body: { slug?: unknown; referrer?: unknown };
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (
    typeof body.slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)
  ) {
    return new NextResponse(null, { status: 400 });
  }

  const day = new Date().toISOString().slice(0, 10);
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const visitorHash = analyticsHash(
    `${address}\0${request.headers.get("user-agent") ?? "unknown"}\0${day}`,
    "daily-visitor",
  );
  const referrer = referrerHost(body.referrer, request.nextUrl.host);
  const sql = getDatabase();

  const recorded = await sql.begin(async (transaction) => {
    const [post] = await transaction`
      SELECT 1 FROM posts
      WHERE slug = ${body.slug as string} AND published_at IS NOT NULL AND archived_at IS NULL
    `;
    if (!post) return false;

    const unique = await transaction`
      INSERT INTO post_daily_visitors (post_slug, day, visitor_hash)
      VALUES (${body.slug as string}, ${day}::date, ${visitorHash})
      ON CONFLICT DO NOTHING RETURNING 1
    `;
    await transaction`
      INSERT INTO post_daily_stats (post_slug, day, views, unique_visitors)
      VALUES (${body.slug as string}, ${day}::date, 1, ${unique.length})
      ON CONFLICT (post_slug, day) DO UPDATE
      SET views = post_daily_stats.views + 1,
          unique_visitors = post_daily_stats.unique_visitors + excluded.unique_visitors
    `;
    if (referrer) {
      await transaction`
        INSERT INTO post_referrer_daily (post_slug, day, referrer_host, views)
        VALUES (${body.slug as string}, ${day}::date, ${referrer}, 1)
        ON CONFLICT (post_slug, day, referrer_host) DO UPDATE
        SET views = post_referrer_daily.views + 1
      `;
    }
    return true;
  });

  return new NextResponse(null, { status: recorded ? 204 : 404 });
}
