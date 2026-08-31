import { mediaExists } from "@/lib/media";
import { projectsFor } from "@/data/projects";
import { getUniverse, type UniverseId } from "@/data/universes";
import VerticalLandingClient from "./VerticalLandingClient";

/**
 * Coquille serveur d'une landing page d'univers : détermine la présence
 * réelle des fichiers médias (build-time, voir lib/media.ts) puis délègue
 * le rendu à VerticalLandingClient, qui résout la copie bilingue via le
 * contexte de langue (useLanguage ne peut pas être appelé côté serveur).
 */
export default function VerticalLanding({ universeId }: { universeId: UniverseId }) {
  const universe = getUniverse(universeId);
  const projects = projectsFor(universeId);

  const hasHeroVideo = mediaExists(universe.hero.video);
  const hasHeroPoster = universe.hero.poster ? mediaExists(universe.hero.poster) : false;

  const mediaStatus = Object.fromEntries(
    projects.map((project) => [
      project.id,
      { video: mediaExists(project.video), poster: mediaExists(project.poster) },
    ])
  );

  return (
    <VerticalLandingClient
      universeId={universeId}
      hasHeroVideo={hasHeroVideo}
      hasHeroPoster={hasHeroPoster}
      videoSrc={universe.hero.video}
      posterSrc={universe.hero.poster || undefined}
      projects={projects}
      mediaStatus={mediaStatus}
    />
  );
}
