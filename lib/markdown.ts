export type TocItem = {
  id: string;
  title: string;
  depth: number;
};

function plainHeading(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .trim();
}

export function slugifyHeading(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

export function createHeadingSlugger(): (value: string) => string {
  const counts = new Map<string, number>();

  return (value) => {
    const base = slugifyHeading(value);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };
}

export function extractToc(markdown: string): TocItem[] {
  const slug = createHeadingSlugger();
  const items: TocItem[] = [];
  let fence: "`" | "~" | undefined;

  for (const line of markdown.replaceAll("\r\n", "\n").split("\n")) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0] as "`" | "~";
      if (!fence || fence === marker) fence = fence ? undefined : marker;
      continue;
    }
    if (fence) continue;

    const heading = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;

    const title = plainHeading(heading[2]);
    items.push({ id: slug(title), title, depth: heading[1].length });
  }

  return items;
}
