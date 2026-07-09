import { cardImage, spreads, type Spread } from "@/lib/tarot-data";
import {
  cardIndexDescription,
  cardIndexFaq,
  cardIndexTitle,
  cardMeaningDescription,
  cardMeaningPath,
  cardMeaningTitle,
  tarotCardMeanings,
  type TarotCardMeaning,
} from "@/lib/tarot-card-meanings";
import {
  clampSeoDescription,
  siteBaseUrl,
  siteDescription,
  siteImage,
  spreadSeoMeta,
} from "@/lib/tarot-seo";

type JsonLd = Record<string, unknown>;

const organizationId = `${siteBaseUrl}/#organization`;
const websiteId = `${siteBaseUrl}/#website`;
const webAppId = `${siteBaseUrl}/#web-application`;
const lastUpdated = "2026-06-30";

function absoluteUrl(path: string) {
  if (path.startsWith("https://") || path.startsWith("http://")) return path;
  return `${siteBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function graph(items: JsonLd[]) {
  return {
    "@context": "https://schema.org",
    "@graph": items,
  };
}

function organizationSchema(): JsonLd {
  return {
    "@type": "Organization",
    "@id": organizationId,
    name: "Arcana AI",
    url: `${siteBaseUrl}/`,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/favicon.svg"),
    },
  };
}

function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    name: "Arcana AI Tarot",
    alternateName: "AI Tarot Reading",
    url: `${siteBaseUrl}/`,
    description: siteDescription,
    inLanguage: "en",
    publisher: { "@id": organizationId },
  };
}

export function homeStructuredData() {
  return graph([
    organizationSchema(),
    websiteSchema(),
    {
      "@type": ["WebApplication", "SoftwareApplication"],
      "@id": webAppId,
      name: "Arcana AI Tarot",
      alternateName: "AI Tarot Reading",
      url: `${siteBaseUrl}/`,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      description:
        `Get an AI tarot reading online. Ask a question, draw the Rider-Waite cards, and receive an AI-guided interpretation across ${spreads.length} classic spreads.`,
      image: siteImage,
      isAccessibleForFree: true,
      offers: [
        {
          "@type": "Offer",
          name: "Free tarot readings",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Monthly Pass",
          price: "9.99",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Quarterly Pass",
          price: "19.99",
          priceCurrency: "USD",
        },
      ],
      publisher: { "@id": organizationId },
    },
    {
      "@type": "ItemList",
      "@id": `${siteBaseUrl}/#tarot-spreads`,
      name: "AI tarot spreads",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: spreads.length,
      itemListElement: spreads.map((spread, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${spread.name} Tarot Reading`,
        url: absoluteUrl(`/spread/${spread.id}`),
        description: spread.blurb,
      })),
    },
  ]);
}

export function staticPageStructuredData({
  path,
  title,
  description,
  breadcrumbName,
}: {
  path: string;
  title: string;
  description: string;
  breadcrumbName: string;
}) {
  const url = absoluteUrl(path);
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;

  return graph([
    organizationSchema(),
    websiteSchema(),
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteBaseUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: breadcrumbName,
          item: url,
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url,
      name: title,
      description,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      breadcrumb: { "@id": breadcrumbId },
      publisher: { "@id": organizationId },
    },
  ]);
}

export function cardIndexStructuredData() {
  const url = absoluteUrl("/card");
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const itemListId = `${url}#major-arcana`;
  const faqId = `${url}#faq`;

  return graph([
    organizationSchema(),
    websiteSchema(),
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteBaseUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tarot Cards",
          item: url,
        },
      ],
    },
    {
      "@type": "CollectionPage",
      "@id": webpageId,
      url,
      name: cardIndexTitle,
      description: cardIndexDescription,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      breadcrumb: { "@id": breadcrumbId },
      mainEntity: { "@id": itemListId },
      publisher: { "@id": organizationId },
    },
    {
      "@type": "ItemList",
      "@id": itemListId,
      name: "Major Arcana tarot card meanings",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: tarotCardMeanings.length,
      itemListElement: tarotCardMeanings.map((card, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${card.name} Tarot Card Meaning`,
        url: absoluteUrl(cardMeaningPath(card)),
        description: card.oneLine,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": faqId,
      mainEntity: cardIndexFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ]);
}

export function cardMeaningStructuredData(card: TarotCardMeaning) {
  const url = absoluteUrl(cardMeaningPath(card));
  const title = cardMeaningTitle(card);
  const description = cardMeaningDescription(card);
  const image = absoluteUrl(card.image);
  const webpageId = `${url}#webpage`;
  const articleId = `${url}#article`;
  const breadcrumbId = `${url}#breadcrumb`;
  const faqId = `${url}#faq`;

  return graph([
    organizationSchema(),
    websiteSchema(),
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteBaseUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tarot Cards",
          item: absoluteUrl("/card"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${card.name} Tarot Card Meaning`,
          item: url,
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url,
      name: title,
      description,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      breadcrumb: { "@id": breadcrumbId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: image,
      },
      mainEntity: { "@id": articleId },
      publisher: { "@id": organizationId },
    },
    {
      "@type": "Article",
      "@id": articleId,
      headline: title,
      description,
      image,
      datePublished: "2026-07-09",
      dateModified: "2026-07-09",
      author: { "@id": organizationId },
      publisher: { "@id": organizationId },
      mainEntityOfPage: { "@id": webpageId },
      articleSection: "Tarot card meanings",
      inLanguage: "en",
      about: [
        "Major Arcana",
        "Rider-Waite tarot",
        `${card.name} tarot card`,
        "upright and reversed tarot meanings",
      ],
      keywords: [
        `${card.name} tarot card meaning`,
        `${card.name} upright`,
        `${card.name} reversed`,
        ...card.keywords,
      ],
    },
    {
      "@type": "FAQPage",
      "@id": faqId,
      mainEntity: card.faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ]);
}

export function spreadDescription(spread: Spread) {
  const seo = spreadSeoMeta[spread.id];
  return clampSeoDescription(
    `${spread.blurb} ${
      seo?.p1 ?? `Ask a question and let Arcana AI read your ${spread.name} spread instantly.`
    }`
  );
}

export function spreadTitle(spread: Spread) {
  return `${spread.name} Tarot Reading | Arcana AI`;
}

export function spreadStructuredData(spread: Spread) {
  const seo = spreadSeoMeta[spread.id];
  const url = absoluteUrl(`/spread/${spread.id}`);
  const title = spreadTitle(spread);
  const description = spreadDescription(spread);
  const image = absoluteUrl(seo ? cardImage(seo.cardNum, seo.cardName) : "/og-image.jpg");
  const webpageId = `${url}#webpage`;
  const articleId = `${url}#article`;
  const breadcrumbId = `${url}#breadcrumb`;
  const faqId = `${url}#faq`;

  const schema: JsonLd[] = [
    organizationSchema(),
    websiteSchema(),
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteBaseUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Spreads",
          item: `${siteBaseUrl}/#spreads`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${spread.name} Tarot Reading`,
          item: url,
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url,
      name: title,
      description,
      inLanguage: "en",
      isPartOf: { "@id": websiteId },
      breadcrumb: { "@id": breadcrumbId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: image,
      },
      mainEntity: { "@id": articleId },
    },
    {
      "@type": "Article",
      "@id": articleId,
      headline: title,
      description,
      image,
      datePublished: "2026-06-29",
      dateModified: lastUpdated,
      author: { "@id": organizationId },
      publisher: { "@id": organizationId },
      mainEntityOfPage: { "@id": webpageId },
      articleSection: "Tarot spreads",
      inLanguage: "en",
      about: [
        "AI tarot reading",
        "Rider-Waite tarot",
        `${spread.name} tarot spread`,
      ],
    },
  ];

  if (seo?.faq.length) {
    schema.push({
      "@type": "FAQPage",
      "@id": faqId,
      mainEntity: seo.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    });
  }

  return graph(schema);
}
