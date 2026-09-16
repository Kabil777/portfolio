"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      aria-label="Share this post"
      className="article-share-button"
      onClick={share}
      type="button"
    >
      <Share2 aria-hidden="true" size={20} strokeWidth={3} />
      <span>Share</span>
    </button>
  );
}
