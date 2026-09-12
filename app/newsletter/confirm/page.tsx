import Link from "next/link";
import { confirmNewsletter } from "@/app/newsletter/confirm/actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ConfirmNewsletterPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string; status?: string }>;
}) {
    const { token, status } = await searchParams;
    const confirmed = status === "confirmed";
    const failed = status === "error";
    const ready = typeof token === "string" && token.length > 0;

    return (
        <>
            <SiteHeader />
            <main className="newsletter-confirm" id="content">
                <section>
                    <p className="article-community-kicker">NEWSLETTER</p>
                    <h1>
                        {confirmed
                            ? "You’re subscribed."
                            : failed
                              ? "Confirmation failed."
                              : ready
                                ? "Confirm subscription."
                                : "Link unavailable."}
                    </h1>
                    <p>
                        {confirmed
                            ? "The next post will land in your inbox."
                            : failed
                              ? "We could not complete your subscription. Please try subscribing again."
                              : ready
                                ? "Confirm that you want new posts delivered by email."
                                : "This confirmation link is invalid, expired, or already used."}
                    </p>
                    {ready && (
                        <form action={confirmNewsletter}>
                            <input name="token" type="hidden" value={token} />
                            <Button type="submit">Confirm subscription</Button>
                        </form>
                    )}
                    <Link href="/blog">Back to blog</Link>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
