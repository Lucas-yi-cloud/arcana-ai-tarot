import type { Metadata } from "next";
import TarotApp from "@/app/tarot-app";

export const metadata: Metadata = {
  title: "About Arcana AI — A Quieter Way to Ask the Cards",
  description:
    "Learn how Arcana AI pairs Rider-Waite tarot symbolism with AI-guided interpretation for private, reflective readings.",
  alternates: { canonical: "/about" },
};

export default function AboutRoute() {
  return <TarotApp initialRoute="about" />;
}
