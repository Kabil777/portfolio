import Image from "next/image";
import { LikeButton } from "@/components/blog/like-button";
import { Badge } from "@/components/ui/badge";
import type { BlogPostMeta } from "@/lib/blog";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeZone: "UTC",
});

export function ArticleHeader({
  post,
  showLike = false,
}: {
  post: BlogPostMeta;
  showLike?: boolean;
}) {
  return (
    <header
      className={`article-header${post.cover ? " article-header-with-cover" : ""}`}
    >
      <div className="article-header-copy">
        <h1>{post.title}</h1>
        <p className="article-description">{post.description}</p>
        <div className="article-meta">
          <time dateTime={post.date}>
            {dateFormatter.format(new Date(`${post.date}T00:00:00Z`))}
          </time>
          <span aria-hidden="true">/</span>
          <span>{post.readingTime} min read</span>
          {showLike && <LikeButton slug={post.slug} />}
        </div>
        {post.tags.length > 0 && (
          <div className="article-tags" aria-label="Topics" role="list">
            {post.tags.map((tag) => (
              <Badge key={tag} role="listitem" variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      {post.cover && (
        <Image
          alt={`Architecture diagram for ${post.title}`}
          className="article-cover"
          height={887}
          priority
          src={post.cover}
          width={1600}
        />
      )}
    </header>
  );
}
