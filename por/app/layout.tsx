import type { Metadata } from "next";
import { Darker_Grotesque, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Kabil — Data, Platform & SRE",
  description:
    "Kabil builds reliable data systems, observable platforms, and calm operations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${darkerGrotesque.variable} ${jetBrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
