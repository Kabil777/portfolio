import { createElement } from "react";
import { PostEmail } from "@/components/email/post-email";
import { blogExcerpt } from "@/lib/blog";
import { getSiteConfig } from "@/lib/config";
import { getDatabase } from "@/lib/db";
import { resendEnv } from "@/lib/env";
import { getResend } from "@/lib/newsletter";
import { getBlogPost } from "@/lib/posts";

export type CampaignSummary = {
  slug: string;
  title: string;
  campaignStatus?: string;
  sentAt?: Date;
};

export async function getCampaigns(): Promise<CampaignSummary[]> {
  const rows = await getDatabase()<
    Array<{
      slug: string;
      title: string;
      status: string | null;
      sent_at: Date | null;
    }>
  >`
    SELECT posts.slug, posts.title, campaigns.status, campaigns.sent_at
    FROM posts
    LEFT JOIN campaigns ON campaigns.post_slug = posts.slug
    WHERE posts.published_at IS NOT NULL AND posts.archived_at IS NULL
    ORDER BY posts.post_date DESC
  `;
  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    campaignStatus: row.status ?? undefined,
    sentAt: row.sent_at ?? undefined,
  }));
}

export async function getCampaignPreview(slug: string) {
  const post = await getBlogPost(slug);
  if (!post) return undefined;
  return { post };
}

export async function sendTestCampaign(slug: string): Promise<void> {
  const preview = await getCampaignPreview(slug);
  if (!preview) throw new Error("Published post not found");
  const config = getSiteConfig();
  const excerpt = blogExcerpt(preview.post.content);
  const { error } = await getResend().emails.send({
    from: config.newsletter.from,
    to: config.newsletter.ownerEmail,
    subject: `[TEST] ${preview.post.title}`,
    react: createElement(PostEmail, {
      post: preview.post,
      siteUrl: config.site.url,
      unsubscribeUrl: `${config.site.url}/privacy`,
    }),
    text: `${preview.post.title}\n\n${preview.post.description}\n\n${excerpt}\n\nRead full article: ${config.site.url}/blog/${slug}`,
  });
  if (error) throw new Error(`Test email failed: ${error.message}`);
}

export async function sendCampaign(
  slug: string,
  scheduledAt?: string,
): Promise<void> {
  const preview = await getCampaignPreview(slug);
  if (!preview) throw new Error("Published post not found");
  const sql = getDatabase();
  const claimed = await sql`
    INSERT INTO campaigns (post_slug, status)
    VALUES (${slug}, 'draft')
    ON CONFLICT (post_slug) DO UPDATE
    SET status = 'draft', updated_at = now()
    WHERE campaigns.status = 'failed'
    RETURNING id
  `;
  if (!claimed.length)
    throw new Error("Campaign already created for this post");

  const config = getSiteConfig();
  const excerpt = blogExcerpt(preview.post.content);
  const result = await getResend().broadcasts.create({
    from: config.newsletter.from,
    segmentId: resendEnv().segmentId,
    subject: preview.post.title,
    previewText: preview.post.description,
    react: createElement(PostEmail, {
      post: preview.post,
      siteUrl: config.site.url,
    }),
    text: `${preview.post.title}\n\n${preview.post.description}\n\n${excerpt}\n\nRead full article: ${config.site.url}/blog/${slug}`,
    send: true,
    ...(scheduledAt ? { scheduledAt } : {}),
  });
  if (result.error || !result.data) {
    await sql`UPDATE campaigns SET status = 'failed', updated_at = now() WHERE post_slug = ${slug}`;
    throw new Error(
      `Campaign could not be created${result.error ? `: ${result.error.message}` : ""}`,
    );
  }

  await sql`
    UPDATE campaigns
    SET resend_broadcast_id = ${result.data.id},
        status = ${scheduledAt ? "scheduled" : "sent"},
        scheduled_at = ${scheduledAt ? new Date(scheduledAt) : null},
        sent_at = ${scheduledAt ? null : new Date()},
        updated_at = now()
    WHERE post_slug = ${slug}
  `;
}
