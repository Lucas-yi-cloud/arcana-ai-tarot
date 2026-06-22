import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arcana AI — AI Tarot Readings",
  description:
    "Choose a tarot spread, ask a question, and receive an AI-guided reading.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
