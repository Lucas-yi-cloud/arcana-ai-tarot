import type { Metadata } from "next";
import TarotApp from "@/app/tarot-app";

export const metadata: Metadata = {
  title: "Contact — Arcana AI Tarot",
  description:
    "Contact Arcana AI for product feedback, support, billing, and privacy questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactRoute() {
  return <TarotApp initialRoute="contact" />;
}
