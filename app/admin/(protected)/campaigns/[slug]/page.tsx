import { render } from "@react-email/render";
import { notFound } from "next/navigation";
import {
    sendCampaignAction,
    sendTestCampaignAction,
} from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { FlashToasts } from "@/components/admin/flash-toasts";
import { PostEmail } from "@/components/email/post-email";
import { getCampaignPreview, getCampaigns } from "@/lib/campaigns";
import { getSiteConfig } from "@/lib/config";

export default async function CampaignPreviewPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{
        tested?: string;
        error?: string;
        warning?: string;
    }>;
}) {
    const { slug } = await params;
    const [preview, campaigns] = await Promise.all([
        getCampaignPreview(slug),
        getCampaigns(),
    ]);
    if (!preview) notFound();
    const existing = campaigns.find(
        (campaign) => campaign.slug === slug,
    )?.campaignStatus;
    const result = await searchParams;
    const tested = result.tested === "1";
    const error = result.error;
    const config = getSiteConfig();
    const emailHtml = await render(
        <PostEmail
            post={preview.post}
            siteUrl={config.site.url}
            unsubscribeUrl={`${config.site.url}/privacy`}
        />,
    );

    return (
        <section aria-labelledby="campaign-preview-title">
            <div className="admin-page-heading">
                <div>
                    <p className="admin-kicker">EMAIL PREVIEW</p>
                    <h1 id="campaign-preview-title">{preview.post.title}</h1>
                </div>
                {existing && (
                    <span className={`admin-status admin-status-${existing}`}>
                        {existing}
                    </span>
                )}
            </div>
            <FlashToasts
                error={error}
                success={
                    tested ? "Test email sent to configured owner." : undefined
                }
                warning={result.warning}
            />
            <div className="admin-campaign-actions">
                <form action={sendTestCampaignAction}>
                    <input name="slug" type="hidden" value={slug} />
                    <button
                        className="admin-button admin-button-secondary"
                        type="submit"
                    >
                        Send test
                    </button>
                </form>
                {!existing && (
                    <form action={sendCampaignAction}>
                        <input name="slug" type="hidden" value={slug} />
                        <label htmlFor="scheduledAt">Schedule (optional)</label>
                        <input
                            id="scheduledAt"
                            name="scheduledAt"
                            type="datetime-local"
                        />
                        <ConfirmSubmit
                            className="admin-button"
                            message="Send this post to every active subscriber? This cannot be undone."
                        >
                            Send newsletter
                        </ConfirmSubmit>
                    </form>
                )}
            </div>
            <iframe
                className="admin-email-preview"
                srcDoc={emailHtml}
                title={`Email preview: ${preview.post.title}`}
            />
        </section>
    );
}
