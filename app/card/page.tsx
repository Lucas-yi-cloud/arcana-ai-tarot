import type { Metadata } from "next";
import JsonLd from "@/app/json-ld";
import { CardMeaningsIndex } from "@/app/card/card-meanings-index";
import { cardIndexStructuredData } from "@/lib/structured-data";
import {
  cardIndexDescription,
  cardIndexKeywords,
  cardIndexTitle,
} from "@/lib/tarot-card-meanings";

export const metadata: Metadata = {
  title: cardIndexTitle,
  description: cardIndexDescription,
  keywords: cardIndexKeywords,
  alternates: { canonical: "/card" },
  openGraph: {
    type: "website",
    title: cardIndexTitle,
    description: cardIndexDescription,
    url: "/card",
    siteName: "Arcana AI Tarot",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: cardIndexTitle,
    description: cardIndexDescription,
    images: ["/og-image.jpg"],
  },
};

export default function CardMeaningsPage() {
  return (
    <>
      <JsonLd data={cardIndexStructuredData()} />
      <CardMeaningsIndex />
    </>
  );
}
