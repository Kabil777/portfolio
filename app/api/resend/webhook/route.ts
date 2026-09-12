import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { resendEnv } from "@/lib/env";
import { getResend } from "@/lib/newsletter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: { type: string; data: Record<string, unknown> };
  try {
    // SAFETY: Resend verifies and returns a documented webhook union; every variant has string `type` and object `data`.
    event = getResend().webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret: resendEnv().webhookSecret,
    }) as unknown as { type: string; data: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const sql = getDatabase();
  await sql.begin(async (transaction) => {
    const inserted = await transaction`
      INSERT INTO webhook_events (id, event_type)
      VALUES (${id}, ${event.type})
      ON CONFLICT DO NOTHING RETURNING id
    `;
    if (!inserted.length) return;

    const email =
      typeof event.data.email === "string"
        ? event.data.email.toLowerCase()
        : undefined;
    if (
      (event.type === "contact.updated" || event.type === "contact.deleted") &&
      email
    ) {
      const unsubscribed =
        event.type === "contact.deleted" || event.data.unsubscribed === true;
      const changed = await transaction`
        UPDATE subscribers
        SET status = ${unsubscribed ? "unsubscribed" : "active"},
            unsubscribed_at = ${unsubscribed ? new Date() : null}, updated_at = now()
        WHERE email = ${email}
          AND status IS DISTINCT FROM ${unsubscribed ? "unsubscribed" : "active"}
        RETURNING email
      `;
      if (unsubscribed && changed.length) {
        await transaction`
          UPDATE campaigns SET unsubscribed = unsubscribed + 1, updated_at = now()
          WHERE id = (
            SELECT id FROM campaigns WHERE status = 'sent'
            ORDER BY sent_at DESC NULLS LAST LIMIT 1
          )
        `;
      }
    }

    const broadcastId =
      typeof event.data.broadcast_id === "string"
        ? event.data.broadcast_id
        : undefined;
    if (!broadcastId) return;
    if (event.type === "email.delivered") {
      await transaction`UPDATE campaigns SET delivered = delivered + 1, updated_at = now() WHERE resend_broadcast_id = ${broadcastId}`;
    } else if (event.type === "email.bounced") {
      await transaction`UPDATE campaigns SET bounced = bounced + 1, updated_at = now() WHERE resend_broadcast_id = ${broadcastId}`;
    } else if (event.type === "email.complained") {
      await transaction`UPDATE campaigns SET complained = complained + 1, updated_at = now() WHERE resend_broadcast_id = ${broadcastId}`;
    }
  });

  return NextResponse.json({ received: true });
}
