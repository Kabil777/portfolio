import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { getSiteConfig } from "@/lib/config";
import {
    Darker_Grotesque,
    JetBrains_Mono,
    Public_Sans,
} from "next/font/google";
import "./globals.css";

const darkerGrotesque = Darker_Grotesque({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
    display: "swap",
});

const publicSans = Public_Sans({
    subsets: ["latin"],
    variable: "--font-public-sans",
    weight: "700",
    display: "swap",
});

const title = "Kabil Muthusamy — Data, Platform & SRE";
const description =
    "Kabil Muthusamy builds reliable data systems, observable platforms, and calm operations.";

export const metadata: Metadata = {
    metadataBase: new URL(getSiteConfig().site.url),
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        url: "/",
        siteName: "Kabil Muthusamy",
        title,
        description,
    },
    twitter: {
        card: "summary_large_image",
        title,
        description,
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html data-scroll-behavior="smooth" lang="en">
            <body
                className={`${darkerGrotesque.variable} ${jetBrainsMono.variable} ${publicSans.variable}`}
            >
                {children}
                <Toaster closeButton position="bottom-right" richColors />
            </body>
        </html>
    );
}
