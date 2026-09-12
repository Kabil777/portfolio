import type { NextRequest } from "next/server";
import { getDatabase } from "@/lib/db";
import { analyticsHash } from "@/lib/security";

function actor(request: NextRequest): string {
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return analyticsHash(
    `${address}\0${request.headers.get("user-agent") ?? "unknown"}`,
    "rate-limit-actor",
  );
}

export async function allowRequest(
  request: NextRequest,
  action: string,
  maximum: number,
  windowSeconds: number,
): Promise<boolean> {
  const bucket = new Date(
    Math.floor(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000,
  );
  const [row] = await getDatabase()<Array<{ request_count: number }>>`
    INSERT INTO rate_limits (actor_hash, action, bucket_start)
    VALUES (${actor(request)}, ${action}, ${bucket})
    ON CONFLICT (actor_hash, action, bucket_start) DO UPDATE
    SET request_count = rate_limits.request_count + 1
    RETURNING request_count
  `;
  return row.request_count <= maximum;
}
