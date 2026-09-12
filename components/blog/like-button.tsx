"use client";

import { useEffect, useState } from "react";

type LikeState = { count: number; liked: boolean };

export function LikeButton({ slug }: { slug: string }) {
  const [state, setState] = useState<LikeState>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/likes?slug=${encodeURIComponent(slug)}`)
      .then((response) => response.json())
      .then((next: LikeState) => {
        if (active) setState(next);
      })
      .catch(() => {
        if (active) setError("Likes unavailable.");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  async function toggle() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) throw new Error("Like failed");
      setState(await response.json());
    } catch {
      setError("Could not save your like.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="article-like">
      <button
        aria-label={state?.liked ? "Remove like" : "Mark article useful"}
        aria-pressed={state?.liked ?? false}
        disabled={pending || !state}
        onClick={toggle}
        type="button"
      >
        <strong aria-live="polite">{state ? state.count : "…"}</strong>
        <span>{state?.count === 1 ? "like" : "likes"}</span>
        <span className="article-like-heart" aria-hidden="true">
          {state?.liked ? "♥" : "♡"}
        </span>
      </button>
      {error && (
        <span className="article-action-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
