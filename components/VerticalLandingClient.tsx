"use client";

import Hero from "./Hero";
import Manifesto from "./Manifesto";
import SelectedFilms from "./SelectedFilms";
import ShotList from "./ShotList";
import PropertyStyles from "./PropertyStyles";
import Approach from "./Approach";
import Trust from "./Trust";
import ContactForm from "./ContactForm";
import { useLanguage } from "@/lib/LanguageContext";
import type { UniverseId } from "@/data/universes";
import type { Project } from "@/data/projects";

type MediaStatus = Record<string, { video: boolean; poster: boolean }>;

const defaultSectorByUniverse: Record<UniverseId, string | undefined> = {
  "real-estate": "immobilier",
  "wedding-venues": "mariage",
  hospitality: undefined, // couvre à la fois "Hôtel" et "Restaurant" — on laisse le visiteur préciser
  business: "commerce",
};

export default function VerticalLandingClient({
  universeId,
  hasHeroVideo,
  hasHeroPoster,
  videoSrc,
  posterSrc,
  projects,
  mediaStatus,
}: {
  universeId: UniverseId;
  hasHeroVideo: boolean;
  hasHeroPoster: boolean;
  videoSrc: string;
  posterSrc?: string;
  projects: Project[];
  mediaStatus: MediaStatus;
}) {
  const { t, locale } = useLanguage();
  const u = t.universes[universeId];
  const shotListKicker = locale === "fr" ? "En pratique" : "In practice";
  const shotListTitle =
    locale === "fr" ? ["Un exemple,", "plan par plan."] : ["An example,", "shot by shot."];

  return (
    <main>
      <Hero
        hasVideo={hasHeroVideo}
        hasPoster={hasHeroPoster}
        videoSrc={videoSrc}
        posterSrc={posterSrc}
        content={u.hero}
        ctaPrimaryHref="#films"
        ctaSecondaryHref="#contact"
      />
      <Manifesto content={u.intro} ctaHref="#contact" />
      {projects.length > 0 ? (
        <SelectedFilms
          mediaStatus={mediaStatus}
          projects={projects}
          content={{ ...u.portfolio, cta: u.cta }}
          ctaHref="#contact"
        />
      ) : null}
      <ShotList kicker={shotListKicker} title={shotListTitle} lists={u.shotLists} />
      {/* Détail supplémentaire propre à Real Estate : 3 sous-types de bien, chacun avec sa propre mise en scène. */}
      {universeId === "real-estate" ? <PropertyStyles /> : null}
      <Approach />
      <Trust />
      <ContactForm defaultSector={defaultSectorByUniverse[universeId]} />
    </main>
  );
}
