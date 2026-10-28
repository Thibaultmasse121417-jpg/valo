import type { Metadata } from "next";
import TradePage from "@/components/TradePage";
import { TRADES } from "@/data/site";

export const metadata: Metadata = {
  title: "Sites web sur mesure",
  description: TRADES["sites-web"].seo.fr,
  alternates: { canonical: "/sites-web" },
};

export default function SitesWebPage() {
  return <TradePage slug="sites-web" />;
}
