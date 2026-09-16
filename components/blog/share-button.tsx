"use client";

import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ShareButton({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let previous = window.scrollY;

    function updateVisibility() {
      const current = window.scrollY;
      const nearTop = current < 120;
      const footer = document.querySelector("footer");
      const footerVisible = footer
        ? footer.getBoundingClientRect().top < window.innerHeight
        : false;
      setVisible(!footerVisible && (nearTop || current < previous));
      previous = current;
    }

    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  async function share() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
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
      className={`article-share-button${visible ? "" : " article-share-button-hidden"}`}
      onClick={share}
      type="button"
    >
      <Share2 aria-hidden="true" size={20} strokeWidth={3} />
    </button>
  );
}
