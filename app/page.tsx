import { mediaExists } from "@/lib/media";
import { hospitalityDemos } from "@/data/projects";
import Hero from "@/components/Hero";
import ImmediateProof from "@/components/ImmediateProof";
import SelectedFilms from "@/components/SelectedFilms";
import Manifesto from "@/components/Manifesto";
import Approach from "@/components/Approach";
import ValueProps from "@/components/ValueProps";
import Offers from "@/components/Offers";
import Trust from "@/components/Trust";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import StickyCta from "@/components/StickyCta";

export default function Home() {
  // Le hero-poster.jpg existant est un château français — il ne correspond
  // plus au positionnement hospitality/UK boutique hotel du lancement.
  // Tant qu'un vrai visuel hôtel n'est pas produit, on affiche le
  // placeholder éditorial honnête plutôt qu'un visuel trompeur.
  const hasHeroVideo = false;
  const hasHeroPoster = false;

  const mediaStatus = Object.fromEntries(
    hospitalityDemos.map((project) => [
      project.id,
      { video: mediaExists(project.video), poster: mediaExists(project.poster) },
    ])
  );

  return (
    <main>
      <Hero hasVideo={hasHeroVideo} hasPoster={hasHeroPoster} ctaPrimaryHref="#how-it-works" ctaSecondaryHref="#work" />
      <ImmediateProof hasBefore={false} hasAfter={false} hasAfterPoster={false} />
      <SelectedFilms mediaStatus={mediaStatus} projects={hospitalityDemos} id="work" />
      <Manifesto ctaHref="#how-it-works" />
      <Approach />
      <ValueProps />
      <Offers />
      <Trust />
      <FAQ />
      <ContactForm defaultSector="hotel" />
      <StickyCta />
    </main>
  );
}
