import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { BlogPostMeta } from "@/lib/blog";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link className="blog-card-link" href={`/blog/${post.slug}`} prefetch={false}>
      <Card className="blog-card">
        <div className="blog-card-copy">
          <p className="blog-card-meta">
            <time dateTime={post.date}>
              {dateFormatter.format(new Date(`${post.date}T00:00:00Z`))}
            </time>
            <span aria-hidden="true"> / </span>
            {post.readingTime} min read
          </p>
          <h3>{post.title}</h3>
          <p className="blog-card-description">{post.description}</p>
          <div className="blog-card-tags" aria-label="Topics">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="blog-card-action">Read post</span>
        </div>
        {post.cover ? (
          <Image
            alt=""
            className="blog-card-cover"
            height={887}
            src={post.cover}
            width={1600}
          />
        ) : (
          <div className="blog-card-placeholder" aria-hidden="true">
            DATA / PLATFORM / SRE
          </div>
        )}
      </Card>
    </Link>
  );
}
