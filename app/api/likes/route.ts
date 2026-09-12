import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { allowRequest } from "@/lib/rate-limit";
import { hasSameOrigin, randomToken, secretHash } from "@/lib/security";

export const runtime = "nodejs";
const READER_COOKIE = "blog_reader";

function validSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function readerHash(token: string, slug: string): string {
  return secretHash(token, `like:${slug}`);
}

async function likeState(slug: string, token?: string) {
  const [row] = await getDatabase()<Array<{ count: number; liked: boolean }>>`
    SELECT count(*)::int AS count,
           COALESCE(bool_or(reader_hash = ${token ? readerHash(token, slug) : ""}), false) AS liked
    FROM likes WHERE post_slug = ${slug}
  `;
  return row ?? { count: 0, liked: false };
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!validSlug(slug))
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  return NextResponse.json(
    await likeState(slug, request.cookies.get(READER_COOKIE)?.value),
  );
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (!(await allowRequest(request, "like", 30, 60))) {
    return NextResponse.json({ error: "Try again later" }, { status: 429 });
  }

  let body: { slug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!validSlug(body.slug))
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  const slug = body.slug;

  const existingToken = request.cookies.get(READER_COOKIE)?.value;
  const token = existingToken ?? randomToken();
  const hash = readerHash(token, slug);
  const sql = getDatabase();

  const liked = await sql.begin(async (transaction) => {
    const [post] = await transaction`
      SELECT 1 FROM posts
      WHERE slug = ${slug} AND published_at IS NOT NULL AND archived_at IS NULL
    `;
    if (!post) return undefined;

    const inserted = await transaction`
      INSERT INTO likes (post_slug, reader_hash)
      VALUES (${slug}, ${hash})
      ON CONFLICT DO NOTHING RETURNING 1
    `;
    if (inserted.length) return true;
    await transaction`
      DELETE FROM likes WHERE post_slug = ${slug} AND reader_hash = ${hash}
    `;
    return false;
  });
  if (liked === undefined)
    return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const state = await likeState(slug, token);
  const response = NextResponse.json(state);
  if (!existingToken) {
    response.cookies.set(READER_COOKIE, token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}
