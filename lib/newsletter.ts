import { Resend } from "resend";
import { getSiteConfig } from "@/lib/config";
import { getDatabase } from "@/lib/db";
import { resendEnv } from "@/lib/env";
import { randomToken, secretHash } from "@/lib/security";

let resendClient: Resend | undefined;

export type Subscriber = {
  email: string;
  status: "pending" | "active" | "unsubscribed";
  consentedAt: Date | null;
  createdAt: Date;
};

export function getResend(): Resend {
  resendClient ??= new Resend(resendEnv().apiKey);
  return resendClient;
}

export function normalizeEmail(value: string): string | undefined {
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : undefined;
}

export async function requestSubscription(
  value: string,
): Promise<"active" | "pending"> {
  const email = normalizeEmail(value);
  if (!email) throw new Error("Enter a valid email address");

  const [existing] = await getDatabase()<Array<{ status: string }>>`
    SELECT status FROM subscribers WHERE email = ${email}
  `;
  if (existing?.status === "active") return "active";

  const token = randomToken();
  await getDatabase()`
    INSERT INTO subscribers (
      email, status, confirmation_token_hash, confirmation_expires_at
    )
    VALUES (
      ${email}, 'pending', ${secretHash(token, "newsletter-confirmation")},
      now() + interval '24 hours'
    )
    ON CONFLICT (email) DO UPDATE
    SET status = 'pending',
        confirmation_token_hash = excluded.confirmation_token_hash,
        confirmation_expires_at = excluded.confirmation_expires_at,
        updated_at = now()
  `;

  const config = getSiteConfig();
  const confirmationUrl = `${config.site.url}/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const { error } = await getResend().emails.send({
    from: config.newsletter.from,
    to: email,
    subject: "Confirm your subscription",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1>Confirm your subscription.</h1><p>One click confirms you want Kabil's new posts by email.</p><p><a href="${confirmationUrl}">Confirm subscription</a></p><p>This link expires in 24 hours. Ignore this email if you did not subscribe.</p></div>`,
    text: `Confirm your subscription: ${confirmationUrl}\n\nThis link expires in 24 hours.`,
  });
  if (error) throw new Error("Confirmation email could not be sent");
  return "pending";
}

export async function confirmSubscription(token: string): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{40,}$/.test(token)) return false;
  const tokenHash = secretHash(token, "newsletter-confirmation");
  const [subscriber] = await getDatabase()<Array<{ email: string }>>`
    SELECT email FROM subscribers
    WHERE confirmation_token_hash = ${tokenHash}
      AND confirmation_expires_at > now()
      AND status = 'pending'
  `;
  if (!subscriber) return false;

  const client = getResend();
  const environment = resendEnv();
  const created = await client.contacts.create({
    email: subscriber.email,
    unsubscribed: false,
    segments: [{ id: environment.segmentId }],
  });
  let contactId = created.data?.id;
  if (created.error) {
    const updated = await client.contacts.update({
      email: subscriber.email,
      unsubscribed: false,
    });
    if (updated.error || !updated.data)
      throw new Error("Subscriber could not be activated");
    contactId = updated.data.id;
    const segment = await client.contacts.segments.add({
      email: subscriber.email,
      segmentId: environment.segmentId,
    });
    if (segment.error)
      throw new Error("Subscriber segment could not be activated");
  }

  const result = await getDatabase()`
    UPDATE subscribers
    SET status = 'active', consented_at = now(), unsubscribed_at = NULL,
        resend_contact_id = ${contactId ?? null}, confirmation_token_hash = NULL,
        confirmation_expires_at = NULL, updated_at = now()
    WHERE email = ${subscriber.email} AND confirmation_token_hash = ${tokenHash}
    RETURNING email
  `;
  return result.length === 1;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const rows = await getDatabase()<
    Array<{
      email: string;
      status: Subscriber["status"];
      consented_at: Date | null;
      created_at: Date;
    }>
  >`
    SELECT email, status, consented_at, created_at
    FROM subscribers ORDER BY created_at DESC
  `;
  return rows.map((row) => ({
    email: row.email,
    status: row.status,
    consentedAt: row.consented_at,
    createdAt: row.created_at,
  }));
}

export async function unsubscribe(value: string): Promise<void> {
  const email = normalizeEmail(value);
  if (!email) throw new Error("Invalid subscriber");
  const { error } = await getResend().contacts.update({
    email,
    unsubscribed: true,
  });
  if (error) throw new Error("Resend could not unsubscribe contact");
  await getDatabase()`
    UPDATE subscribers
    SET status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
    WHERE email = ${email}
  `;
}
