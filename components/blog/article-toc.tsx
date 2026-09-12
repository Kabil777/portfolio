"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";

function TocLinks({ items, activeId }: { items: TocItem[]; activeId: string }) {
  return (
    <ol>
      {items.map((item) => (
        <li className={`toc-depth-${Math.min(item.depth, 3)}`} key={item.id}>
          <a
            aria-current={activeId === item.id ? "location" : undefined}
            href={`#${item.id}`}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function ArticleToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const heading = document.getElementById(item.id);
        if (!heading || heading.getBoundingClientRect().top > 140) break;
        current = item.id;
      }
      setActiveId((previous) => (previous === current ? previous : current));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  if (!items.length) return null;

  return (
    <>
      <aside className="article-toc-desktop" aria-label="On this page">
        <p>ON THIS PAGE</p>
        <TocLinks activeId={activeId} items={items} />
      </aside>
      <details className="article-toc-mobile">
        <summary>ON THIS PAGE</summary>
        <nav aria-label="On this page">
          <TocLinks activeId={activeId} items={items} />
        </nav>
      </details>
    </>
  );
}
