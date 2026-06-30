import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/app/json-ld";
import TarotApp from "@/app/tarot-app";
import { cardImage, spreads } from "@/lib/tarot-data";
import {
  siteDescription,
  siteTitle,
  spreadSeoMeta,
} from "@/lib/tarot-seo";
import {
  spreadDescription,
  spreadStructuredData,
  spreadTitle,
} from "@/lib/structured-data";

type SpreadPageProps = {
  params: Promise<{ id: string }>;
};

function findSpread(id: string) {
  return spreads.find((item) => item.id === id) ?? null;
}

export function generateStaticParams() {
  return spreads.map((spread) => ({ id: spread.id }));
}

export async function generateMetadata({ params }: SpreadPageProps): Promise<Metadata> {
  const { id } = await params;
  const spread = findSpread(id);
  if (!spread) {
    return {
      title: siteTitle,
      description: siteDescription,
      robots: { index: false, follow: false },
    };
  }

  const seo = spreadSeoMeta[spread.id];
  const title = spreadTitle(spread);
  const description = spreadDescription(spread);
  const url = `/spread/${spread.id}`;
  const image = seo ? cardImage(seo.cardNum, seo.cardName) : "/og-image.jpg";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Arcana AI Tarot",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function SpreadPage({ params }: SpreadPageProps) {
  const { id } = await params;
  const spread = findSpread(id);
  if (!spread) notFound();

  return (
    <>
      <JsonLd data={spreadStructuredData(spread)} />
      <TarotApp initialRoute="detail" initialSpreadId={spread.id} />
    </>
  );
}
