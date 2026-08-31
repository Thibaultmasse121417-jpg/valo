import type { Metadata } from "next";
import VerticalLanding from "@/components/VerticalLanding";
import StickyCta from "@/components/StickyCta";
import { content } from "@/data/content";

const seo = content.fr.universes["wedding-venues"].seo;

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: "/wedding-venues" },
  openGraph: { title: seo.title, description: seo.description, url: "/wedding-venues" },
};

export default function WeddingVenuesPage() {
  return (
    <>
      <VerticalLanding universeId="wedding-venues" />
      <StickyCta />
    </>
  );
}
