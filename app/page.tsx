import { mediaExists } from "@/lib/media";
import { projects } from "@/data/projects";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import SelectedFilms from "@/components/SelectedFilms";
import Approach from "@/components/Approach";
import PropertyStyles from "@/components/PropertyStyles";
import ForAgencies from "@/components/ForAgencies";
import Trust from "@/components/Trust";
import About from "@/components/About";
import Contact from "@/components/Contact";

export default function Home() {
  const hasHeroVideo = mediaExists("/videos/hero.mp4");
  const hasHeroPoster = mediaExists("/images/hero-poster.jpg");
  const hasFounderPhoto = mediaExists("/images/founder.jpg");

  const mediaStatus = Object.fromEntries(
    projects.map((project) => [
      project.id,
      {
        video: mediaExists(project.video),
        poster: mediaExists(project.poster),
      },
    ])
  );

  return (
    <main>
      <Hero hasVideo={hasHeroVideo} hasPoster={hasHeroPoster} />
      <Manifesto />
      <SelectedFilms mediaStatus={mediaStatus} />
      <Approach />
      <PropertyStyles />
      <ForAgencies />
      <Trust />
      <About hasFounderPhoto={hasFounderPhoto} />
      <Contact />
    </main>
  );
}
