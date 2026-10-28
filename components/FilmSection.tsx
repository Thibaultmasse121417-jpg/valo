"use client";

import Image from "next/image";
import { T, useLang } from "@/lib/LanguageContext";
import { useUI } from "@/lib/UIContext";
import { FILM, SEQUENCES, STUDIES, fmtTime } from "@/data/site";
import SectionHead from "@/components/SectionHead";

const Corners = () => (
  <>
    <span className="corner c1" /><span className="corner c2" /><span className="corner c3" /><span className="corner c4" />
  </>
);

/** Le vrai film, son découpage séquence par séquence, puis les études (clairement présentées comme telles). */
export default function FilmSection() {
  const { t } = useLang();
  const { openFilm, openImage } = useUI();

  return (
    <section className="section" id="films" aria-labelledby="films-title">
      <div className="wrap">
        <SectionHead
          num="01"
          id="films-title"
          size="t-xl"
          variant="wide"
          label={{ fr: "Le film", en: "The film" }}
          title={{ fr: [{ t: "Un film," }, { t: "*pas un diaporama.*", c: "in2" }], en: [{ t: "A film," }, { t: "*not a slideshow.*", c: "in2" }] }}
        />

        <article aria-labelledby="villa-title">
          <button
            type="button"
            className="frame feature-frame"
            data-reveal
            onClick={() => openFilm(0)}
            aria-label={t({ fr: "Lire le film Villa triplex, 50 secondes", en: "Play the Villa triplex film, 50 seconds" })}
          >
            <Image src={FILM.poster} alt="" fill sizes="(min-width: 1440px) 1312px, 100vw" data-parallax />
            <Corners />
            <span className="play" aria-hidden="true">
              <span className="disc"><svg viewBox="0 0 20 20"><path d="M4 2l14 8-14 8z" fill="currentColor" /></svg></span>
              <span className="pl"><T fr={`Voir le film · ${FILM.duration}`} en={`Watch the film · ${FILM.duration}`} /></span>
            </span>
          </button>

          <div className="feature-info">
            <div className="feature-title" data-reveal>
              <span className="badge"><span className="rec" aria-hidden="true" /><T fr="Film réalisé par Estalia" en="Film by Estalia" /></span>
              <h3 className="t-l" id="villa-title">Villa triplex</h3>
              <p className="place">San Peïre, Var</p>
            </div>
            <div className="feature-intent" data-reveal style={{ ["--d" as string]: ".06s" }}>
              <p className="body-l" style={{ color: "var(--fg)" }}>
                <T
                  fr="Faire ressentir la lumière du Var et la circulation entre les trois niveaux, pièce après pièce — de l’arrivée au bord de la piscine jusqu’à la tombée du soir."
                  en="To convey the Var light and the flow between the three levels, room after room — from the arrival by the pool to nightfall."
                />
              </p>
              <p className="small">
                <T
                  fr={"Réalisé à partir des photos et vidéos existantes du bien : sélection des plans, montage, rythme, étalonnage et mise en musique par le studio."}
                  en="Made from the property’s existing photos and videos: shot selection, editing, pacing, colour grading and music by the studio."
                />
              </p>
              <div className="actions">
                <button type="button" className="btn btn--solid" onClick={() => openFilm(0)}>
                  <T fr="Voir le film" en="Watch the film" /> <span className="arr" aria-hidden="true">→</span>
                </button>
              </div>
            </div>
            <dl className="meta feature-meta" data-reveal style={{ ["--d" as string]: ".12s" }}>
              <dt><T fr="Métier" en="Trade" /></dt><dd><T fr="Immobilier" en="Real estate" /></dd>
              <dt><T fr="Création" en="Work" /></dt><dd>Film</dd>
              <dt><T fr="Durée" en="Length" /></dt><dd>{FILM.duration}</dd>
              <dt>Format</dt><dd><T fr="Cinémascope 2,39:1" en="Cinemascope 2.39:1" /></dd>
            </dl>
          </div>

          <div className="strip-head">
            <h4 className="label"><T fr="Découpage — 8 séquences" en="Breakdown — 8 sequences" /></h4>
            <p className="small"><T fr="Touchez une séquence pour lancer le film à cet instant." en="Tap a sequence to start the film right there." /></p>
          </div>
          <div className="strip" data-reveal>
            <ol className="hscroll">
              {SEQUENCES.map((s, i) => (
                <li key={s.t}>
                  <button
                    type="button"
                    className="seq"
                    onClick={() => openFilm(s.t)}
                    aria-label={t({ fr: `${s.name.fr} — lancer le film à ${fmtTime(s.t)}`, en: `${s.name.en} — play the film from ${fmtTime(s.t)}` })}
                  >
                    <span className="frame">
                      <Image src={`/videos/sequences/seq-0${i + 1}.jpg`} alt="" fill sizes="300px" />
                      <Corners />
                    </span>
                    <span className="cap">
                      <span className="tc">{fmtTime(s.t)}</span>
                      <span className="t">{t(s.name)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </article>

        <div className="studies-head">
          <h3 className="t-m" data-reveal>
            <T fr={<>Études de <em>direction artistique</em></>} en={<>Art direction <em>studies</em></>} />
          </h3>
          <p className="small" data-reveal style={{ ["--d" as string]: ".06s" }}>
            <T
              fr="Des propositions conceptuelles imaginées par le studio pour explorer une ambiance. Ce ne sont pas des commandes clients."
              en="Concept proposals imagined by the studio to explore a mood. They are not client commissions."
            />
          </p>
        </div>
        <ul className="studies">
          {STUDIES.map((s, i) => (
            <li key={s.img} data-reveal style={{ ["--d" as string]: `${(i * 0.06).toFixed(2)}s` }}>
              <button
                type="button"
                className="study"
                onClick={() =>
                  openImage(s.img, t(s.alt), t({ fr: `${s.title.fr} — étude de direction artistique, non commandée`, en: `${s.title.en} — art direction study, not commissioned` }))
                }
              >
                <span className="frame">
                  <Image src={s.img} alt={t(s.alt)} fill sizes="(min-width: 1100px) 25vw, (min-width: 640px) 50vw, 100vw" />
                  <span className="badge on-img"><T fr="Étude" en="Study" /></span>
                  <Corners />
                </span>
                <span className="info">
                  <span className="label">{t(s.sector)}</span>
                  <span className="t">{t(s.title)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
