import type { Metadata } from "next";
import VerticalLanding from "@/components/VerticalLanding";
import StickyCta from "@/components/StickyCta";
import { content } from "@/data/content";

const seo = content.fr.universes.hospitality.seo;

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: "/hospitality" },
  openGraph: { title: seo.title, description: seo.description, url: "/hospitality" },
};

export default function HospitalityPage() {
  return (
    <>
      <VerticalLanding universeId="hospitality" />
      <StickyCta />
    </>
  );
}
