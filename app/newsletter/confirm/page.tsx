import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { confirmSubscription } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

export default async function ConfirmNewsletterPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const token = (await searchParams).token;
    let confirmed = false;
    if (token) {
        try {
            confirmed = await confirmSubscription(token);
        } catch {
            confirmed = false;
        }
    }

    return (
        <>
            <SiteHeader />
            <main className="newsletter-confirm" id="content">
                <section>
                    <p className="article-community-kicker">NEWSLETTER</p>
                    <h1>
                        {confirmed ? "You’re subscribed." : "Link unavailable."}
                    </h1>
                    <p>
                        {confirmed
                            ? "The next post will land in your inbox."
                            : "This confirmation link is invalid, expired, or already used."}
                    </p>
                    <Link href="/blog">Back to blog</Link>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
