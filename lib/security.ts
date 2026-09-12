import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { securityEnv } from "@/lib/env";

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function secretHash(value: string, purpose: string): string {
  return createHmac("sha256", securityEnv().sessionSecret)
    .update(`${purpose}\0${value}`)
    .digest("base64url");
}

export function analyticsHash(value: string, purpose: string): string {
  return createHmac("sha256", securityEnv().analyticsSecret)
    .update(`${purpose}\0${value}`)
    .digest("base64url");
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && origin === request.nextUrl.origin;
}
