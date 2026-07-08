import type { Metadata } from "next";
import JsonLd from "@/app/json-ld";
import TarotApp from "@/app/tarot-app";
import { staticPageStructuredData } from "@/lib/structured-data";

const title = "Contact — Arcana AI Tarot";
const description =
  "Contact Arcana AI for product feedback, support, billing, and privacy questions.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
};

export default function ContactRoute() {
  return (
    <>
      <JsonLd
        data={staticPageStructuredData({
          path: "/contact",
          title,
          description,
          breadcrumbName: "Contact",
        })}
      />
      <TarotApp initialRoute="contact" />
    </>
  );
}
