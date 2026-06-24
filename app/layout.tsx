import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "AI Tarot Reading — Free Online Tarot Card Readings | Arcana AI";
const siteDescription =
  "Get an AI tarot reading online in seconds. Ask a question, draw the cards, and let Arcana AI interpret the Rider-Waite deck — from a daily one-card draw to the full Celtic Cross. Free, private, and accurate.";
const siteUrl = "https://aitarotreading.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    title: "AI Tarot Reading — Free Online Tarot Card Readings",
    description:
      "Ask a question, draw the cards, and let Arcana AI read the Rider-Waite spread for you. Free online AI tarot reading.",
    url: "/",
    siteName: "Arcana AI Tarot",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tarot Reading — Free Online Tarot Card Readings",
    description:
      "Ask a question, draw the cards, and let Arcana AI read the Rider-Waite spread for you. Free online AI tarot reading.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Arcana AI Tarot",
  alternateName: "AI Tarot Reading",
  url: `${siteUrl}/`,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web, iOS",
  description:
    "Get an AI tarot reading online. Ask a question, draw the Rider-Waite cards, and receive an AI-guided interpretation across 14 classic spreads.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
