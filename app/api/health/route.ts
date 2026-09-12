import { getDatabase } from "@/lib/db";
import { keepaliveEnv } from "@/lib/env";
import { safeEqual } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!safeEqual(authorization, `Bearer ${keepaliveEnv().secret}`)) {
    return new Response(null, { status: 401 });
  }

  await getDatabase()`SELECT 1`;
  return Response.json({ ok: true });
}
