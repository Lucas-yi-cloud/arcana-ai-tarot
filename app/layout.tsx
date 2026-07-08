import type { Metadata } from "next";
import { siteBaseUrl, siteDescription, siteTitle } from "@/lib/tarot-seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "ai tarot reading",
    "ai tarot",
    "tarot reading online",
    "free tarot reading",
    "online tarot cards",
    "ai tarot card reading",
    "rider waite tarot",
    "daily tarot",
    "love tarot reading",
    "career tarot reading",
  ],
  authors: [{ name: "Arcana AI" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: siteTitle,
    description:
      "Ask a question, draw Rider-Waite cards, and get a clear AI tarot reading online.",
    url: "/",
    siteName: "Arcana AI Tarot",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description:
      "Ask a question, draw Rider-Waite cards, and get a clear AI tarot reading online.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="/ga4-init.js" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
