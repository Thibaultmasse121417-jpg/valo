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
const title = "Estalia — Hotel Content Studio";
const description =
  "Estalia turns the photos and videos your hotel already has into premium social content — no new shoot. Hospitality content creation for independent boutique hotels.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "hotel content creation",
    "hospitality content studio",
    "hotel social media content",
    "boutique hotel video",
    "estalia",
  ],
  authors: [{ name: "Estalia" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "Estalia",
    locale: "en_GB",
    // Le FR reste servi côté client par le sélecteur (lib/LanguageContext.tsx)
    // pour le fondateur — le lancement cible le marché UK, EN par défaut.
    // Le visuel de partage (og:image) est généré automatiquement par
    // app/opengraph-image.tsx — pas besoin de le déclarer ici.
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
    <html lang="en" className={`${editorial.variable} ${body.variable}`}>
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
