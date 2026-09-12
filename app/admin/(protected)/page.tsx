import Link from "next/link";
import { TrafficChart } from "@/components/admin/traffic-chart";
import { getAnalyticsDashboard } from "@/lib/analytics";

function selectedRange(value: string | undefined): 7 | 30 | 90 {
  return value === "7" || value === "90" ? (Number(value) as 7 | 90) : 30;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const days = selectedRange((await searchParams).range);
  const dashboard = await getAnalyticsDashboard(days);
  const metrics = [
    ["Views", dashboard.totals.views],
    ["Daily uniques", dashboard.totals.uniqueVisitors],
    ["Likes", dashboard.totals.likes],
    ["Subscribers", dashboard.totals.subscribers],
  ] as const;

  return (
    <section aria-labelledby="dashboard-title">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">CONTROL ROOM</p>
          <h1 id="dashboard-title">Newsletter operations.</h1>
        </div>
        <nav className="admin-range" aria-label="Analytics date range">
          {[7, 30, 90].map((range) => (
            <Link
              aria-current={days === range ? "page" : undefined}
              href={`/admin?range=${range}`}
              key={range}
            >
              {range} days
            </Link>
          ))}
        </nav>
      </div>

      <div className="admin-metrics">
        {metrics.map(([label, value]) => (
          <article className="admin-metric" key={label}>
            <p>{label}</p>
            <strong>{value.toLocaleString()}</strong>
          </article>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel" aria-labelledby="traffic-title">
          <h2 id="traffic-title">Daily traffic</h2>
          <TrafficChart data={dashboard.trend} />
        </section>

        <section className="admin-panel" aria-labelledby="campaign-title">
          <h2 id="campaign-title">Latest campaign</h2>
          {dashboard.latestCampaign ? (
            <>
              <strong>{dashboard.latestCampaign.title}</strong>
              <p>{dashboard.latestCampaign.status}</p>
            </>
          ) : (
            <p>No campaign yet.</p>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="top-posts-title">
          <h2 id="top-posts-title">Top posts</h2>
          {dashboard.topPosts.length ? (
            <ol className="admin-ranked-list">
              {dashboard.topPosts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  <span>
                    {post.views} views / {post.uniqueVisitors} unique
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p>No traffic yet.</p>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="referrers-title">
          <h2 id="referrers-title">Referrers</h2>
          {dashboard.referrers.length ? (
            <ol className="admin-ranked-list">
              {dashboard.referrers.map((referrer) => (
                <li key={referrer.host}>
                  <span>{referrer.host}</span>
                  <strong>{referrer.views}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p>No external referrers yet.</p>
          )}
        </section>
      </div>
    </section>
  );
}
