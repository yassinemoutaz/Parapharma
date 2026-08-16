import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "./_layout/footer";
import { Marquee } from "./_layout/marquee";
import { Navbar } from "./_layout/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Parapharmacie — Santé & Beauté à Casablanca",
    template: "%s | Parapharmacie",
  },
  description:
    "Parapharmacie en ligne au Maroc : dermo-cosmétique, soins, hygiène et para-médical, livrés gratuitement à Casablanca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Aller au contenu principal
        </a>
        <Marquee />
        <Navbar />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}