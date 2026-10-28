import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { UIProvider } from "@/lib/UIContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Player from "@/components/Player";
import Motion from "@/components/Motion";
import { siteConfig } from "@/data/config";

// Titres : serif éditoriale, élégante et expressive (choix du fondateur).
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Texte courant, navigation, boutons : sans empattement très lisible.
const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = siteConfig.url;
const title = "Estalia Studio — Films, sites web & direction artistique";
const description =
  "Films de promotion, sites web sur mesure et direction artistique pour les commerces, agences immobilières, campings, hôtels et notaires. Studio fondé par Thibault Masse.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s — Estalia Studio" },
  description,
  keywords: [
    "vidéo de promotion commerce",
    "film immobilier",
    "vidéo camping",
    "vidéo hôtel",
    "site web sur mesure",
    "direction artistique",
    "Estalia Studio",
  ],
  authors: [{ name: "Thibault Masse" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "Estalia Studio",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title, description },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0b0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* active les apparitions au défilement seulement si le JavaScript tourne */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <LanguageProvider>
          <UIProvider>
            <a className="skip" href="#main">Aller au contenu</a>
            <div id="app">
              <Header />
              {children}
              <Footer />
            </div>
            <Player />
            <Motion />
          </UIProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
