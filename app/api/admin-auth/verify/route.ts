import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  verifyAdminChallenge,
} from "@/lib/admin-auth";
import { allowRequest } from "@/lib/rate-limit";
import { hasSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!(await allowRequest(request, "admin-verify", 10, 900))) {
    return NextResponse.json({ error: "Try again later" }, { status: 429 });
  }

  const input = (await request.json()) as Record<string, unknown>;
  if (
    typeof input.id !== "string" ||
    typeof input.keyId !== "string" ||
    typeof input.message !== "string" ||
    typeof input.signature !== "string"
  ) {
    return NextResponse.json(
      { error: "Invalid login response" },
      { status: 400 },
    );
  }

  const token = await verifyAdminChallenge({
    id: input.id,
    keyId: input.keyId,
    message: input.message,
    signature: input.signature,
  });
  if (!token) {
    return NextResponse.json({ error: "Signature rejected" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return response;
}
