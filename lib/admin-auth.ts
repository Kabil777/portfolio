import { randomUUID, verify } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSiteConfig } from "@/lib/config";
import { getDatabase } from "@/lib/db";
import { randomToken, safeEqual, secretHash } from "@/lib/security";

export const ADMIN_COOKIE = "kabil_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

export type AdminSession = { keyId: string; expiresAt: Date };

export async function issueAdminChallenge(keyId: string) {
  const key = getSiteConfig().admin.publicKeys.find(
    (item) => item.id === keyId,
  );
  if (!key) return undefined;

  const id = randomUUID();
  const nonce = randomToken();
  const message = `kabil-admin-login-v1\n${id}\n${keyId}\n${nonce}\n${getSiteConfig().site.url}`;
  const sql = getDatabase();

  await sql`
    INSERT INTO admin_challenges (id, key_id, challenge_hash, expires_at)
    VALUES (${id}, ${keyId}, ${secretHash(message, "admin-challenge")}, now() + interval '5 minutes')
  `;

  return { id, keyId, message };
}

export async function verifyAdminChallenge(input: {
  id: string;
  keyId: string;
  message: string;
  signature: string;
}): Promise<string | undefined> {
  const configuredKey = getSiteConfig().admin.publicKeys.find(
    (item) => item.id === input.keyId,
  );
  if (!configuredKey) return undefined;

  let signature: Buffer;
  try {
    signature = Buffer.from(input.signature, "base64url");
  } catch {
    return undefined;
  }

  const sql = getDatabase();
  return sql.begin(async (transaction) => {
    const [challenge] = await transaction<
      Array<{ key_id: string; challenge_hash: string }>
    >`
      SELECT key_id, challenge_hash
      FROM admin_challenges
      WHERE id = ${input.id} AND used_at IS NULL AND expires_at > now()
      FOR UPDATE
    `;

    if (
      !challenge ||
      challenge.key_id !== input.keyId ||
      !safeEqual(
        challenge.challenge_hash,
        secretHash(input.message, "admin-challenge"),
      ) ||
      !verify(
        null,
        Buffer.from(input.message),
        configuredKey.publicKey,
        signature,
      )
    ) {
      return undefined;
    }

    await transaction`
      UPDATE admin_challenges SET used_at = now() WHERE id = ${input.id}
    `;

    const token = randomToken();
    await transaction`
      INSERT INTO admin_sessions (token_hash, key_id, expires_at)
      VALUES (
        ${secretHash(token, "admin-session")},
        ${input.keyId},
        now() + interval '8 hours'
      )
    `;
    return token;
  });
}

export async function getAdminSession(): Promise<AdminSession | undefined> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return undefined;

  const [session] = await getDatabase()<
    Array<{ key_id: string; expires_at: Date }>
  >`
    SELECT key_id, expires_at
    FROM admin_sessions
    WHERE token_hash = ${secretHash(token, "admin-session")} AND expires_at > now()
  `;

  return session
    ? { keyId: session.key_id, expiresAt: session.expires_at }
    : undefined;
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function deleteAdminSession(token: string): Promise<void> {
  await getDatabase()`
    DELETE FROM admin_sessions
    WHERE token_hash = ${secretHash(token, "admin-session")}
  `;
}

export const adminCookieOptions = {
  httpOnly: true,
  maxAge: SESSION_SECONDS,
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};
