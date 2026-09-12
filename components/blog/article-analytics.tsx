"use client";

import { useEffect, useRef } from "react";

export function ArticleAnalytics({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, referrer: document.referrer }),
      keepalive: true,
    });
  }, [slug]);

  return null;
}
