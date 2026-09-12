import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { BlogPostMeta } from "@/lib/blog";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function BlogIndexCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link className="blog-index-card" href={`/blog/${post.slug}`}>
      {post.cover ? (
        <Image
          alt=""
          className="blog-index-card-cover"
          height={887}
          src={post.cover}
          width={1600}
        />
      ) : (
        <div className="blog-index-card-placeholder" aria-hidden="true">
          DATA / PLATFORM / SRE
        </div>
      )}
      <div className="blog-index-card-copy">
        <p className="blog-index-card-meta">
          <time dateTime={post.date}>
            {dateFormatter.format(new Date(`${post.date}T00:00:00Z`))}
          </time>
          <span aria-hidden="true"> / </span>
          {post.readingTime} min read
        </p>
        <h3>{post.title}</h3>
        <p className="blog-index-card-description">{post.description}</p>
        <div className="blog-index-card-tags" aria-label="Topics">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
