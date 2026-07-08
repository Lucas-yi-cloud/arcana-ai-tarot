import type { Metadata } from "next";
import { siteBaseUrl, siteDescription, siteTitle } from "@/lib/tarot-seo";
import "./globals.css";

const ga4MeasurementId = "G-BV1BZXP1X2";

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
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${ga4MeasurementId}');
`,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
