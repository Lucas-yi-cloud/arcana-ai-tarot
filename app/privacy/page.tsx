import type { Metadata } from "next";
import TarotApp from "@/app/tarot-app";

export const metadata: Metadata = {
  title: "Privacy — Arcana AI Tarot",
  description:
    "Read how Arcana AI handles accounts, saved tarot readings, payments, cookies, and privacy requests.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyRoute() {
  return <TarotApp initialRoute="privacy" />;
}
