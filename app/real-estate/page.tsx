import type { Metadata } from "next";
import VerticalLanding from "@/components/VerticalLanding";
import StickyCta from "@/components/StickyCta";
import { content } from "@/data/content";

const seo = content.fr.universes["real-estate"].seo;

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: "/real-estate" },
  openGraph: { title: seo.title, description: seo.description, url: "/real-estate" },
};

export default function RealEstatePage() {
  return (
    <>
      <VerticalLanding universeId="real-estate" />
      <StickyCta />
    </>
  );
}
