import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import FilmSection from "@/components/FilmSection";
import Promo from "@/components/Promo";
import Metiers from "@/components/Metiers";
import Saisons from "@/components/Saisons";
import { FAQ, Methode, Sites, Studio, Tarifs } from "@/components/Sections";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Intro />
      <FilmSection />
      <Promo />
      <Metiers />
      <Saisons />
      <Sites />
      <Methode />
      <Tarifs />
      <Studio />
      <FAQ />
      <ContactForm />
    </main>
  );
}
