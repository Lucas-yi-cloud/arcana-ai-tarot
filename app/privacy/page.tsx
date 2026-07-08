import type { Metadata } from "next";
import JsonLd from "@/app/json-ld";
import TarotApp from "@/app/tarot-app";
import { staticPageStructuredData } from "@/lib/structured-data";

const title = "Privacy — Arcana AI Tarot";
const description =
  "Read how Arcana AI handles accounts, saved tarot readings, payments, cookies, and privacy requests.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyRoute() {
  return (
    <>
      <JsonLd
        data={staticPageStructuredData({
          path: "/privacy",
          title,
          description,
          breadcrumbName: "Privacy",
        })}
      />
      <TarotApp initialRoute="privacy" />
    </>
  );
}
