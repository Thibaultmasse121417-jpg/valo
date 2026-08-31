import type { Metadata } from "next";
import VerticalLanding from "@/components/VerticalLanding";
import StickyCta from "@/components/StickyCta";
import { content } from "@/data/content";

const seo = content.fr.universes.business.seo;

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: "/business" },
  openGraph: { title: seo.title, description: seo.description, url: "/business" },
};

export default function BusinessPage() {
  return (
    <>
      <VerticalLanding universeId="business" />
      <StickyCta />
    </>
  );
}
