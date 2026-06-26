import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TarotApp from "@/app/tarot-app";
import { cardImage, spreads } from "@/lib/tarot-data";
import {
  clampSeoDescription,
  siteDescription,
  siteTitle,
  spreadSeoMeta,
} from "@/lib/tarot-seo";

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
  const title = `${spread.name} Tarot Reading — Free AI ${spread.name} Spread | Arcana AI`;
  const description = clampSeoDescription(
    `${spread.blurb} ${
      seo?.p1 ?? `Ask a question and let Arcana AI read your ${spread.name} spread instantly.`
    }`
  );
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

  return <TarotApp initialRoute="detail" initialSpreadId={spread.id} />;
}
