import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/app/json-ld";
import { CardMeaningDetail } from "@/app/card/card-meanings-client";
import { cardMeaningStructuredData } from "@/lib/structured-data";
import {
  cardMeaningDescription,
  cardMeaningKeywords,
  cardMeaningPath,
  cardMeaningTitle,
  findTarotCardMeaning,
  tarotCardMeanings,
} from "@/lib/tarot-card-meanings";
import { siteDescription, siteTitle } from "@/lib/tarot-seo";

type CardPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tarotCardMeanings.map((card) => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = findTarotCardMeaning(slug);
  if (!card) {
    return {
      title: siteTitle,
      description: siteDescription,
      robots: { index: false, follow: false },
    };
  }

  const title = cardMeaningTitle(card);
  const description = cardMeaningDescription(card);
  const url = cardMeaningPath(card);

  return {
    title,
    description,
    keywords: cardMeaningKeywords(card),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "Arcana AI Tarot",
      images: [card.image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card.image],
    },
  };
}

export default async function CardMeaningPage({ params }: CardPageProps) {
  const { slug } = await params;
  const card = findTarotCardMeaning(slug);
  if (!card) notFound();

  return (
    <>
      <JsonLd data={cardMeaningStructuredData(card)} />
      <CardMeaningDetail card={card} />
    </>
  );
}
