import { T } from "@/lib/LanguageContext";
import { siteConfig } from "@/data/config";

export default function Intro() {
  return (
    <section className="section intro" aria-labelledby="intro-title">
      <div className="wrap grid">
        <p className="label" data-reveal>
          <b>00</b>&nbsp; <T fr="Le studio" en="The studio" />
        </p>
        <div className="txt">
          <h2 className="sr-only" id="intro-title">
            <T fr="Estalia Studio en quelques mots" en="Estalia Studio in a few words" />
          </h2>
          <p className="lede" data-reveal>
            <T
              fr={<>Un lieu, un savoir-faire, une équipe ont toujours quelque chose à raconter. Estalia Studio en trouve la lumière et le rythme, puis crée les films et les sites qui donnent <em>envie de pousser la porte.</em></>}
              en={<>A place, a craft, a team always have something to say. Estalia Studio finds their light and rhythm, then creates the films and websites that make people <em>want to walk in.</em></>}
            />
          </p>
          <div className="sig" data-reveal style={{ ["--d" as string]: ".08s" }}>
            <span className="small">
              <T fr="Fondé et dirigé par" en="Founded and run by" />{" "}
              <a href="#studio" className="muted">{siteConfig.founder.name}</a>
            </span>
            <span className="label">
              <T fr="Direction artistique · Vidéo · Design web" en="Art direction · Film · Web design" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
