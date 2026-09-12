import Link from "next/link";
import { getCampaigns } from "@/lib/campaigns";

export default async function AdminCampaignsPage() {
    const campaigns = await getCampaigns();
    return (
        <section aria-labelledby="campaigns-title">
            <div className="admin-page-heading">
                <div>
                    <p className="admin-kicker">DELIVERY</p>
                    <h1 id="campaigns-title">Newsletter sends.</h1>
                </div>
            </div>
            <p>
                Select a published post. Preview and test it before one final
                send.
            </p>
            {campaigns.length ? (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Post</th>
                                <th>Status</th>
                                <th>Sent</th>
                                <th>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((campaign) => (
                                <tr key={campaign.slug}>
                                    <td>
                                        <strong>{campaign.title}</strong>
                                        <small>{campaign.slug}</small>
                                    </td>
                                    <td>
                                        <span
                                            className={`admin-status admin-status-${campaign.campaignStatus ?? "draft"}`}
                                        >
                                            {campaign.campaignStatus ??
                                                "not sent"}
                                        </span>
                                    </td>
                                    <td>
                                        {campaign.sentAt?.toLocaleString("en", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        }) ?? "—"}
                                    </td>
                                    <td>
                                        <Link
                                            href={`/admin/campaigns/${campaign.slug}`}
                                            prefetch={false}
                                        >
                                            {campaign.campaignStatus
                                                ? "View"
                                                : "Prepare"}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="admin-empty">
                    Publish a post before preparing a newsletter send.
                </p>
            )}
        </section>
    );
}
