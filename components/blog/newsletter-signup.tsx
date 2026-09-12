"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { toast } from "sonner";

const newsletterDismissedAtKey = "newsletter-dismissed-at";
const newsletterCooldownMs = 7 * 24 * 60 * 60 * 1000;

export function shouldShowNewsletter(
  scrollTop: number,
  documentHeight: number,
  viewportHeight: number,
) {
  const scrollable = documentHeight - viewportHeight;
  return scrollable <= 0 || scrollTop / scrollable >= 0.45;
}

export function NewsletterSignup() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function showAtMidpoint() {
      const dismissedAt = Number(
        localStorage.getItem(newsletterDismissedAtKey),
      );
      if (Date.now() - dismissedAt < newsletterCooldownMs) return;
      if (
        !shouldShowNewsletter(
          scrollY,
          document.documentElement.scrollHeight,
          innerHeight,
        )
      )
        return;
      dialog.current?.showModal();
      dialog.current?.focus();
      removeEventListener("scroll", showAtMidpoint);
    }

    addEventListener("scroll", showAtMidpoint, { passive: true });
    showAtMidpoint();
    return () => removeEventListener("scroll", showAtMidpoint);
  }, []);

  async function subscribe(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.currentTarget;

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: new FormData(form).get("email") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Subscription failed");
      form.reset();
      dialog.current?.close();
      toast.success(result.message, { id: "newsletter-subscribed" });
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Subscription failed.",
        {
          id: "newsletter-error",
        },
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog
      className="newsletter-dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
      onClose={() =>
        localStorage.setItem(newsletterDismissedAtKey, String(Date.now()))
      }
      ref={dialog}
      tabIndex={-1}
    >
      <section className="newsletter-signup" aria-labelledby="newsletter-title">
        <header>
          <p className="newsletter-command">
            <span aria-hidden="true">$</span> subscribe
          </p>
          <h2 id="newsletter-title">One useful note when it is ready.</h2>
        </header>
        <div className="newsletter-signup-body">
          <form onSubmit={subscribe}>
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              autoComplete="email"
              id="newsletter-email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
            <button disabled={pending} type="submit">
              {pending ? "Sending…" : "Subscribe"}
            </button>
          </form>
          <div className="newsletter-actions">
            <small>
              Confirm by email · <a href="/privacy">Privacy</a>
            </small>
            <button
              className="newsletter-dismiss"
              onClick={() => dialog.current?.close()}
              type="button"
            >
              No thanks
            </button>
          </div>
        </div>
      </section>
    </dialog>
  );
}
