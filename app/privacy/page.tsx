import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy — Kabil Muthusamy" };

export default function PrivacyPage() {
    const email = getSiteConfig().contact?.email ?? "hello@kabil.dev";
    return (
        <>
            <SiteHeader />
            <main className="privacy-page" id="content">
                <article>
                    <p className="article-community-kicker">
                        PLAIN-LANGUAGE PRIVACY
                    </p>
                    <h1>Small data footprint.</h1>
                    <h2>Likes</h2>
                    <p>
                        An essential first-party cookie remembers whether this
                        browser liked a post. It is not shared with advertisers.
                    </p>
                    <h2>Newsletter</h2>
                    <p>
                        Email addresses are stored only after a confirmation
                        step and sent to Resend for delivery. Messages include
                        unsubscribe controls. Open and click tracking are
                        disabled.
                    </p>
                    <h2>Your choices</h2>
                    <p>
                        Unsubscribe from any newsletter email. For access or
                        deletion requests, email{" "}
                        <a href={`mailto:${email}`}>{email}</a>.
                    </p>
                </article>
            </main>
            <SiteFooter />
        </>
    );
}
