import type { Metadata } from "next";
import TarotApp from "@/app/tarot-app";

export const metadata: Metadata = {
  title: "Journals — Arcana AI Tarot",
  description: "Review your saved Arcana AI tarot readings and return to past spreads.",
  alternates: { canonical: "/journals" },
  robots: { index: false, follow: true },
};

export default function JournalsRoute() {
  return <TarotApp initialRoute="history" />;
}
