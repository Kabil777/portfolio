import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
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

export const metadata: Metadata = {
    title: "Kabil Muthusamy — Data, Platform & SRE",
    description:
        "Kabil Muthusamy builds reliable data systems, observable platforms, and calm operations.",
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
