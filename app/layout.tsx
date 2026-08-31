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
const title = "Estalia Studio — Films cinématographiques pour lieux d'exception";
const description =
  "Studio de création de films cinématiques pour l'immobilier de prestige, les domaines de mariage, l'hôtellerie-restauration et les commerces premium.";
const titleEn = "Estalia Studio — Cinematic Films for Exceptional Places";
const descriptionEn =
  "A creative studio producing cinematic films for luxury real estate, wedding venues, hospitality and premium businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "film immobilier",
    "film cinématique lieu d'exception",
    "cinematic real estate",
    "wedding venue film",
    "hospitality film studio",
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
    // Le visuel de partage (og:image) est généré automatiquement par
    // app/opengraph-image.tsx — pas besoin de le déclarer ici.
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
