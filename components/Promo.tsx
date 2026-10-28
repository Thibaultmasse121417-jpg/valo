import Image from "next/image";
import { T } from "@/lib/LanguageContext";
import { FORMATS, PILLARS } from "@/data/site";
import SectionHead from "@/components/SectionHead";

/** Vidéos de promotion : ce que chaque film met en valeur, et où il est vu. */
export default function Promo() {
  return (
    <section className="section" id="promo" aria-labelledby="promo-title">
      <div className="wrap">
        <SectionHead
          num="02"
          id="promo-title"
          label={{ fr: "Vidéos de promotion", en: "Promotional videos" }}
          title={{
            fr: [{ t: "Votre commerce," }, { t: "filmé pour *donner envie*" }, { t: "*de venir.*", c: "in1" }],
            en: [{ t: "Your business," }, { t: "filmed to *make people*" }, { t: "*want to come.*", c: "in1" }],
          }}
          body={{
            fr: "Chaque film met en valeur ce qui fait votre différence. Il est pensé pour être vu là où vos futurs clients vous cherchent : sur les réseaux sociaux, sur votre site et sur Google.",
            en: "Each film highlights what sets you apart. It is designed to be seen where your future customers look for you: on social media, on your website and on Google.",
          }}
        />
        <ol className="pillars">
          {PILLARS.map((p, i) => (
            <li key={p.title.fr} className="pillar" data-reveal style={{ ["--d" as string]: `${(i * 0.06).toFixed(2)}s` }}>
              <span className="n">0{i + 1}</span>
              <h3 className="t-s"><T fr={p.title.fr} en={p.title.en} /></h3>
              <p><T fr={p.text.fr} en={p.text.en} /></p>
            </li>
          ))}
        </ol>

        <div className="formats">
          <div className="formats-head" data-reveal>
            <h3 className="t-m"><T fr={<>Un film, <em>trois formats.</em></>} en={<>One film, <em>three formats.</em></>} /></h3>
            <p className="small">
              <T
                fr="Chaque film est livré dans les formats de vos canaux. Illustration avec des images de notre film immobilier."
                en="Each film is delivered in the formats of your channels. Shown here with stills from our real-estate film."
              />
            </p>
          </div>
          <div className="formats-grid">
            {FORMATS.map((f, i) => (
              <figure key={f.ratio} className={`fmt ${f.cls}`} data-reveal style={{ ["--d" as string]: `${(i * 0.06).toFixed(2)}s` }}>
                <span className="frame">
                  <Image src={`/videos/sequences/seq-0${f.still}.jpg`} alt="" fill sizes="(min-width: 900px) 30vw, 50vw" style={{ objectPosition: f.pos }} />
                  <span className="ratio">{f.ratio}</span>
                </span>
                <figcaption>
                  <h3><T fr={f.title.fr} en={f.title.en} /></h3>
                  <p><T fr={f.text.fr} en={f.text.en} /></p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
