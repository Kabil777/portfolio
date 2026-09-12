import { NextRequest, NextResponse } from "next/server";
import { issueAdminChallenge } from "@/lib/admin-auth";
import { allowRequest } from "@/lib/rate-limit";
import { hasSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!(await allowRequest(request, "admin-login", 10, 900))) {
    return NextResponse.json({ error: "Try again later" }, { status: 429 });
  }

  const { keyId } = (await request.json()) as { keyId?: unknown };
  if (typeof keyId !== "string") {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const challenge = await issueAdminChallenge(keyId);
  return challenge
    ? NextResponse.json(challenge, { headers: { "Cache-Control": "no-store" } })
    : NextResponse.json({ error: "Unknown key" }, { status: 400 });
}
