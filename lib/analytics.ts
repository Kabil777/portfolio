import { getDatabase } from "@/lib/db";

export type AnalyticsDashboard = {
  totals: {
    views: number;
    uniqueVisitors: number;
    likes: number;
    subscribers: number;
  };
  trend: Array<{ day: string; views: number; uniqueVisitors: number }>;
  topPosts: Array<{
    slug: string;
    title: string;
    views: number;
    uniqueVisitors: number;
  }>;
  referrers: Array<{ host: string; views: number }>;
  latestCampaign?: { title: string; status: string; sentAt: Date | null };
};

export async function getAnalyticsDashboard(
  days: 7 | 30 | 90,
): Promise<AnalyticsDashboard> {
  const sql = getDatabase();
  const [traffic, engagement, trend, topPosts, referrers, latestCampaigns] =
    await Promise.all([
      sql<Array<{ views: number; unique_visitors: number }>>`
      SELECT COALESCE(sum(views), 0)::int AS views,
             COALESCE(sum(unique_visitors), 0)::int AS unique_visitors
      FROM post_daily_stats
      WHERE day >= current_date - (${days}::int - 1)
    `,
      sql<Array<{ likes: number; subscribers: number }>>`
      SELECT
        (SELECT count(*)::int FROM likes) AS likes,
        (SELECT count(*)::int FROM subscribers WHERE status = 'active') AS subscribers
    `,
      sql<Array<{ day: Date; views: number; unique_visitors: number }>>`
      SELECT series.day,
             COALESCE(stats.views, 0)::int AS views,
             COALESCE(stats.unique_visitors, 0)::int AS unique_visitors
      FROM generate_series(
        current_date - (${days}::int - 1), current_date, interval '1 day'
      ) AS series(day)
      LEFT JOIN (
        SELECT day, sum(views) AS views, sum(unique_visitors) AS unique_visitors
        FROM post_daily_stats GROUP BY day
      ) stats ON stats.day = series.day
      ORDER BY series.day
    `,
      sql<
        Array<{
          slug: string;
          title: string;
          views: number;
          unique_visitors: number;
        }>
      >`
      SELECT posts.slug, posts.title,
             COALESCE(sum(stats.views), 0)::int AS views,
             COALESCE(sum(stats.unique_visitors), 0)::int AS unique_visitors
      FROM posts
      LEFT JOIN post_daily_stats stats
        ON stats.post_slug = posts.slug
       AND stats.day >= current_date - (${days}::int - 1)
      WHERE posts.published_at IS NOT NULL AND posts.archived_at IS NULL
      GROUP BY posts.slug, posts.title
      ORDER BY views DESC, unique_visitors DESC
      LIMIT 8
    `,
      sql<Array<{ host: string; views: number }>>`
      SELECT referrer_host AS host, sum(views)::int AS views
      FROM post_referrer_daily
      WHERE day >= current_date - (${days}::int - 1)
      GROUP BY referrer_host ORDER BY views DESC LIMIT 8
    `,
      sql<Array<{ title: string; status: string; sent_at: Date | null }>>`
      SELECT posts.title, campaigns.status, campaigns.sent_at
      FROM campaigns JOIN posts ON posts.slug = campaigns.post_slug
      ORDER BY campaigns.updated_at DESC LIMIT 1
    `,
    ]);

  return {
    totals: {
      views: traffic[0]?.views ?? 0,
      uniqueVisitors: traffic[0]?.unique_visitors ?? 0,
      likes: engagement[0]?.likes ?? 0,
      subscribers: engagement[0]?.subscribers ?? 0,
    },
    trend: trend.map((row) => ({
      day: row.day.toISOString().slice(0, 10),
      views: row.views,
      uniqueVisitors: row.unique_visitors,
    })),
    topPosts: topPosts.map((row) => ({
      slug: row.slug,
      title: row.title,
      views: row.views,
      uniqueVisitors: row.unique_visitors,
    })),
    referrers,
    latestCampaign: latestCampaigns[0]
      ? {
          title: latestCampaigns[0].title,
          status: latestCampaigns[0].status,
          sentAt: latestCampaigns[0].sent_at,
        }
      : undefined,
  };
}
