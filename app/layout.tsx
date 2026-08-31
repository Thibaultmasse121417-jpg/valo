import type { Metadata } from "next";
import { Bodoni_Moda, Archivo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Serif éditoriale à fort contraste (haute couture / presse architecture)
// pour les grands titres — plus affirmée et impactante que les serifs
// "romantiques" génériquement associées aux sites IA (Cormorant, Playfair…).
const editorial = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

// Grotesque contemporaine, plus construite et professionnelle qu'Inter,
// pour le texte courant, la navigation et les labels.
const body = Archivo({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = "https://estalia-studio.vercel.app";
const title = "Estalia Studio — Films immobiliers cinématographiques";
const description =
  "Films cinématographiques et contenus premium pour propriétés d'exception et agences immobilières de prestige.";
const titleEn = "Estalia Studio — Cinematic Real Estate Films";
const descriptionEn =
  "Cinematic films and premium content for exceptional properties and prestige real estate agencies.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "film immobilier",
    "vidéo immobilier prestige",
    "cinematic real estate",
    "luxury real estate video",
    "estalia studio",
  ],
  authors: [{ name: "Estalia Studio" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "Estalia Studio",
    locale: "fr_FR",
    // Métadonnées anglaises exposées via og:locale:alternate — le
    // contenu anglais complet est servi côté client par le sélecteur
    // FR / EN (voir lib/LanguageContext.tsx et data/content.ts).
    images: [
      {
        // Placeholder éditorial généré automatiquement — remplacez par
        // un vrai visuel 1200×630 (jpg/png) pour un meilleur rendu sur
        // certains réseaux (voir /public/og-image.svg).
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: `${title} / ${titleEn}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: titleEn,
    description: descriptionEn,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${editorial.variable} ${body.variable}`}>
      <body className="bg-ivoire font-sans text-noir antialiased">
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
