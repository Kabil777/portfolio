import Link from "next/link";
import { unsubscribeSubscriberAction } from "@/app/admin/actions";
import { getSubscribers } from "@/lib/newsletter";

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const parameters = await searchParams;
  const query = parameters.q?.trim().toLowerCase() ?? "";
  const allowed = new Set(["pending", "active", "unsubscribed"]);
  const status =
    parameters.status && allowed.has(parameters.status)
      ? parameters.status
      : "all";
  const allSubscribers = await getSubscribers();
  const subscribers = allSubscribers.filter(
    (subscriber) =>
      (!query || subscriber.email.includes(query)) &&
      (status === "all" || subscriber.status === status),
  );

  return (
    <section aria-labelledby="subscribers-title">
      <div className="admin-page-heading subscriber-heading">
        <div>
          <p className="admin-kicker">PEOPLE SUBSCRIBED TO NEWSLETTER</p>
          <h1 id="subscribers-title">Subscribers.</h1>
        </div>
        <Link className="admin-button" href="/admin/subscribers/export">
          Export CSV
        </Link>
      </div>

      <div className="subscriber-summary" aria-label="Subscriber totals">
        {(["active", "pending", "unsubscribed"] as const).map((item) => (
          <article key={item}>
            <span>{item}</span>
            <strong>
              {
                allSubscribers.filter(({ status: value }) => value === item)
                  .length
              }
            </strong>
          </article>
        ))}
      </div>

      <form className="subscriber-toolbar">
        <label htmlFor="subscriber-search">Find email</label>
        <input
          defaultValue={parameters.q}
          id="subscriber-search"
          name="q"
          placeholder="name@example.com"
          type="search"
        />
        <label htmlFor="subscriber-status">Show</label>
        <select defaultValue={status} id="subscriber-status" name="status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <button type="submit">Apply</button>
      </form>

      {subscribers.length ? (
        <div className="subscriber-grid">
          {subscribers.map((subscriber) => (
            <article className="subscriber-card" key={subscriber.email}>
              <header>
                <span
                  className={`admin-status admin-status-${subscriber.status}`}
                >
                  {subscriber.status}
                </span>
                <time
                  dateTime={(
                    subscriber.consentedAt ?? subscriber.createdAt
                  ).toISOString()}
                >
                  {(
                    subscriber.consentedAt ?? subscriber.createdAt
                  ).toLocaleDateString("en", {
                    dateStyle: "medium",
                  })}
                </time>
              </header>
              <strong>{subscriber.email}</strong>
              <small>
                {subscriber.consentedAt
                  ? "Confirmed subscriber"
                  : "Awaiting confirmation"}
              </small>
              {subscriber.status === "active" && (
                <form action={unsubscribeSubscriberAction}>
                  <input name="email" type="hidden" value={subscriber.email} />
                  <button type="submit">Unsubscribe</button>
                </form>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-empty">No subscribers match these filters.</p>
      )}
    </section>
  );
}
