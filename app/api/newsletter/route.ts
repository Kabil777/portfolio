import { NextRequest, NextResponse } from "next/server";
import { requestSubscription } from "@/lib/newsletter";
import { allowRequest } from "@/lib/rate-limit";
import { hasSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (!(await allowRequest(request, "newsletter", 3, 3600))) {
    return NextResponse.json({ error: "Try again later" }, { status: 429 });
  }

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof body.email !== "string") {
    return NextResponse.json(
      { error: "Enter an email address" },
      { status: 400 },
    );
  }

  try {
    await requestSubscription(body.email);
    return NextResponse.json({ message: "Check your inbox to confirm." });
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : "Subscription failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
