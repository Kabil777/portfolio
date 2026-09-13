import Link from "next/link";
import { confirmNewsletter } from "@/app/newsletter/confirm/actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const confirmationContent = {
  ready: {
    marker: "02",
    code: "ACTION REQUIRED",
    title: "One click. You’re in.",
    message: "Confirm that you want new posts delivered to your inbox.",
    link: "Not now",
  },
  confirmed: {
    marker: "OK",
    code: "SUBSCRIPTION ACTIVE",
    title: "You’re subscribed.",
    message: "Done. The next post will land in your inbox.",
    link: "Read latest posts",
  },
  failed: {
    marker: "!!",
    code: "CONFIRMATION FAILED",
    title: "Couldn’t confirm.",
    message: "Open the confirmation link in your email and try again.",
    link: "Back to blog",
  },
  invalid: {
    marker: "—",
    code: "LINK UNAVAILABLE",
    title: "This link is done.",
    message: "It may be invalid, expired, or already used. Request a fresh link from any post.",
    link: "Request a new link",
  },
} as const;

export default async function ConfirmNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>;
}) {
  const { token, status } = await searchParams;
  const ready = typeof token === "string" && token.length > 0;
  const state =
    status === "confirmed"
      ? "confirmed"
      : status === "error"
        ? "failed"
        : ready
          ? "ready"
          : "invalid";
  const content = confirmationContent[state];

  return (
    <>
      <SiteHeader />
      <main className="newsletter-confirm" data-state={state} id="content">
        <section className="newsletter-confirm-card">
          <div className="newsletter-confirm-status" aria-hidden="true">
            <span>MAIL OPS</span>
            <strong>{content.marker}</strong>
            <small>{content.code}</small>
          </div>
          <div className="newsletter-confirm-copy">
            <p className="article-community-kicker">KABIL’S NEWSLETTER</p>
            <h1>{content.title}</h1>
            <p>{content.message}</p>
            {state === "ready" && (
              <form action={confirmNewsletter}>
                <input name="token" type="hidden" value={token} />
                <Button size="lg" type="submit">
                  Confirm subscription
                </Button>
              </form>
            )}
            <Link className="newsletter-confirm-link" href="/blog" prefetch={false}>
              {content.link}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
