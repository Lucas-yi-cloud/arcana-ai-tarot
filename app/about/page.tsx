import type { Metadata } from "next";
import JsonLd from "@/app/json-ld";
import TarotApp from "@/app/tarot-app";
import { staticPageStructuredData } from "@/lib/structured-data";

const title = "About Arcana AI — A Quieter Way to Ask the Cards";
const description =
  "Learn how Arcana AI pairs Rider-Waite tarot symbolism with AI-guided interpretation for private, reflective readings.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
};

export default function AboutRoute() {
  return (
    <>
      <JsonLd
        data={staticPageStructuredData({
          path: "/about",
          title,
          description,
          breadcrumbName: "About",
        })}
      />
      <TarotApp initialRoute="about" />
    </>
  );
}
