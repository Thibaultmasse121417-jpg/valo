import { mediaExists } from "@/lib/media";
import { projects } from "@/data/projects";
import { universes } from "@/data/universes";
import Hero from "@/components/Hero";
import UniverseChooser from "@/components/UniverseChooser";
import Manifesto from "@/components/Manifesto";
import SelectedFilms from "@/components/SelectedFilms";
import Approach from "@/components/Approach";
import Offers from "@/components/Offers";
import Trust from "@/components/Trust";
import About from "@/components/About";
import ContactForm from "@/components/ContactForm";
import StickyCta from "@/components/StickyCta";

export default function Home() {
  const hasHeroVideo = mediaExists("/videos/hero.mp4");
  const hasHeroPoster = mediaExists("/images/hero-poster.jpg");
  const hasFounderPhoto = mediaExists("/images/founder.jpg");

  const mediaStatus = Object.fromEntries(
    projects.map((project) => [
      project.id,
      { video: mediaExists(project.video), poster: mediaExists(project.poster) },
    ])
  );

  const imageStatus = Object.fromEntries(
    universes.map((u) => [u.id, u.hero.poster ? mediaExists(u.hero.poster) : false])
  );

  return (
    <main>
      <Hero hasVideo={hasHeroVideo} hasPoster={hasHeroPoster} />
      <UniverseChooser imageStatus={imageStatus} />
      <Manifesto />
      <SelectedFilms mediaStatus={mediaStatus} />
      <Approach />
      <Offers />
      <Trust />
      <About hasFounderPhoto={hasFounderPhoto} />
      <ContactForm />
      <StickyCta />
    </main>
  );
}
